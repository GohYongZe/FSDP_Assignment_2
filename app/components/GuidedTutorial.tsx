import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export interface TutorialStep {
  target: any;
  text: string;
}

interface GuidedTutorialProps {
  steps: TutorialStep[];
  onClose: () => void;
}

const GuidedTutorial: React.FC<GuidedTutorialProps> = ({ steps, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetLayout, setTargetLayout] = useState<any>(null);

  const currentTarget = steps[currentStep]?.target;

  useEffect(() => {
    if (currentTarget && currentTarget.current) {
      setTimeout(() => {
        currentTarget.current.measure((fx, fy, width, height, px, py) => {
          setTargetLayout({ x: px, y: py, width, height });
        });
      }, 500); 
    }
  }, [currentStep, currentTarget]);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setTargetLayout(null);
    } else {
      onClose();
    }
  };

  const renderHighlight = () => {
    if (!targetLayout) return null;

    const highlightStyle = {
      position: 'absolute' as 'absolute',
      left: targetLayout.x - 5,
      top: targetLayout.y - 5,
      width: targetLayout.width + 10,
      height: targetLayout.height + 10,
      borderRadius: 10,
      borderColor: '#da291c',
      borderWidth: 2,
      backgroundColor: 'transparent',
    };

    return <View style={highlightStyle} />;
  };

  const renderTextBox = () => {
    if (!targetLayout) return null;

    return (
      <View style={[styles.textBox, { top: targetLayout.y + targetLayout.height + 20 }]}>
        <Text style={styles.textBoxText}>{steps[currentStep].text}</Text>
        <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={styles.container}>
        <View style={styles.overlay} />
        {renderHighlight()}
        {renderTextBox()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  textBox: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  textBoxText: {
    fontSize: 16,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#da291c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default GuidedTutorial;
