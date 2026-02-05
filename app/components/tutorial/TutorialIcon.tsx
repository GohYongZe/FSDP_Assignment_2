import React from "react";
import { TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTutorial } from "./useTutorial";
import { useNavigationState } from "@react-navigation/native";
import { tutorials } from "./tutorialSteps"; // Import tutorials to check if screen has steps

const enabledScreens = ["homepage"]; // Define screens where the tutorial icon should appear

const TutorialIcon = () => {
  const { startTutorial, isTutorialActive } = useTutorial();
  const routes = useNavigationState((state) => state.routes);
  const currentRouteName = routes[routes.length - 1]?.name;

  // Only render the icon if the current screen is enabled and no tutorial is active
  if (!enabledScreens.includes(currentRouteName) || isTutorialActive) {
    return null;
  }

  const handlePress = () => {
    // This check is technically redundant now due to the `if` condition above,
    // but kept for clarity or if logic changes.
    if (isTutorialActive) {
      return;
    }

    if (currentRouteName && tutorials[currentRouteName]) {
      // Check if tutorial steps exist for this screen
      startTutorial(currentRouteName);
    } else {
      console.warn(`No tutorial available for screen: ${currentRouteName}`);
      // Optionally, show an alert to the user that no tutorial is available
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={{ marginRight: 15 }}>
      <FontAwesome6 name="question-circle" size={24} color="black" />
    </TouchableOpacity>
  );
};

export default TutorialIcon;