import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { useTutorial } from './TutorialContext';

interface TutorialElementProps {
  children: ReactNode;
  label: string;
}

const TutorialElement: React.FC<TutorialElementProps> = ({ children, label }) => {
  const { registerElement } = useTutorial();

  return (
    <View
      onLayout={(event) => {
        // Using measure to get the position relative to the screen, not the parent
        event.currentTarget.measure((x, y, width, height, pageX, pageY) => {
          const layout = { x: pageX, y: pageY, width, height };
          registerElement(label, layout);
        });
      }}
    >
      {children}
    </View>
  );
};

export default TutorialElement;
