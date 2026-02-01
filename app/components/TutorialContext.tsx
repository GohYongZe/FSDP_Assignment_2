import React, { createContext, useContext } from 'react';
import { LayoutRectangle, View } from 'react-native';

export interface TutorialStep {
  id: string;
  layout: LayoutRectangle;
  text: string;
}

interface TutorialContextType {
  isTutorialActive: boolean;
  activeStep: TutorialStep | null;
  startTutorial: () => void;
  stopTutorial: () => void;
  showStep: (stepId: string) => void;
  registerTarget: (id: string, ref: React.RefObject<View>) => void;
  unregisterTarget: (id: string) => void;
}

export const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
