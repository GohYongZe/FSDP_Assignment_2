import { createContext, useContext } from "react";
import { LayoutRectangle } from "react-native";

export interface TutorialContextType {
  isTutorialActive: boolean;
  startTutorial: (screen: string) => void;
  stopTutorial: () => void;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  tutorialScreen: string | null;

  // New additions for layout registration
  layouts: { [key: string]: LayoutRectangle };
  registerElement: (id: string, layout: LayoutRectangle) => void;
  completeTutorial: (screen: string) => Promise<void>;
}

export const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined,
);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};