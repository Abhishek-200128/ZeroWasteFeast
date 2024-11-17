import { Stack } from "expo-router";

export default function NotificationLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Daily Notification Setting",
          headerShown: false,

        }}
      />
    </Stack>
  );
}
