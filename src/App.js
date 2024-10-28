import React, { useState, useRef, useCallback } from "react";
import "./App.css";
import { debounce } from "./utils/debounce";
import { hexToRgb, luminance, contrastRatio } from "./utils/colorUtils";
import { fetchColorData } from "./services/colorService";
import ColorNamerTemplate from "./components/ColorNamerTemplate";

function App() {
  const [color, setColor] = useState("#ffffff");
  const [colorNames, setColorNames] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [clicked, setClicked] = useState(false); // Track if the circle is clicked
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

    circle.style.left = `${adjustedX}px`;
    circle.style.top = `${adjustedY}px`;
    circle.style.display = "block"; // Ensure the circle is displayed on click
  };

  const handleTouchMove = (event) => {
    if (!clicked) {
      event.preventDefault();
      const touch = event.touches[0];
      handleImageInteraction(touch.clientX, touch.clientY);
    }
  };

  const handleMouseMove = (event) => {
    if (!clicked) {
      handleImageInteraction(event.clientX, event.clientY);
    }
  };

  const handleClick = (event) => {
    setClicked(true); // Set clicked to true to persist the circle's visibility
    handleImageInteraction(event.clientX, event.clientY); // Update circle position on each click
  };

  const getTextColor = (backgroundColor) => {
    const [r, g, b] = hexToRgb(backgroundColor);
    const bgLuminance = luminance(r, g, b);
    const whiteLuminance = luminance(255, 255, 255);

    const contrastWithWhite = contrastRatio(bgLuminance, whiteLuminance);

    return contrastWithWhite >= 4.5 ? "#ffffff" : "#000000";
  };

  return (
    <ColorNamerTemplate>
      <div className="input-container">
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
            onMouseLeave={() => !clicked && (circleRef.current.style.display = "none")}
            onClick={handleClick} // Moves the circle to the click position
            onTouchStart={() => (circleRef.current.style.display = "block")}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => !clicked && (circleRef.current.style.display = "none")}
            draggable="false"
          />
          <canvas ref={canvasRef} className="canvas" />
          <div id="cursor-circle" ref={circleRef} style={{ display: clicked ? "block" : "none" }}></div>
        </div>
      )}
      <div className="colorNames">
        <p>
          Selected Color:{" "}
          <span
            className="color-block"
            style={{ backgroundColor: color, color: getTextColor(color) }}
          >
            {color}
          </span>
        </p>
        <p>Possible Color Name:</p>
        <ul>
          {colorNames.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
      </div>
    </ColorNamerTemplate>
  );
}

export default App;
