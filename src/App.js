import React, { useState, useRef, useCallback } from "react";
import "./App.css";
import { debounce } from "./utils/debounce";
import { findClosestColor, hexToRgb, luminance, contrastRatio } from "./utils/colorUtils";
import { fetchColorData } from "./services/colorService";
import { standardColors } from "./constants/colors";
import ColorNamerTemplate from "./components/ColorNamerTemplate"; // Import the Template component

function App() {
  const [color, setColor] = useState("#ffffff");
  const [colorNames, setColorNames] = useState([]);
  const [closestColor, setClosestColor] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const canvasRef = useRef(null);
  const circleRef = useRef(null);

  const debouncedFetchColorData = useCallback(
    debounce(async (hex) => {
      const names = await fetchColorData(hex);
      setColorNames(names);
    }, 200),
    []
  );

  const handleImageInteraction = (x, y) => {
    const canvas = canvasRef.current;
    const circle = circleRef.current;
    if (!canvas || !circle) return;

    const context = canvas.getContext("2d");
    const image = document.getElementById("image");
    if (!context || !image) return;

    const rect = image.getBoundingClientRect();
    const adjustedX = x - rect.left;
    const adjustedY = y - rect.top;

    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, image.width, image.height);

    const pixel = context.getImageData(adjustedX, adjustedY, 1, 1).data;
    const rgb = [pixel[0], pixel[1], pixel[2]];
    const hex = `#${rgb
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("")}`;

    setColor(hex);

    debouncedFetchColorData(hex);

    const closest = findClosestColor(rgb, standardColors);
    setClosestColor(closest);

    circle.style.left = `${adjustedX}px`;
    circle.style.top = `${adjustedY}px`;
  };

  const handleTouchMove = (event) => {
    event.preventDefault();
    const touch = event.touches[0];
    handleImageInteraction(touch.clientX, touch.clientY);
  };

  const handleMouseMove = (event) => {
    handleImageInteraction(event.clientX, event.clientY);
  };

  const getTextColor = (backgroundColor) => {
    const [r, g, b] = hexToRgb(backgroundColor);
    const bgLuminance = luminance(r, g, b);
    const whiteLuminance = luminance(255, 255, 255);
  
    // Calculate contrast ratios
    const contrastWithWhite = contrastRatio(bgLuminance, whiteLuminance);
  
    // Return black or white text based on the contrast
    return contrastWithWhite >= 4.5 ? "#ffffff" : "#000000";
  };
  

  return (
    <ColorNamerTemplate>
      <div class="input-container">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setImageSrc(URL.createObjectURL(file));
            }
          }}
        />
      </div>
      {imageSrc && (
        <div className="image-container">
          <img
            id="image"
            src={imageSrc}
            alt="Uploaded"
            className="image"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => (circleRef.current.style.display = "block")}
            onMouseLeave={() => (circleRef.current.style.display = "none")}
            onTouchStart={() => (circleRef.current.style.display = "block")}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => (circleRef.current.style.display = "none")}
            draggable="false"
          />
          <canvas ref={canvasRef} className="canvas" />
          <div id="cursor-circle" ref={circleRef}></div>
        </div>
      )}
      <div className="colorNames">
        <p>Selected Color: <span className='color-block' style={{ backgroundColor: color, color: getTextColor(color) }}>{color}</span></p>
        <p>Possible Color Name:</p>
        <ul>
          {colorNames.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
      </div>
      <div className="closestColor">
        {closestColor && (
          <p>
            Closest Standard Color:{" "}
            <strong>
              {closestColor.name} ({closestColor.type})
            </strong>
          </p>
        )}
      </div>
    </ColorNamerTemplate>
  );
}

export default App;
