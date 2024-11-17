import { Canvas, DiffRect, rect, rrect } from "@shopify/react-native-skia";
import { Dimensions, Platform, StyleSheet } from "react-native";
import { StatusBar } from 'react-native';

// Get screen dimensions (width and height)
const { width, height } = Dimensions.get("window");

// Calculate window height including the status bar height
const windowHeight = Dimensions.get('window').height + StatusBar.currentHeight!;

// Determine square size based on the smallest dimension (width or height)
const squareSize = Math.min(width, height);

// Define the dimensions for the inner overlay rectangle
const innerDimension = 300;

// Define the outer rectangle covering the entire screen
const outer = rrect(rect(0, 0, width, windowHeight), 0, 0);

// Define the first inner rectangle (used in scan mode)
const inner1 = rrect(
  rect(
    width / 2 - innerDimension / 2, // Center horizontally
    height / 2 - innerDimension / 2, // Center vertically
    innerDimension,
    innerDimension
  ),
  50, // Corner radius for rounded edges
  50
);

// Define the second inner rectangle (used in photo mode)
const inner2 = rrect(
  rect(
    (width - squareSize) / 2,  // Center horizontally for square
    (height - squareSize) / 2, // Center vertically for square
    squareSize,
    squareSize
  ),
  10, // Smaller corner radius
  10
);

// Define the props for the Overlay component, including cameraMode
type OverlayProps = {
  cameraMode: 'scan' | 'photo'; // Camera mode can be either 'scan' or 'photo'
};

// Overlay component rendering the rectangular overlay based on cameraMode
export const Overlay: React.FC<OverlayProps> = ({ cameraMode }) => {
  // Choose the inner rectangle based on camera mode
  const inner = cameraMode === 'photo' ? inner2 : inner1;

  return (
    // Canvas for rendering the overlay
    <Canvas
      style={
        Platform.OS === "android" ? { flex: 1 } : StyleSheet.absoluteFillObject
      }
    >
      {/* DiffRect renders the overlay by cutting out the inner rectangle from the outer */}
      <DiffRect inner={inner} outer={outer} color="black" opacity={0.5} />
    </Canvas>
  );
};