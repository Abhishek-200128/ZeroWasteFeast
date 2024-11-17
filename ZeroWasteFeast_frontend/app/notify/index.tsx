import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Platform,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from "react-native";
import * as Notifications from "expo-notifications";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { initializeNotifications } from "./notifications"; // Initialize notification settings
import CustomButton from "../../components/CustomButton"; // Custom button component

// Call to initialize notification settings on app startup
initializeNotifications();

const Notify: React.FC = () => {
  const router = useRouter(); // Router for navigation
  const title = "Here's your daily report!"; // Notification title
  const body = "Click for further details.."; // Notification body
  const [time, setTime] = useState<Date>(new Date()); // State to hold the selected time
  const [showTimePicker, setShowTimePicker] = useState<boolean>(Platform.OS === "ios" ? true : false); // Control visibility of time picker
  const notificationIdentifierRef = useRef<string | null>(null); // Store the notification identifier
  const [isNotificationEnabled, setIsNotificationEnabled] = useState<boolean>(false); // Track notification permission state
  const insets = useSafeAreaInsets(); // Get safe area insets for padding

  // Run once when the component mounts to check notification permissions
  useEffect(() => {
    checkNotificationPermission();
  }, []);

  // Check if the app has permission to send notifications
  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setIsNotificationEnabled(status === "granted"); // Update state based on permission status
  };

  // Toggle notification permission (request permission if not already granted)
  const toggleNotificationPermission = async () => {
    if (isNotificationEnabled) {
      // Notify the user to disable notifications through settings if already enabled
      Alert.alert(
        "Disable Notifications",
        "To disable notifications, please go to your device settings.",
        [{ text: "OK" }]
      );
    } else {
      // Request permission for notifications
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        setIsNotificationEnabled(true); // Enable notifications if permission granted
        Alert.alert("Success", "Notification permission granted");
      } else {
        Alert.alert(
          "Error",
          "Failed to enable notifications, please go to your device settings."
        );
      }
    }
  };

  // Schedule a recurring notification at the specified time each day
  const scheduleNotification = async (): Promise<string> => {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: { title, body }, // Notification content
      trigger: {
        hour: time.getHours(), // Trigger time (hour)
        minute: time.getMinutes(), // Trigger time (minute)
        repeats: true, // Repeat daily
      },
    });
    return identifier; // Return the notification identifier
  };

  // Send a notification immediately
  const handleShowNotification = (): void => {
    Notifications.scheduleNotificationAsync({
      content: { title, body }, // Content of the immediate notification
      trigger: null, // Trigger immediately
    });
  };

  // Cancel all scheduled notifications
  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync(); // Cancel all scheduled notifications
      Alert.alert("Success", "All scheduled notifications have been canceled");
    } catch (error) {
      console.error("Error canceling notifications:", error);
      Alert.alert("Error", "Failed to cancel notifications");
    }
  };

  // Schedule a new notification after canceling any existing ones
  const handleScheduleNotification = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync(); // Clear all existing notifications
    const id = await scheduleNotification(); // Schedule the new notification
    notificationIdentifierRef.current = id; // Store the notification ID
  };

  // Show the time picker (used for Android)
  const showTimepicker = (): void => {
    setShowTimePicker(true);
  };

  // Handle changes in the time picker
  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date): void => {
    if (event.type === "set" && selectedTime) {
      setTime(selectedTime); // Update the selected time
      Platform.OS === "ios" ? setShowTimePicker(true) : setShowTimePicker(false);
    } else {
      Platform.OS === "ios" ? setShowTimePicker(true) : setShowTimePicker(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with back button and title */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={32} color="#4A5568" />
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Toggle for enabling/disabling notifications */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Enable Notifications{"     "}</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isNotificationEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleNotificationPermission}
            value={isNotificationEnabled}
            style={styles.switch}
          />
        </View>

        {/* Time picker for setting notification time */}
        <View style={styles.timePickerContainer}>
          <Text style={styles.timePickerLabel}>Set your notification time:</Text>
          {Platform.OS === "android" && (
            <TouchableOpacity onPress={showTimepicker} style={styles.timePickerButton}>
              <Ionicons name="time-outline" size={40} color="grey" />
            </TouchableOpacity>
          )}
          {/* Display time picker (visible for iOS by default) */}
          {showTimePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={time}
              mode="time"
              is24Hour={true}
              display={Platform.OS === "ios" ? "default" : "spinner"}
              onChange={onTimeChange} // Handle changes to the selected time
            />
          )}
        </View>

        {/* Button to schedule the daily notification */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Schedule daily notification"
            handlePress={() => {
              handleScheduleNotification();
              Alert.alert("Success", "Notification time updated");
            }}
            containerStyles={styles.button}
          />
        </View>

        {/* Button to cancel all scheduled notifications */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Cancel all notifications"
            handlePress={() => {
              cancelAllNotifications();
            }}
            containerStyles={styles.button}
          />
        </View>

        {/* Button to show a notification immediately */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Show notification now"
            handlePress={() => {
              handleShowNotification();
              Alert.alert("Success", "Send notification immediately");
            }}
            containerStyles={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

// Styles for the screen components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "black",
    marginLeft: 10,
  },
  content: {
    padding: 16,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#4A5568",
  },
  switch: {
    marginLeft: 10,
  },
  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  timePickerLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#4A5568",
    marginRight: 10,
  },
  timePickerButton: {
    padding: 5,
  },
  buttonContainer: {
    marginBottom: 15,
  },
  button: {
    width: "100%",
  },
});

export default Notify;
