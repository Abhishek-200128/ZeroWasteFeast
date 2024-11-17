import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ScrollView } from "react-native-gesture-handler";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import InventoryList from "../../components/InventoryScreen/InventoryList";
import Ionicons from "react-native-vector-icons/Ionicons";
import Fontisto from "react-native-vector-icons/Fontisto";
import {
  saveInventoryData,
  loadInventoryData,
} from "../../data/DataController";

const DailyReportScreen = () => {
  const router = useRouter(); // Expo router for navigation
  const [inventoryData, setInventoryData] = useState([]); // State to store inventory data
  const [search, setSearch] = useState(""); // Search term state
  const [selectedStatus, setSelectedStatus] = useState("Stored"); // Default selected status is "Stored"
  const [selectedCategories, setSelectedCategories] = useState([]); // State to store selected categories
  const scrollRef = useRef(null); // Reference for ScrollView to control scrolling
  const isInitialMount = useRef(true); // Boolean ref to track the first render
  const insets = useSafeAreaInsets(); // Safe area insets for padding
  const { number } = useLocalSearchParams(); // Get params from homescreen cards

  // Save inventory data when it changes, except on the first mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      saveInventoryData(inventoryData); // Save the inventory data to local storage
    }
  }, [inventoryData]);

  // Load inventory data when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const savedData = await loadInventoryData(); // Load the inventory data from local storage
        setInventoryData(savedData); // Update state with loaded data
      };
      loadData();
    }, [])
  );

  // Navigate to the notification settings screen
  const handleSettingsPress = () => {
    router.push("/notify");
  };

  return (
    <GestureHandlerRootView>
      {/* Hide the header for this screen */}
      <Stack.Screen
        options={{
          title: "Overview",
          headerShown: false,
        }}
      />
      {/* Main container with padding to respect the safe area insets */}
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Status bar configuration */}
        <StatusBar
          barStyle={Platform.OS === "ios" ? "default" : "dark-content"}
        />
        {/* Header with back button, title, and notification button */}
        <View style={styles.headerContainer}>
          {/* Back button to navigate back or replace with home screen */}
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back(); 
              } else {
                router.replace("/home"); 
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={32} color="#4A5568" />
          </TouchableOpacity>
          {/* Title and subtitle container */}
          <View style={styles.titleContainer}>
            <Text className="text-3xl font-pmedium text-gray-800">Daily Report</Text>
            <Text style={styles.subtitle}>Reminder: Items expiring in Three Days</Text>
          </View>
          {/* Settings button to open notification settings */}
          <TouchableOpacity
            onPress={handleSettingsPress}
            style={styles.settingsButton}
          >
            <Fontisto name="bell" size={28} color="black" />
          </TouchableOpacity>
        </View>
        {/* Scrollable list of inventory items */}
        <ScrollView ref={scrollRef}>
          <InventoryList
            listMode={"summary"} // Use summary mode for inventory display
            inventoryData={inventoryData} // Inventory data passed as prop
            setInventoryData={setInventoryData} // Function to update inventory data
            resetFiltersButton={false} // Hide reset filters button
            search={search} // Search query
            selectedStatus={selectedStatus} // Currently selected status
            selectedCategories={selectedCategories} // Currently selected categories
            setSearch={setSearch} // Function to update search query
            setSelectedStatus={setSelectedStatus} // Function to update selected status
            setSelectedCategories={setSelectedCategories} // Function to update selected categories
            scrollRef={scrollRef} // ScrollView reference
          />
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};

// Styles for the screen components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2", // Light gray background color
  },
  headerContainer: {
    flexDirection: "row", // Arrange header items in a row
    alignItems: "center", // Align items vertically in the center
    justifyContent: "space-between", // Space out items in the header
    paddingHorizontal: 10, // Horizontal padding
    paddingVertical: 10, // Vertical padding
  },
  backButton: {
    padding: 5, // Padding for the back button
  },
  titleContainer: {
    flex: 1, // Take up remaining space in the header
    marginLeft: 10, // Add space between the back button and the title
  },
  title: {
    fontSize: 28, // Large font size for the title
    fontWeight: "600", // Semi-bold text
    color: "black", // Black text color
  },
  subtitle: {
    fontSize: 14, // Smaller font size for the subtitle
    color: "#4A5568", // Gray color for the subtitle text
  },
  settingsButton: {
    padding: 5, // Padding for the settings button
  },
});

export default DailyReportScreen;
