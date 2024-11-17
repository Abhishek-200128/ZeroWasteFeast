import React, { useState, useCallback, useEffect, memo } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { loadInventoryData, loadRecipeData } from "../../data/DataController";
import RecipeModal from "@/components/Recipes/RecipeModal";
import RecipeCard from "@/components/Recipes/RecipeCard";
import { MultipleSelectList } from "react-native-dropdown-select-list";
import { Ionicons } from "@expo/vector-icons";

// Get the width of the device screen
const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth * 0.85; // Calculate card width for recipe cards
const cardSpacing = 16; // Spacing between recipe cards

// Function to get the correct image source based on the image data
const getImageSource = (imageData) => {
  if (typeof imageData === "string") {
    // If the image data is a base64 string
    return imageData.startsWith("data:image")
      ? { uri: imageData }
      : { uri: `data:image/jpeg;base64,${imageData}` };
  }
  if (imageData && imageData.uri) {
    return imageData; // If the image data is an object with a URI
  }
  // Fallback to a default image if the data is invalid
  console.error("Invalid image data:", imageData);
  return require("../../assets/images/default-menu-image-placeholder.png");
};

// Function to fetch recipes from the API with retries for error handling
const fetchRecipes = async (ingredients, maxRetries = 5, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Construct the API URL with encoded ingredients
      const ingredientsParam = encodeURIComponent(JSON.stringify(ingredients));
      const url = `https://tj0peg1rqk.execute-api.ap-southeast-2.amazonaws.com/deploy/get_recipes?ings=${ingredientsParam}`;
      console.log(`Attempt ${i + 1}: Fetching from URL:`, url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map((recipe) => ({
        ...recipe,
        image: getImageSource(recipe.image), // Get the correct image source
      }));
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      if (i < maxRetries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay)); // Retry after delay
      } else {
        console.error("Max retries reached. Giving up.");
        throw error;
      }
    }
  }
};

// Memoized component to render the recipe list, preventing unnecessary re-renders
const RecipeList = memo(({ recipes, onRecipePress }) => (
  <FlatList
    data={recipes} // The list of recipes to display
    renderItem={({ item }) => (
      <RecipeCard
        title={item.title} // Title of the recipe
        image={item.image} // Image of the recipe
        onPress={() => onRecipePress(item)} // Handle recipe card press
      />
    )}
    keyExtractor={(item) => item.id} // Key extractor for the list
    horizontal
    showsHorizontalScrollIndicator={false}
    snapToInterval={cardWidth + cardSpacing} // Snap effect for the carousel
    decelerationRate="fast"
    contentContainerStyle={styles.carouselContainer}
  />
));

// Tab button component to switch between recipe tabs (Find Recipes, Saved Recipes)
const TabButton = ({ title, isActive, onPress, isLoading }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.activeTabButton]} // Apply active style when the tab is active
    onPress={onPress}
    disabled={isLoading} // Disable the button while loading
    activeOpacity={0.6}
  >
    <Ionicons
      name={
        title === "Find Recipes"
          ? isActive
            ? "globe"
            : "globe-outline"
          : isActive
          ? "bookmarks"
          : "bookmarks-outline"
      }
      size={24}
      color={isActive ? "#FFE4C4" : "#4A5568"}
    />
    <Text
      style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

