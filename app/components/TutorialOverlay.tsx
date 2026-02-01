import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Image } from 'react-native';
import { useTutorial, TutorialStep } from './TutorialContext';
import { useRouter } from 'expo-router';

interface TutorialOverlayProps {
  steps: TutorialStep[];
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps }) => {
  const { stopTutorial, showStep, activeStep } = useTutorial();
  const router = useRouter();

  const handleStepPress = (stepId: string) => {
    showStep(stepId);
  };

  const handleGoToTransferScreen = () => {
    stopTutorial();
    router.push('/TransferScreen');
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
          animationType="fade"
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={() => showStep('')}>
            <View style={styles.popup}>
              <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>{activeStep.id.replace('tutorial-', '').replace('-', ' ')}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => showStep('')}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.popupBody}>
                {activeStep.image && (
                  <Image source={activeStep.image} style={styles.popupImage} />
                )}
                <Text style={styles.popupText}>{activeStep.text}</Text>
              </View>
              {activeStep.id === 'tutorial-paynow-button' && (
                <TouchableOpacity style={styles.ctaButton} onPress={handleGoToTransferScreen}>
                  <Text style={styles.ctaButtonText}>Go to Transfer Screen</Text>
                </TouchableOpacity>
              )}
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
    borderColor: '#FFFF00', // Brighter yellow
    borderWidth: 3, // Slightly thicker border for more prominence
    borderRadius: 8,
    shadowColor: '#FFFF00', // Make the shadow match the border color
    shadowOffset: { width: 0, height: 0 }, // Center the shadow
    shadowOpacity: 1, // Full opacity for the shadow
    shadowRadius: 15, // Larger shadow radius
    elevation: 15, // Android elevation for shadow effect
  },
  instructionText: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 1001, // Ensure the instruction text is above the highlight
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popup: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#888',
  },
  popupBody: {
    padding: 20,
    alignItems: 'center',
  },
  popupImage: {
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 50,
  },
  popupText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#da291c',
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TutorialOverlay;
