import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useTutorial } from './TutorialContext';

/**
 * A custom hook that creates a ref for a component and registers it with the
 * TutorialProvider as a potential tutorial target.
 * @param testID The unique identifier for the tutorial target. This must match a key in tutorial.config.ts.
 * @returns A ref object to be attached to the target View, TouchableOpacity, etc.
 */
export const useTutorialTarget = (testID: string) => {
  const ref = useRef<View>(null);
  const { registerTarget, unregisterTarget } = useTutorial();

  useEffect(() => {
    if (testID && ref) {
      registerTarget(testID, ref);
    }

    // Cleanup function to unregister the target when the component unmounts.
    return () => {
      if (testID) {
        unregisterTarget(testID);
      }
    };
    // The dependency array ensures this effect runs only when the component mounts and unmounts.
  }, [testID, ref, registerTarget, unregisterTarget]);

  return ref;
};
