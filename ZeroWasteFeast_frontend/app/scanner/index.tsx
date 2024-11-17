import React, { useState, useEffect, useRef } from "react";
import { Camera, CameraView, CameraCapturedPicture } from "expo-camera";
import {
  Alert,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { AppState, AppStateStatus, Linking, SafeAreaView } from "react-native";
import { Overlay } from "./Overlay";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import Ionicons from "react-native-vector-icons/Ionicons";
import { MaterialIcons } from "@expo/vector-icons";

// CameraMode type can either be "scan" for barcode scanning or "photo" for image capture
type CameraMode = "scan" | "photo";

// Get device screen dimensions
const { width, height } = Dimensions.get("window");

export default function Home() {
  // State to manage camera permissions
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  // State to control modal visibility
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  // State to toggle between scanning and photo capture modes
  const [cameraMode, setCameraMode] = useState<CameraMode>("scan");
  // State to hold the captured image
  const [capturedImage, setCapturedImage] =
    useState<ImageManipulator.ImageResult | null>(null);
  // Reference to prevent multiple QR code scans in quick succession
  const qrLock = useRef<boolean>(false);
  // Reference to track app state (background or active)
  const appState = useRef<AppStateStatus>(AppState.currentState);
  // @ts-ignore Reference for the camera
  const cameraRef = useRef<Camera | null>(null);
  // State to hold fetched product details
  const [category, setCategory] = useState<string>("");
  const [name, setName] = useState<string>("");
  // React Navigation's router for navigating between screens
  const router = useRouter();

  // Function to fetch product details based on a barcode
  const fetchDataScan = async (barcode: string) => {
    const API_URL = `https://tj0peg1rqk.execute-api.ap-southeast-2.amazonaws.com/deploy/get_product?id=${barcode}`;
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      console.log("Fetched data:", data);
      setCategory(data.category);
      setName(data.name);

      // Displaying the fetched data in an alert
      Alert.alert(
        "Product Information",
        `Name: ${data.name}\nCategory: ${data.category}`,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to AddScreen with the fetched product details
              router.push({
                pathname: "/AddScreen",
                params: { name: data.name, category: data.category },
              });
            },
          },
        ]
      );
    } catch (error) {
      console.log("Error fetching data:", error);
      Alert.alert("Error", "Failed to fetch product information");
    }
  };

  // Request camera permissions and handle app state changes
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      if (status !== "granted") {
        setModalVisible(true); // Show modal if permission is denied
      }
    })();

    // Listener for app state changes (background or active)
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false; // Unlock QR scanning when app returns to active
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Request camera permission from user
  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
    setModalVisible(false); // Hide modal after permission is granted
    if (status !== "granted") {
      // Show alert to guide the user to enable permissions from settings
      Alert.alert(
        "Permission required",
        "Camera permission is required to use this feature. Please grant permission in your device settings.",
        [{ text: "OK", onPress: () => Linking.openSettings() }]
      );
    }
  };

  // Function to capture a photo
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        // Capture the photo
        const photo = await cameraRef.current.takePictureAsync();

        // Crop the image to a square and resize it
        const squareSize = Math.min(photo.width, photo.height);
        const cropRegion = {
          originX: Math.round((photo.width - squareSize) / 2),
          originY: Math.round((photo.height - squareSize) / 2),
          width: squareSize,
          height: squareSize,
        };

        const manipResult = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ crop: cropRegion }, { resize: { width: 320, height: 320 } }],
          { format: ImageManipulator.SaveFormat.JPEG }
        );
        setCapturedImage(manipResult);

        // Show a preview of the captured image and options to use or retake
        Alert.alert("Photo Preview", "Do you want to use this photo?", [
          {
            text: "Retake",
            onPress: () => setCapturedImage(null),
            style: "cancel",
          },
          {
            text: "Use Photo",
            onPress: () => sendPhotoToBackend(manipResult.uri),
          },
        ]);
      } catch (error) {
        console.error("Error in takePicture:", error);
        Alert.alert("Error", "Failed to capture image");
      }
    }
  };

  // Function to send the captured image to the backend
  const sendPhotoToBackend = async (imageUri: string) => {
    const API_URL = `https://tj0peg1rqk.execute-api.ap-southeast-2.amazonaws.com/deploy/get_produce?type=fruit`;
    console.log("Start sending photo to backend");
    try {
      // Convert image to base64 format
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("Image converted to base64, sending to backend:");

      // Send the base64 image to the backend API
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);

      // Show the image recognition result in an alert
      Alert.alert(
        "Image Recognition Result",
        `Label: ${data.label}\nCategory: ${data.category}\nConfidence: ${data.confidence}%`,
        [
          {
            text: "OK",
            onPress: () => {
              setCapturedImage(null); // Clear captured image
              router.push({
                pathname: "/AddScreen",
                params: { name: data.label, category: data.category },
              });
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error in sendPhotoToBackend:", error);

      // Show error alert with retry options
      Alert.alert(
        "Error",
        "Failed to recognise the food. Please try again.",
        [
          {
            text: "Retry",
            onPress: () => {
              sendPhotoToBackend(imageUri); // Retry sending the image
            },
          },
          {
            text: "Retake",
            style: "cancel",
            onPress: () => setCapturedImage(null),
          },
        ],
        { cancelable: true }
      );
    }
  };

  // Function to toggle between barcode scanning and photo modes
  const toggleCameraMode = () => {
    setCameraMode((prevMode) => (prevMode === "scan" ? "photo" : "scan"));
  };

  // If camera permission is not yet determined, return an empty view
  if (hasPermission === null) {
    return <View />;
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      {/* Stack screen configuration */}
      <Stack.Screen
        options={{
          title: "Overview",
          headerShown: false,
        }}
      />
      {/* If permission is granted, render the camera view */}
      {hasPermission === true ? (
        <CameraView
          ref={cameraRef}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13"],
          }}
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={
            cameraMode === "scan"
              ? ({ data }: { data: string }) => {
                  // Handle barcode scan
                  if (data && !qrLock.current) {
                    qrLock.current = true; // Lock scanning to prevent multiple scans
                    setTimeout(async () => {
                      fetchDataScan(data); // Fetch data based on barcode
                    }, 500);
                  }
                }
              : undefined
          }
        />
      ) : null}
      <Overlay cameraMode={cameraMode} />

      {/* Back button */}
      <View
        style={{ position: "absolute", top: height * 0.1, left: 10, zIndex: 1 }}
      >
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/home");
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={32} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Button to toggle camera mode */}
      <TouchableOpacity style={styles.modeButton} onPress={toggleCameraMode}>
        <MaterialIcons name="change-circle" size={32} color="#4A5568" />
        <Text style={styles.modeButtonText}>
          {cameraMode === "scan"
            ? "Switch to Photo Recognition Mode"
            : "Switch to Barcode Scan Mode"}
        </Text>
      </TouchableOpacity>

      {/* Camera mode description text */}
      <Text
        style={styles.modeDescription}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {cameraMode === "scan"
          ? "Scan the barcode on the package ↓"
          : "Take a photo of fresh goods ↓"}
      </Text>

      {/* Capture button for photo mode */}
      {cameraMode === "photo" && (
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <Text style={styles.captureButtonText}>Take Photo</Text>
        </TouchableOpacity>
      )}

      {/* Modal to request camera permissions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Camera permission is required to use this feature.
            </Text>
            <TouchableOpacity style={styles.button} onPress={requestPermission}>
              <Text style={styles.textStyle}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Display the captured image when in photo mode */}
      {capturedImage && (
        <View style={styles.capturedImageContainer}>
          <Image
            source={{ uri: capturedImage.uri }}
            style={styles.capturedImage}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Styles for the modal view
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
  },
  backButton: {
    padding: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  modeDescription: {
    position: "absolute",
    top: height * 0.2,
    alignSelf: "center",
    padding: 10,
    borderRadius: 5,
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 20,
  },
  modeButton: {
    position: "absolute",
    flexDirection: 'row', 
    alignItems: 'center',
    bottom: height * 0.15,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  modeButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  captureButton: {
    position: "absolute",
    bottom: height * 0.05,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 15,
    borderRadius: 30,
  },
  captureButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  capturedImageContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  capturedImage: {
    width: 320,
    height: 320,
  },
});
