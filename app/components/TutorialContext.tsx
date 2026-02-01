import React, { createContext, useContext, ReactNode } from 'react';
import { LayoutRectangle } from 'react-native';

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
  registerStep: (step: TutorialStep) => void;
  steps: TutorialStep[];
}

export const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
