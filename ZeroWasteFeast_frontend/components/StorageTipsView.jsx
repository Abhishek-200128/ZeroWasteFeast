import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const StorageTipsView = ({ tips, isLoading, onClose }) => {
  const screenHeight = Dimensions.get("window").height;

  if (isLoading) {
    return (
      <View
        className="absolute bottom-5 left-5 right-5 bg-white p-4 rounded-lg shadow-lg items-center justify-center border-2 border-secondary"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          height: screenHeight / 2,
        }}
      >
        <ActivityIndicator size="large" color="#000000" />
        <Text className="mt-2 text-base" numberOfLines={1} adjustsFontSizeToFit>
          Loading storage tips from Gemini...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="absolute bottom-5 left-5 right-5 bg-white p-4 rounded-lg shadow-lg border-2 border-secondary"
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={true}
      persistentScrollbar={true}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        height: screenHeight / 2,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold">Storage Tips</Text>
        <Feather
          name="chevron-down"
          size={32}
          color="#4A5568"
          onPress={onClose}
        />
      </View>
      <Text className="text-base mt-2">{tips}</Text>
    </ScrollView>
  );
};

export default StorageTipsView;
