import { NavigationProp } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const params = useLocalSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Jan 2026");

  // Get account data from params with fallbacks
  const accountType = (params.accountType as string) || "OCBC FRANK Account";
  const balance = (params.balance as string) || "1,234.56";
  const accountNumber = (params.accountNumber as string) || "";

  // Available months
  const months = ["Jan 2026", "Nov 2025", "Oct 2025"];

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
            console.error("Error logging out:", error);
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
          onPress={() => router.push("/homepage")}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={20} color="#333" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => router.push("/more")}>
          <Icon name="cog" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Balance Information */}
        <View style={styles.balanceContainer}>
          <Text style={styles.accountTypeHeader}>{accountType}</Text>
          <Text style={styles.accountNumberText}>
            {(() => {
              const accNo = accountNumber || "123456789";
              // Format as XXX-XXXXX-XXX
              if (accNo.length >= 9) {
                return `${accNo.slice(0, 3)}-${accNo.slice(3, -3)}-${accNo.slice(-3)}`;
              }
              return accNo;
            })()}
          </Text>

          <View style={styles.balanceColumn}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceValue}>{balance} SGD</Text>
          </View>
          <View style={styles.balanceColumn}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>{balance} SGD</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Transactions</Text>

        {/* Month Filter Slider */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.monthFilterContainer}
          contentContainerStyle={styles.monthFilterContent}
        >
          {months.map((month) => (
            <TouchableOpacity
              key={month}
              style={[
                styles.monthFilterButton,
                selectedMonth === month && styles.monthFilterButtonActive,
              ]}
              onPress={() => setSelectedMonth(month)}
            >
              <Text
                style={[
                  styles.monthFilterText,
                  selectedMonth === month && styles.monthFilterTextActive,
                ]}
              >
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transaction List - Conditional Rendering Based on Selected Month */}
        {selectedMonth === "Jan 2026" && (
          <View style={styles.transactionList}>
            <View style={styles.transactionItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.transDate}>28 Jan</Text>
                <Text style={styles.transName}>TRANSFER</Text>
                <Text style={styles.transDetails}>From John Doe</Text>
              </View>
              <Text style={[styles.amount, styles.deposit]}>+150.00</Text>
            </View>

            <View style={styles.transactionItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.transDate}>27 Jan</Text>
                <Text style={styles.transName}>PAYMENT</Text>
                <Text style={styles.transDetails}>Shopping Mall Purchase</Text>
              </View>
              <Text style={[styles.amount, styles.expense]}>-45.50</Text>
            </View>
          </View>
        )}

        {selectedMonth === "Nov 2025" && (
          <View style={styles.transactionList}>
            <View style={styles.transactionItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.transDate}>01 Nov</Text>
                <Text style={styles.transName}>Supermarket Purchase</Text>
              </View>
              <Text style={[styles.amount, styles.expense]}>-85.50</Text>
            </View>
          </View>
        )}

        {selectedMonth === "Oct 2025" && (
          <View style={styles.transactionList}>
            <View style={styles.transactionItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.transDate}>30 Oct</Text>
                <Text style={styles.transName}>Salary Deposit</Text>
              </View>
              <Text style={[styles.amount, styles.deposit]}>+4,500.00</Text>
            </View>
          </View>
        )}

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
          <Icon name="home" size={22} color="#888" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/transferscreen")}
        >
          <Icon name="exchange-alt" size={22} color="#888" />
          <Text style={styles.navText}>Pay & Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/more")}
        >
          <Icon name="th-large" size={22} color="#888" />
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
    paddingTop: 40,
    backgroundColor: "#f6ecec",
    borderBottomWidth: 0,
  },
  headerText: { fontSize: 20, fontWeight: "700", color: "#fff" },
  backButton: { padding: 8 },
  scrollContent: { paddingBottom: 100 },
  balanceContainer: {
    backgroundColor: "#f6ecec",
    padding: 20,
    paddingTop: 0,
    marginBottom: 25,
  },
  accountTypeHeader: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  accountNumberText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
    marginBottom: 35,
  },
  balanceColumn: {
    marginBottom: 15,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
    marginBottom: 5,
  },
  balanceValue: { fontSize: 18, fontWeight: "700", color: "#333" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  monthFilterContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  monthFilterContent: {
    paddingRight: 0,
  },
  monthFilterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  monthFilterButtonActive: {
    backgroundColor: "#da291c",
    borderColor: "#da291c",
  },
  monthFilterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  monthFilterTextActive: {
    color: "#fff",
  },
  transactionList: { marginBottom: 10, paddingHorizontal: 15 },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  transName: { fontSize: 16, fontWeight: "600", color: "#333" },
  transDate: { fontSize: 12, color: "#888", marginBottom: 2 },
  transDetails: { fontSize: 14, color: "#666", marginTop: 2 },
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
    paddingBottom: 35,
    paddingTop: 12,
  },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 6 },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
    color: "#888",
  },
});

export default AccountDetailsScreen;
