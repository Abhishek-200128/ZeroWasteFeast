import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Image } from "react-native";

import { icons } from "../constants";

const VideoCard = ({ title }) => {
  const router = useRouter();

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            {/* <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            /> */}
            <View
              className="w-full h-full rounded-lg"
              style={{ backgroundColor: "#4ECDC4" }}
            />
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        </View>

        <View className="pt-2">
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>

      {
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/")}
          className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
        >
          {/* <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          /> */}
          <View
            className="w-full h-full rounded-xl mt-3"
            style={{ backgroundColor: "#4ECDC4" }}
          />
        </TouchableOpacity>
      }
    </View>
  );
};

export default VideoCard;
