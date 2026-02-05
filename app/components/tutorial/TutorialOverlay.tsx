import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useTutorial } from "./useTutorial";
import { getTutorials } from "./tutorialSteps";
import { FontAwesome6 } from "@expo/vector-icons";
import { tutorialTranslations } from "./tutorialTranslations";

const { width, height } = Dimensions.get("window");
const OVERLAY_COLOR = "rgba(0, 0, 0, 0.7)";
const HIGHLIGHT_PADDING = 1;
const BORDER_WIDTH = 3; // Width of the highlight border

const TutorialOverlay = () => {
  const {
    isTutorialActive,
    isGuideMode,
    stopTutorial,
    tutorialScreen,
    layouts,
    completeTutorial,
    language,
  } = useTutorial();

  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [isInputReady, setIsInputReady] = useState(false);
  const closeReadyRef = useRef(false);
  const translations = tutorialTranslations[language] || tutorialTranslations.en;

  // Reset selection when tutorial starts/stops
  useEffect(() => {
    if (isTutorialActive && tutorialScreen) {
      setSelectedTarget(null);
    } else if (!isTutorialActive) {
      // Reset to null when tutorial becomes inactive
      setSelectedTarget(null);
    }
  }, [isTutorialActive, isGuideMode, tutorialScreen, layouts]);


  useEffect(() => {
    if (!isTutorialActive || selectedTarget === null) {
      setIsInputReady(false);
      return;
    }
    setIsInputReady(false);
    const timer = setTimeout(() => {
      setIsInputReady(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [isTutorialActive, selectedTarget]);

  useEffect(() => {
    if (isTutorialActive && isGuideMode) {
      closeReadyRef.current = false;
      const timer = setTimeout(() => {
        closeReadyRef.current = true;
      }, 300);
      return () => clearTimeout(timer);
    }
    closeReadyRef.current = false;
  }, [isTutorialActive, isGuideMode]);
  
  if (!isTutorialActive || !tutorialScreen) {
    return null;
  }

  const allTutorials = getTutorials(language);
  const steps = allTutorials[tutorialScreen];
  if (!steps || steps.length === 0) {
    stopTutorial();
    return null;
  }

  const handleTargetClick = (index: number) => {
    setSelectedTarget(index);
  };

  const handlePrevious = () => {
    if (!isInputReady) return;
    if (selectedTarget !== null && selectedTarget > 0) {
      setSelectedTarget(selectedTarget - 1);
    }
  };

  const handleNext = () => {
    if (!isInputReady) return;
    if (selectedTarget !== null && selectedTarget < steps.length - 1) {
      setSelectedTarget(selectedTarget + 1);
    }
  };

  const handleFinish = () => {
    if (!isInputReady) return;
    completeTutorial(tutorialScreen!);
  };

  // Get current step info if one is selected
  const currentStep = selectedTarget !== null ? steps[selectedTarget] : null;
  const currentLayout =
    currentStep && layouts[currentStep.nativeID]
      ? layouts[currentStep.nativeID]
      : null;

  // Function to render initial overlay with cutouts for all highlights
  const renderInitialOverlay = () => {
    const highlightAreas = steps
      .map((step) => layouts[step.nativeID])
      .filter((layout) => layout !== undefined);

    if (highlightAreas.length === 0) return null;

    // Create segments for the dimmed overlay
    const segments: React.ReactNode[] = [];
    
    // Sort highlights by Y position
    const sortedAreas = [...highlightAreas].sort((a, b) => a.y - b.y);

    // Top segment (from screen top to first highlight)
    const firstHighlight = sortedAreas[0];
    segments.push(
      <TouchableOpacity
        key="top"
        style={[
          styles.overlayAbsolute,
          {
            top: 0,
            left: 0,
            width: width,
            height: firstHighlight.y - HIGHLIGHT_PADDING - BORDER_WIDTH,
            backgroundColor: OVERLAY_COLOR,
          },
        ]}
        onPress={() => {
          setSelectedTarget(null);
        }}
        activeOpacity={1}
      />
    );

    // For each highlight, create left/right segments
    sortedAreas.forEach((area, index) => {
      const highlightY = area.y - HIGHLIGHT_PADDING - BORDER_WIDTH;
      const highlightX = area.x - HIGHLIGHT_PADDING - BORDER_WIDTH;
      const highlightHeight = area.height + 2 * HIGHLIGHT_PADDING + 2 * BORDER_WIDTH;
      const highlightWidth = area.width + 2 * HIGHLIGHT_PADDING + 2 * BORDER_WIDTH;

      // Left segment
      if (highlightX > 0) {
        segments.push(
          <TouchableOpacity
            key={`left-${index}`}
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
            onPress={() => {
              setSelectedTarget(null);
            }}
            activeOpacity={1}
          />
        );
      }

      // Right segment
      if (highlightX + highlightWidth < width) {
        segments.push(
          <TouchableOpacity
            key={`right-${index}`}
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
            onPress={() => {
              setSelectedTarget(null);
            }}
            activeOpacity={1}
          />
        );
      }

      // Middle segments (between highlights)
      if (index < sortedAreas.length - 1) {
        const nextArea = sortedAreas[index + 1];
        const currentBottom = highlightY + highlightHeight;
        const nextTop = nextArea.y - HIGHLIGHT_PADDING - BORDER_WIDTH;
        
        if (nextTop > currentBottom) {
          segments.push(
            <TouchableOpacity
              key={`middle-${index}`}
              style={[
                styles.overlayAbsolute,
                {
                  top: currentBottom,
                  left: 0,
                  width: width,
                  height: nextTop - currentBottom,
                  backgroundColor: OVERLAY_COLOR,
                },
              ]}
              onPress={() => {
                setSelectedTarget(null);
              }}
              activeOpacity={1}
            />
          );
        }
      }
    });

    // Bottom segment (from last highlight to screen bottom)
    const lastHighlight = sortedAreas[sortedAreas.length - 1];
    const lastBottom = lastHighlight.y - HIGHLIGHT_PADDING - BORDER_WIDTH + lastHighlight.height + 2 * HIGHLIGHT_PADDING + 2 * BORDER_WIDTH;
    
    segments.push(
      <TouchableOpacity
        key="bottom"
        style={[
          styles.overlayAbsolute,
          {
            top: lastBottom,
            left: 0,
            width: width,
            height: height - lastBottom,
            backgroundColor: OVERLAY_COLOR,
          },
        ]}
        onPress={() => {
          setSelectedTarget(null);
        }}
        activeOpacity={1}
      />
    );

    return segments;
  };

  // Render highlighted boxes - show all in initial state, only selected when viewing details
  const highlightedBoxes = steps.map((step, index) => {
    const layout = layouts[step.nativeID];
    if (!layout) return null;

    // Hide other outlines when a specific target is selected
    if (selectedTarget !== null && selectedTarget !== index) {
      return null;
    }

    const highlightX = layout.x - HIGHLIGHT_PADDING;
    const highlightY = layout.y - HIGHLIGHT_PADDING;
    const highlightWidth = layout.width + 2 * HIGHLIGHT_PADDING;
    const highlightHeight = layout.height + 2 * HIGHLIGHT_PADDING;

    const isSelected = selectedTarget === index;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.highlightBorder,
          {
            left: highlightX,
            top: highlightY,
            width: highlightWidth,
            height: highlightHeight,
            borderColor: isSelected ? "#FFD700" : "rgba(255, 215, 0, 0.6)",
            borderWidth: isSelected ? 3 : 2,
          },
        ]}
        onPress={() => handleTargetClick(index)}
        activeOpacity={0.8}
      />
    );
  });

  // Calculate popup position if a target is selected
  let popupTop = 0;
  let popupBottom = 0;
  let popupLeft = 12;
  let popupRight = 12;

  if (currentLayout && currentStep) {
    const highlightX = currentLayout.x - HIGHLIGHT_PADDING;
    const highlightY = currentLayout.y - HIGHLIGHT_PADDING;
    const highlightWidth = currentLayout.width + 2 * HIGHLIGHT_PADDING;
    const highlightHeight = currentLayout.height + 2 * HIGHLIGHT_PADDING;
    const POPUP_SPACING = 15;

    const popupPosition = currentStep.position || "bottom";

    switch (popupPosition) {
      case "top":
        popupBottom = height - highlightY + POPUP_SPACING;
        popupLeft = 12;
        popupRight = 12;
        break;
      case "bottom":
      default:
        popupTop = highlightY + highlightHeight + POPUP_SPACING;
        popupLeft = 12;
        popupRight = 12;
        break;
      case "left":
        popupTop = Math.max(POPUP_SPACING, highlightY);
        popupRight = width - highlightX + POPUP_SPACING;
        popupLeft = 12;
        break;
      case "right":
        popupTop = Math.max(POPUP_SPACING, highlightY);
        popupLeft = highlightX + highlightWidth + POPUP_SPACING;
        popupRight = 12;
        break;
    }
  }

  return (
    <SafeAreaView
      style={styles.container}
      pointerEvents="auto"
    >
      {/* Dimmed background - different rendering for initial vs selected state */}
      {selectedTarget === null ? (
        // Initial state: show all highlights with cutouts
        renderInitialOverlay()
      ) : (
        // Selected state: show single highlight with cutout
        currentLayout && (
          <>
            <TouchableOpacity
              style={[
                styles.overlayAbsolute,
                {
                  height: currentLayout.y - HIGHLIGHT_PADDING - BORDER_WIDTH,
                  width: width,
                  backgroundColor: OVERLAY_COLOR,
                },
              ]}
              onPress={() => {
                setSelectedTarget(null);
              }}
              activeOpacity={1}
            />
            <TouchableOpacity
              style={[
                styles.overlayAbsolute,
                {
                  top:
                    currentLayout.y -
                    HIGHLIGHT_PADDING -
                    BORDER_WIDTH +
                    currentLayout.height +
                    2 * HIGHLIGHT_PADDING +
                    2 * BORDER_WIDTH,
                  height:
                    height -
                    (currentLayout.y -
                      HIGHLIGHT_PADDING -
                      BORDER_WIDTH +
                      currentLayout.height +
                      2 * HIGHLIGHT_PADDING +
                      2 * BORDER_WIDTH),
                  width: width,
                  backgroundColor: OVERLAY_COLOR,
                },
              ]}
              onPress={() => {
                setSelectedTarget(null);
              }}
              activeOpacity={1}
            />
            <TouchableOpacity
              style={[
                styles.overlayAbsolute,
                {
                  top: currentLayout.y - HIGHLIGHT_PADDING - BORDER_WIDTH,
                  left: 0,
                  width: currentLayout.x - HIGHLIGHT_PADDING - BORDER_WIDTH,
                  height: currentLayout.height + 2 * HIGHLIGHT_PADDING + 2 * BORDER_WIDTH,
                  backgroundColor: OVERLAY_COLOR,
                },
              ]}
              onPress={() => {
                setSelectedTarget(null);
              }}
              activeOpacity={1}
            />
            <TouchableOpacity
              style={[
                styles.overlayAbsolute,
                {
                  top: currentLayout.y - HIGHLIGHT_PADDING - BORDER_WIDTH,
                  left:
                    currentLayout.x -
                    HIGHLIGHT_PADDING -
                    BORDER_WIDTH +
                    currentLayout.width +
                    2 * HIGHLIGHT_PADDING +
                    2 * BORDER_WIDTH,
                  width:
                    width -
                    (currentLayout.x -
                      HIGHLIGHT_PADDING -
                      BORDER_WIDTH +
                      currentLayout.width +
                      2 * HIGHLIGHT_PADDING +
                      2 * BORDER_WIDTH),
                  height: currentLayout.height + 2 * HIGHLIGHT_PADDING + 2 * BORDER_WIDTH,
                  backgroundColor: OVERLAY_COLOR,
                },
              ]}
              onPress={() => {
                setSelectedTarget(null);
              }}
              activeOpacity={1}
            />
          </>
        )
      )}

      {/* All highlighted boxes */}
      {highlightedBoxes}

      {/* Popup - only shown when a target is selected */}
      {selectedTarget !== null && currentStep && currentLayout && (
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
          <Text style={styles.popupTitle}>{currentStep.title}</Text>
          <Text style={styles.popupContent}>{currentStep.content}</Text>

          {/* Navigation controls */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={!isInputReady || selectedTarget === 0}
              style={styles.navButton}
            >
              <FontAwesome6
                name="chevron-left"
                size={24}
                color={!isInputReady || selectedTarget === 0 ? "#e0e0e0" : "#da291c"}
              />
            </TouchableOpacity>
            <View style={styles.stepCounterContainer}>
              <Text style={styles.stepCounter}>
                {selectedTarget + 1} / {steps.length}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleNext}
              disabled={!isInputReady || selectedTarget === steps.length - 1}
              style={styles.navButton}
            >
              <FontAwesome6
                name="chevron-right"
                size={24}
                color={!isInputReady || selectedTarget === steps.length - 1 ? "#e0e0e0" : "#da291c"}
              />
            </TouchableOpacity>
          </View>

          {/* Finish button */}
          {!isGuideMode && (
            <TouchableOpacity
              onPress={handleFinish}
              style={styles.finishButton}
              disabled={!isInputReady}
            >
              <Text style={styles.finishButtonText}>{translations.finishTour}</Text>
            </TouchableOpacity>
          )}

          {/* End Tour button - always visible */}
          <TouchableOpacity
            onPress={stopTutorial}
            style={styles.endTourButton}
            disabled={!isInputReady}
          >
            <Text style={styles.endTourButtonText}>{translations.endTour}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Back button - only show when NOT in guide mode */}
      {!isGuideMode && (
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => {
            if (selectedTarget !== null) {
              // If viewing details, go back to initial state
              setSelectedTarget(null);
            } else {
              // If in initial state, close tutorial
              stopTutorial();
            }
          }}
        >
          <FontAwesome6 name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Close (X) button in guide mode */}
      {isGuideMode && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (!closeReadyRef.current) return;
            if (selectedTarget !== null) {
              setSelectedTarget(null);
            } else {
              stopTutorial();
            }
          }}
        >
          <FontAwesome6 name="xmark" size={24} color="white" />
        </TouchableOpacity>
      )}
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
    zIndex: 10000,
  },
  overlayAbsolute: {
    position: "absolute",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: "50%",
    marginLeft: -25,
    zIndex: 10001,
    padding: 16,
    backgroundColor: "#da291c",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  highlightBorder: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "#FFD700",
    borderRadius: 12,
    zIndex: 9999,
    shadowColor: "#FFD700",

    shadowOpacity: 0.2,
    shadowRadius: 26,
    elevation: 110,
  },
  popup: {
    position: "absolute",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 24,
    zIndex: 10001,
    minWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 2,
    borderColor: "#da291c",
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 16,
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  popupContent: {
    fontSize: 18,
    color: "#333333",
    marginBottom: 20,
    lineHeight: 28,
    fontWeight: "500",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  navButton: {
    padding: 10,
    minWidth: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e8e8e8",
  },
  stepCounterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  stepCounter: {
    fontSize: 18,
    color: "#da291c",
    fontWeight: "bold",
    minWidth: 80,
    textAlign: "center",
  },
  finishButton: {
    backgroundColor: "#da291c",
    paddingVertical: 18,
    marginTop: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#da291c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  finishButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  endTourButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 18,
    marginTop: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#da291c",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  endTourButtonText: {
    color: "#da291c",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
});

export default TutorialOverlay;