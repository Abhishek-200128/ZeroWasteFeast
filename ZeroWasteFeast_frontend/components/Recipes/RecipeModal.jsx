import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Animated,
  Image,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import cookingIcon from "../../assets/icons/cooking_outline.png";
import { saveRecipeData, loadRecipeData } from "../../data/DataController";

const RecipeModal = ({ isVisible, onClose, recipe }) => {
  const [activeTab, setActiveTab] = useState("Ingredients");
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const stickyHeaderHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateStickyHeader();
    checkIfRecipeIsSaved();
  }, [headerVisible, recipe]);

  const animateStickyHeader = () => {
    Animated.timing(stickyHeaderHeight, {
      toValue: headerVisible ? 0 : 60,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setHeaderVisible(offsetY <= 300);
  };

  const handleOnClose = () => {
    setHeaderVisible(true);
    onClose();
  };

  const checkIfRecipeIsSaved = async () => {
    if (recipe) {
      const savedRecipes = await loadRecipeData();
      setIsSaved(
        savedRecipes.some((savedRecipe) => savedRecipe.id === recipe.id)
      );
    }
  };

  const handleSaveRecipe = async () => {
    try {
      const savedRecipes = await loadRecipeData();
      if (isSaved) {
        const updatedRecipes = savedRecipes.filter(
          (savedRecipe) => savedRecipe.id !== recipe.id
        );
        await saveRecipeData(updatedRecipes);
        setIsSaved(false);
        Alert.alert(
          "Recipe Removed",
          "The recipe has been removed from your saved list."
        );
      } else {
        const updatedRecipes = [...savedRecipes, recipe];
        await saveRecipeData(updatedRecipes);
        setIsSaved(true);
        Alert.alert(
          "Recipe Saved",
          "The recipe has been added to your saved list."
        );
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert(
        "Error",
        "There was an error saving the recipe. Please try again."
      );
    }
  };

  const renderHeader = () => (
    <ImageBackground source={recipe.image} style={styles.header}>
      <TouchableOpacity
        onPress={handleOnClose}
        activeOpacity={0.6}
        style={styles.backIcon}
      >
        <Ionicons name="chevron-back-outline" size={30} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleSaveRecipe}
        activeOpacity={0.6}
        style={[styles.saveIcon, isSaved && styles.activeSaveIcon]}
      >
        <Ionicons
          name={isSaved ? "bookmark" : "bookmark-outline"}
          size={30}
          color={isSaved ? "#FFA001" : "white"}
        />
      </TouchableOpacity>
    </ImageBackground>
  );

  const renderStars = (rating, maxStars = 5) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return Array.from({ length: maxStars }, (_, index) => {
      if (index < fullStars) {
        return (
          <Ionicons
            key={`full-${index}`}
            name="star"
            size={30}
            color="#fcd303"
          />
        );
      } else if (index === fullStars && hasHalfStar) {
        return (
          <Ionicons key="half" name="star-half" size={30} color="#fcd303" />
        );
      } else {
        return (
          <Ionicons
            key={`empty-${index}`}
            name="star-outline"
            size={30}
            color="#fcd303"
          />
        );
      }
    });
  };

  const renderTitle = () => {
    const rating = Math.min(recipe.steps.length / 2, 5);

    return (
      <View style={styles.titleSection}>
        <Text style={styles.title}>{recipe.title}</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{recipe.ingredients.length}</Text>
            <Text style={styles.infoLabel}>INGREDIENTS</Text>
          </View>
          <View style={styles.infoSeparator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DIFFICULTY</Text>
            <View style={styles.starsContainer}>{renderStars(rating)}</View>
          </View>
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <>
      <Animated.View
        style={[styles.stickyHeader, { height: stickyHeaderHeight }]}
      >
        <TouchableOpacity onPress={handleOnClose} activeOpacity={0.6}>
          <Ionicons name="chevron-back-outline" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.stickyTitle} numberOfLines={1}>
          {recipe.title}
        </Text>
      </Animated.View>
      <View style={styles.tabContainer}>
        {["Ingredients", "Instructions"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderIngredients = () => (
    <View style={styles.contentContainer}>
      {recipe.ingredients.map((ingredient, index) => (
        <View key={index} style={styles.ingredientItem}>
          <Image source={cookingIcon} style={styles.ingredientIcon} />
          <Text style={styles.ingredientName}>{ingredient}</Text>
        </View>
      ))}
      <View style={styles.endOfListSeparator} />
    </View>
  );

  const renderInstructions = () => (
    <View style={styles.contentContainer}>
      {recipe.steps.map((step, index) => (
        <React.Fragment key={index}>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumberContainer}>
              <Text style={styles.instructionNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{step}</Text>
          </View>
          <View style={styles.instructionSeparator} />
        </React.Fragment>
      ))}
      <View style={styles.finalStepContainer}>
        <Text style={styles.finalStepText}>{"Serve with a smile :)"}</Text>
        <View style={styles.endOfListSeparator} />
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "Ingredients":
        return renderIngredients();
      case "Instructions":
        return renderInstructions();
      default:
        return null;
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleOnClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={400}
      animationOutTiming={400}
      backdropTransitionInTiming={400}
      backdropTransitionOutTiming={400}
    >
      <View style={styles.modalContent}>
        <ScrollView
          stickyHeaderIndices={[2]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {recipe && renderHeader()}
          {recipe && renderTitle()}
          {recipe && renderTabs()}
          {recipe && renderContent()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "90%",
    overflow: "hidden",
  },
  header: {
    height: 200,
    justifyContent: "space-between",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  backIcon: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(128, 128, 128, 0.4)",
    borderRadius: 30,
    padding: 7,
  },
  saveIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(128, 128, 128, 0.4)",
    borderRadius: 30,
    padding: 7,
  },
  activeSaveIcon: {
    backgroundColor: "rgba(77, 67, 58, 0.8)",
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 15,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  infoRow: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#444",
  },
  infoSeparator: {
    borderWidth: 0.7,
    borderColor: "lightgrey",
    height: 60,
    marginHorizontal: 30,
  },
  starsContainer: {
    flexDirection: "row",
    marginTop: 5,
  },
  stickyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  stickyTitle: {
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  tab: {
    paddingVertical: 15,
    flex: 1,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "black",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "black",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 10,
  },
  ingredientIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  ingredientName: {
    fontSize: 18,
    flex: 1,
    color: "#333",
    fontWeight: "500",
  },
  ingredientQuantity: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  instructionNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  instructionNumber: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  instructionText: {
    marginTop: 2,
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: "#333",
  },
  instructionSeparator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  finalStepContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  finalStepText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontStyle: "italic",
  },
  endOfListSeparator: {
    width: "100%",
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 20,
  },
});

export default RecipeModal;
