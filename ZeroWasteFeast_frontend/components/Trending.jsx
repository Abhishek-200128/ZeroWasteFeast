import React, { useState } from "react";
import { useRouter } from "expo-router";
import * as Animatable from "react-native-animatable";
import {
  FlatList,
  Image,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1,
  },
};

const zoomOut = {
  0: {
    scale: 1,
  },
  1: {
    scale: 0.9,
  },
};

const TrendingItem = ({ activeItem, item }) => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.id ? zoomIn : zoomOut}
      duration={500}
    >
      {
        <TouchableOpacity
          className="relative flex justify-center items-center"
          activeOpacity={0.7}
          onPress={() => router.push(item.router)}
        >
          <View
            className="w-72 h-52 rounded-[33px] overflow-hidden shadow-lg"
            style={{ backgroundColor: item.color }}
          >
            {!imageLoaded && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
            <ImageBackground
              source={item.thumbnail}
              className="w-72 h-52 rounded-[33px] overflow-hidden shadow-lg shadow-black/40"
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
            />
            <Text className="absolute top-0 left-0 text-white text-4xl font-bold p-4">
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
      }
    </Animatable.View>
  );
};

const Trending = () => {
  const posts = [
    {
      id: "1",
      name: "Daily Report",
      router: "/dailyReport",
      color: "#FF6B6B",
      thumbnail: require("../assets/images/cover-dailyreport.jpg"),
    },
    {
      id: "2",
      name: "Recipes",
      router: "/recipes",
      color: "#4ECDC4",
      thumbnail: require("../assets/images/cover-recipe.jpg"),
    },
    {
      id: "3",
      name: "Donation Suggestion",
      router: "/MapScreen",
      color: "#45B7D1",
      thumbnail: require("../assets/images/cover-donate.jpg"),
    },
  ];

  const [activeItem, setActiveItem] = useState(posts[0].id);

  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].item.id);
    }
  };

  return (
    <FlatList
      data={posts}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170 }}
    />
  );
};

export default Trending;
