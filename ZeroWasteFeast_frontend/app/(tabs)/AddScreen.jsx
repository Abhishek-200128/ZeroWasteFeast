import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import DatePicker from "react-native-neat-date-picker";
import {
  getCategoryIconOutline,
  formatToDateObject,
  formatToDateString,
} from "@/data/HelperFunctions"; // Helper functions for formatting dates and category icons
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid"; // To generate unique item IDs
import {
  saveInventoryData,
  loadInventoryData,
} from "../../data/DataController"; // Functions to load and save inventory data

// Define available categories for dropdown picker
const categories = [
  { label: "Fresh Produce", value: "Fresh Produce" },
  { label: "Cold Storage", value: "Cold Storage" },
  { label: "Meat", value: "Meat" },
  { label: "Drinks", value: "Drinks" },
  { label: "Pantry", value: "Pantry" },
  { label: "Others", value: "others" },
];

// Default form data for a new inventory item
const defaultFormData = {
  name: "",
  category: "others",
  purchasedDate: new Date(),
  expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
  status: "Stored",
};

const AddScreen = () => {
  const params = useLocalSearchParams(); // Extract parameters passed from other screens
  const [formData, setFormData] = useState(defaultFormData); // State to manage form input
  const [inventory, setInventory] = useState([]); // State to manage the inventory list
  const [openCategory, setOpenCategory] = useState(false); // Dropdown open state
  const [showPurchasedDatePicker, setShowPurchasedDatePicker] = useState(false); // Purchased date picker visibility
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false); // Expiry date picker visibility
  const [isEditing, setIsEditing] = useState(false); // Track if the user is editing an existing item
  const router = useRouter(); // Router for navigation

  // Get the category icon based on the selected category
  const categoryIcon = useMemo(
    () => getCategoryIconOutline(formData.category),
    [formData.category]
  );

  // Load data and set the form based on the mode (add or edit) when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadInventoryData().then(setInventory); // Load the inventory from storage

      if (params.mode === "edit") {
        setIsEditing(true); // Set editing mode
        // Populate the form with the passed parameters for editing
        setFormData({
          name: params.name,
          category: params.category,
          purchasedDate: new Date(formatToDateObject(params.purchaseDate)),
          expiryDate: new Date(formatToDateObject(params.expiryDate)),
          status: params.status,
        });
      } else {
        setIsEditing(false); // Set add mode
        setFormData(defaultFormData); // Reset form data
        params.name && handleInputChange("name", params.name); // Populate the name if passed
        params.category && handleInputChange("category", params.category); // Populate the category if passed
      }
    }, [
      params.mode,
      params.name,
      params.category,
      params.purchaseDate,
      params.expiryDate,
      params.status,
    ])
  );

  // Handle input changes for form fields
  const handleInputChange = useCallback((name, value) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      // Automatically update the item status based on the expiry date
      if (name === "expiryDate") {
        updatedData.status = value < new Date() ? "Expired" : "Stored";
      }
      return updatedData;
    });
  }, []);

  // Handle the form submission for adding or updating an item
  const handleSubmit = useCallback(async () => {
    // Check if the name field is empty
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter a name for the item.");
      return;
    }

    try {
      // Update existing item or add a new item to the inventory
      const updatedInventory = isEditing
        ? inventory.map((item) =>
            item.id === params.id
              ? {
                  ...item,
                  name: formData.name,
                  category: formData.category,
                  purchase_date: formatToDateString(formData.purchasedDate),
                  expiry_date: formatToDateString(formData.expiryDate),
                  status: formData.status,
                }
              : item
          )
        : [
            ...inventory,
            {
              id: uuidv4(), // Generate a unique ID for new item
              name: formData.name,
              category: formData.category,
              status: formData.status,
              purchase_date: formatToDateString(formData.purchasedDate),
              expiry_date: formatToDateString(formData.expiryDate),
              consumed_percentage: 100,
              notes: [],
            },
          ];

      // Save the updated inventory data
      await saveInventoryData(updatedInventory);
      setInventory(updatedInventory); // Update inventory state
      Alert.alert(
        "Success",
        `Item ${isEditing ? "updated" : "added"} successfully!`
      );
      router.replace("./InventoryScreen"); // Navigate back to the inventory screen
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to ${isEditing ? "update" : "add"} item. Please try again.`
      );
      console.log(`Failed to ${isEditing ? "update" : "add"} item:`, error);
    }
  }, [formData, isEditing, inventory, params.id, router]);

  // Handle date selection from the date picker
  const handleDatePickerConfirm = useCallback(
    (date, type) => {
      const selectedDate = new Date(date);

      if (type === "purchasedDate") {
        if (selectedDate > formData.expiryDate) {
          Alert.alert(
            "Invalid Date",
            "Purchase date cannot be later than expiry date."
          );
          return;
        }
        handleInputChange("purchasedDate", selectedDate); // Update purchased date
      } else if (type === "expiryDate") {
        if (selectedDate < formData.purchasedDate) {
          Alert.alert(
            "Invalid Date",
            "Expiry date cannot be earlier than purchase date."
          );
          return;
        }
        handleInputChange("expiryDate", selectedDate); // Update expiry date
      }

      // Hide the date picker after selection
      setShowPurchasedDatePicker(false);
      setShowExpiryDatePicker(false);
    },
    [formData.purchasedDate, formData.expiryDate, handleInputChange]
  );

  // Cancel the date picker without making changes
  const handleDatePickerCancel = useCallback(() => {
    setShowPurchasedDatePicker(false);
    setShowExpiryDatePicker(false);
  }, []);

  // Render the date picker modal
  const renderDatePicker = useMemo(
    () => (
      <DatePicker
        key={
          showPurchasedDatePicker
            ? `purchased-${formData.purchasedDate}`
            : `expiry-${formData.expiryDate}`
        }
        isVisible={showPurchasedDatePicker || showExpiryDatePicker} // Show based on state
        mode={"single"} // Single date mode
        onCancel={handleDatePickerCancel} // Handle cancellation
        onConfirm={(date) =>
          handleDatePickerConfirm(
            date,
            showPurchasedDatePicker ? "purchasedDate" : "expiryDate"
          )
        }
        initialDate={
          showPurchasedDatePicker ? formData.purchasedDate : formData.expiryDate
        }
        colorOptions={{
          headerColor: "grey",
          weekDaysColor: "grey",
          selectedDateBackgroundColor: "grey",
          confirmButtonColor: "black",
        }}
        // minDate={showExpiryDatePicker ? formData.purchasedDate : undefined}
        minDate={showExpiryDatePicker ? formData.purchasedDate : undefined}
        maxDate={showPurchasedDatePicker ? formData.expiryDate : undefined}
      />
    ),
    [
      showPurchasedDatePicker,
      showExpiryDatePicker,
      formData.purchasedDate,
      formData.expiryDate,
      handleDatePickerCancel,
      handleDatePickerConfirm,
    ]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Avoid keyboard overlap
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent} horizontal>
        <View style={styles.card}>
          {/* Header displaying "Edit" or "Add" based on mode */}
          <View style={styles.statusHeader}>
            <Text style={styles.headerTitle}>{isEditing ? "Edit" : "Add"}</Text>
            <View
              style={[
                styles.statusTextContainer,
                {
                  backgroundColor:
                    formData.status === "Expired" ? "#FFD700" : "#90EE90", // Color based on status
                },
              ]}
            >
              <Text style={styles.statusText}>{formData.status}</Text>
            </View>
          </View>

          {/* Main content with form inputs */}
          <View style={styles.contentContainer}>
            {/* Section for category icon and name input */}
            <View style={styles.iconNameContainer}>
              <View style={styles.imageContainer}>
                {categoryIcon && (
                  <Image source={categoryIcon} style={styles.categoryIcon} />
                )}
              </View>
              <View style={styles.nameInputContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange("name", value)}
                  placeholder="Enter name"
                  placeholderTextColor="#D3D3D3"
                />
              </View>
            </View>

            {/* Category selection dropdown */}
            <View style={styles.categoryContainer}>
              <Text style={styles.label}>Category</Text>
              <DropDownPicker
                open={openCategory} // Dropdown open state
                value={formData.category} // Currently selected category
                items={categories} // List of categories
                setOpen={setOpenCategory} // Toggle dropdown
                onSelectItem={(category) => {
                  handleInputChange("category", category.value); // Handle category change
                }}
                placeholder="Select a category"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownLabel}
                maxHeight={170}
                itemSeparator={true}
                itemSeparatorStyle={{ backgroundColor: "#D3D3D3" }}
                selectedItemContainerStyle={{ backgroundColor: "#D3D3D3" }}
                selectedItemLabelStyle={{ fontWeight: "bold" }}
              />
            </View>
          </View>

          {/* Date inputs for purchased and expiry dates */}
          <View style={styles.dateContainer}>
            <View style={styles.dateGroup}>
              <Text style={styles.label}>Purchased</Text>
              <TouchableOpacity
                onPress={() => setShowPurchasedDatePicker(true)}
              >
                <View pointerEvents="none">
                  <TextInput
                    style={styles.dateInput}
                    value={formatToDateString(formData.purchasedDate)} // Display formatted date
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#D3D3D3"
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.dateGroup}>
              <Text style={styles.label}>Expiry</Text>
              <TouchableOpacity onPress={() => setShowExpiryDatePicker(true)}>
                <View pointerEvents="none">
                  <TextInput
                    style={styles.dateInput}
                    value={formatToDateString(formData.expiryDate)} // Display formatted expiry date
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#D3D3D3"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Button to submit the form */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {isEditing ? "Update Item" : "Add To Inventory"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Render date picker component */}
      {renderDatePicker}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Styles for the container and layout
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  card: {
    borderWidth: 0.8,
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  statusHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: "800",
  },
  statusTextContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
  },
  statusText: {
    fontWeight: "bold",
  },
  contentContainer: {
    padding: 15,
  },
  iconNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    borderWidth: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
  },
  nameInputContainer: {
    flex: 1,
    width: 100,
  },
  label: { fontSize: 20, fontWeight: "bold" },
  categoryContainer: {
    marginBottom: 15,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 5,
    fontSize: 20,
    fontWeight: "400",
  },
  dropdownLabel: {
    fontSize: 17,
    fontWeight: "500",
    color: "#333333",
  },
  dropdown: {
    borderWidth: 0,
    borderBottomWidth: 1,
  },
  dropdownContainer: {
    borderColor: "#D3D3D3",
    borderRadius: 10,
    marginTop: 5,
  },
  dateContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingBottom: 15,
    zIndex: -1,
  },
  dateGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 5,
    fontSize: 15,
  },
  button: {
    backgroundColor: "grey",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    margin: 20,
    zIndex: -1,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default AddScreen;
