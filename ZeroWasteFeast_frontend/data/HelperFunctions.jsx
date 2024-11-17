export const calculateFreshnessPercentage = (purchaseDate, expiryDate) => {
  const purchase = new Date(purchaseDate.split("/").reverse().join("-"));
  const expiry = new Date(expiryDate.split("/").reverse().join("-"));
  const today = new Date();

  const totalDays = (expiry - purchase) / (1000 * 60 * 60 * 24);
  const daysRemaining = (expiry - today) / (1000 * 60 * 60 * 24);

  const freshnessPercentage = (daysRemaining / totalDays) * 100;
  return Math.max(0, Math.min(100, freshnessPercentage));
};

export const getProgressColor = (percentage) => {
  if (percentage >= 75) return "#4CAF50"; // Green
  if (percentage >= 50) return "#FFEB3B"; // Yellow
  if (percentage >= 25) return "#FF9800"; // Orange
  return "#F44336"; // Red
};

export const getProgressColorLowSaturation = (percentage) => {
  if (percentage >= 75) return "#84C496"; // Green
  if (percentage >= 50) return "#FFF176"; // Yellow
  if (percentage >= 25) return "#FFB057"; // Orange
  return "#F88A82"; // Red
};

export const getProgressColorDarker = (percentage) => {
  if (percentage >= 75) return "#4F805D"; // Green
  if (percentage >= 50) return "#97ad17"; // Yellow
  if (percentage >= 25) return "#D98A38"; // Orange
  return "#D9655C"; // Red
};

export const getCategoryIconOutline = (category) => {
  switch (category) {
    case "Fresh Produce":
      return require("../assets/icons/vegetableBasket_outline.png");
    case "Cold Storage":
      return require("../assets/icons/coldStorage_outline.png");
    case "Meat":
      return require("../assets/icons/meat_outline.png");
    case "Drinks":
      return require("../assets/icons/drinks_outline.png");
    case "Pantry":
      return require("../assets/icons/chips_outline.png");
    case "others":
    default:
      return require("../assets/icons/box_outline.png");
  }
};

export const formatToDateString = (date) => {
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

export const formatToDateObject = (date) => {
  const [day, month, year] = date.split("/").map(Number);
  const dateObject = new Date(year, month - 1, day);
  return dateObject;
};
