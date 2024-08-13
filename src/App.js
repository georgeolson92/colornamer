import React, { useState } from 'react';

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
  // Add more colors as needed
];

function App() {
  const [color, setColor] = useState('#ffffff');  // Initial color is white
  const [colorNames, setColorNames] = useState([]);
  const [closestColor, setClosestColor] = useState(null);  // Store the closest color info

  const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return [r, g, b];
  };

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

  const handleColorChange = async (event) => {
    const newColor = event.target.value;
    setColor(newColor);

    try {
      // Fetch the color data from The Color API
      const response = await fetch(`https://www.thecolorapi.com/id?hex=${newColor.slice(1)}`);
      const data = await response.json();

      // Extract color names safely
      const names = [data.name.value];
      if (data.name.closest_named_hex && data.name.closest_named_hex !== data.name.value) {
        names.push(data.name.closest_named_hex);
      }

      setColorNames(names);

      // Find the closest standard color
      const rgb = hexToRgb(newColor);
      const closest = findClosestColor(rgb);
      setClosestColor(closest);
    } catch (error) {
      console.error('Error fetching the color names:', error);
      setColorNames(['Unknown']);
      setClosestColor(null);
    }
  };

  return (
    <div className="App">
      <h1>Color Name Finder</h1>
      <input
        type="color"
        value={color}
        onChange={handleColorChange}
      />
      <p>Selected Color: {color}</p>
      <p>Possible Color Names:</p>
      <ul>
        {colorNames.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
      {closestColor && (
        <p>Closest Standard Color: {closestColor.name} ({closestColor.type})</p>
      )}
    </div>
  );
}

export default App;
