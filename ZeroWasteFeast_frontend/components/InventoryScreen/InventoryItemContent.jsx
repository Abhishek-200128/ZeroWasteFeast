import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { ListItem } from "@rneui/themed";
import { CircularProgress } from "react-native-circular-progress";
import AnimatedCard from "./AnimatedCard";
import {
  calculateFreshnessPercentage,
  getProgressColor,
  getCategoryIconOutline,
} from "../../data/HelperFunctions";

const LIST_ITEM_HEIGHT = 100;

const InventoryItemContent = ({
  inventoryData,
  setInventoryData,
  item,
  scrollRef,
  onDismiss,
}) => {
  const isStored = item.status === "Stored";
  const fillPercentage = isStored
    ? calculateFreshnessPercentage(item.purchase_date, item.expiry_date)
    : 100;
  const progressColor = getProgressColor(fillPercentage);

  return (
    <AnimatedCard
      isStored={isStored}
      scrollRef={scrollRef}
      onDismiss={onDismiss}
      inventoryData={inventoryData}
      setInventoryData={setInventoryData}
      item={item}
    >
      <ListItem
        bottomDivider
        containerStyle={[
          styles.listItemContainer,
          !isStored && styles.nonStoredItem,
        ]}
      >
        <CircularProgress
          size={60}
          width={5}
          fill={fillPercentage}
          tintColor={isStored ? progressColor : "#808080"}
          backgroundColor={isStored ? "#4A4A4A" : "#d3d3d3"}
          rotation={360}
        >
          {() => (
            <Image
              source={getCategoryIconOutline(item.category)}
              style={styles.itemImage}
            />
          )}
        </CircularProgress>
        <ListItem.Content style={styles.listContent}>
          <View style={styles.itemInfoContainer}>
            <View style={styles.itemMainInfo}>
              <ListItem.Title style={styles.itemName}>
                {item.name}
              </ListItem.Title>
            </View>
            <View style={styles.itemDateInfo}>
              <Text style={styles.itemDate}>Added: {item.purchase_date}</Text>
            </View>
            <View style={styles.itemDateInfo}>
              <Text style={styles.itemDate}>Expires: {item.expiry_date}</Text>
            </View>
          </View>
          <View style={styles.itemStatusContainer}>
            <Text style={styles.itemStatus}>{item.status}</Text>
          </View>
        </ListItem.Content>
      </ListItem>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  listItemContainer: {
    height: LIST_ITEM_HEIGHT,
    flexDirection: "row",
    borderRadius: 10,
    marginBottom: 5,
    overflow: "hidden",
    backgroundColor: "white",
  },
  listContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemInfoContainer: {
    flex: 1,
  },
  itemMainInfo: {
    marginBottom: 5,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemDateInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemDate: {
    fontSize: 12,
    color: "#666",
  },
  itemStatusContainer: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  nonStoredItem: {
    opacity: 0.7,
  },
});

export default InventoryItemContent;
