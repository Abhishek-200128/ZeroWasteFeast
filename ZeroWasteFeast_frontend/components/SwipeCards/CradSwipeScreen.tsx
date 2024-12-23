/* eslint-disable react-native/no-inline-styles */
import {StyleSheet, Text, View} from 'react-native';
import React, {useState, useCallback} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  useFocusEffect,
} from "expo-router";
import Card from './components/Card';
import {SystemBars} from 'react-native-bars';
import {data} from './data/data';
import {
  saveInventoryData,
  loadInventoryData,
} from "../../data/DataController";

const CradSwipeScreen = () => {
  const [newData, setNewData] = useState([...data, ...data]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activityIndex, setActivityIndex] = useState(0);
  const animatedValue = useSharedValue(0);
  const MAX = 3;
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

  const animatedStyle = useAnimatedStyle(() => {
    if (animatedValue.value > currentIndex + 0.5) {
      runOnJS(setActivityIndex)(currentIndex + 1);
    } else {
      runOnJS(setActivityIndex)(currentIndex);
    }
    const opacity = interpolate(
      animatedValue.value,
      [currentIndex, currentIndex + 0.3, currentIndex + 0.8, currentIndex + 1],
      [1, 0, 0, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: opacity,
    };
  });

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView>
        {/* If you're not using react-native-bars, you can remove SystemBars */}
        <SystemBars animated={true} barStyle={'light-content'} />
        <View style={styles.cardContainer}>
          {newData.map((item, index) => {
            if (index > currentIndex + MAX || index < currentIndex) {
              return null;
            }
            return (
              <Card
                newData={newData}
                setNewData={setNewData}
                maxVisibleItems={MAX}
                item={item}
                index={index}
                dataLength={newData.length}
                animatedValue={animatedValue}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                key={index}
                inventoryData={inventoryData}
              />
            );
          })}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default CradSwipeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContainer: {
    flex: 3 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    position: 'relative',
    paddingHorizontal: 16,
  },
});
