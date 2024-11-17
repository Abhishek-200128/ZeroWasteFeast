import React, { useState, useCallback } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import Card from "./Card";
import {
  saveInventoryData,
  loadInventoryData,
} from "../../data/DataController";

export default function PercentageWasteCard() {
  const [inventoryData, setInventoryData] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const savedData = await loadInventoryData();
        setInventoryData(savedData);
      };
      loadData();
    }, [])
  );

  const calculateConsumedAndDonatedPercentage = (data) => {
    const nonStoredItems = data.filter((item) => item.status !== "Stored");
    const totalNonStored = nonStoredItems.length;

    const consumedItems = nonStoredItems.filter(
      (item) => item.status === "Consumed"
    ).length;
    const donatedItems = nonStoredItems.filter(
      (item) => item.status === "Donated"
    ).length;

    percentage = ((consumedItems + donatedItems) / totalNonStored) * 100;
    console.log(percentage);
    return percentage ? percentage : 100;
  };

  var noData = inventoryData.length === 0;

  return (
    <View>
      <Card
        title="Percentage of Food Consumed/Donated"
        value={
          noData
            ? "No Data"
            : calculateConsumedAndDonatedPercentage(inventoryData).toFixed(2) +
              "%"
        }
      />
    </View>
  );
}
