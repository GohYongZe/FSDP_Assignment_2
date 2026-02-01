import { usePathname } from 'expo-router';
import React, { ReactNode, useCallback, useState } from 'react';
import { LayoutRectangle, View } from 'react-native';
import { TUTORIAL_CONFIG } from '../tutorial.config';
import { TutorialContext, TutorialStep } from './TutorialContext';
import TutorialOverlay from './TutorialOverlay';

interface TutorialProviderProps {
  children: ReactNode;
}

// A helper to promisify the measure function
const measure = (ref: React.RefObject<View>): Promise<LayoutRectangle> => {
  return new Promise(resolve => {
    // Add a timeout to ensure the element is ready to be measured, especially on web.
    setTimeout(() => {
      ref.current?.measure((x, y, width, height, pageX, pageY) => {
        // If an element is off-screen, all values can be 0.
        // We resolve anyway and let the consumer decide if the layout is valid.
        resolve({ x: pageX, y: pageY, width, height });
      });
    }, 50); // A small delay can help ensure layout stability.
  });
};

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [activeStep, setActiveStep] = useState<TutorialStep | null>(null);
  const [currentSteps, setCurrentSteps] = useState<TutorialStep[]>([]);
  const [targets, setTargets] = useState(new Map<string, React.RefObject<View>>());
  const pathname = usePathname();

  const getPageKey = (path: string) => {
    const page = path.split('/').pop() || 'index';
    return page.toLowerCase();
  };

  const registerTarget = useCallback((id: string, ref: React.RefObject<View>) => {
    setTargets(prev => new Map(prev).set(id, ref));
  }, []);

  const unregisterTarget = useCallback((id: string) => {
    setTargets(prev => {
      const newTargets = new Map(prev);
      newTargets.delete(id);
      return newTargets;
    });
  }, []);

  const startTutorial = useCallback(async () => {
    const pageKey = getPageKey(pathname);
    const pageConfig = TUTORIAL_CONFIG[pageKey as keyof typeof TUTORIAL_CONFIG];

    if (!pageConfig) {
      console.warn(`[Tutorial] No tutorial config found for page: ${pageKey}`);
      return;
    }

    const stepPromises: Promise<TutorialStep | null>[] = [];

    for (const testID in pageConfig) {
      const targetRef = targets.get(testID);
      if (targetRef?.current) {
        const promise = measure(targetRef).then(layout => {
          // Only create a step if the element has a measurable size.
          if (layout.width > 0 && layout.height > 0) {
            return {
              id: testID,
              layout,
              text: pageConfig[testID as keyof typeof pageConfig],
            };
          }
          return null;
        });
        stepPromises.push(promise);
      } else {
        console.warn(`[Tutorial] Target with testID "${testID}" not found in registry.`);
      }
    }

    // Await all measurements and filter out any null results (e.g., for hidden elements)
    const measuredSteps = (await Promise.all(stepPromises)).filter(Boolean) as TutorialStep[];

    if (measuredSteps.length === 0) {
        console.warn(`[Tutorial] No visible tutorial targets were found for page: ${pageKey}`);
        return;
    }

    setCurrentSteps(measuredSteps);
    setActiveStep(null);
    setIsTutorialActive(true);
  }, [pathname, targets]);

  const stopTutorial = useCallback(() => {
    setIsTutorialActive(false);
    setActiveStep(null);
    setCurrentSteps([]); // Clear the steps for the next run
  }, []);

  const showStep = useCallback((stepId: string) => {
    if (stepId === '') {
      setActiveStep(null);
      return;
    }
    const step = currentSteps.find(s => s.id === stepId);
    if (step) {
      setActiveStep(step);
    }
  }, [currentSteps]);

  const value = {
    isTutorialActive,
    activeStep,
    startTutorial,
    stopTutorial,
    showStep,
    registerTarget,
    unregisterTarget,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {isTutorialActive && <TutorialOverlay steps={currentSteps} />}
    </TutorialContext.Provider>
  );
};