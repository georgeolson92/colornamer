import React, { useState } from 'react';

function App() {
  const [color, setColor] = useState('#ffffff');  // Initial color is white
  const [colorName, setColorName] = useState('White');

  const handleColorChange = async (event) => {
    const newColor = event.target.value;
    setColor(newColor);

    // Fetch the color name from The Color API
    try {
      const response = await fetch(`https://www.thecolorapi.com/id?hex=${newColor.slice(1)}`);
      const data = await response.json();
      setColorName(data.name.value);
    } catch (error) {
      console.error('Error fetching the color name:', error);
      setColorName('Unknown');  // Fallback if the API fails
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
      <p>Color Name: {colorName}</p>
    </div>
  );
}

export default App;