import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { useTutorial, TutorialStep } from './TutorialContext';

interface TutorialOverlayProps {
  steps: TutorialStep[];
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps }) => {
  const { stopTutorial, showStep, activeStep } = useTutorial();

  const handleStepPress = (stepId: string) => {
    showStep(stepId);
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={stopTutorial} />

      <Text style={styles.instructionText}>Click on the highlighted part to continue</Text>

      {steps.map((step) => (
        <TouchableOpacity
          key={step.id}
          style={[styles.highlight, { top: step.layout.y, left: step.layout.x, width: step.layout.width, height: step.layout.height }]}
          onPress={() => handleStepPress(step.id)}
        />
      ))}

      {activeStep && (
        <Modal
          transparent={true}
          visible={!!activeStep}
          onRequestClose={() => showStep('')}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={() => showStep('')}>
            <View style={styles.popup}>
              <TouchableOpacity style={styles.closeButton} onPress={() => showStep('')}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
              <Text>{activeStep.text}</Text>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 8,
  },
  instructionText: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popup: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TutorialOverlay;
