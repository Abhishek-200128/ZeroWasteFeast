import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import InventoryItemContent from "./InventoryItemContent";

const InventoryList = ({
  listMode,
  inventoryData,
  setInventoryData,
  resetFiltersButton,
  search,
  selectedStatus,
  selectedCategories,
  setSelectedStatus,
  setSelectedCategories,
  setSearch,
  scrollRef,
}) => {
  const resetFilters = () => {
    setSelectedStatus("Stored");
    setSelectedCategories([]);
    setSearch("");
  };

  const filteredAndSortedInventory = useMemo(() => {
    let filtered = inventoryData;

    if (listMode === "summary") {
      const today = new Date();
      filtered = inventoryData.filter((item) => {
        const expiryDate = new Date(
          Date.parse(item.expiry_date.split("/").reverse().join("-"))
        );
        const daysUntilExpiry = Math.ceil(
          (expiryDate - today) / (1000 * 60 * 60 * 24)
        );
        return (
          daysUntilExpiry <= 3 &&
          daysUntilExpiry >= 0 &&
          item.status === "Stored"
        );
      });
    } else {
      filtered = inventoryData.filter((item) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus =
          selectedStatus.length === 0 || selectedStatus.includes(item.status);
        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes(item.category);
        return matchesSearch && matchesStatus && matchesCategory;
      });
    }

    return filtered.sort((a, b) => {
      const daysUntilExpiry = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(
          Date.parse(expiryDate.split("/").reverse().join("-"))
        );
        return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      };

      if (listMode === "summary") {
        return daysUntilExpiry(a.expiry_date) - daysUntilExpiry(b.expiry_date);
      }

      const daysSinceDate = (dateString) => {
        const today = new Date();
        const date = new Date(
          Date.parse(dateString.split("/").reverse().join("-"))
        );
        return Math.ceil((today - date) / (1000 * 60 * 60 * 24));
      };

      const aIsStored = a.status === "Stored";
      const bIsStored = b.status === "Stored";

      if (aIsStored && !bIsStored) return -1;
      if (!aIsStored && bIsStored) return 1;

      if (aIsStored && bIsStored) {
        return daysUntilExpiry(a.expiry_date) - daysUntilExpiry(b.expiry_date);
      }

      if (!aIsStored && !bIsStored) {
        const aDate = a.expiry_date;
        const bDate = b.expiry_date;
        return daysSinceDate(aDate) - daysSinceDate(bDate);
      }

      return 0;
    });
  }, [inventoryData, search, selectedStatus, selectedCategories, listMode]);

  const onDismiss = useCallback((updatedItem, direction) => {
    setInventoryData((prevInventoryData) =>
      prevInventoryData.map((item) =>
        item.id === updatedItem.id
          ? { ...item, status: direction === "LEFT" ? "Consumed" : "Donated" }
          : item
      )
    );
  }, []);

  return (
    <View>
      <View style={styles.startOfListLine} />
      <View style={styles.summaryContent}>
        <Text style={styles.itemCount}>
          {filteredAndSortedInventory.length} Items
        </Text>
        {resetFiltersButton && listMode !== "summary" && (
          <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.listContainer}>
        {filteredAndSortedInventory.map((item) => (
          <InventoryItemContent
            key={item.id}
            inventoryData={inventoryData}
            setInventoryData={setInventoryData}
            item={item}
            scrollRef={scrollRef}
            onDismiss={onDismiss}
          />
        ))}
      </View>
      <View style={styles.endOfListLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContent: {
    marginTop: 0,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCount: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 5,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    marginTop: 5,
    paddingHorizontal: 8,
  },
  startOfListLine: {
    marginTop: 10,
    marginBottom: 5,
    borderBottomColor: "grey",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  endOfListLine: {
    marginTop: 5,
    marginBottom: 10,
    borderBottomColor: "grey",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default InventoryList;
