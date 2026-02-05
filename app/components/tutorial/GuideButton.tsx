import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, Alert, View, Modal, Text } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTutorial } from "./useTutorial";
import { useNavigationState } from "@react-navigation/native";
import { usePathname, useGlobalSearchParams } from "expo-router";
import { tutorials } from "./tutorialSteps";
import { CardInfoPopup } from "./CardInfoPopup";
import { tutorialTranslations } from "./tutorialTranslations";

export const GuideButton: React.FC = () => {
  const { startTutorial, isGuideMode, disableGuideMode, language } = useTutorial();
  const translations = tutorialTranslations[language] || tutorialTranslations.en;
  const routes = useNavigationState((state) => state?.routes);
  const currentRouteName = routes?.[routes.length - 1]?.name;
  const currentRouteParams = routes?.[routes.length - 1]?.params;
  const pathname = usePathname();
  const globalParams = useGlobalSearchParams();
  const [showAlert, setShowAlert] = useState(false);
  const [showCardPopup, setShowCardPopup] = useState(false);

  // Map route names to tutorial screen names
  const getScreenName = (
    routeName: string | undefined,
    path: string | null | undefined,
  ): string | null => {
    if (path) {
      if (path === "/" || path === "/index" || path === "/homepage") {
        return "homepage";
      }
      return path.replace(/^\//, "");
    }
    if (!routeName) return null;
    if (routeName === "index" || routeName === "__root") {
      return "homepage";
    }
    return routeName;
  };

  const screenName = getScreenName(currentRouteName, pathname);
  
  // Show button when guide mode is active (on all pages)
  if (!isGuideMode) {
    return null;
  }

  // Hide button on signup, landing, and login pages
  if (screenName === "signup" || screenName === "landing" || screenName === "login") {
    return null;
  }

  const handleGuidePress = () => {
    console.log("🔵 GuideButton clicked");
    console.log("🔵 Current route:", currentRouteName);
    console.log("🔵 Pathname:", pathname);
    console.log("🔵 Mapped screen name:", screenName);

    // Special handling for accountdetails page
    if (screenName === "accountdetails") {
      const accountNum = globalParams.accountNumber || "";
      console.log("🔵 Account Number from global params:", accountNum);
      console.log("🔵 All global params:", globalParams);
      setShowCardPopup(true);
      return;
    }

    console.log("🔵 Has tutorial?", screenName && tutorials[screenName]);
    if (screenName && tutorials[screenName]) {
      console.log("✅ Starting tutorial for:", screenName);
      startTutorial(screenName, { force: true });
    } else {
      console.log("❌ No tutorial available for:", screenName);
      // Show senior-friendly alert
      setShowAlert(true);
    }
  };

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <TouchableOpacity
        onPress={handleGuidePress}
        style={styles.guideButton}
      >
        <FontAwesome6 name="book-open" size={24} color="white" />
      </TouchableOpacity>

      {/* Card Info Popup for accountdetails */}
      <CardInfoPopup
        visible={showCardPopup}
        cardNumber={(globalParams.accountNumber as string) || ""}
        onClose={() => setShowCardPopup(false)}
      />

      {/* Senior-Friendly Custom Alert Modal */}
      <Modal
        visible={showAlert}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlert(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>{translations.tutorialNotAvailable}</Text>
            <Text style={styles.alertMessage}>
              {translations.noTutorial}{"\n\n"}
              {translations.tryVisiting}
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.stayButton]}
                onPress={() => setShowAlert(false)}
              >
                <Text style={styles.stayButtonText}>{translations.stayHere}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.exitButton]}
                onPress={() => {
                  setShowAlert(false);
                  disableGuideMode();
                }}
              >
                <Text style={styles.exitButtonText}>{translations.exitGuideMode}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  guideButton: {
    position: "absolute",
    top: 24,
    left: "50%",
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertBox: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  alertTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 18,
    color: "#555555",
    lineHeight: 28,
    marginBottom: 32,
    textAlign: "center",
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  stayButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#0066cc",
  },
  stayButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0066cc",
  },
  exitButton: {
    backgroundColor: "#da291c",
  },
  exitButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
});
