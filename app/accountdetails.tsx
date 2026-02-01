import { NavigationProp } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { supabase } from "../lib/supabase";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AccountDetailsScreen = ({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) => {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleAdvanced = () => {
    // This creates a smooth slide-down effect when the button is pressed
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAdvanced(!showAdvanced);
  };

  const handleMenuPress = () => {
    Alert.alert("Account Menu", "Choose an option", [
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            router.replace("/landing");
          } catch (error) {
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={20} color="#005eb8" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Account Details</Text>
        <TouchableOpacity onPress={handleMenuPress}>
          <Icon name="ellipsis-v" size={18} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Header Card */}
        <View style={styles.productHeader}>
          <Text style={styles.productTitle}>OCBC FRANK Account</Text>
          <Text style={styles.balanceText}>Available Balance: S$1,234.56</Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>

        {/* Transaction List */}
        <View style={styles.transactionList}>
          <View style={styles.transactionItem}>
            <View>
              <Text style={styles.transName}>Salary Deposit</Text>
              <Text style={styles.transDate}>30 Oct 2025</Text>
            </View>
            <Text style={[styles.amount, styles.deposit]}>+ S$4,500.00</Text>
          </View>

          <View style={styles.transactionItem}>
            <View>
              <Text style={styles.transName}>Supermarket Purchase</Text>
              <Text style={styles.transDate}>01 Nov 2025</Text>
            </View>
            <Text style={[styles.amount, styles.expense]}>- S$85.50</Text>
          </View>
        </View>

        {/* Toggle Button */}
        <TouchableOpacity style={styles.toggleButton} onPress={toggleAdvanced}>
          <Text style={styles.toggleButtonText}>
            {showAdvanced
              ? "Hide Full History and Management"
              : "View Full History and Management"}
          </Text>
          <Icon
            name={showAdvanced ? "chevron-up" : "chevron-down"}
            size={14}
            color="#005eb8"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        {/* Advanced Features (Conditional Rendering) */}
        {showAdvanced && (
          <View style={styles.advancedFeatures}>
            <Text style={styles.advancedTitle}>Account Management</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Account Opening Date</Text>
              <Text style={styles.infoValue}>15 March 2018</Text>
            </View>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Download e-Statements</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>
                Change Account Nickname
              </Text>
            </TouchableOpacity>

            <Text style={styles.placeholderText}>
              [Many older transactions would be listed here]
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav Placeholder */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/homepage")}
        >
          <Icon name="home" size={20} color="#888" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/TransferScreen")}
        >
          <Icon name="exchange-alt" size={20} color="#888" />
          <Text style={styles.navText}>Pay & Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/more")}
        >
          <Icon name="th-large" size={20} color="#888" />
          <Text style={styles.navText}>More</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: { fontSize: 20, fontWeight: "700", color: "#333" },
  backButton: { padding: 8 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  productHeader: {
    backgroundColor: "#e8a87c", // Match original color
    padding: 30,
    borderRadius: 12,
    marginBottom: 25,
  },
  productTitle: { color: "white", fontSize: 22, fontWeight: "700" },
  balanceText: { color: "white", fontSize: 16, opacity: 0.9, marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  transactionList: { marginBottom: 20 },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  transName: { fontSize: 16, fontWeight: "600", color: "#333" },
  transDate: { fontSize: 13, color: "#888", marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "700" },
  deposit: { color: "#28a745" },
  expense: { color: "#da291c" },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#005eb8",
    borderRadius: 8,
    marginVertical: 15,
  },
  toggleButtonText: { color: "#005eb8", fontWeight: "600", fontSize: 15 },
  advancedFeatures: { marginTop: 10 },
  advancedTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#005eb8",
    marginBottom: 15,
  },
  infoBox: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoLabel: { fontSize: 14, color: "#555", marginBottom: 5 },
  infoValue: { fontSize: 17, fontWeight: "600", color: "#333" },
  actionButton: {
    backgroundColor: "#e6f0ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  actionButtonText: { color: "#005eb8", fontWeight: "600" },
  placeholderText: {
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
    marginTop: 10,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 10,
  },
  navItem: { flex: 1, alignItems: "center" },
  navText: { fontSize: 11, marginTop: 4, fontWeight: "500", color: "#888" },
});

export default AccountDetailsScreen;