// Main RecipeScreen component
const RecipeScreen = () => {
  const insets = useSafeAreaInsets(); // Get the safe area insets for padding
  const router = useRouter(); // Router for navigation
  const [inventoryData, setInventoryData] = useState([]); // State for inventory data
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [selectedRecipe, setSelectedRecipe] = useState(null); // State for selected recipe
  const [recipeData, setRecipeData] = useState([]); // State for recipe data
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [selectedIngredients, setSelectedIngredients] = useState([]); // State for selected ingredients
  const [activeTab, setActiveTab] = useState("api"); // State for active tab
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filteredRecipes, setFilteredRecipes] = useState([]); // State for filtered recipes

  // Function to load recipes from the API
  const loadRecipes = useCallback(async () => {
    setIsLoading(true); // Set loading state to true
    try {
      const recipes = await fetchRecipes(selectedIngredients); // Fetch recipes based on selected ingredients
      setRecipeData(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setIsLoading(false); // Set loading state to false when done
    }
  }, [selectedIngredients]);

  // Function to load saved recipes from local storage
  const loadSavedRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedRecipes = await loadRecipeData(); // Load saved recipes
      setRecipeData(savedRecipes);
    } catch (error) {
      console.error("Error loading saved recipes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load recipes or saved recipes based on the active tab
  useEffect(() => {
    if (activeTab === "api") {
      loadRecipes();
    } else if (activeTab === "saved") {
      loadSavedRecipes();
    }
  }, [activeTab, loadRecipes, loadSavedRecipes]);

  // Filter saved recipes based on search query
  useEffect(() => {
    if (activeTab === "saved") {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = recipeData.filter((recipe) =>
        recipe.title.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredRecipes(filtered); // Update the filtered recipes based on search query
    }
  }, [searchQuery, recipeData, activeTab]);

  // Focus effect to load inventory data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const savedData = await loadInventoryData(); // Load inventory data
        setInventoryData(savedData);
      };
      loadData();
    }, [])
  );

  // Handle recipe card press to open the modal
  const handleRecipePress = useCallback((recipe) => {
    setSelectedRecipe(recipe);
    setIsModalVisible(true); // Show the modal with the selected recipe
  }, []);

  // Handle search input change for filtering recipes
  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  // Generate options for the ingredient select list from inventory data
  const inventoryOptions = inventoryData
    .filter((item) => item.status === "Stored") // Only show items that are stored
    .map((item) => ({
      key: item.id,
      value: item.name,
    }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "default" : "dark-content"}
      />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerContainer}>
        {/* Back button to navigate back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={32} color="#4A5568" />
        </TouchableOpacity>
        <Text className="text-3xl font-pmedium text-gray-800" style={styles.title}>
          Recipes
        </Text>
      </View>
      {/* Tab buttons for switching between "Find Recipes" and "Saved Recipes" */}
      <View style={styles.tabContainer}>
        <TabButton
          title="Find Recipes"
          isActive={activeTab === "api"} // Set the active tab
          onPress={() => setActiveTab("api")}
          isLoading={isLoading}
        />
        <TabButton
          title="Saved Recipes"
          isActive={activeTab === "saved"}
          onPress={() => setActiveTab("saved")}
          isLoading={isLoading}
        />
      </View>
      {/* Ingredient select list for the "Find Recipes" tab */}
      {activeTab === "api" && (
        <View style={styles.selectListContainer}>
          <MultipleSelectList
            setSelected={setSelectedIngredients}
            data={inventoryOptions} // Data options for the select list
            save="value"
            onSelect={() => console.log(selectedIngredients)}
            label="Selected Ingredients"
            placeholder="Find Recipes That Use Your Ingredients"
            notFoundText="No Item Found"
            arrowicon={
              <Ionicons name="chevron-down" size={24} color="#4A5568" />
            }
            closeicon={<Ionicons name="close" size={24} color="#4A5568" />}
            maxHeight={250}
            boxStyles={styles.box}
            inputStyles={styles.input}
            dropdownStyles={styles.dropdown}
            dropdownTextStyles={styles.dropdownText}
            dropdownItemStyles={styles.dropdownItem}
            badgeStyles={styles.badge}
            badgeTextStyles={styles.badgeText}
            checkBoxStyles={styles.checkbox}
          />
        </View>
      )}
      {/* Search input for the "Saved Recipes" tab */}
      {activeTab === "saved" && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved recipes"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>
      )}
      {/* Loading indicator when data is being fetched */}
      {isLoading ? (
        <>
          <Text style={styles.loadingText}>
            {activeTab === "api"
              ? "Loading Your Recipes"
              : "Loading Saved Recipes"}
          </Text>
          <ActivityIndicator size="large" color="grey" style={styles.loader} />
        </>
      ) : (
        // Recipe list for the selected tab
        <RecipeList
          recipes={activeTab === "api" ? recipeData : filteredRecipes}
          onRecipePress={handleRecipePress}
        />
      )}
      {/* Modal to display the selected recipe details */}
      <RecipeModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        recipe={selectedRecipe}
      />
    </View>
  );
};

// Styles for the screen components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    paddingRight: 20,
  },
  title: {
    fontSize: 32,
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  tabButton: {
    flexDirection: "row",
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#d3d3d3",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  activeTabButton: {
    backgroundColor: "#4d433a",
  },
  tabButtonText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },
  activeTabButtonText: {
    color: "#FFE4C4",
  },
  carouselContainer: {
    paddingHorizontal: (screenWidth - cardWidth) / 2 - cardSpacing / 2,
    paddingVertical: 20,
  },
  selectListContainer: {
    paddingHorizontal: 10,
  },
  box: {
    borderRadius: 12,
    borderColor: "#4d433a",
    backgroundColor: "#F7FAFC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
  },
  input: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
  },
  dropdown: {
    borderRadius: 12,
    borderColor: "#4d433a",
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownText: {
    fontSize: 16,
    color: "#4A5568",
  },
  dropdownItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  badge: {
    backgroundColor: "#4d433a",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 0,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFE4C4",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#4A5568",
  },
  loader: {
    marginTop: 20,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "grey",
    marginTop: 10,
  },
  searchContainer: {
    paddingHorizontal: 10,
  },
  searchInput: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    borderRadius: 12,
    borderColor: "#4d433a",
    backgroundColor: "#F7FAFC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
  },
});

export default RecipeScreen;
