import React, { useState, useEffect } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"; // Importing MapView and Marker for displaying the map and markers
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Button,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Handling safe area insets for screen padding
import * as Location from "expo-location"; // Importing location services from Expo
import axios from "axios"; // Axios for API requests
import { Linking } from "react-native"; // Linking to open URLs like Google Maps
import CustomButton from "../../components/CustomButton"; // Custom button component
import { ScrollView } from "react-native-gesture-handler"; // ScrollView for scrolling content
import Feather from "react-native-vector-icons/Feather"; // Icon library for UI
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Fontisto from "react-native-vector-icons/Fontisto";

function MapScreen(props) {
  const [mapRegion, setMapRegion] = useState({
    latitude: -37.8136, // Initial map coordinates (Melbourne)
    longitude: 144.9631,
    latitudeDelta: 0.0922, // Zoom level
    longitudeDelta: 0.0421,
  });

  const [places, setPlaces] = useState([]); // State to store nearby places
  const [errorMsg, setErrorMsg] = useState(null); // State to store error messages
  const [userLocation, setUserLocation] = useState(null); // State to store user's current location
  const [selectedPlace, setSelectedPlace] = useState(null); // State to store the selected place details

  const insets = useSafeAreaInsets(); // Handling safe area insets

  // Function to get the user's current location
  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied!");
      return;
    }
    try {
      // Watch the user's location and update the map region
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, // High accuracy for GPS
          timeInterval: 1000,
          distanceInterval: 10, // Update location every 10 meters
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          setMapRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          fetchPlaces(location.coords.latitude, location.coords.longitude); // Fetch nearby places
        }
      );

      return () => {
        locationSubscription && locationSubscription.remove(); // Clean up subscription when the component unmounts
      };
    } catch (error) {
      console.error("Error watching location", error);
      setErrorMsg("Failed to watch current location, please try again.");
    }
  };

  // Fetch nearby places based on the user's location
  const fetchPlaces = async (latitude, longitude) => {
    const apiKey = "AIzaSyCcOTPltvuKz1oJWAZV1jUrvbhRVinCM3Y"; // Google API key
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=point_of_interest&keyword=food+donation+center&key=${apiKey}`;

    try {
      const response = await axios.get(url); // Fetching nearby places
      setPlaces(response.data.results.slice(0, 10)); // Pick top 10 results
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to fetch places!");
    }
  };

  // Fetch detailed information about a selected place
  const fetchPlaceDetails = async (placeId) => {
    const apiKey = "AIzaSyCcOTPltvuKz1oJWAZV1jUrvbhRVinCM3Y";
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const details = response.data.result;

      const photoReference = details.photos
        ? details.photos[0].photo_reference
        : null;
      const photoUrl = photoReference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`
        : null;

      return {
        ...details, // Return detailed info
        photoUrl, // Return photo URL if available
      };
    } catch (error) {
      console.error("Error fetching place details:", error);
      setErrorMsg("Failed to fetch place details!");
    }
  };

  // Fetch distance and duration between user's location and selected place
  const fetchDistanceAndDuration = async (
    originLat,
    originLng,
    destinationLat,
    destinationLng
  ) => {
    const apiKey = "AIzaSyCcOTPltvuKz1oJWAZV1jUrvbhRVinCM3Y";
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destinationLat},${destinationLng}&mode=driving&key=${apiKey}`;
    const url_walk = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destinationLat},${destinationLng}&mode=walking&key=${apiKey}`;
    try {
      const response = await axios.get(url);
      const data = response.data.rows[0].elements[0];
      const response_walk = await axios.get(url_walk);
      const data_walk = response_walk.data.rows[0].elements[0];
      return {
        distance: data.distance.text, // Driving distance
        duration: data.duration.text, // Driving time
        duration_walk: data_walk.duration.text, // Walking time
      };
    } catch (error) {
      console.error("Error fetching distance and duration:", error);
    }
  };

  // Handle marker press event
  const handleMarkerPress = async (place) => {
    const details = await fetchPlaceDetails(place.place_id); // Fetch details of the place
    const destinationLat = place.geometry.location.lat;
    const destinationLng = place.geometry.location.lng;

    // Fetch distance and driving time
    if (userLocation) {
      const { distance, duration, duration_walk } =
        await fetchDistanceAndDuration(
          userLocation.latitude,
          userLocation.longitude,
          destinationLat,
          destinationLng
        );

      setSelectedPlace({
        ...place,
        details, // Attach detailed info
        distance,
        duration,
        duration_walk,
      });
    }
  };

  // Hide selected place details when tapping elsewhere on the map
  const handleMapPress = (event) => {
    if (selectedPlace) {
      setSelectedPlace(null);
    }
  };

  // Open Google Maps for directions
  const handleGetLocationPress = () => {
    if (selectedPlace && userLocation) {
      const destinationLat = selectedPlace.geometry.location.lat;
      const destinationLng = selectedPlace.geometry.location.lng;
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${destinationLat},${destinationLng}`;
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open Google Maps", err)
      );
    }
  };

  // Call getUserLocation on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Set status bar style */}
      <StatusBar
        barStyle={Platform.OS === "ios" ? "default" : "dark-content"}
      />
      <View className="flex-1 justify-between items-start">
        {/* Header section */}
        <View className="flex justify-between items-start flex-row mb-3 px-4">
          <View>
            <Text className="text-3xl font-pmedium text-gray-800 py-2">
              Donation Suggestion
            </Text>
            <Text
              className="font-pmedium text-sm text-gray-800 px-1"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Navigate to nearest donation centers ↓
            </Text>
          </View>
        </View>
        {/* Divider line */}
        <View className="bg-gray-300 h-px w-full" />

        {/* Error message */}
        {errorMsg ? <Text>{errorMsg}</Text> : null}

        {/* Map View */}
        <MapView
          style={styles.map}
          region={mapRegion} // Set map region to user location or default
          onPress={handleMapPress} // Hide place details when tapping on the map
          showsMyLocationButton
          showsUserLocation
        >
          {places.map((place, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              }}
              title={place.name}
              description={place.vicinity}
              onPress={() => handleMarkerPress(place)} // Fetch place details when pressing a marker
            />
          ))}
        </MapView>

        {/* Selected place details */}
        {selectedPlace && (
          <ScrollView
            className="absolute bottom-5 left-5 right-5 bg-white p-4 rounded-lg shadow-lg max-h-96 border-2 border-secondary"
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            {/* Place name */}
            <View className="flex-row items-center justify-between">
              <Text selectable={true} className="text-lg font-bold">
                {selectedPlace.name}
              </Text>
              <Feather
                name="chevron-down"
                size={32}
                color="#4A5568"
                onPress={() => handleMapPress()} // Close the place details
              />
            </View>

            {/* Distance and travel time */}
            <View className="flex-row items-center">
              <Fontisto name="map-marker-alt" size={16} color="#4A5568" />
              <Text className="text-base px-1 pr-1">
                {selectedPlace.distance}
                {"   "}
              </Text>
              <AntDesign name="car" size={16} color="#4A5568" />
              <Text className="text-base px-1">{selectedPlace.duration} </Text>
              <MaterialIcons name="directions-walk" size={16} color="#4A5568" />
              <Text className="text-base px-1">
                {selectedPlace.duration_walk}{" "}
              </Text>
            </View>

            {/* Place photo */}
            <View>
              {selectedPlace.details?.photoUrl ? (
                <Image
                  source={{ uri: selectedPlace.details.photoUrl }}
                  style={{ width: "100%", height: 200, borderRadius: 10 }}
                />
              ) : (
                <Text className="text-base text-gray-500">No picture</Text>
              )}
            </View>

            {/* Navigate button */}
            <CustomButton
              title="Navigate"
              handlePress={handleGetLocationPress} // Open Google Maps for directions
              containerStyles="w-full mt-3"
            />

            {/* Opening hours */}
            {selectedPlace.details?.opening_hours && (
              <Text className="text-base mt-1">
                Open Now:{" "}
                {selectedPlace.details.opening_hours.open_now ? "Yes" : "No"}
              </Text>
            )}

            {/* Weekday hours */}
            {selectedPlace.details?.opening_hours?.weekday_text && (
              <View className="mt-1">
                {selectedPlace.details.opening_hours.weekday_text.map(
                  (day, index) => (
                    <Text key={index} className="text-base">
                      {day}
                    </Text>
                  )
                )}
              </View>
            )}

            {/* Additional place details */}
            {selectedPlace.details?.description && (
              <Text className="text-base mt-1">
                Description: {selectedPlace.details.description}
              </Text>
            )}
            <Text selectable={true} className="text-base mt-1">
              Address: {selectedPlace.details?.formatted_address}
            </Text>
            <Text selectable={true} className="text-base mt-1">
              Phone: {selectedPlace.details?.formatted_phone_number}
            </Text>
            <Text selectable={true} className="text-base mt-1">
              Website: {selectedPlace.details?.website}
            </Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default MapScreen;
