import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome"; // Import FontAwesome icons for visual elements
import Card from "../../components/StatsScreen/Card";
import PercentageWasteCard from "../../components/StatsScreen/PercentageWasteCard";
import MonthlyWasteCard from "../../components/StatsScreen/MonthlyWasteCard";
import AverageWasteCard from "../../components/StatsScreen/AverageWasteCard";
import NationalComparisonCard from "../../components/StatsScreen/NationalComparisonCard";
import AdditionalInformation from "../../components/StatsScreen/AddtionalInformation";
import { tipsData } from "../../data/tipsData"; // Import the tips data from an external file
import Modal from "react-native-modal"; // Modal for displaying additional information
import { Ionicons } from "@expo/vector-icons"; // Importing icons from Ionicons

function StatsScreen(props) {
  const [randomTip, setRandomTip] = useState({ title: "", description: "" }); // State to store a random tip
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [showDataSources, setShowDataSources] = useState(false); // State to toggle data sources visibility

  const insets = useSafeAreaInsets(); // Safe area insets for padding on devices with notches

  const closeModal = () => {
    setModalVisible(false); // Function to close the modal
  };

  // Generate a random tip on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * tipsData.tips.length);
    setRandomTip(tipsData.tips[randomIndex]); // Set a random tip from the tips data
  }, []); // This effect runs only once, when the component is mounted

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Adjusting status bar style based on platform */}
      <StatusBar
        barStyle={Platform.OS === "ios" ? "default" : "dark-content"}
      />

      {/* Scrollable view for stats */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Header */}
        <View className="flex justify-between items-start flex-row mb-3 px-4">
          <View>
            <Text className="text-3xl font-pmedium text-gray-800 py-2">
              Your Stats
            </Text>
            <Text
              className="font-pmedium text-sm text-gray-800 px-1"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Check your waste data with other Aussie
            </Text>
          </View>
        </View>

        {/* Cards displaying waste stats */}
        <MonthlyWasteCard />
        <NationalComparisonCard />
        <PercentageWasteCard />
        <AverageWasteCard />

        {/* Additional Information section, opens modal when clicked */}
        <Card>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.cardContent}
          >
            <Text style={styles.additionalInfoText}>Food Consumption Data</Text>
            <Icon name="chevron-right" size={20} color="#000" />
          </TouchableOpacity>
        </Card>

        {/* Random tip section */}
        <View style={styles.tipContainer}>
          <Icon
            name="lightbulb-o"
            size={40}
            color="#FFD700"
            style={styles.icon}
          />
          <Text style={styles.tipTitle}>Tip of the Day:</Text>
          <Text style={styles.tipText}>{randomTip.title}</Text>
          <Text style={styles.tipDescription}>{randomTip.description}</Text>
        </View>

        {/* Toggle button for data sources */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.descriptionToggle}
            onPress={() => setShowDataSources(!showDataSources)}
          >
            <Text style={styles.descriptionToggleText}>
              {showDataSources ? "Hide" : "Show"} Data Sources
            </Text>
            <Ionicons
              name={showDataSources ? "chevron-up" : "chevron-down"}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>

          {/* Data source information */}
          {showDataSources && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Data Sources :</Text>
              <View style={styles.descriptionList}>
                <Text style={styles.descriptionPoint}>
                  • Australian Bureau of Statistics (ABS)
                </Text>
                <Text style={styles.descriptionPoint}>
                  • Source: Apparent Consumption of Selected Foodstuffs,
                  Australia
                </Text>
                <Text>Australian grocery product, Source: Kaggle</Text>
                <Text style={styles.descriptionPoint}>
                  • URL:
                  https://www.abs.gov.au/statistics/health/health-conditions-and-risks/apparent-consumption-selected-foodstuffs-australia/2022-23/4316DO001_202223_ESTIMATES.xlsx
                </Text>
                <Text style={styles.descriptionPoint}>
                  • Last updated: 2022-23 financial year
                </Text>
                <Text style={styles.descriptionPoint}>
                  • License: CC BY 2.5 AU
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal for showing additional information */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeModal}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <AdditionalInformation closeModal={closeModal} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
  },
  scrollViewContent: {},
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    resizeMode: "cover",
  },
  tipContainer: {
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tipText: {
    color: "tomato",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 16,
    textAlign: "left",
    color: "#666",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  additionalInfoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#f8f9fa",
    height: "90%",
  },
  descriptionToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  descriptionToggleText: {
    fontSize: 16,
    color: "#007AFF",
    marginRight: 5,
  },
  descriptionContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  descriptionList: {
    marginLeft: 10,
  },
  descriptionPoint: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default StatsScreen;
