import React, { useState, useRef, useCallback } from 'react';
import './App.css';  // Import the CSS file
import { debounce } from './debounce';  // Import debounce function

// Define standard colors
const standardColors = [
  { name: 'Red', rgb: [255, 0, 0], type: 'primary' },
  { name: 'Green', rgb: [0, 255, 0], type: 'primary' },
  { name: 'Blue', rgb: [0, 0, 255], type: 'primary' },
  { name: 'Yellow', rgb: [255, 255, 0], type: 'secondary' },
  { name: 'Cyan', rgb: [0, 255, 255], type: 'secondary' },
  { name: 'Magenta', rgb: [255, 0, 255], type: 'secondary' },
  { name: 'Orange', rgb: [255, 165, 0], type: 'tertiary' },
  { name: 'Purple', rgb: [128, 0, 128], type: 'tertiary' },
  { name: 'White', rgb: [255, 255, 255], type: 'neutral' },
  { name: 'Black', rgb: [0, 0, 0], type: 'neutral' },
  { name: 'Brown', rgb: [165, 42, 42], type: 'neutral' },
  { name: 'Gray', rgb: [128, 128, 128], type: 'neutral' },
  // Add more colors as needed
];

function App() {
  const [color, setColor] = useState('#ffffff');
  const [colorNames, setColorNames] = useState([]);
  const [closestColor, setClosestColor] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [loadingColors, setLoadingColors] = useState(false);
  const canvasRef = useRef(null);

  const calculateDistance = (rgb1, rgb2) => {
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );
  };

  const findClosestColor = (rgb) => {
    let minDistance = Infinity;
    let closest = null;

    standardColors.forEach((color) => {
      const distance = calculateDistance(rgb, color.rgb);
      if (distance < minDistance) {
        minDistance = distance;
        closest = color;
      }
    });

    return closest;
  };

  const fetchColorData = async (hex) => {
    setLoadingColors(true); // Start loading
    try {
      const response = await fetch(`https://www.thecolorapi.com/id?hex=${hex.slice(1)}`);
      const data = await response.json();

      // Extract color names safely
      const names = [data.name.value];
      if (data.name.closest_named_hex && data.name.closest_named_hex !== data.name.value) {
        names.push(data.name.closest_named_hex);
      }

      setColorNames(names);
    } catch (error) {
      console.error('Error fetching the color names:', error);
      setColorNames(['Unknown']);  // Fallback if the API fails
    } finally {
      setLoadingColors(false); // End loading
    }
  };

  const debouncedFetchColorData = useCallback(debounce(fetchColorData, 200), []); // 200ms debounce

  const handleImageMouseMove = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    const closest = findClosestColor(rgb);
    setClosestColor(closest);
  };

  return (
    <div className="App">
      <h1>Color Finder</h1>
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
        <>
          <img
            id="image"
            src={imageSrc}
            alt="Uploaded"
            className="image"
            onMouseMove={handleImageMouseMove}
          />
          <canvas ref={canvasRef} className="canvas" />
        </>
      )}
      <p>Selected Color: {color}</p>
      <p>Possible Color Name:</p>
      {loadingColors ? 'Loading...' : ''}
      <div className="colorNames">
        <ul>
          {colorNames.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
      </div>
      <div className="closestColor">
        {closestColor && (
          <p>Closest Standard Color: {closestColor.name} ({closestColor.type})</p>
        )}
      </div>
    </div>
  );
}

export default App;
