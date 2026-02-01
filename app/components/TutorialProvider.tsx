import React, { useState, useCallback, ReactNode } from 'react';
import { LayoutRectangle } from 'react-native';
import { TutorialContext, TutorialStep } from './TutorialContext';
import TutorialOverlay from './TutorialOverlay';

interface TutorialProviderProps {
  children: ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [activeStep, setActiveStep] = useState<TutorialStep | null>(null);

  const registerStep = useCallback((step: TutorialStep) => {
    setSteps((prevSteps) => {
      // Avoid duplicates
      if (prevSteps.find(s => s.id === step.id)) {
        return prevSteps.map(s => s.id === step.id ? step : s);
      }
      return [...prevSteps, step];
    });
  }, []);

  const startTutorial = useCallback(() => {
    setIsTutorialActive(true);
    setActiveStep(null); // No specific step is active initially, just the overlay
  }, []);

  const stopTutorial = useCallback(() => {
    setIsTutorialActive(false);
    setSteps([]);
    setActiveStep(null);
  }, []);

  const showStep = useCallback((stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (step) {
      setActiveStep(step);
    }
  }, [steps]);

  const value = {
    isTutorialActive,
    activeStep,
    startTutorial,
    stopTutorial,
    showStep,
    registerStep,
    steps,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {isTutorialActive && <TutorialOverlay />}
    </TutorialContext.Provider>
  );
};
