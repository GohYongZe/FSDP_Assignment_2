import { createContext, useContext } from "react";
import { LayoutRectangle } from "react-native";

export interface TutorialContextType {
  isTutorialActive: boolean;
  isGuideMode: boolean;
  startTutorial: (screen: string, options?: { force?: boolean }) => void;
  stopTutorial: () => void;
  tutorialScreen: string | null;
  enableGuideMode: () => void;
  disableGuideMode: () => void;
  language: string;

  // Layout registration
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