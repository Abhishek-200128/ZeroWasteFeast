import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  VictoryChart,
  VictoryTheme,
  VictoryBar,
  VictoryAxis,
} from "victory-native";
import {
  saveInventoryData,
  loadInventoryData,
} from "../../data/DataController";
import { useFocusEffect } from "expo-router";
import Card from "./Card";

const json = require("json-keys-sort");

// Mapping of months
const monthsMap = {
  1: ["Jan", "January"],
  2: ["Feb", "February"],
  3: ["Mar", "March"],
  4: ["Apr", "April"],
  5: ["May", "May"],
  6: ["Jun", "June"],
  7: ["Jul", "July"],
  8: ["Aug", "August"],
  9: ["Sep", "September"],
  10: ["Oct", "October"],
  11: ["Nov", "November"],
  12: ["Dec", "December"],
};

// Helper function to get the month name from the date
const getMonthName = (dateString) => {
  const [day, month, year] = dateString.split("/");
  const date = new Date(+year, month - 1, +day);
  return date.toLocaleString("default", { month: "short" });
};

// Function to process the data for charts
const processData = (data) => {
  const monthlyWaste = {};
  const typeWaste = {};

  data.forEach((ingredient) => {
    const currentYear = new Date().getFullYear();

    if (ingredient.status === "Expired") {
      const [day, month, year] = ingredient.expiry_date.split("/").map(Number);

      // Only include data from the current year
      if (year === currentYear) {
        const monthName = getMonthName(ingredient.expiry_date);
        const type = ingredient.category;

        // Grouping waste by month
        monthlyWaste[month] = (monthlyWaste[month] || 0) + 1;

        // Grouping waste by type for each month
        if (!typeWaste[monthName]) typeWaste[monthName] = [];
        const typeEntry = typeWaste[monthName].find((item) => item.x === type);
        if (typeEntry) {
          typeEntry.y += 1;
        } else {
          typeWaste[monthName].push({ x: type, y: 1 });
        }
      }
    }
  });

  // Sort monthly waste data by keys
  const sortedMonthlyWaste = json.sort(monthlyWaste, true);

  // Convert sorted data into the desired array format
  const monthData = Object.entries(sortedMonthlyWaste).map(
    ([month, waste]) => ({
      Month: monthsMap[month][0],
      Month_Full: monthsMap[month][1],
      Wasted_Items: waste,
    })
  );

  return { monthData, typeWaste };
};

export default function MonthlyWasteCard() {
  const [inventoryData, setInventoryData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // Initialize empty string
  const [selectedMonthLong, setSelectedMonthLong] = useState(""); // Initialize empty string
  const [isUserSelection, setIsUserSelection] = useState(false); // Track user selection

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const savedData = await loadInventoryData();
        setInventoryData(savedData);
      };
      loadData();
    }, [])
  );

  const { monthData, typeWaste } = processData(inventoryData);

  var noData = monthData.length === 0;

  // Handle month click event
  const handleMonthPress = (month) => {
    setSelectedMonth(month["Month"]);
    setSelectedMonthLong(month["Month_Full"]);
    setIsUserSelection(true); // User has made a selection
  };

  // Automatically select the last available month in monthData by default
  useEffect(() => {
    // Only set the last month if the user hasn't made a selection
    if (monthData.length > 0 && !isUserSelection) {
      const lastMonth = monthData[monthData.length - 1]; // Get the last month in monthData
      setSelectedMonth(lastMonth.Month); // Set the last month's short name
      setSelectedMonthLong(lastMonth.Month_Full); // Set the last month's full name
    }
  }, [monthData, isUserSelection]); // Add isUserSelection to dependencies

  return (
    <View>
      <Card title="Monthly Food Waste (Number of Items in Each Category)">
        <View style={styles.chartContainer}>
          {noData ? (
            <Text>No Data</Text>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {monthData.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleMonthPress(month)}
                    style={[
                      styles.monthButton,
                      selectedMonth === month.Month && styles.selectedMonth,
                    ]}
                  >
                    <Text style={styles.monthButtonText}>{month.Month}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={
                  typeWaste[selectedMonth] &&
                  typeWaste[selectedMonth]?.length === 2
                    ? 100
                    : typeWaste[selectedMonth]?.length === 3
                    ? 50
                    : typeWaste[selectedMonth]?.length === 4
                    ? 30
                    : 15
                }
              >
                <VictoryAxis
                  tickValues={typeWaste[selectedMonth]?.map((item) => item.x)}
                  tickFormat={typeWaste[selectedMonth]?.map((item) => item.x)}
                  gridComponent={<></>} // Hides grid lines
                  style={{
                    tickLabels: {
                      angle: 10,
                      textAnchor: "middle", // Ensures the text aligns properly when tilted
                    },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  style={styles.hiddenAxis} // Hide the Y-axis elements
                  gridComponent={<></>} // Hides grid lines
                />
                <VictoryBar
                  cornerRadius={6}
                  style={{
                    data: {
                      fill: ({ datum }) => {
                        // Define color mapping based on food type
                        const foodColors = {
                          "Fresh Produce": "#4CAF50",
                          "Cold Storage": "#ADD8E6",
                          Meat: "#AA4A44",
                          Drinks: "#008080",
                          Pantry: "#E1C16E",
                          others: "#A9A9A9",
                        };
                        return foodColors[datum.x] || "#ccc"; // Assign color based on food type or fallback color
                      },
                    },
                  }}
                  data={typeWaste[selectedMonth] || []}
                  labels={({ datum }) => Math.round(datum.y)}
                  x="x"
                  y="y"
                  barWidth={30}
                />
              </VictoryChart>
            </>
          )}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hiddenAxis: {
    axis: { stroke: "transparent" }, // Hide the Y-axis line
    ticks: { stroke: "transparent" }, // Hide the Y-axis ticks
    tickLabels: { fill: "transparent" }, // Hide the Y-axis labels
  },
  monthButton: {
    padding: 10,
    margin: 5,
    backgroundColor: "#EEE",
    borderRadius: 25,
  },
  selectedMonth: {
    backgroundColor: "#A9A9A9",
  },
  monthButtonText: {
    fontSize: 16,
    color: "#333",
  },
});
