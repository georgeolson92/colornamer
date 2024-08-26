import React, { useState, useRef, useCallback } from 'react';
import './App.css';
import { debounce } from './debounce';

const standardColors = [
  // Your standard colors array here
];

function App() {
  const [color, setColor] = useState('#ffffff');
  const [colorNames, setColorNames] = useState([]);
  const [closestColor, setClosestColor] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [loadingColors, setLoadingColors] = useState(false);
  const canvasRef = useRef(null);
  const circleRef = useRef(null);

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
    setLoadingColors(true);
    try {
      const response = await fetch(`https://www.thecolorapi.com/id?hex=${hex.slice(1)}`);
      const data = await response.json();

      const names = [data.name.value];
      if (data.name.closest_named_hex && data.name.closest_named_hex !== data.name.value) {
        names.push(data.name.closest_named_hex);
      }

      setColorNames(names);
    } catch (error) {
      console.error('Error fetching the color names:', error);
      setColorNames(['Unknown']);
    } finally {
      setLoadingColors(false);
    }
  };

  const debouncedFetchColorData = useCallback(debounce(fetchColorData, 200), []);

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
  
    const closest = findClosestColor(rgb);
    setClosestColor(closest);
  
    // Position the circle, adjusting for its size to center it on the cursor
    const circleSize = 100; // Adjust this size if your circle's size changes
    circle.style.left = `${event.clientX - rect.left}px`;
    circle.style.top = `${event.clientY - rect.top}px`;
  
    circle.style.transform = `translate(-50%, -50%)`; // Center the circle on the cursor
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
