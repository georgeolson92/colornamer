import React, { useState, useRef, useCallback } from 'react';
import './App.css';
import { debounce } from './utils/debounce';
import { findClosestColor } from './utils/colorUtils';
import { fetchColorData } from './services/colorService';
import { standardColors } from './constants/colors';
import ColorNamerTemplate from './components/ColorNamerTemplate'; // Import the Template component

function App() {
  const [color, setColor] = useState('#ffffff');
  const [colorNames, setColorNames] = useState([]);
  const [closestColor, setClosestColor] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [loadingColors, setLoadingColors] = useState(false);
  const canvasRef = useRef(null);
  const circleRef = useRef(null);

  const debouncedFetchColorData = useCallback(debounce(async (hex) => {
    setLoadingColors(true);
    const names = await fetchColorData(hex);
    setColorNames(names);
    setLoadingColors(false);
  }, 200), []);

  const handleImageMouseMove = (event) => {
    const canvas = canvasRef.current;
    const circle = circleRef.current;
    if (!canvas || !circle) return;

    const context = canvas.getContext('2d');
    const image = document.getElementById('image');
    if (!context || !image) return;

    const rect = image.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, image.width, image.height);

    const pixel = context.getImageData(x, y, 1, 1).data;
    const rgb = [pixel[0], pixel[1], pixel[2]];
    const hex = `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`;

    setColor(hex);

    debouncedFetchColorData(hex);

    const closest = findClosestColor(rgb, standardColors);
    setClosestColor(closest);

    circle.style.left = `${event.clientX - rect.left}px`;
    circle.style.top = `${event.clientY - rect.top}px`;
  };

  return (
    <ColorNamerTemplate>
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
        {imageSrc && (
          <div className="image-container">
            <img
              id="image"
              src={imageSrc}
              alt="Uploaded"
              className="image"
              onMouseMove={handleImageMouseMove}
              onMouseEnter={() => circleRef.current.style.display = 'block'}
              onMouseLeave={() => circleRef.current.style.display = 'none'}
            />
            <canvas ref={canvasRef} className="canvas" />
            <div id="cursor-circle" ref={circleRef}></div>
          </div>
        )}
        <div className="colorNames">
          <p>Selected Color: {color}</p>
          <p>Possible Color Name:</p>
          <ul>
            {loadingColors ? 'Loading...' : ''}
            {colorNames.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </div>
        <div className="closestColor">
          {closestColor && (
            <p>Closest Standard Color: <strong>{closestColor.name} ({closestColor.type})</strong></p>
          )}
        </div>
    </ColorNamerTemplate>
  );
}

export default App;
