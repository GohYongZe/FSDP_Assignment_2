import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LayoutRectangle,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useTutorial } from "./components/TutorialContext";

interface Account {
  id: string;
  name: string;
  emailAddress: string;
  accountNumber?: string;
  accountType?: string;
  type: "local" | "foreign";
  balance?: number;
}

export default function HomePage() {
  const router = useRouter();
  const { startTutorial, registerStep } = useTutorial();

  // State from homepage.tsx
  const [isHidden, setIsHidden] = useState(true);
  const [activeTab, setActiveTab] = useState("accounts");

  // State from homepage.tsx
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // New state for account management
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Refs for tutorial elements
  const quickActionsRef = useRef<View>(null);
  const tabsRef = useRef<View>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log("Auth error:", authError);
        setUserName("Guest");
        setLoading(false);
        return;
      }

      console.log("=== FETCHING USER DATA ===");
      console.log("Logged in user email:", user.email);

      // Fetch all accounts for this email
      const allAccounts: Account[] = [];

      // Fetch from Localaccounts - Try different possible column name variations
      console.log("Attempting to fetch from Localaccounts table...");
      const { data: localData, error: localError } = await supabase
        .from("Localaccounts")
        .select("*")
        .eq("emailAddress", user.email);

      console.log("Localaccounts response:", {
        data: localData,
        error: localError,
      });

      if (localError) {
        console.log(
          "Error fetching local accounts:",
          localError.message,
          localError.details,
        );
      }

      if (localData && localData.length > 0) {
        console.log("Found local accounts:", localData);
        localData.forEach((acc: any) => {
          console.log("Processing local account:", acc);

          // Check if accountType contains "+"
          const accountTypes = acc.accountType
            ? acc.accountType.split("+").map((type: string) => type.trim())
            : [acc.accountType];

          // If account has multiple types (contains +), create separate entries
          if (accountTypes.length > 1) {
            accountTypes.forEach((type: string, index: number) => {
              allAccounts.push({
                id: `${acc.accountId}-${index}`,
                name: acc.name,
                emailAddress: acc.emailAddress,
                accountNumber: acc.accountNo,
                accountType: type,
                type: "local",
                balance: parseFloat(acc.balance) || 0,
              });
            });
          } else {
            // Single account type
            allAccounts.push({
              id: acc.accountId.toString(),
              name: acc.name,
              emailAddress: acc.emailAddress,
              accountNumber: acc.accountNo,
              accountType: acc.accountType,
              type: "local",
              balance: parseFloat(acc.balance) || 0,
            });
          }
        });
      } else {
        console.log("No local accounts found for:", user.email);
      }

      // Fetch from Foreignaccounts
      console.log("Attempting to fetch from Foreignaccounts table...");
      const { data: foreignData, error: foreignError } = await supabase
        .from("Foreignaccounts")
        .select("*")
        .eq("emailAddress", user.email);

      console.log("Foreignaccounts response:", {
        data: foreignData,
        error: foreignError,
      });

      if (foreignError) {
        console.log(
          "Error fetching foreign accounts:",
          foreignError.message,
          foreignError.details,
        );
      }

      if (foreignData && foreignData.length > 0) {
        console.log("Found foreign accounts:", foreignData);
        foreignData.forEach((acc: any) => {
          console.log("Processing foreign account:", acc);

          // Check if accountType contains "+"
          const accountTypes = acc.accountType
            ? acc.accountType.split("+").map((type: string) => type.trim())
            : [acc.accountType];

          // If account has multiple types (contains +), create separate entries
          if (accountTypes.length > 1) {
            accountTypes.forEach((type: string, index: number) => {
              allAccounts.push({
                id: `${acc.accountId}-${index}`,
                name: acc.name,
                emailAddress: acc.emailAddress,
                accountNumber: acc.accountNo,
                accountType: type,
                type: "foreign",
                balance: parseFloat(acc.balance) || 0,
              });
            });
          } else {
            // Single account type
            allAccounts.push({
              id: acc.accountId.toString(),
              name: acc.name,
              emailAddress: acc.emailAddress,
              accountNumber: acc.accountNo,
              accountType: acc.accountType,
              type: "foreign",
              balance: parseFloat(acc.balance) || 0,
            });
          }
        });
      } else {
        console.log("No foreign accounts found for:", user.email);
      }

      console.log("=== TOTAL ACCOUNTS FOUND:", allAccounts.length, "===");
      setAccounts(allAccounts);

      // Set the first account as default or show message
      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0]);
        setUserName(allAccounts[0].name);
      } else {
        console.log("No accounts found - user may need to create an account");
        setUserName(user.email?.split("@")[0] || "User");
        // Show a helpful message
        Alert.alert(
          "No Accounts Found",
          "No bank accounts are linked to this email. Please contact support or create an account.",
          [{ text: "OK" }],
        );
      }

      setLoading(false);
    } catch (error) {
      console.log("Unexpected error in fetchUserData:", error);
      setUserName("User");
      setLoading(false);
      Alert.alert("Error", "Failed to load account data. Please try again.");
    }
  };

  const handleAccountSelect = (account: Account) => {
    console.log("Switching to account:", account.name);
    setSelectedAccount(account);
    setUserName(account.name);
    setShowAccountModal(false);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error", "Failed to logout: " + error.message);
            } else {
              router.replace("/landing");
            }
          } catch {
            Alert.alert("Error", "An unexpected error occurred");
          }
        },
      },
    ]);
  };

  const onLayout = (ref: React.RefObject<View>, id: string, text: string) => {
    if (ref.current) {
      ref.current.measure((x, y, width, height, pageX, pageY) => {
        const layout = { x: pageX, y: pageY, width, height };
        registerStep({ id, layout, text });
      });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#da291c" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 bg-gray-100">
        {/* Header Section */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1565967511849-76a60a16170",
          }}
          className="h-56 p-5 justify-between"
        >
          <View className="flex-row justify-between items-center mt-8">
            <FontAwesome6 name="expand" size={24} color="black" />
            <View className="flex-row items-center">
              <Link href="/notifications" className="mr-4">
                <FontAwesome6 name="bell" size={24} color="black" />
              </Link>
              <TouchableOpacity onPress={() => startTutorial()} className="mr-4">
                <FontAwesome6 name="question-circle" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout}>
                <Text className="text-blue-700 font-bold">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-800">
              Welcome, {userName}
            </Text>
            {accounts.length > 1 && (
              <TouchableOpacity
                onPress={() => setShowAccountModal(true)}
                className="bg-white/80 px-3 py-2 rounded-lg flex-row items-center mt-2 self-start"
              >
                <FontAwesome6 name="user-group" size={14} color="#da291c" />
                <Text className="ml-2 text-xs font-semibold text-gray-800">
                  Switch Account ({accounts.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>

        {/* Quick Actions Card */}
        <View
          ref={quickActionsRef}
          onLayout={() => onLayout(quickActionsRef, 'quick-actions', 'This is the Quick Actions section. You can quickly access features like PayNow.')}
          className="bg-white mx-4 -mt-12 p-5 rounded-xl shadow-lg flex-row justify-around relative">
          <TouchableOpacity className="absolute top-2 right-2">
            <FontAwesome6 name="gear" size={16} color="gray" />
          </TouchableOpacity>

          <View className="items-center">
            <TouchableOpacity
              className="bg-gray-100 p-3 rounded-full mb-1"
              onPress={() => router.push("/transferscreen")}
            >
              <FontAwesome6 name="comment-dollar" size={20} color="black" />
            </TouchableOpacity>
            <Text className="text-xs text-gray-600">PayNow</Text>
          </View>
          {/* Additional icons can be added here following the same pattern */}
        </View>

        {/* Account Tabs */}
        <View 
          ref={tabsRef}
          onLayout={() => onLayout(tabsRef, 'tabs', 'These tabs let you switch between your accounts, cards, and investments.')}
          className="flex-row items-center p-4">
          <TouchableOpacity
            onPress={() => setIsHidden(!isHidden)}
            className="mr-3"
          >
            <FontAwesome6
              name={isHidden ? "eye" : "eye-slash"}
              size={20}
              color={isHidden ? "#666" : "#da291c"}
            />
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {["accounts", "cards", "investments"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full border mr-2 ${activeTab === tab ? "bg-red-600 border-red-600" : "bg-white border-gray-300"}`}
              >
                <Text
                  className={`capitalize ${activeTab === tab ? "text-white font-bold" : "text-gray-600"}`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Account Details Card */}
        {selectedAccount ? (
          <TouchableOpacity
            className="bg-gray-50 mx-4 p-5 rounded-xl border border-gray-200"
            onPress={() => router.push("/accountdetails")}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="bg-orange-300 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold text-xs">
                    {selectedAccount?.type === "foreign" ? "FOR" : "FRA"}
                  </Text>
                </View>
                <View>
                  <Text className="font-bold text-gray-800">
                    {selectedAccount?.accountType ||
                      `OCBC ${selectedAccount?.type === "foreign" ? "Foreign" : "FRANK"} Account`}
                  </Text>
                  <Text
                    className={`text-xs text-gray-500 ${isHidden ? "bg-gray-200 text-transparent" : ""}`}
                  >
                    {isHidden
                      ? "••••••••"
                      : selectedAccount?.accountNumber || "123-45678-9"}
                  </Text>
                </View>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color="gray" />
            </View>

            <View className="border-t border-gray-200 pt-3 flex-row justify-between items-end">
              <Text className="text-gray-400 text-sm">Available balance</Text>
              <Text
                className={`text-lg font-bold ${isHidden ? "bg-gray-200 text-transparent" : "text-gray-800"}`}
              >
                {isHidden
                  ? "••••••"
                  : `S$ ${selectedAccount?.balance?.toFixed(2) || "0.00"}`}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View className="bg-gray-50 mx-4 p-5 rounded-xl border border-gray-200">
            <Text className="text-center text-gray-500">
              No accounts found. Please contact support.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Account Selection Modal */}
      <Modal
        visible={showAccountModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Account</Text>
              <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </V>
            <ScrollView style={styles.accountList}>
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.accountOption,
                      selectedAccount?.id === account.id &&
                        styles.accountOptionSelected,
                    ]}
                    onPress={() => handleAccountSelect(account)}
                  >
                    <View style={styles.accountIcon}>
                      <Text style={styles.accountIconText}>
                        {account.type === "foreign" ? "FOR" : "FRA"}
                      </Text>
                    </View>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{account.name}</Text>
                      <Text style={styles.accountType}>
                        {account.accountType ||
                          (account.type === "foreign"
                            ? "Foreign Account"
                            : "FRANK Account")}
                      </Text>
                      <Text style={styles.accountNumber}>
                        {account.accountNumber || "***-*****-*"}
                      </Text>
                    </View>
                    {selectedAccount?.id === account.id && (
                      <FontAwesome6
                        name="check-circle"
                        size={20}
                        color="#da291c"
                      />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: "#666", textAlign: "center" }}>
                    No accounts available
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => router.push("/homepage")}
        >
          <FontAwesome5 name="home" size={22} color="#da291c" />
          <Text style={[styles.navItemText, styles.navItemTextActive]}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/transferscreen")}
        >
          <FontAwesome5 name="exchange-alt" size={22} color="#888" />
          <Text style={styles.navItemText}>Pay & Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/more")}
        >
          <FontAwesome5 name="th-large" size={22} color="#888" />
          <Text style={styles.navItemText}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 8,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  navItemActive: {},
  navItemText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#888",
    marginTop: 4,
  },
  navItemTextActive: {
    color: "#da291c",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalClose: {
    fontSize: 24,
    color: "#666",
    fontWeight: "300",
  },
  accountList: {
    maxHeight: 400,
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  accountOptionSelected: {
    backgroundColor: "#f5f5f5",
  },
  accountIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e8a87c",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountIconText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  accountType: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 12,
    color: "#999",
  },
});
