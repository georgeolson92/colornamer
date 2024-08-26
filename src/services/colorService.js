// services/colorService.js
export const fetchColorData = async (hex) => {
    try {
      const response = await fetch(`https://www.thecolorapi.com/id?hex=${hex.slice(1)}`);
      const data = await response.json();
  
      const names = [data.name.value];
      if (data.name.closest_named_hex && data.name.closest_named_hex !== data.name.value) {
        names.push(data.name.closest_named_hex);
      }
  
      return names;
    } catch (error) {
      console.error('Error fetching the color names:', error);
      return ['Unknown'];  // Fallback if the API fails
    }
  };
  