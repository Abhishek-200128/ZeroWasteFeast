import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  FlatList,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import CustomButton from "../components/CustomButton";

// Get device screen dimensions
const { height, width } = Dimensions.get("window");

// Array of images and their descriptions
const imagesArray = [
  { image: images.cards, description: "Photo & Log all your food in the app." },
  {
    image: images.cards1,
    description: "Help monitoring food inventory at all times.",
  },
  {
    image: images.cards2,
    description: "Quickly log the status of your food consumption.",
  },
  {
    image: images.cards3,
    description: "Offer thoughtful food storage recommendations.",
  },
  {
    image: images.cards4,
    description: "Generates personalized recipes based on your inventory.",
  },
  {
    image: images.cards5,
    description: "Save your favorite recipes. AND MORE...",
  },
];

export default function App() {
  // State to track the active (visible) image index
  const [activeIndex, setActiveIndex] = useState(0);

  // Handler for the scroll event, updating the active index based on scroll position
  const onScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setActiveIndex(currentIndex);
  };

  // Render function for each item in the FlatList
  const renderItem = ({ item }) => (
    <View
      className="w-full justify-center items-center"
      style={{ width: width }}
    >
      {/* Displaying the image */}
      <Image
        source={item.image}
        className="max-w-[380px] w-full h-[500px] mb-3"
        resizeMode="contain"
      />
      {/* Displaying the image description */}
      <View className="w-full items-center">
        <Text
          className="text-lg font-pregular text-gray-800 pb-4 px-1"
          numberOfLines={1}
          adjustsFontSizeToFit={true}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="bg-white h-full">
      {/* Status bar appearance */}
      <StatusBar style="dark" />
      {/* Main content wrapped in a ScrollView */}
      <ScrollView>
        <View className="w-full justify-center items-center">
          {/* Horizontal FlatList for image swipe */}
          <FlatList
            data={imagesArray}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            snapToInterval={width} // Ensures snapping to each image
            decelerationRate="fast"
          />
          {/* Dots indicator for current image */}
          <View className="flex-row justify-center">
            {imagesArray.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index === activeIndex ? "#FFA001" : "#CCC",
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>
          {/* Bottom section with the app title and button */}
          <View
            className="flex-1 w-full justify-end items-center px-4"
            style={{
              marginTop: height > 900 ? 80 : 0,
            }}
          >
            {/* App title */}
            <View className="relative mb-1">
              <Text
                className="text-3xl text-gray-800 font-bold text-center"
                numberOfLines={2}
                adjustsFontSizeToFit={true}
              >
                Save your food and money with{" "}
                <Text className="text-secondary-200 font-ppacifico">
                  ZeroWaste{" "}
                  <Text className="text-black font-pnunito">Feast</Text>
                </Text>
              </Text>
            </View>
            {/* Custom button to navigate to home screen */}
            <CustomButton
              title="Start"
              handlePress={() => {
                router.replace("/home");
              }}
              containerStyles="w-full mt-7"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
