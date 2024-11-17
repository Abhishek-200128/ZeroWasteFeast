import * as Notifications from 'expo-notifications';
import { Platform } from "react-native";
import { router } from 'expo-router';

export const initializeNotifications = async () => {
  await Notifications.requestPermissionsAsync();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  // special setting for new Android OS
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Add notification response listener
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    setTimeout(() => {
      router.replace('/home');
      router.push('/dailyReport');
    }, 1000); // delay 1 second for router initial
  });

  // Remove the listener when it's no longer needed
  return () => {
    Notifications.removeNotificationSubscription(responseListener);
  };
};
