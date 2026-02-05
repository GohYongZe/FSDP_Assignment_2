import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  Alert,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

interface CardInfoPopupProps {
  visible: boolean;
  cardNumber: string;
  onClose: () => void;
}

export const CardInfoPopup: React.FC<CardInfoPopupProps> = ({
  visible,
  cardNumber,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setString(cardNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy card number");
    }
  };

  // Format card number as XXX-XXXXX-XXX
  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, "");
    if (cleaned.length >= 9) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, -3)}-${cleaned.slice(-3)}`;
    }
    return cleaned;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.cardBox}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <FontAwesome6 name="xmark" size={24} color="#da291c" />
          </TouchableOpacity>

          <Text style={styles.cardTitle}>Account Number</Text>

          <View style={styles.cardNumberContainer}>
            <Text style={styles.cardNumberText}>
              {formatCardNumber(cardNumber)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.copyButton,
              copied && styles.copyButtonActive,
            ]}
            onPress={handleCopyToClipboard}
          >
            <FontAwesome6
              name={copied ? "check" : "copy"}
              size={20}
              color={copied ? "#28a745" : "#ffffff"}
              style={{ marginRight: 12 }}
            />
            <Text style={[
              styles.copyButtonText,
              copied && styles.copyButtonTextActive,
            ]}>
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.infoText}>
            Keep your account number safe and secure. You can share this when receiving payments.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardBox: {
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
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 28,
    textAlign: "center",
    marginTop: 8,
  },
  cardNumberContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#e8e8e8",
  },
  cardNumberText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#da291c",
    textAlign: "center",
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: "#da291c",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#da291c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  copyButtonActive: {
    backgroundColor: "#28a745",
  },
  copyButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  copyButtonTextActive: {
    color: "#28a745",
  },
  infoText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    fontStyle: "italic",
  },
});

export default CardInfoPopup;
