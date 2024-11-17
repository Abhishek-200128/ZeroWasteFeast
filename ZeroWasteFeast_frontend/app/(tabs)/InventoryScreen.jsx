import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { SearchBar } from "@rneui/themed";
import InventoryList from "../../components/InventoryScreen/InventoryList";
import {
  saveInventoryData,
  loadInventoryData,
} from "../../data/DataController";
import categoryIconData from "../../data/categoryIconData";
import { generateRandomInventoryItem } from "../../data/randomInventoryGenerator";

const InventoryScreen = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Stored");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const scrollRef = useRef(null);
  const isInitialMount = useRef(true);
  const insets = useSafeAreaInsets();
  const { name, backgroundColor } = useLocalSearchParams(); //get param from homescreen cards

  const updateSelectedCategories = (name) => {
    // Clear the selectedCategories first
    setSelectedCategories([]);

    // If name is provided and not 'All Category', add it to selectedCategories
    if (name && name !== "All Category") {
      setSelectedCategories([name]);
    }
  };

  useEffect(() => {
    if (name) {
      updateSelectedCategories(name);
    }
  }, [name]);

  const getCategoryIcon = (categoryName) => {
    const category = categoryIconData.find((cat) => cat.label === categoryName);
    return category ? category.icon : require("../../assets/icons/box.png"); // Default icon if not found
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      saveInventoryData(inventoryData);
    }
  }, [inventoryData]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const savedData = await loadInventoryData();
        setInventoryData(savedData);
      };
      loadData();
    }, [])
  );

  const status = ["Stored", "Expired", "Donated", "Consumed"];
  const categories = categoryIconData;

  const updateSearch = (search) => {
    setSearch(search);
  };

  const toggleStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prevSelectedCategories) => {
      if (prevSelectedCategories.includes(category)) {
        return prevSelectedCategories.filter((item) => item !== category);
      } else {
        return [...prevSelectedCategories, category];
      }
    });
  };

  // temp functions to add/remove items from inventory for testing purposes
  const addRandomItem = () => {
    const newItem = generateRandomInventoryItem();
    setInventoryData((prevData) => [...prevData, newItem]);
  };

  const removeAllItems = () => {
    setInventoryData([]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "default" : "dark-content"}
        // backgroundColor={headerBackgroundColor}
      />

      <View
        style={[
          styles.header,
          { backgroundColor: backgroundColor || "#6d85a4" },
        ]}
      >
        <View style={styles.top} className="flex-row items-center justify-between">
          <Text
            className="text-2xl font-pmedium text-white flex-1"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Inventory: {name || "All Category"}
          </Text>
          <View style={styles.imageContainer}>
            <Image source={getCategoryIcon(name)} style={styles.image} />
          </View>
        </View>
      </View>
      <SearchBar
        placeholder="Search"
        onChangeText={updateSearch}
        value={search}
        platform="default"
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInputContainer}
      />
      <ScrollView ref={scrollRef}>
        <View style={styles.statusContainer}>
          {status.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => toggleStatus(filter)}
              style={[
                styles.statusButton,
                selectedStatus.includes(filter) && styles.activeStatusButton,
              ]}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  selectedStatus.includes(filter) &&
                    styles.activeStatusButtonText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {name === "All Category" ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollView}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.label}
                onPress={() => toggleCategory(category.label)}
                style={[
                  styles.categoryButton,
                  selectedCategories.includes(category.label) &&
                    styles.activeCategoryButton,
                ]}
              >
                <View
                  style={[
                    styles.categoryIconContainer,
                    selectedCategories.includes(category.label) &&
                      styles.activeCategoryIconContainer,
                  ]}
                >
                  <Image source={category.icon} style={styles.categoryIcon} />
                </View>
                <View style={styles.categoryTextContainer}>
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategories.includes(category.label) &&
                        styles.activeCategoryLabel,
                    ]}
                  >
                    {category.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
        {name === "All Category" ? (
          <InventoryList
            inventoryData={inventoryData}
            setInventoryData={setInventoryData}
            search={search}
            resetFiltersButton={true}
            selectedStatus={selectedStatus}
            selectedCategories={selectedCategories}
            setSearch={setSearch}
            setSelectedStatus={setSelectedStatus}
            setSelectedCategories={setSelectedCategories}
            scrollRef={scrollRef}
          />
        ) : (
          <InventoryList
            inventoryData={inventoryData}
            setInventoryData={setInventoryData}
            search={search}
            resetFiltersButton={false}
            selectedStatus={selectedStatus}
            selectedCategories={selectedCategories}
            setSearch={setSearch}
            setSelectedStatus={setSelectedStatus}
            setSelectedCategories={setSelectedCategories}
            scrollRef={scrollRef}
          />
        )}
        {/* Dev options to add & remove items */}
        {/* <TouchableOpacity
          onPress={addRandomItem}
          style={{
            flex: 1,
            alignItems: "center",
            marginBottom: 10,
            borderWidth: 1,
            borderRadius: 20,
            marginHorizontal: 20,
            padding: 10,
          }}
        >
          <Text>Add Random Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={removeAllItems}
          style={{
            flex: 1,
            alignItems: "center",
            marginBottom: 40,
            borderWidth: 1,
            borderRadius: 20,
            marginHorizontal: 20,
            padding: 10,
          }}
        >
          <Text>Remove All Items</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    // padding: 8,
  },
  header: {
    height: 80,
    // justifyContent: 'center',
    padding: 10,
    // alignItems: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    // marginBottom: 10,
  },
  top: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
  },
  imageContainer: {
    width: 100,
    height: 50,
  },
  image: {
    width: 100,
    height: 50,
    resizeMode: "contain",
  },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchBarInputContainer: {
    backgroundColor: "white",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 8,
  },
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: "#e0e0e0",
  },
  statusButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  activeStatusButton: {
    backgroundColor: "#6d6d6d",
  },
  activeStatusButtonText: {
    color: "white",
  },
  categoryScrollView: {
    paddingTop: 10,
  },
  categoryButton: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  categoryIconContainer: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  activeCategoryIconContainer: {
    backgroundColor: "#e0e0e0",
  },
  categoryIcon: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  categoryTextContainer: {
    width: 70,
    alignItems: "center",
  },
  categoryLabel: {
    marginTop: 5,
    fontSize: 15,
    color: "#333",
    textAlign: "center",
    textAlignVertical: "center",
  },
  activeCategoryLabel: {
    color: "black",
    fontWeight: "bold",
  },
});

export default InventoryScreen;
