import React, { useState, useCallback, useEffect } from "react";
import { LayoutRectangle } from "react-native";
import { useNavigationState } from "@react-navigation/native"; // Import useNavigationState
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { TutorialContext } from "./useTutorial";
import { tutorials } from "./tutorialSteps";

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialScreen, setTutorialScreen] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [layouts, setLayouts] = useState<{ [key: string]: LayoutRectangle }>(
    {},
  );
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set()); // New state for completed tutorials

  // Load completed tutorials from AsyncStorage on mount
  useEffect(() => {
    const loadCompletedTutorials = async () => {
      try {
        const stored = await AsyncStorage.getItem('completedTutorials');
        if (stored) {
          setCompletedTutorials(new Set(JSON.parse(stored)));
        }
      } catch (e) {
        console.error("Failed to load completed tutorials from AsyncStorage", e);
      }
    };
    loadCompletedTutorials();
  }, []);

  const routes = useNavigationState((state) => state.routes);
  const currentRouteName = routes[routes.length - 1]?.name;

  // Effect to handle navigation changes
  useEffect(() => {
    if (isTutorialActive && tutorialScreen && currentRouteName !== tutorialScreen) {
      console.log(`Navigated away from ${tutorialScreen}, stopping tutorial.`);
      stopTutorial();
    }
  }, [currentRouteName, isTutorialActive, tutorialScreen]); // Dependencies for useEffect


  const registerElement = useCallback((id: string, layout: LayoutRectangle) => {
    setLayouts((prev) => ({ ...prev, [id]: layout }));
  }, []);

  const stopTutorial = () => {
    setIsTutorialActive(false);
    setTutorialScreen(null);
    setCurrentStep(0);
    setLayouts({}); // Clear layouts when tutorial ends
  };

  const startTutorial = (screen: string) => {
    // Check if tutorial is already completed for this screen
    if (completedTutorials.has(screen)) {
      console.log(`Tutorial for screen ${screen} already completed. Skipping.`);
      return;
    }

    if (tutorials[screen] && tutorials[screen].length > 0) {
      setTutorialScreen(screen);
      setCurrentStep(0);
      setIsTutorialActive(true);
    } else {
      console.warn(`No tutorial steps defined for screen: ${screen}`);
      setIsTutorialActive(false);
      setTutorialScreen(null);
    }
  };

  const nextStep = () => {
    if (
      tutorialScreen &&
      tutorials[tutorialScreen] &&
      currentStep < tutorials[tutorialScreen].length - 1
    ) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTutorial(tutorialScreen!); // Automatically complete if last step
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // New function to mark tutorial as completed
  const completeTutorial = useCallback(async (screen: string) => {
    try {
      const newCompleted = new Set(completedTutorials).add(screen);
      setCompletedTutorials(newCompleted);
      await AsyncStorage.setItem('completedTutorials', JSON.stringify(Array.from(newCompleted)));
      stopTutorial(); // Stop the tutorial after marking as complete
    } catch (e) {
      console.error("Failed to save completed tutorial to AsyncStorage", e);
    }
  }, [completedTutorials, stopTutorial]);


  return (
    <TutorialContext.Provider
      value={{
        isTutorialActive,
        startTutorial,
        stopTutorial,
        currentStep,
        nextStep,
        prevStep,
        tutorialScreen,
        layouts,
        registerElement,
        completeTutorial, // Pass the new function
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

