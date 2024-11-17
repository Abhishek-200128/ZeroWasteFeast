import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Text } from "react-native";
import { VictoryChart, VictoryTheme, VictoryLine } from "victory-native";
import Card from "./Card";
import {
  saveInventoryData,
  loadInventoryData,
} from "../../data/DataController";
import { useFocusEffect } from "expo-router";

export default function NationalComparisonCard() {
  // Initializing states for receiving server data
  const [waste_perc, setWastePerc] = useState(0);
  const [past_percs, setPastPerc] = useState([]);

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

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch server data for finding percentage of food wasted
  const fetchData = async () => {
    const API_URL = "https://tj0peg1rqk.execute-api.ap-southeast-2.amazonaws.com/deploy/ausWastePerc";
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setWastePerc(data.waste_perc);
        setPastPerc(data.past_percs);
      })
      .catch((error) => console.log("Error fetching data:", error));
  };

  // Calculate user percentage of food waste
  waste_count = 0;
  food_len = inventoryData.length;

  inventoryData.forEach((ingredient) => {
    if (ingredient.status === "Expired") {
      waste_count += 1;
    }
  });

  var user_waste_perc =
    food_len > 0 ? Math.round((waste_count / food_len) * 100) : 0;
  const todayYear = new Date().getFullYear();

  // Convert this data into Victory-native format for line chart
  var line_data = [];
  var sum = past_percs.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  var past_len = past_percs.length;

  for (let i = todayYear; i <= todayYear + 10; i++) {
    if (i == todayYear) {
      line_data.push({ x: i, y: waste_perc });
    } else {
      sum = sum + user_waste_perc;
      past_len = past_len + 1;
      var value = sum / past_len;
      line_data.push({ x: i, y: value });
    }
  }

  // Initialise final values to show on the line chart and the text
  final_perc = Math.round(line_data[line_data.length - 1]["y"]);
  final_year = line_data[line_data.length - 1]["x"];
  isUserBetter = waste_perc > user_waste_perc;
  var noData = inventoryData.length === 0;

  return (
    // Draw line chart and it's corresponding text
    <View>
      <Card title="What if we followed you?">
        {noData ? (
          <Text>No Data</Text>
        ) : (
          <View>
            <View style={styles.chartContainer}>
              <VictoryChart
                theme={VictoryTheme.material}
                minDomain={{ y: 0 }}
                maxDomain={{ y: 90 }}
              >
                <VictoryLine
                  interpolation="natural"
                  animate={{
                    duration: 2000,
                    onLoad: { duration: 1000 },
                  }}
                  style={{
                    data: { stroke: "#c43a31" },
                    parent: { border: "1px solid #ccc" },
                  }}
                  data={line_data}
                />
              </VictoryChart>
            </View>

            <Text style={{ fontSize: 18, color: "brown", fontWeight: "bold" }}>
              Australians currently waste{" "}
              <Text style={{ color: "red" }}>{waste_perc}% </Text>
              of their food. If everyone used you as a role model, that
              percentage will{" "}
              <Text
                style={{
                  color: isUserBetter ? "green" : "red",
                }}
              >
                {isUserBetter ? "decrease" : "increase"}
              </Text>{" "}
              to{" "}
              <Text
                style={{
                  color: isUserBetter ? "green" : "red",
                }}
              >
                {final_perc}%
              </Text>{" "}
              by the end of {final_year}.{" "}
              <Text>
                {isUserBetter
                  ? "Thank you and let's keep saving waste together!"
                  : "Let us help you to reduce your waste."}
              </Text>{" "}
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 10,
  },
});
