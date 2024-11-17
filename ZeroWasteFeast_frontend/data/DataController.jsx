import * as FileSystem from "expo-file-system";

const inventoryFilePath = `${FileSystem.documentDirectory}/inventoryData.json`;

export const saveInventoryData = async (data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await FileSystem.writeAsStringAsync(inventoryFilePath, jsonValue);
    console.log("Inventory data saved successfully: ", jsonValue);
  } catch (e) {
    console.error("Error saving inventory data", e);
  }
};

export const loadInventoryData = async () => {
  try {
    // Check if the file exists
    const fileInfo = await FileSystem.getInfoAsync(inventoryFilePath);

    if (!fileInfo.exists) {
      // If the file doesn't exist, create an empty file
      await FileSystem.writeAsStringAsync(
        inventoryFilePath,
        JSON.stringify([])
      );
      console.log("Created empty inventory file");
      return [];
    }

    // If the file exists, read its contents
    const data = await FileSystem.readAsStringAsync(inventoryFilePath);
    let jsonValue = JSON.parse(data);
    console.log("Inventory data loaded successfully: ", jsonValue);

    // Update inventory status before returning
    jsonValue = await updateInventoryStatus(jsonValue);

    return jsonValue;
  } catch (e) {
    console.error("Error loading inventory data", e);
    return [];
  }
};

// Helper function to parse date string in DD/MM/YYYY format
const parseDate = (dateString) => {
  const [day, month, year] = dateString.split("/");
  return new Date(year, month - 1, day); // month is 0-indexed in JS Date
};

export const updateInventoryStatus = async (inventoryData) => {
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Flag to track if any changes were made
  let changesMade = false;

  // Loop through the inventory items
  const updatedInventory = inventoryData.map((item) => {
    if (item.status === "Stored") {
      // Parse the expiry date using our custom function
      const expiryDate = parseDate(item.expiry_date);
      expiryDate.setHours(0, 0, 0, 0);
      // Check if the item has expired or expires today
      if (expiryDate <= today) {
        item.status = "Expired";
        changesMade = true;
        console.log(`Item "${item.name}" status updated to Expired`);
      }
    }
    return item;
  });

  // If changes were made, save the updated inventory
  if (changesMade) {
    await saveInventoryData(updatedInventory);
    console.log("Inventory status updated successfully");
  } else {
    console.log("Item status checker: No changes needed in inventory status");
  }

  return updatedInventory;
};

const recipeFilePath = `${FileSystem.documentDirectory}/recipeData.json`;

export const saveRecipeData = async (data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await FileSystem.writeAsStringAsync(recipeFilePath, jsonValue);
    const recipeNames = data.map((recipe) => recipe.title);
    console.log("Recipe data saved successfully: ", recipeNames.join(", "));
  } catch (e) {
    console.error("Error saving recipe data", e);
  }
};

export const loadRecipeData = async () => {
  try {
    // Check if the file exists
    const fileInfo = await FileSystem.getInfoAsync(recipeFilePath);

    if (!fileInfo.exists) {
      // If the file doesn't exist, create an empty file
      await FileSystem.writeAsStringAsync(recipeFilePath, JSON.stringify([]));
      console.log("Created empty recipe file");
      return [];
    }

    // If the file exists, read its contents
    const data = await FileSystem.readAsStringAsync(recipeFilePath);
    const jsonValue = JSON.parse(data);
    const recipeNames = jsonValue.map((recipe) => recipe.title);
    console.log("Recipe data loaded successfully: ", recipeNames.join(", "));
    return jsonValue;
  } catch (e) {
    console.error("Error loading recipe data", e);
    return [];
  }
};
