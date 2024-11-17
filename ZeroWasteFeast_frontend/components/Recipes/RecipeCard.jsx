import React from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth * 0.85;
const cardSpacing = 16;

const RecipeCard = ({ title, image, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.cardContainer}
    >
      <View style={styles.imageCardContainer}>
        <ImageBackground
          source={image}
          style={styles.recipeCard}
          imageStyle={styles.recipeCardImage}
        >
          <LinearGradient
            colors={["#00000000", "#00000070"]}
            style={styles.gradientOverlay}
          >
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle}>{title}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    marginHorizontal: cardSpacing / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 1,
  },
  imageCardContainer: {
    flex: 1,
    borderRadius: 40,
    overflow: "hidden",
    marginBottom: 12,
  },
  recipeCard: {
    flex: 1,
    justifyContent: "flex-end",
  },
  recipeCardImage: {
    resizeMode: "cover",
  },
  gradientOverlay: {
    height: "70%",
    width: "100%",
    justifyContent: "flex-end",
  },
  recipeInfo: {
    padding: 16,
  },
  recipeTitle: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "bold",
  },
});

export default RecipeCard;
