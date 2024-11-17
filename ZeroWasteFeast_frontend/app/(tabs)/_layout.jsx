import React, { useState } from "react";
import { Text, View, Platform } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";

const TabIcon = ({ iconName, color, name, focused }) => {
  return (
    <View className="items-center justify-center gap-2">
      <Ionicons name={iconName} size={24} color={color} />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"}`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  const router = useRouter();

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <GestureHandlerRootView>
        <MenuProvider>
          <Tabs
            screenOptions={{
              tabBarShowLabel: false,
              tabBarActiveTintColor: "#FFA001",
              tabBarInactiveTintColor: "#CDCDE0",
              tabBarStyle: {
                backgroundColor: "#4d433a",
                borderTopWidth: 1,
                borderTopColor: "#232533",
                height: Platform.OS === "ios" ? 80 : 75,
                paddingBottom: Platform.OS === "ios" ? 10 : 0,
              },
            }}
          >
            <Tabs.Screen
              name="home"
              options={{
                title: "Home",
                headerShown: false,
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon
                    iconName={focused ? "home" : "home-outline"}
                    color={color}
                    name="Home"
                    focused={focused}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="InventoryScreen"
              options={{
                title: "InventoryScreen",
                headerShown: false,
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon
                    iconName={focused ? "nutrition" : "nutrition-outline"}
                    color={color}
                    name="Inventory"
                    focused={focused}
                  />
                ),
              }}
              listeners={{
                tabPress: (e) => {
                  // Prevent default action
                  e.preventDefault();
                  // Navigate to InventoryScreen with default params
                  router.push({
                    pathname: "/InventoryScreen",
                    params: {
                      name: "All Category",
                      backgroundColor: "#6d85a4",
                    },
                  });
                },
              }}
            />
            <Tabs.Screen
              name="AddScreen"
              options={{
                title: "AddScreen",
                headerShown: false,
                tabBarButton: () => (
                  <View
                    className="items-center justify-center"
                    style={{ marginBottom: 40 }}
                  >
                    <Menu>
                      <MenuTrigger>
                        <View className="items-center justify-center w-16 h-16 rounded-full bg-tomato">
                          <Ionicons
                            name="add-circle"
                            size={65}
                            color="#FFA001"
                          />
                        </View>
                      </MenuTrigger>

                      <MenuOptions
                        optionsContainerStyle={{
                          width: 250,
                          position: "absolute",
                          left: 50,
                          backgroundColor: "#FFFFFF",
                          borderRadius: 8,
                          shadowColor: "#000",
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                          elevation: 5,
                        }}
                      >
                        <MenuOption
                          className="items-center"
                          onSelect={() =>
                            router.push({
                              pathname: "/AddScreen",
                              mode: "add",
                            })
                          }
                        >
                          <Text className="text-lg px-4 py-2 w-full text-center">
                            Manually Add Food
                          </Text>
                        </MenuOption>
                        <MenuOption
                          className="items-center"
                          onSelect={() => router.push("/scanner")}
                        >
                          <Text className="text-lg px-4 py-2 w-full text-center">
                            Camera Add Food
                          </Text>
                        </MenuOption>
                        <MenuOption
                          className="items-center"
                          onSelect={() => console.log("Cancel")}
                        >
                          <Text className="text-lg px-4 py-2 w-full text-center">
                            Cancel
                          </Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="MapScreen"
              options={{
                title: "MapScreen",
                headerShown: false,
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon
                    iconName={focused ? "map" : "map-outline"}
                    color={color}
                    name="Donation"
                    focused={focused}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="StatsScreen"
              options={{
                title: "StatsScreen",
                headerShown: false,
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon
                    iconName={focused ? "stats-chart" : "stats-chart-outline"}
                    color={color}
                    name="Stats"
                    focused={focused}
                  />
                ),
              }}
            />
          </Tabs>
        </MenuProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default TabsLayout;
