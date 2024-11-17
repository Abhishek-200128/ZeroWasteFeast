import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Dimensions,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as Device from 'expo-device';
import Animated, {
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { DataType } from "../data/data";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ProgressBar from "react-native-progress/Bar";
import { router } from "expo-router";
import {
  calculateFreshnessPercentage,
  getProgressColor,
} from "../../../data/HelperFunctions";

type Props = {
  newData: DataType[];
  setNewData: React.Dispatch<React.SetStateAction<DataType[]>>;
  maxVisibleItems: number;
  item: DataType;
  index: number;
  dataLength: number;
  animatedValue: SharedValue<number>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  inventoryData: any[];
};

const { width: screenWidth, height: screenHeight  } = Dimensions.get('window');

const renderFreshnessSection = ({
  fillPercentage,
  progressColorLowSaturation,
}: {
  fillPercentage: number;
  progressColorLowSaturation: string;
}) => (
  <View>
    <View style={styles.freshnessTextContainer}>
      <Text style={styles.freshnessLabel}>Average Freshness</Text>
      <Text style={[styles.freshnessPercentage, { textAlign: "right" }]}>
        {Math.round(fillPercentage)}%
      </Text>
    </View>
    <View style={styles.freshnessBarContainer}>
      <ProgressBar
        height={15}
        progress={fillPercentage / 100}
        color={progressColorLowSaturation}
        borderRadius={10}
        borderWidth={3}
      />
    </View>
  </View>
);

const Card = ({
  newData,
  setNewData,
  maxVisibleItems,
  item,
  index,
  dataLength,
  animatedValue,
  currentIndex,
  setCurrentIndex,
  inventoryData,
}: Props) => {
  // const [deviceName, setDeviceName] = useState('');
  // const {height: screenHeight  } = Dimensions.get('window');
  // useEffect(() => {
  //   const fetchDeviceName = async () => {
  //     const name = await Device.deviceName;
  //     setDeviceName(name || 'Unknown Device');
  //   };

  //   fetchDeviceName();
  // }, []);
  // console.log(deviceName, screenHeight);

  const currentDate = new Date();
  const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };
  const filteredInventoryData = item.name === "All Category"
    ? inventoryData.filter(goods => parseDate(goods.expiry_date) >= currentDate)
    : inventoryData.filter(goods => 
        goods.category === item.name && parseDate(goods.expiry_date) >= currentDate
      );

  const itemPercentages = filteredInventoryData.map((goods) => {
    const isStored = goods.status === "Stored";
    return isStored
      ? calculateFreshnessPercentage(goods.purchase_date, goods.expiry_date)
      : 100;
  });
  const averageFillPercentage =
    itemPercentages.length > 0
      ? itemPercentages.reduce((sum, percentage) => sum + percentage, 0) /
        itemPercentages.length
      : 0;
  const roundedAverageFillPercentage = Math.round(averageFillPercentage);

  const progressColor = getProgressColor(roundedAverageFillPercentage);

  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const direction = useSharedValue(0);

  const handleCardPress = () => {
    router.push({
      pathname: "/InventoryScreen",
      params: {
        name: item.name,
        backgroundColor: item.backgroundColor,
      },
    });
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
      "worklet";
      direction.value = 0;
    })
    .onUpdate((e) => {
      "worklet";
      const isSwipeRight = e.translationX > 0;
      direction.value = isSwipeRight ? 1 : -1;

      if (currentIndex === index) {
        translateX.value = e.translationX;
        animatedValue.value = interpolate(
          Math.abs(e.translationX),
          [0, width],
          [index, index + 1]
        );
      }
    })
    .onEnd((e) => {
      "worklet";
      if (currentIndex === index) {
        if (Math.abs(e.translationX) > 100 || Math.abs(e.velocityX) > 500) {
          translateX.value = withTiming(width * direction.value, {}, () => {
            runOnJS(setNewData)([...newData, newData[currentIndex]]);
            runOnJS(setCurrentIndex)(currentIndex + 1);
          });
          animatedValue.value = withTiming(currentIndex + 1);
        } else {
          translateX.value = withTiming(0, { duration: 500 });
          animatedValue.value = withTiming(currentIndex, { duration: 500 });
        }
      }
    });

  const tap = Gesture.Tap().onEnd(() => {
    "worklet";
    if (direction.value === 0) {
      runOnJS(handleCardPress)();
    }
  });

  const combinedGesture = Gesture.Simultaneous(gesture, tap);

  const animatedStyle = useAnimatedStyle(() => {
    const currentItem = index === currentIndex;

    const translateY = interpolate(
      animatedValue.value,
      [index - 1, index],
      [-30, 0]
    );

    const scale = interpolate(
      animatedValue.value,
      [index - 1, index],
      [0.9, 1]
    );

    const rotateZ = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [0, 20]
    );

    const opacity = interpolate(
      animatedValue.value + maxVisibleItems,
      [index, index + 1],
      [0, 1]
    );

    return {
      transform: [
        { translateY: currentItem ? 0 : translateY },
        { scale: currentItem ? 1 : scale },
        { translateX: translateX.value },
        {
          rotateZ: currentItem ? `${direction.value * rotateZ}deg` : "0deg",
        },
      ],
      opacity: index < currentIndex + maxVisibleItems ? 1 : opacity,
    };
  });

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: item.backgroundColor, zIndex: dataLength - index },
          animatedStyle,
        ]}
      >
        <View style={styles.top}>
          <Text style={styles.textName}>{item.name}</Text>
          <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.image} />
          </View>
        </View>
        <View style={styles.middle}>
          <Text style={styles.textNumber}>{item.number}</Text>
        </View>
        <View style={styles.middle}>
          {filteredInventoryData.length > 0 ? (
            renderFreshnessSection({
              fillPercentage: roundedAverageFillPercentage,
              progressColorLowSaturation: progressColor,
            })
          ) : (
            <Text style={styles.freshnessLabel}>No records</Text>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export default Card;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: screenWidth - 20,
    height: screenHeight < 800 ? 180 : 210,
    borderRadius: 28,
    padding: 16,
  },
  top: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
  },
  imageContainer: {
    width: 120,
    height: 70,
  },
  image: {
    width: 120,
    height: 70,
    resizeMode: "contain",
  },
  middle: {
    flex: 2,
    justifyContent: "center",
  },
  textNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  bottom: {
    flex: 1,
    flexDirection: "row",
    gap: 56,
  },
  freshnessTextContainer: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  freshnessLabel: {
    fontSize: 18,
    fontWeight: "500",
  },
  freshnessPercentage: {
    fontWeight: "800",
    fontSize: 20,
    color: "#333",
  },
  freshnessBarContainer: { marginTop: 5 },
  consumedPercentageTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
});
