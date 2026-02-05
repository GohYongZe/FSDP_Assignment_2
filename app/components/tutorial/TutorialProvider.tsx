import React, { useState, useCallback, useEffect, useRef } from "react";
import { LayoutRectangle } from "react-native";
import { useNavigationState } from "@react-navigation/native"; // Import useNavigationState
import { usePathname } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { TutorialContext } from "./useTutorial";
import { tutorials } from "./tutorialSteps";
import IntroGuidePopup from "./IntroGuidePopup";

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [isGuideMode, setIsGuideMode] = useState(false);
  const [tutorialScreen, setTutorialScreen] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [layouts, setLayouts] = useState<{ [key: string]: LayoutRectangle }>(
    {},
  );
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());
  const [showIntroGuide, setShowIntroGuide] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [language, setLanguage] = useState("en");
  const tutorialStartTimeRef = useRef<number>(0);

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

    const loadGuideMode = async () => {
      try {
        const storedGuideMode = await AsyncStorage.getItem('isGuideMode');
        if (storedGuideMode === 'true') {
          setIsGuideMode(true);
        }
      } catch (e) {
        console.error("Failed to load guide mode from AsyncStorage", e);
      }
    };

    const loadIntroSeen = async () => {
      try {
        const storedIntroSeen = await AsyncStorage.getItem('hasSeenIntro');
        if (storedIntroSeen === 'true') {
          setHasSeenIntro(true);
        }
      } catch (e) {
        console.error("Failed to load intro seen status from AsyncStorage", e);
      }
    };

    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('selectedLanguage');
        if (storedLanguage) {
          setLanguage(storedLanguage);
        }
      } catch (e) {
        console.error("Failed to load language from AsyncStorage", e);
      }
    };

    loadCompletedTutorials();
    loadGuideMode();
    loadIntroSeen();
    loadLanguage();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const checkLanguageChange = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('selectedLanguage');
        if (storedLanguage && storedLanguage !== language) {
          setLanguage(storedLanguage);
        }
      } catch (e) {
        console.error("Failed to check language", e);
      }
    };

    const interval = setInterval(checkLanguageChange, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const routes = useNavigationState((state) => state.routes);
  const currentRouteName = routes[routes.length - 1]?.name;
  const pathname = usePathname();

  // Effect to handle navigation changes - stop tutorial when navigating away
  useEffect(() => {
    if (!isTutorialActive || !tutorialScreen) return;
    // In guide mode, don't auto-stop on navigation changes
    if (isGuideMode) return;

    const now = Date.now();
    const gracePeriod = 500; // 500ms grace period after starting tutorial
    const timeSinceStart = now - tutorialStartTimeRef.current;

    // If navigation state isn't ready yet, don't stop tutorial
    if (!pathname && !currentRouteName) return;

    // Map current route to tutorial screen name (prefer pathname)
    let mappedRouteName: string | null | undefined = currentRouteName;
    if (pathname) {
      if (pathname === "/" || pathname === "/index" || pathname === "/homepage") {
        mappedRouteName = "homepage";
      } else {
        mappedRouteName = pathname.replace(/^\//, "");
      }
    } else if (currentRouteName === "index" || currentRouteName === "__root") {
      mappedRouteName = "homepage";
    }

    if (!mappedRouteName) return;

    // Check if we're still on the tutorial screen
    const isStillOnTutorialScreen = mappedRouteName === tutorialScreen;

    // Stop tutorial if navigated away from the tutorial screen
    if (!isStillOnTutorialScreen && timeSinceStart > gracePeriod) {
      stopTutorial();
    }
  }, [currentRouteName, pathname, isTutorialActive, tutorialScreen]); // Dependencies for useEffect


  const registerElement = useCallback((id: string, layout: LayoutRectangle) => {
    setLayouts((prev) => ({ ...prev, [id]: layout }));
  }, []);

  const stopTutorial = () => {
    setIsTutorialActive(false);
    setTutorialScreen(null);
    setCurrentStep(0);
    // Keep layouts so restarting on the same screen doesn't lose measurements
  };

  const enableGuideMode = async () => {
    // Check if user has seen the intro guide
    if (!hasSeenIntro) {
      setShowIntroGuide(true);
    } else {
      setIsGuideMode(true);
      try {
        await AsyncStorage.setItem('isGuideMode', 'true');
      } catch (e) {
        console.error("Failed to save guide mode to AsyncStorage", e);
      }
    }
  };

  const handleIntroComplete = async () => {
    setShowIntroGuide(false);
    setHasSeenIntro(true);
    setIsGuideMode(true);
    try {
      await AsyncStorage.setItem('hasSeenIntro', 'true');
      await AsyncStorage.setItem('isGuideMode', 'true');
    } catch (e) {
      console.error("Failed to save intro status to AsyncStorage", e);
    }
  };

  const disableGuideMode = async () => {
    setIsGuideMode(false);
    stopTutorial(); // Also stop any active tutorial
    try {
      await AsyncStorage.setItem('isGuideMode', 'false');
    } catch (e) {
      console.error("Failed to save guide mode to AsyncStorage", e);
    }
  };

  const startTutorial = (screen: string, options?: { force?: boolean }) => {
    // Check if tutorial is already completed for this screen
    if (!options?.force && completedTutorials.has(screen)) {
      return;
    }

    if (tutorials[screen] && tutorials[screen].length > 0) {
      tutorialStartTimeRef.current = Date.now(); // Record when tutorial starts
      // Always reset to step 0 when starting/restarting tutorial
      setCurrentStep(0);
      setTutorialScreen(screen);
      setIsTutorialActive(true);
    } else {
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
        isGuideMode,
        startTutorial,
        stopTutorial,
        tutorialScreen,
        enableGuideMode,
        disableGuideMode,
        layouts,
        registerElement,
        completeTutorial,
        language,
      }}
    >
      {children}
      <IntroGuidePopup
        visible={showIntroGuide}
        onComplete={handleIntroComplete}
        language={language}
      />
    </TutorialContext.Provider>
  );
};

