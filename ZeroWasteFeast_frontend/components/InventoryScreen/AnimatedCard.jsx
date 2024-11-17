import React, { useState } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faHandHoldingMedical } from "@fortawesome/free-solid-svg-icons/faHandHoldingMedical";
import { faUtensils } from "@fortawesome/free-solid-svg-icons/faUtensils";
import ItemDetailModal from "./ItemDetailModal";

const LIST_ITEM_HEIGHT = 100;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TRANSLATE_X_THRESHOLD = SCREEN_WIDTH * 0.3;

const AnimatedCard = ({
  children,
  isStored,
  scrollRef,
  onDismiss,
  inventoryData,
  setInventoryData,
  item,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(LIST_ITEM_HEIGHT);
  const marginBottom = useSharedValue(5);
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0);
  const elevation = useSharedValue(0);

  const panGesture = createPanGesture(
    translateX,
    itemHeight,
    marginBottom,
    onDismiss,
    item,
    scrollRef
  );

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(1.02, { duration: 200 });
      shadowOpacity.value = withTiming(0.2, { duration: 200 });
    })
    .onFinalize(() => {
      scale.value = withTiming(1, { duration: 200 });
      shadowOpacity.value = withTiming(0, { duration: 200 });
    })
    .onEnd(() => {
      runOnJS(setIsModalVisible)(true);
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
    shadowRadius: interpolate(shadowOpacity.value, [0.1, 0.3], [2, 4]),
    elevation: elevation.value,
  }));

  const rItemContainerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    marginBottom: marginBottom.value,
  }));

  const rIconContainerStyle = useAnimatedStyle(() => ({
    opacity: withTiming(
      Math.abs(translateX.value) > TRANSLATE_X_THRESHOLD ? 0 : 1
    ),
  }));

  return (
    <Animated.View style={[styles.listItemGap, rItemContainerStyle]}>
      {isStored && renderSwipeIcons(rIconContainerStyle)}
      {isStored ? (
        <GestureDetector gesture={Gesture.Race(panGesture, tapGesture)}>
          <Animated.View style={[styles.card, rStyle]}>
            {children}
          </Animated.View>
        </GestureDetector>
      ) : (
        <GestureDetector gesture={tapGesture}>
          <Animated.View style={[styles.card, rStyle]}>
            {children}
          </Animated.View>
        </GestureDetector>
      )}
      <ItemDetailModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        inventoryData={inventoryData}
        setInventoryData={setInventoryData}
        item={item}
      />
    </Animated.View>
  );
};

const createPanGesture = (
  translateX,
  itemHeight,
  marginBottom,
  onDismiss,
  item,
  scrollRef
) => {
  const activeOffsetX = [-10, 10];
  const failOffsetY = [-10, 10];

  return Gesture.Pan()
    .activeOffsetX(activeOffsetX)
    .failOffsetY(failOffsetY)
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd(() => {
      const shouldBeDismissedLeft = translateX.value < -TRANSLATE_X_THRESHOLD;
      const shouldBeDismissedRight = translateX.value > TRANSLATE_X_THRESHOLD;
      if (shouldBeDismissedLeft || shouldBeDismissedRight) {
        const dismissDirection = shouldBeDismissedLeft ? "LEFT" : "RIGHT";
        translateX.value = withTiming(
          dismissDirection === "LEFT" ? -SCREEN_WIDTH : SCREEN_WIDTH
        );
        itemHeight.value = withTiming(0);
        marginBottom.value = withTiming(0, undefined, (isFinished) => {
          if (isFinished && onDismiss)
            runOnJS(onDismiss)(item, dismissDirection);
        });
      } else {
        translateX.value = withTiming(0);
      }
    })
    .simultaneousWithExternalGesture(scrollRef);
};

const renderSwipeIcons = (rIconContainerStyle) => (
  <Animated.View style={rIconContainerStyle}>
    <LinearGradient
      style={styles.donateIconContainer}
      colors={["#e0f7df", "#f0f0f0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <FontAwesomeIcon
        icon={faHandHoldingMedical}
        size={LIST_ITEM_HEIGHT * 0.4}
        color="green"
      />
    </LinearGradient>
    <LinearGradient
      style={styles.consumeIconContainer}
      colors={["#f7f4c0", "#f0f0f0"]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 0 }}
    >
      <FontAwesomeIcon
        icon={faUtensils}
        size={LIST_ITEM_HEIGHT * 0.4}
        color="#8b4513"
      />
    </LinearGradient>
  </Animated.View>
);

const styles = StyleSheet.create({
  listItemGap: { marginBottom: 5 },
  card: {
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0,
    shadowRadius: 2,
    elevation: 1,
  },
  donateIconContainer: {
    height: LIST_ITEM_HEIGHT,
    width: LIST_ITEM_HEIGHT * 2,
    position: "absolute",
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 30,
  },
  consumeIconContainer: {
    height: LIST_ITEM_HEIGHT,
    width: LIST_ITEM_HEIGHT * 2,
    position: "absolute",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 30,
    borderRadius: 10,
    right: "0%",
  },
});

export default AnimatedCard;
