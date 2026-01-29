import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
// import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "@jamsch/expo-speech-recognition";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
} from "react-native";
import { supabase } from "../lib/supabase";

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

  // qr scanning
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Cobi States
  const [isCobiListening, setIsCobiListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  // Cobi Event Listeners - Disabled
  /*
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      setSpokenText(transcript);
      if (event.isFinal) {
        processCommandWithCobi(transcript);
      }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("Cobi Voice Error:", event.error, event.message);
    setIsCobiListening(false);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsCobiListening(false);
  });
  */

  const handleStartScan = () => {
    if (!permission) {
      requestPermission();
      return;
    }
    if (!permission.granted) {
      Alert.alert(
        "Permission",
        "Camera permission is required to scan QR codes.",
      );
      requestPermission();
      return;
    }
    setScanned(false);
    setShowScanner(true);
  };

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    // Prevent multiple scans
    if (scanned) return;
    setScanned(true);
    // Don't close immediately to avoid jarring transitions, or close if we show an alert.

    try {
      const parsed = JSON.parse(data);
      console.log("Scanned QR:", parsed);
      setShowScanner(false); // Close now

        if (parsed.type === 'request') {
            // Payment Request
            if (parsed.accountNo && parsed.amount) {
                Alert.alert(
                    "Payment Request", 
                    `Do you want to pay SGD ${parsed.amount} to ${parsed.accountNo}?`,
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Pay", onPress: () => {
                            router.push({
                                pathname: "/twotappay",
                                params: {
                                    accountNo: parsed.accountNo,
                                    nickName: parsed.name || 'Quick Pay',
                                    amount: parsed.amount // Pass amount to pre-select
                                }
                            });
                        }}
                    ]
                );
            }
        } else if (parsed.accountNo) {
            // Link Request (Standard Profile QR)
            Alert.alert(
                "Link Account", 
                `Found account: ${parsed.accountNo}. Do you want to link?`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Link", onPress: () => {
                        router.push({
                            pathname: "/linktoaccount",
                            params: {
                                accountNo: parsed.accountNo,
                                name: parsed.name || ''
                            }
                        });
                    }}
                ]
            );
        } else {
            Alert.alert("Invalid QR", "This QR code is not recognized.");
        }
    } catch (e) {
        console.error("Error parsing QR code:", e);
        setShowScanner(false);
        Alert.alert("Error", "Could not parse QR code.");
    }
  };

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth error:", authError);
        setUserName("Guest");
        setLoading(false);
        return;
      }

      // Fetch all accounts for this email
      const allAccounts: Account[] = [];

      // Fetch from Localaccounts
      console.log("Attempting to fetch from Localaccounts table...");
      const { data: localData, error: localError } = await supabase
        .from("Localaccounts")
        .select("*")
        .eq("emailAddress", user.email);

      if (localError) {
        console.error("Error fetching local accounts:", localError.message);
      }

      if (localData && localData.length > 0) {
        localData.forEach((acc: any) => {
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
      }

      const { data: foreignData, error: foreignError } = await supabase
        .from("Foreignaccounts")
        .select("*")
        .eq("emailAddress", user.email);

      if (foreignError) {
        console.error("Error fetching foreign accounts:", foreignError.message);
      }

      if (foreignData && foreignData.length > 0) {
        foreignData.forEach((acc: any) => {
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
      }

      setAccounts(allAccounts);

      // Set the first account as default or show message
      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0]);
        setUserName(allAccounts[0].name);
      } else {
        setUserName(user.email?.split("@")[0] || "User");
        Alert.alert(
          "No Accounts Found",
          "No bank accounts are linked to this email. Please contact support or create an account.",
          [{ text: "OK" }]
        );
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setUserName("User");
      setLoading(false);
      Alert.alert("Error", "Failed to load account data. Please try again.");
    }
  };

  const handleAccountSelect = (account: Account) => {
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

  // Cobi Handlers
  const handleCobiPress = async () => {
    Alert.alert("Feature Unavailable", "Voice commands are currently disabled in this environment.");
    /*
    if (isCobiListening) {
      ExpoSpeechRecognitionModule.stop();
      setIsCobiListening(false);
    } else {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      // Robust permission check for Android and iOS
      if (result.status !== "granted" && !result.granted) {
        Alert.alert(
          "Permission Denied",
          "Cobi needs microphone access to help you."
        );
        return;
      }

      setSpokenText("");
      setIsCobiListening(true);
      // Continuous mode keeps the mic active for longer sentences
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        continuous: true,
        interimResults: true,
      });
    }
    */
  };

  const processCommandWithCobi = async (text: string) => {
    try {
      const { data } = await supabase.functions.invoke("cobi-assistant", {
        body: { query: text, userName: userName },
      });
      if (data?.message) {
        Alert.alert("Cobi", data.message);
        fetchUserData(); // Refresh dashboard balance after transaction
      }
    } catch (err) {
      console.error(err);
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
        <View className="bg-white mx-4 -mt-12 p-5 rounded-xl shadow-lg flex-row justify-around relative">
          <TouchableOpacity className="absolute top-2 right-2">
            <FontAwesome6 name="gear" size={16} color="gray" />
          </TouchableOpacity>

          <View className="items-center">
            <TouchableOpacity
              className="bg-gray-100 p-3 rounded-full mb-1"
              onPress={() => router.push("/TransferScreen")}
            >
              <FontAwesome6 name="comment-dollar" size={20} color="black" />
            </TouchableOpacity>
            <Text className="text-xs text-gray-600">PayNow</Text>
          </View>

          <View className="items-center">
            <TouchableOpacity
              className="bg-gray-100 p-3 rounded-full mb-1"
              onPress={handleStartScan}
            >
              <FontAwesome6 name="qrcode" size={20} color="black" />
            </TouchableOpacity>
            <Text className="text-xs text-gray-600">Scan</Text>
          </View>
        </View>

        {/* Account Tabs */}
        <View className="flex-row items-center p-4">
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
            </View>
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

      {/* Camera Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowScanner(false)}
      >
        <View className="flex-1 bg-black">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          <View className="absolute top-0 left-0 right-0 p-12 items-center">
            <Text className="text-white text-lg font-bold bg-black/50 p-2 rounded-lg overflow-hidden">
              Scan QR Code
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowScanner(false)}
            className="absolute top-4 right-4 bg-white/20 p-2 rounded-full"
          >
            <FontAwesome6 name="xmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Floating Cobi Button */}
      <TouchableOpacity
        onPress={handleCobiPress}
        style={[
          styles.cobiButton,
          { backgroundColor: isCobiListening ? "#da291c" : "#0066cc" },
        ]}
      >
        <FontAwesome6
          name={isCobiListening ? "microphone" : "wand-magic-sparkles"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      {/* Cobi Listening Popup */}
      {isCobiListening && (
        <View style={styles.cobiPopup}>
          <Text style={styles.cobiTitle}>Cobi Assistant</Text>
          <Text style={styles.cobiText}>
            {spokenText || "Listening..."}
          </Text>
        </View>
      )}

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
          onPress={() => router.push("/TransferScreen")}
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

      {/* Camera Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowScanner(false)}
      >
        <View className="flex-1 bg-black">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          <View className="absolute top-0 left-0 right-0 p-12 items-center">
            <Text className="text-white text-lg font-bold bg-black/50 p-2 rounded-lg overflow-hidden">
              Scan QR Code
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowScanner(false)}
            className="absolute top-4 right-4 bg-white/20 p-2 rounded-full"
          >
            <FontAwesome6 name="xmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
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
  cobiButton: {
    position: "absolute",
    bottom: 96,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cobiPopup: {
    position: "absolute",
    bottom: 170,
    right: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    width: 256,
    borderWidth: 1,
    borderColor: "#e3f2fd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cobiTitle: {
    fontWeight: "bold",
    color: "#0066cc",
    marginBottom: 4,
    fontSize: 14,
  },
  cobiText: {
    fontStyle: "italic",
    fontSize: 12,
    color: "#666",
  },
});