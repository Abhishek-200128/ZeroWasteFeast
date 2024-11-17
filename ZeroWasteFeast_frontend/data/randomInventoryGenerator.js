import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const categories = [
  "Fresh Produce",
  "Cold Storage",
  "Meat",
  "Drinks",
  "Pantry",
  "Others",
];

const status = ["Stored", "Expired", "Donated", "Consumed"];

const foodItems = {
  "Fresh Produce": [
    "apple",
    "banana",
    "carrot",
    "tomato",
    "lettuce",
    "cucumber",
    "broccoli",
    "spinach",
    "strawberries",
    "blueberries",
  ],
  "Cold Storage": ["yogurt", "cheese", "butter", "cream", "tofu"],
  Meat: [
    "chicken breast",
    "ground beef",
    "pork chops",
    "salmon fillet",
    "turkey",
    "ham",
  ],
  Drinks: ["milk", "orange juice", "soda", "water", "coffee"],
  Pantry: [
    "pasta",
    "rice",
    "canned beans",
    "cereal",
    "peanut butter",
    "chips",
    "crackers",
  ],
  Others: ["ketchup", "mustard", "mayonnaise", "olive oil", "vinegar"],
};

function generateRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function formatDate(date) {
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

export function generateRandomInventoryItem() {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const name =
    foodItems[category][Math.floor(Math.random() * foodItems[category].length)];

  const purchaseDate = generateRandomDate(
    new Date(),
    new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  );
  const expiryDate = new Date(
    purchaseDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
  );

  const outputObject = {
    id: uuidv4(),
    name: name,
    purchase_date: formatDate(purchaseDate),
    expiry_date: formatDate(expiryDate),
    status: status[Math.floor(Math.random() * status.length)],
    category: category,
    consumed_percentage: Math.floor(Math.random() * 101),
    notes:
      Math.random() > 0.5
        ? [
            `Random note 1 for ${name}`,
            `Random note 2 for ${name}`,
            `Random note 3 for ${name}`,
            `Random longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong note 4 for ${name}`,
          ]
        : [
            `Random note 1 for ${name}`,
            `Random note 2 for ${name}`,
            `Random note 3 for ${name}`,
            `Random note 4 for ${name}`,
            `Random note 5 for ${name}`,
            `Random note 6 for ${name}`,
            `Random note 7 for ${name}`,
            `Random note 8 for ${name}`,
          ],
  };

  console.log("added", outputObject);

  return outputObject;
}
