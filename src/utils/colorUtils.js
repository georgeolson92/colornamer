const calculateDistance = (rgb1, rgb2) => {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
  );
};

const findClosestColor = (rgb, standardColors) => {
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

export { calculateDistance, findClosestColor };
