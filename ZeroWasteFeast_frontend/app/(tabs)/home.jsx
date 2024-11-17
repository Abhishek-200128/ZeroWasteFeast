import React, { useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { images } from "../../constants";
// import useAppwrite from "../../lib/useAppwrite";
// import { getAllPosts, getLatestPosts } from "../../lib/appwrite";
// import { EmptyState, SearchInput, Trending, VideoCard } from "../../components";
import SearchInput from "../../components/SearchInput";
import Trending from "../../components/Trending";
import EmptyState from "../../components/EmptyState";
import VideoCard from "../../components/VideoCard";
import CradSwipeScreen from "../../components/SwipeCards/CradSwipeScreen";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";

const Home = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";

  // const { data: posts, refetch } = useAppwrite(getAllPosts);
  const { latestPosts } = [
    { id: "1", number: 1, color: "#FF6B6B" },
    { id: "2", number: 2, color: "#4ECDC4" },
    { id: "3", number: 3, color: "#45B7D1" },
  ];

  // one flatlist
  // with list header
  // and horizontal flatlist

  return (
    <View className="bg-lightgray flex-1" style={{ paddingTop: insets.top }}>
      {/* <StatusBar
        barStyle={Platform.OS === "ios" ? "default" : "dark-content"}
      /> */}

      <ScrollView>
        <View className="flex">
          <View className="flex justify-between items-start flex-row px-4">
            <View>
              <Text className="font-pmedium text-sm text-gray-800">
                Welcome to
              </Text>
              <Text className="text-3xl font-ppacifico text-secondary-200 py-3">
                ZeroWaste{" "}
                <Text className="text-3xl font-pnunito text-black py-2">
                  Feast
                </Text>
              </Text>
            </View>

            <View className="mt-1.5">
            <TouchableOpacity onPress={() => { router.replace("/") }}>
              <Image
                source={images.logoSmall}
                className="w-12 h-12"
                resizeMode="contain"
              />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex justify-between items-start flex-row mb-2 px-4">
            <Text className="font-pmedium text-sm text-gray-800 px-1">
              Stop wasting your food & save money!
            </Text>
          </View>
          {/* <SearchInput /> */}
          <View className="shadow-2xl bg-gray-200">
            <View className="w-full h-[1px] bg-gray-300"></View>
          </View>
        </View>
        <View className="w-full mb-4">
          <View className="w-full bg-gray-200 py-4 pt-4">
            <View className="w-full">
              <Text className="text-lg font-pregular text-gray-800 pb-4 px-4">
                What's new today
              </Text>
            </View>
            <Trending posts={latestPosts ?? []} />
          </View>
          <View className={`px-4 ${isIOS ? "my-5 pt-5" : "my-2 pt-1"}`}>
            <Text className="text-lg font-ppacifico text-secondary-200">
              Swipe{" "}
              <Text className="text-lg font-pregular text-black">
                & Check Your Food Inventory
              </Text>
            </Text>
          </View>
        </View>
        <View
          className={`flex justify-between items-start  ${
            isIOS ? "py-0" : "py-6"
          }`}
        >
          {/* <Text className="text-2xl font-psemibold text-black px-4 my-2">
            Check Your Food Inventory
          </Text> */}
          <View className="w-full my-20 flex justify-between">
            <CradSwipeScreen />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;
