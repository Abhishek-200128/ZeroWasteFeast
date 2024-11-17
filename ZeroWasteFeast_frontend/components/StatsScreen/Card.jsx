import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const Card = ({ children, title, value, centerTitle, style, colors }) => {
  return (
    <LinearGradient
      colors={colors ? colors : ["#fff7f6", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, styles.gradient, style]}
    >
      <View>
        {title && (
          <Text style={[styles.cardTitle, centerTitle && styles.centerTitle]}>
            {title}
          </Text>
        )}
        {value && <Text style={styles.cardValue}>{value}</Text>}
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 16,
    borderRadius: 10,

    // Shadow properties for iOS
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,

    // Elevation for Android
    elevation: 3,

    borderWidth: 1,
    borderColor: "#ccc",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  cardValue: {
    fontSize: 24,
    color: "tomato",
    fontWeight: "bold",
  },
  gradient: {
    borderRadius: 10, // You can adjust this to match your design
  },
  centerTitle: {
    textAlign: "center", // Center-align the title
  },
});

export default Card;
