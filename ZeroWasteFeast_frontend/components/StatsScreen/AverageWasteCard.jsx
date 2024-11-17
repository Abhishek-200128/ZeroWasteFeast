import { React, useState, useEffect } from "react";
import { View, Text } from "react-native";
import Card from "./Card";

export default function AverageWasteCard() {
  const [avg_waste, setAvgWaste] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const API_URL =
      "https://tj0peg1rqk.execute-api.ap-southeast-2.amazonaws.com/deploy/avgAusWaste";
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setAvgWaste(data.avg_waste);
      })
      .catch((error) => console.log("Error fetching data111:", error));
  };

  return (
    <View>
      <Card
        title="Average Food Waste Per Person in Australia (Yearly)"
        value={avg_waste ? avg_waste + " Kg" : 0 + " Kg"}
      />
    </View>
  );
}
