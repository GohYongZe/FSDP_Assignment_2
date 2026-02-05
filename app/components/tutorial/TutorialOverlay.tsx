import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView, // Import SafeAreaView
} from "react-native";
import { useTutorial } from "./useTutorial";
import { tutorials } from "./tutorialSteps";
import { FontAwesome6 } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window"); // Get full height too
const OVERLAY_COLOR = "rgba(0, 0, 0, 0.7)";
const HIGHLIGHT_PADDING = 5; // Padding around the highlighted element

const TutorialOverlay = () => {
  const {
    isTutorialActive,
    stopTutorial,
    tutorialScreen,
    currentStep,
    nextStep,
    prevStep,
    layouts,
    completeTutorial, // Destructure completeTutorial
  } = useTutorial();

  if (!isTutorialActive || !tutorialScreen) {
    return null;
  }

  const steps = tutorials[tutorialScreen];
  if (!steps || currentStep >= steps.length) {
    stopTutorial();
    return null;
  }

  const step = steps[currentStep];
  const totalSteps = steps.length;
  const targetLayout = layouts[step.nativeID];

  if (!targetLayout) {
    console.warn(
      `TutorialOverlay: No layout found for element ID: ${step.nativeID} on screen: ${tutorialScreen}`,
    );
    return null;
  }

  // Calculate coordinates for the cut-out region with padding
  const highlightX = targetLayout.x - HIGHLIGHT_PADDING;
  const highlightY = targetLayout.y - HIGHLIGHT_PADDING;
  const highlightWidth = targetLayout.width + 2 * HIGHLIGHT_PADDING;
  const highlightHeight = targetLayout.height + 2 * HIGHLIGHT_PADDING;

  // Determine popup position
  const popupPosition = step.position || 'bottom';
  let popupTop = 0;
  let popupBottom = 0;
  let popupLeft = 0;
  let popupRight = 0;
  const POPUP_SPACING = 15; // Space between highlight and popup

  // Default popup width
  const popupCalculatedWidth = width - (2 * POPUP_SPACING); // Assuming some horizontal margin

  switch (popupPosition) {
    case 'top':
      popupBottom = height - highlightY + POPUP_SPACING;
      // Ensure popup doesn't go off-screen right
      popupLeft = Math.max(POPUP_SPACING, highlightX);
      popupRight = Math.max(POPUP_SPACING, width - (highlightX + highlightWidth));
      break;
    case 'bottom':
      popupTop = highlightY + highlightHeight + POPUP_SPACING;
       // Ensure popup doesn't go off-screen right
      popupLeft = Math.max(POPUP_SPACING, highlightX);
      popupRight = Math.max(POPUP_SPACING, width - (highlightX + highlightWidth));
      break;
    case 'left':
      // Popup to the left of the highlight
      popupTop = highlightY; // Align top with highlight
      popupRight = width - highlightX + POPUP_SPACING; // Right edge aligns with highlight's left edge
      popupLeft = POPUP_SPACING; // Minimal left margin
      break;
    case 'right':
      // Popup to the right of the highlight
      popupTop = highlightY; // Align top with highlight
      popupLeft = highlightX + highlightWidth + POPUP_SPACING; // Left edge aligns with highlight's right edge
      popupRight = POPUP_SPACING; // Minimal right margin
      break;
  }


  return (
    <SafeAreaView
      style={styles.container}
      // Use pointerEvents to allow/block interaction with the highlighted element
      pointerEvents={step.allowInteraction ? "box-none" : "auto"}
    >
      {/* Dimmed background sections around the highlight */}
      {/* Top overlay */}
      <View
        style={[
          styles.overlayAbsolute,
          {
            height: highlightY,
            width: width,
            backgroundColor: OVERLAY_COLOR,
          },
        ]}
      />
      {/* Bottom overlay */}
      <View
        style={[
          styles.overlayAbsolute,
          {
            top: highlightY + highlightHeight,
            height: height - (highlightY + highlightHeight),
            width: width,
            backgroundColor: OVERLAY_COLOR,
          },
        ]}
      />
      {/* Left overlay */}
      <View
        style={[
          styles.overlayAbsolute,
          {
            top: highlightY,
            left: 0,
            width: highlightX,
            height: highlightHeight,
            backgroundColor: OVERLAY_COLOR,
          },
        ]}
      />
      {/* Right overlay */}
      <View
        style={[
          styles.overlayAbsolute,
          {
            top: highlightY,
            left: highlightX + highlightWidth,
            width: width - (highlightX + highlightWidth),
            height: highlightHeight,
            backgroundColor: OVERLAY_COLOR,
          },
        ]}
      />

      {/* Border around the highlighted element */}
      <View
        style={[
          styles.highlightBorder,
          {
            left: highlightX,
            top: highlightY,
            width: highlightWidth,
            height: highlightHeight,
          },
        ]}
      />

      {/* Popup */}
      <View
        style={[
          styles.popup,
          {
            top: popupTop > 0 ? popupTop : undefined,
            bottom: popupBottom > 0 ? popupBottom : undefined,
            left: popupLeft,
            right: popupRight,
          },
        ]}
      >
        <Text style={styles.popupTitle}>{step.title}</Text>
        <Text style={styles.popupContent}>{step.content}</Text>
        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <TouchableOpacity onPress={prevStep} style={styles.navButton}>
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.stepCounter}>
            {currentStep + 1} / {totalSteps}
          </Text>
          {currentStep < totalSteps - 1 ? (
            <TouchableOpacity onPress={nextStep} style={styles.navButton}>
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => completeTutorial(tutorialScreen!)} // Use completeTutorial
              style={styles.navButton}
            >
              <Text style={styles.navButtonText}>Finish</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={stopTutorial}>
        <FontAwesome6 name="times" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000, // Ensure it's on top
  },
  overlayAbsolute: {
    position: "absolute",
    // Background color set inline
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10001,
    padding: 10,
  },
  highlightBorder: { // Changed from 'highlight' to 'highlightBorder'
    position: "absolute",
    borderWidth: 3,
    borderColor: "yellow",
    borderRadius: 10,
    zIndex: 10001,
  },
  popup: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    zIndex: 10001,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  popupContent: {
    fontSize: 14,
    color: "#555",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    alignItems: "center",
  },
  navButton: {
    backgroundColor: "#da291c",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  navButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  stepCounter: {
    fontSize: 14,
    color: "#777",
    fontWeight: "bold",
  },
});

export default TutorialOverlay;