import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { getIntroSteps, tutorialTranslations } from "./tutorialTranslations";

const { width } = Dimensions.get("window");

interface IntroGuidePopupProps {
  visible: boolean;
  onComplete: () => void;
  language: string;
}

const introSteps = [
  {
    title: "Welcome to Guided Tutorial!",
    content: "This guide will help you navigate the app with ease. Let's learn how it works!",
    icon: "book-open" as const,
  },
  {
    title: "Hover Button",
    content: "Look for the guide button on each page. Click it to see highlighted areas that you can interact with.",
    icon: "book-open" as const,
  },
  {
    title: "Click Highlighted Areas",
    content: "When you see yellow highlighted areas, click on them to view step-by-step instructions and guidance.",
    icon: "font" as const,
  },
  {
    title: "Navigate Tutorial Steps",
    content: "Use the arrow buttons to move between steps. You can also click the 'End Tour' button to exit anytime.",
    icon: "arrows-left-right" as const,
  },
  {
    title: "AI Chatbot Assistant",
    content: "Need help? Visit the Homepage and click the chatbot icon to ask questions and get instant assistance with your banking needs!",
    icon: "wand-magic-sparkles" as const,
  },
  {
    title: "Exit Guided Mode",
    content: "To turn off the hover button, click the X button at the top when no tutorial is active, or go to More > Exit Guided Tutorial.",
    icon: "xmark" as const,
  },
  {
    title: "Special Features",
    content: "Some pages like Account Details have special features - click the guide button to access helpful information like account numbers!",
    icon: "star" as const,
  },
];

const IntroGuidePopup: React.FC<IntroGuidePopupProps> = ({
  visible,
  onComplete,
  language,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const introSteps = getIntroSteps(language);
  const translations = tutorialTranslations[language] || tutorialTranslations.en;

  const handleNext = () => {
    if (currentStep < introSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCurrentStep(0);
    onComplete();
  };

  const currentStepData = introSteps[currentStep];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleComplete}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {/* Icon */}
          <View style={[
            styles.iconContainer,
            currentStep === 2 && styles.iconContainerYellow,
            currentStep === 1 && styles.iconContainerBlue,
            currentStep === 4 && styles.iconContainerBlue,
          ]}>
            <FontAwesome6 
              name={currentStepData.icon} 
              size={48} 
              color={currentStep === 1 || currentStep === 4 ? "#fff" : currentStep === 2 ? "#1a1a1a" : "#da291c"} 
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{currentStepData.title}</Text>

          {/* Content */}
          <Text style={styles.content}>{currentStepData.content}</Text>

          {/* Step indicator */}
          <View style={styles.stepIndicatorContainer}>
            {introSteps.map((_: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.stepDot,
                  index === currentStep && styles.stepDotActive,
                ]}
              />
            ))}
          </View>

          {/* Navigation buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={currentStep === 0}
              style={[
                styles.navButton,
                currentStep === 0 && styles.navButtonDisabled,
              ]}
            >
              <FontAwesome6
                name="chevron-left"
                size={20}
                color={currentStep === 0 ? "#ccc" : "#da291c"}
              />
              <Text
                style={[
                  styles.navButtonText,
                  currentStep === 0 && styles.navButtonTextDisabled,
                ]}
              >
                {translations.previous}
              </Text>
            </TouchableOpacity>

            <Text style={styles.stepCounter}>
              {currentStep + 1} / {introSteps.length}
            </Text>

            <TouchableOpacity
              onPress={handleNext}
              style={styles.navButton}
            >
              <Text style={styles.navButtonText}>
                {currentStep === introSteps.length - 1 ? translations.start : translations.next}
              </Text>
              <FontAwesome6
                name={currentStep === introSteps.length - 1 ? "check" : "chevron-right"}
                size={20}
                color="#da291c"
              />
            </TouchableOpacity>
          </View>

          {/* Skip button */}
          <TouchableOpacity onPress={handleComplete} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>{translations.skipTutorial}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  popup: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 32,
    width: Math.min(width - 40, 500),
    maxWidth: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
    borderWidth: 3,
    borderColor: "#da291c",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#fff5f5",
    borderRadius: 50,
    width: 96,
    height: 96,
    justifyContent: "center",
    alignSelf: "center",
  },
  iconContainerYellow: {
    backgroundColor: "#FFD700",
  },
  iconContainerBlue: {
    backgroundColor: "#0066cc",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  content: {
    fontSize: 18,
    color: "#333",
    lineHeight: 28,
    marginBottom: 24,
    textAlign: "center",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
  },
  stepDotActive: {
    backgroundColor: "#da291c",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#da291c",
  },
  navButtonDisabled: {
    borderColor: "#e0e0e0",
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#da291c",
  },
  navButtonTextDisabled: {
    color: "#ccc",
  },
  stepCounter: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "underline",
  },
});

export default IntroGuidePopup;
