import React, { useCallback, useRef } from "react";
import { View, LayoutChangeEvent, findNodeHandle, UIManager } from "react-native";
import { useTutorial } from "./useTutorial";

interface TutorialTargetProps {
  id: string;
  children: React.ReactNode;
}

const TutorialTarget: React.FC<TutorialTargetProps> = ({ id, children }) => {
  const { registerElement } = useTutorial();
  const viewRef = useRef<View>(null);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      // Measure the element's position on screen
      if (viewRef.current) {
        const handle = findNodeHandle(viewRef.current);
        if (handle) {
          UIManager.measure(
            handle,
            (x, y, width, height, pageX, pageY) => {
              registerElement(id, { x: pageX, y: pageY, width, height });
            },
          );
        }
      }
    },
    [id, registerElement],
  );

  return (
    <View ref={viewRef} onLayout={onLayout} collapsable={false}>
      {children}
    </View>
  );
};

export default TutorialTarget;