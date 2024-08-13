import React, { useState } from 'react';

function App() {
  const [color, setColor] = useState('#ffffff');  // Initial color is white
  const [colorNames, setColorNames] = useState([]);  // Store multiple color names

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
    } catch (error) {
      console.error('Error fetching the color names:', error);
      setColorNames(['Unknown']);  // Fallback if the API fails
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
    </div>
  );
}

export default App;