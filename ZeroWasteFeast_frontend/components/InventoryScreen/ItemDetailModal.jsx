import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import ProgressBar from "react-native-progress/Bar";
import Slider from "@react-native-community/slider";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import shelfLifeData from "../../data/shelfLifeData.json";
import {
  calculateFreshnessPercentage,
  getProgressColorDarker,
  getProgressColorLowSaturation,
  getCategoryIconOutline,
} from "../../data/HelperFunctions";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import StorageTipsView from "../StorageTipsView";

// Helper Components
const RecommendationCard = ({ title, description, icon }) => (
  <View style={styles.recommendationCard}>
    <Image source={icon} style={styles.cardIcon} />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDescription}>{description}</Text>
  </View>
);

// Helper Functions
const ItemDetailModal = ({
  isVisible,
  onClose,
  inventoryData,
  setInventoryData,
  item,
}) => {
  if (!item) return null;

  // State
  const [consumedPercentage, setConsumedPercentage] = useState(
    item.consumed_percentage || 0
  );
  const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState(false);
  const [isDeleteNoteModalVisible, setIsDeleteNoteModalVisible] =
    useState(false);
  const [isDeleteItemModalVisible, setIsDeleteItemModalVisible] =
    useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [storageTipsFlag, setStorageTipsFlag] = useState(false);
  const [storageTips, setStorageTips] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Computed Values
  const fillPercentage = calculateFreshnessPercentage(
    item.purchase_date,
    item.expiry_date
  );
  const progressColorLowSaturation =
    getProgressColorLowSaturation(fillPercentage);

  // Event Handlers
  const handleConsumedPercentageChange = (value) => {
    setConsumedPercentage(value);
  };

  const handleUpdateConsumedPercentage = (value) => {
    const updatedInventoryData = inventoryData.map((i) =>
      i.id === item.id ? { ...i, consumedPercentage: value } : i
    );
    setInventoryData(updatedInventoryData);
  };

  const handleEditItem = () => {
    setStorageTipsFlag(false);
    setStorageTips("");
    onClose();
    router.push({
      pathname: "/AddScreen",
      params: {
        mode: "edit",
        id: item.id,
        name: item.name,
        category: item.category,
        purchaseDate: item.purchase_date,
        expiryDate: item.expiry_date,
        status: item.status,
        consumedPercentage: item.consumed_percentage,
        notes: JSON.stringify(item.notes),
      },
    });
  };

  const handleDeleteItem = () => {
    setIsDeleteItemModalVisible(true);
  };

  const confirmDeleteItem = useCallback(() => {
    setIsDeleting(true);
    setIsDeleteItemModalVisible(false);
    setStorageTipsFlag(false);
    setStorageTips("");
    onClose();

    setTimeout(() => {
      const updatedInventoryData = inventoryData.filter(
        (i) => i.id !== item.id
      );
      setInventoryData(updatedInventoryData);
      setIsDeleting(false);
    }, 400);
  }, [inventoryData, item.id, onClose, setInventoryData]);

  const handleAddNote = () => {
    if (newNote.trim()) {
      const updatedInventoryData = inventoryData.map((i) =>
        i.id === item.id
          ? { ...i, notes: [...(i.notes || []), newNote.trim()] }
          : i
      );
      setInventoryData(updatedInventoryData);
      setNewNote("");
    }
    setIsAddNoteModalVisible(false);
  };

  const handleDeleteNote = (note) => {
    setNoteToDelete(note);
    setIsDeleteNoteModalVisible(true);
  };

  const confirmDeleteNote = () => {
    if (noteToDelete !== null) {
      const updatedInventoryData = inventoryData.map((i) =>
        i.id === item.id
          ? { ...i, notes: i.notes.filter((note) => note !== noteToDelete) }
          : i
      );
      setInventoryData(updatedInventoryData);
      setIsDeleteNoteModalVisible(false);
      setNoteToDelete(null);
    }
  };

  // Render Functions
  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            setStorageTipsFlag(false);
            onClose();
          }}
          style={styles.backIcon}
        >
          <Ionicons name="chevron-back-outline" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Details</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={handleDeleteItem}
            style={styles.deleteIcon}
          >
            <Ionicons name="trash-outline" size={30} color="red" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEditItem} style={styles.editIcon}>
            <Ionicons name="create-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.headerSeparatorLine} />
    </>
  );

  const renderItemDetails = () => (
    <View style={styles.itemDetails}>
      <View style={styles.iconContainer}>
        <Image
          source={getCategoryIconOutline(item.category)}
          style={styles.categoryIcon}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.datesContainer}>
          <Text style={styles.expiryDate}>Expires on {item.expiry_date}</Text>
          <Text style={styles.addedDate}>
            Added by you on {item.purchase_date}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFreshnessSection = () => (
    <View style={styles.freshnessContainer}>
      <View style={styles.freshnessTextContainer}>
        <Text style={styles.freshnessLabel}>Freshness</Text>
        <Text style={[styles.freshnessPercentage, { textAlign: "right" }]}>
          {Math.round(fillPercentage)}%
        </Text>
      </View>
      <View style={styles.freshnessBarContainer}>
        <ProgressBar
          width={null}
          height={15}
          progress={fillPercentage / 100}
          color={progressColorLowSaturation}
          borderRadius={10}
          borderWidth={3}
        />
      </View>
    </View>
  );

  const renderConsumedSection = () => (
    <View style={styles.consumedPercentageContainer}>
      <View style={styles.consumedPercentageTextContainer}>
        <Text style={styles.consumedPercentageLabel}>Remaining</Text>
        <Text style={[styles.consumedPercentageText, { textAlign: "right" }]}>
          {Math.round(consumedPercentage)}%
        </Text>
      </View>
      <Slider
        style={styles.consumedPercentageSlider}
        minimumValue={0}
        maximumValue={100}
        value={consumedPercentage}
        onValueChange={handleConsumedPercentageChange}
        onSlidingComplete={handleUpdateConsumedPercentage}
        step={10}
        minimumTrackTintColor={getProgressColorDarker(consumedPercentage)}
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor={getProgressColorDarker(consumedPercentage)}
      />
    </View>
  );

  const renderRecommendations = () => {
    let recommendations = {
      shelf: "Dependant on Item",
      fridge: "Dependant on Item",
      freezer: "Dependant on Item",
    };

    if (item && item.category && shelfLifeData[item.category]) {
      const categoryData = shelfLifeData[item.category];
      const itemData =
        categoryData.find(
          (food) => food.Food.toLowerCase() === item.name.toLowerCase()
        ) || categoryData.find((food) => food.Food === "General");

      if (itemData) {
        recommendations.shelf = itemData["Shelf life in cupboard"];
        recommendations.fridge = itemData["Shelf life in fridge"];
        recommendations.freezer = itemData["Shelf life in freezer"];
      }
    }

    const giveTips = async (itemName) => {
      console.log("Item name passed to handlePress:", itemName);
      setIsLoading(true);
      setStorageTipsFlag(true);

      if (storageTips != "") {
        console.log("Storage Tips:", storageTips);
        setIsLoading(false);
      } else {
        try {
          const response = await fetch(
            `https://tj0peg1rqk.execute-api.ap-southeast-2.amazonaws.com/deploy/get-tips?productName=${itemName}`
          );
          const data = await response.json();

          if (response.ok) {
            console.log("Storage Tips:", data.storage_tips);
            setStorageTips(data.storage_tips);
          } else {
            Alert.alert("Error", "Failed to fetch storage tips");
          }
        } catch (error) {
          Alert.alert("Error", "Something went wrong");
        } finally {
          setIsLoading(false);
        }
      }
    };

    return (
      <View style={styles.recommendationsContainer}>
        <View className="justify-between items-center flex-row pb-3">
          <Text style={styles.recommendationsTitle}>
            Storage Recommendations
          </Text>
          <TouchableOpacity
            onPress={() => !isLoading && giveTips(item.name)}
            className="flex-row items-center"
            disabled={isLoading}
          >
            <MaterialIcons name="tips-and-updates" size={28} color={isLoading ? "#999" : "#FF9C01"} />
            <Text className={`text-secondary-200 ${isLoading ? 'text-gray-400' : ''}`}>More tips</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recommendationsRow}>
          <RecommendationCard
            title="Shelf"
            description={recommendations.shelf}
            icon={require("../../assets/icons/shelf.png")}
          />
          <RecommendationCard
            title="Fridge"
            description={recommendations.fridge}
            icon={require("../../assets/icons/fridge.png")}
          />
          <RecommendationCard
            title="Freezer"
            description={recommendations.freezer}
            icon={require("../../assets/icons/frost.png")}
          />
        </View>
      </View>
    );
  };

  const renderNotes = () => (
    <View style={styles.notesContainer}>
      <View style={styles.notesHeader}>
        <Text style={styles.notesTitle}>Notes</Text>
        <TouchableOpacity
          style={styles.addNoteButton}
          onPress={() => setIsAddNoteModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="black" />
        </TouchableOpacity>
      </View>
      {item.notes && item.notes.length > 0 ? (
        <FlatList
          data={item.notes}
          keyExtractor={(index) => index.toString()}
          renderItem={({ item: note }) => (
            <View style={styles.noteItem}>
              <Text style={styles.noteText}>{note}</Text>
              <TouchableOpacity
                style={styles.deleteNoteButton}
                onPress={() => handleDeleteNote(note)}
              >
                <Ionicons name="close" size={15} color="#F88A82" />
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View style={styles.noNotesContainer}>
          <Text style={styles.noNotesText}>No Notes</Text>
        </View>
      )}
    </View>
  );

  const renderDeleteItemModal = () => (
    <Modal
      isVisible={isDeleteItemModalVisible}
      onBackdropPress={() => setIsDeleteItemModalVisible(false)}
      style={styles.deleteModal}
    >
      <View style={styles.deleteModalContent}>
        <View style={styles.deleteModalIconContainer}>
          <Ionicons name="trash" size={50} color="red" />
        </View>
        <Text style={styles.deleteModalTitle}>Delete Item</Text>
        <Text style={styles.deleteModalMessage}>
          Are you sure you want to delete this item?
        </Text>
        <View style={styles.deleteModalButtons}>
          <TouchableOpacity
            style={styles.deleteModalButton}
            onPress={() => setIsDeleteItemModalVisible(false)}
          >
            <Text style={styles.deleteModalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteModalButton, styles.deleteModalButtonDelete]}
            onPress={confirmDeleteItem}
          >
            <Text style={[styles.deleteModalButtonText, { color: "white" }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderAddNoteModal = () => (
    <Modal
      isVisible={isAddNoteModalVisible}
      onBackdropPress={() => setIsAddNoteModalVisible(false)}
      style={styles.addNoteModal}
      avoidKeyboard
    >
      <View style={styles.addNoteModalContent}>
        <Text style={styles.addNoteModalTitle}>Add a New Note</Text>
        <TextInput
          style={styles.addNoteInput}
          multiline
          placeholder="Enter your note here"
          value={newNote}
          onChangeText={setNewNote}
        />
        <View style={styles.addNoteModalButtons}>
          <TouchableOpacity
            style={styles.addNoteModalButton}
            onPress={() => setIsAddNoteModalVisible(false)}
          >
            <Text style={styles.addNoteModalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addNoteModalButton, styles.addNoteModalButtonAdd]}
            onPress={handleAddNote}
          >
            <Text style={[styles.addNoteModalButtonText, { color: "white" }]}>
              Add
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderDeleteNoteModal = () => (
    <Modal
      isVisible={isDeleteNoteModalVisible}
      onBackdropPress={() => setIsDeleteNoteModalVisible(false)}
      style={styles.deleteModal}
    >
      <View style={styles.deleteModalContent}>
        <View style={styles.deleteModalIconContainer}>
          <Ionicons name="trash" size={50} color="red" />
        </View>
        <Text style={styles.deleteModalTitle}>Delete Note</Text>
        <Text style={styles.deleteModalMessage}>
          Are you sure you want to delete this note?
        </Text>
        <View style={styles.deleteModalButtons}>
          <TouchableOpacity
            style={styles.deleteModalButton}
            onPress={() => setIsDeleteNoteModalVisible(false)}
          >
            <Text style={styles.deleteModalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteModalButton, styles.deleteModalButtonDelete]}
            onPress={confirmDeleteNote}
          >
            <Text style={[styles.deleteModalButtonText, { color: "white" }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ); // Main Render

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => {
        setStorageTipsFlag(false);
        onClose();
      }}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={400}
      animationOutTiming={400}
      backdropTransitionInTiming={400}
      backdropTransitionOutTiming={400}
    >
      <View style={styles.modalContent}>
        {renderHeader()}
        {renderItemDetails()}
        <View style={styles.sectionSeparatorLine} />
        {renderFreshnessSection()}
        {renderConsumedSection()}
        <View style={styles.sectionSeparatorLine} />
        {renderRecommendations()}
        <View style={styles.sectionSeparatorLine} />
        {renderNotes()}
        <View style={styles.footerLine} />
      </View>
      {renderAddNoteModal()}
      {renderDeleteNoteModal()}
      {renderDeleteItemModal()}
      {storageTipsFlag && (
        <StorageTipsView
          tips={storageTips}
          isLoading={isLoading}
          onClose={() => setStorageTipsFlag(false)}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSeparatorLine: {
    marginTop: 15,
    marginBottom: 15,
    borderBottomColor: "black",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
  },
  backIcon: {
    marginRight: 50,
  },
  deleteIcon: {
    marginRight: 20,
  },
  editIcon: {},
  itemDetails: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  iconContainer: {
    backgroundColor: "transparent",
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 10,
    width: 75,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIcon: {
    width: 75,
    height: 75,
    resizeMode: "contain",
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 25,
    fontWeight: "bold",
  },
  datesContainer: {
    justifyContent: "flex-end",
  },
  expiryDate: {
    fontSize: 16,
    color: "#333",
  },
  addedDate: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  sectionSeparatorLine: {
    marginTop: 15,
    marginBottom: 5,
    borderBottomColor: "#D3D3D3",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  footerLine: {
    marginTop: 10,
    borderBottomColor: "#D3D3D3",
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  consumedPercentageLabel: {
    fontSize: 18,
    fontWeight: "500",
  },
  consumedPercentageText: {
    fontWeight: "800",
    fontSize: 20,
    color: "#333",
  },
  consumedPercentageSlider: {
    height: 40,
  },
  recommendationsContainer: {
    marginTop: 5,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  recommendationsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recommendationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    width: "31.5%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cardIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 12,
    textAlign: "center",
  },
  notesContainer: {
    flex: 1,
    marginTop: 5,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addNoteButton: {},
  notesTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noteItem: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteText: {
    fontSize: 12,
    flex: 1,
  },
  deleteModal: {
    justifyContent: "center",
  },
  deleteModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteModalIconContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  deleteModalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  deleteModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  deleteModalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    width: "45%",
    alignItems: "center",
  },
  deleteModalButtonDelete: {
    backgroundColor: "red",
  },
  deleteModalButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  noNotesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noNotesText: {
    fontSize: 16,
    color: "#999",
  },
  addNoteModal: {
    justifyContent: "center",
  },
  addNoteModalContent: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
  },
  addNoteModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  addNoteInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  addNoteModalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  addNoteModalButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  addNoteModalButtonAdd: {
    backgroundColor: "grey",
    borderRadius: 20,
  },
  addNoteModalButtonText: {
    fontWeight: "bold",
  },
});

export default ItemDetailModal;
