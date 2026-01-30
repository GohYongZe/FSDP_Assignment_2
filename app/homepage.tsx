import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
// import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "@jamsch/expo-speech-recognition";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { getTranslation, getTranslationWithParams } from "../lib/translations";

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
  const [isHidden, setIsHidden] = useState(false);
  const [activeTab, setActiveTab] = useState("accounts");

  // State from homepage.tsx
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Language state
  const [language, setLanguage] = useState("en");

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

  // Load language preference
  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("selectedLanguage");
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    loadLanguage();
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
        getTranslation("permission", language),
        getTranslation("cameraPermissionRequired", language),
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

      if (parsed.type === "request") {
        // Payment Request
        if (parsed.accountNo && parsed.amount) {
          Alert.alert(
            getTranslation("paymentRequest", language),
            getTranslationWithParams("paymentRequestMessage", language, {
              amount: parsed.amount,
              accountNo: parsed.accountNo,
            }),
            [
              { text: getTranslation("cancel", language), style: "cancel" },
              {
                text: getTranslation("pay", language),
                onPress: () => {
                  router.push({
                    pathname: "/twotappay",
                    params: {
                      accountNo: parsed.accountNo,
                      nickName: parsed.name || "Quick Pay",
                      amount: parsed.amount, // Pass amount to pre-select
                    },
                  });
                },
              },
            ],
          );
        }
      } else if (parsed.accountNo) {
        // Link Request (Standard Profile QR)
        Alert.alert(
          getTranslation("linkAccount", language),
          getTranslationWithParams("linkAccountMessage", language, {
            accountNo: parsed.accountNo,
          }),
          [
            { text: getTranslation("cancel", language), style: "cancel" },
            {
              text: getTranslation("link", language),
              onPress: () => {
                router.push({
                  pathname: "/linktoaccount",
                  params: {
                    accountNo: parsed.accountNo,
                    name: parsed.name || "",
                  },
                });
              },
            },
          ],
        );
      } else {
        Alert.alert(
          getTranslation("invalidQR", language),
          getTranslation("qrNotRecognized", language),
        );
      }
    } catch (e) {
      console.error("Error parsing QR code:", e);
      setShowScanner(false);
      Alert.alert(
        getTranslation("error", language),
        getTranslation("couldNotParseQR", language),
      );
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
          getTranslation("noAccountsFoundTitle", language),
          getTranslation("noAccountsFoundMessage", language),
          [{ text: getTranslation("ok", language) }],
        );
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setUserName("User");
      setLoading(false);
      Alert.alert(
        getTranslation("error", language),
        getTranslation("failedToLoadAccounts", language),
      );
    }
  };

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    setUserName(account.name);
    setShowAccountModal(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      getTranslation("logout", language),
      getTranslation("logoutConfirm", language),
      [
        { text: getTranslation("cancel", language), style: "cancel" },
        {
          text: getTranslation("logout", language),
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                Alert.alert(
                  getTranslation("error", language),
                  getTranslation("failedLogout", language) +
                    ": " +
                    error.message,
                );
              } else {
                router.replace("/landing");
              }
            } catch {
              Alert.alert(
                getTranslation("error", language),
                getTranslation("unexpectedError", language),
              );
            }
          },
        },
      ],
    );
  };

  // Cobi Handlers
  const handleCobiPress = async () => {
    Alert.alert(
      getTranslation("featureUnavailable", language),
      getTranslation("voiceCommandsDisabled", language),
    );
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
          source={require("../assets/images/homepage_bg.png")}
          className="h-100 p-5 justify-between"
        >
          <View className="flex-row justify-between items-center mt-8">
            <FontAwesome6 name="expand" size={24} color="black" />
            <View className="flex-row items-center">
              <Link href="/notifications" className="mr-4">
                <FontAwesome6 name="bell" size={24} color="black" />
              </Link>
              <TouchableOpacity onPress={handleLogout}>
                <Text className="text-blue-700 font-bold">
                  {getTranslation("logout", language)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="mb-8" style={{ marginTop: 100 }}>
            <Text className="text-3xl font-bold text-gray-800 mb-3">
              {getTranslation("welcome", language)}, {userName}
            </Text>
            {accounts.length > 1 && (
              <TouchableOpacity
                onPress={() => setShowAccountModal(true)}
                className="bg-white/80 px-3 py-2 rounded-lg flex-row items-center mt-2 self-start"
              >
                <FontAwesome6 name="user-group" size={14} color="#da291c" />
                <Text className="ml-2 text-xs font-semibold text-gray-800">
                  {getTranslation("switchAccount", language)} ({accounts.length}
                  )
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>

        {/* Quick Actions Card */}
        <View className="bg-white mx-4 -mt-12 p-5 rounded-xl shadow-lg flex-row justify-around relative">
          <View className="items-center">
            <TouchableOpacity
              className="bg-gray-100 p-3 rounded-full mb-1"
              onPress={() => router.push("/transferscreen")}
            >
              <FontAwesome6 name="comment-dollar" size={20} color="black" />
            </TouchableOpacity>
            <Text className="text-xs text-gray-600">
              {getTranslation("payNow", language)}
            </Text>
          </View>

          <View className="items-center">
            <TouchableOpacity
              className="bg-gray-100 p-3 rounded-full mb-1"
              onPress={handleStartScan}
            >
              <FontAwesome6 name="qrcode" size={20} color="black" />
            </TouchableOpacity>
            <Text className="text-xs text-gray-600">
              {getTranslation("scan", language)}
            </Text>
          </View>

          <View className="h-full w-px bg-gray-300" />

          <View className="items-center">
            <TouchableOpacity className="bg-orange-100 p-3 rounded-full mb-1">
              <FontAwesome6 name="gear" size={20} color="black" />
            </TouchableOpacity>
            <Text className="text-xs text-gray-600">
              {getTranslation("customise", language)}
            </Text>
          </View>
        </View>

        {/* Account Tabs */}
        <View className="flex-row items-center p-4">
          <TouchableOpacity
            onPress={() => setIsHidden(!isHidden)}
            className="mr-3"
          >
            <FontAwesome6
              name={isHidden ? "eye-slash" : "eye"}
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
                  {getTranslation(tab, language)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Account Details Card */}
        {selectedAccount ? (
          <TouchableOpacity
            className="bg-[#f6ecec] mx-4 p-5 rounded-xl border border-gray-200"
            onPress={() =>
              router.push({
                pathname: "/accountdetails",
                params: {
                  accountType:
                    selectedAccount?.accountType ||
                    `OCBC ${selectedAccount?.type === "foreign" ? "Foreign" : "FRANK"} Account`,
                  balance: selectedAccount?.balance?.toFixed(2) || "0.00",
                  accountNumber: selectedAccount?.accountNumber || "",
                },
              })
            }
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="bg-orange-300 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-bold text-xs">
                    {(() => {
                      const accountType =
                        selectedAccount?.accountType ||
                        (selectedAccount?.type === "foreign"
                          ? "Foreign"
                          : "Frank");
                      const firstWord = accountType.split(" ")[0];
                      return firstWord.substring(0, 3).toUpperCase();
                    })()}
                  </Text>
                </View>
                <View>
                  <Text className="text-xl font-bold text-gray-800">
                    {selectedAccount?.accountType ||
                      `OCBC ${selectedAccount?.type === "foreign" ? "Foreign" : "FRANK"} Account`}
                  </Text>
                  <Text
                    className={`text-base font-medium text-black-600 mt-1 ${isHidden ? "bg-black-200 text-transparent" : ""}`}
                  >
                    {isHidden
                      ? "•••••••••••"
                      : (() => {
                          const accNo =
                            selectedAccount?.accountNumber || "123456789";
                          // Format as XXX-XXXXX-XXX
                          if (accNo.length >= 9) {
                            return `${accNo.slice(0, 3)}-${accNo.slice(3, -3)}-${accNo.slice(-3)}`;
                          }
                          return accNo;
                        })()}
                  </Text>
                </View>
              </View>
              <FontAwesome6 name="chevron-right" size={16} color="gray" />
            </View>

            <View className="flex-row justify-between items-end mb-3">
              <Text className="text-gray-700 text-base">
                {getTranslation("availableBalance", language)}
              </Text>
              <Text
                className={`text-xl font-bold ${isHidden ? "bg-black-200 text-transparent" : "text-black-800"}`}
              >
                {isHidden
                  ? "••••••"
                  : `${selectedAccount?.balance?.toFixed(2) || "0.00"} SGD`}
              </Text>
            </View>
            <View className="border-t border-gray-200 pt-3 flex-row justify-between items-center">
              <Text className="text-gray-700 text-base">
                {selectedAccount?.accountType?.toLowerCase().includes("credit")
                  ? getTranslation("creditCardNo", language)
                  : getTranslation("debitCardNo", language)}
              </Text>
              <Text
                className={`text-base font-medium text-black-600 ${isHidden ? "bg-black-200 text-transparent" : ""}`}
              >
                {isHidden
                  ? "••••••••••••"
                  : (() => {
                      const accNo =
                        selectedAccount?.accountNumber || "123456789";
                      // Format as XXXX-XXXX-XXXX for card display
                      if (accNo.length >= 9) {
                        // Group digits in sets of 4
                        const formatted =
                          accNo.match(/.{1,4}/g)?.join("-") || accNo;
                        return formatted;
                      }
                      return accNo;
                    })()}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View className="bg-[#f6ecec] mx-4 p-5 rounded-xl border border-gray-200">
            <Text className="text-center text-gray-500">
              {getTranslation("noAccountsFound", language)}
            </Text>
          </View>
        )}

        {/* Recent Transactions */}
        {selectedAccount && (
          <View className="mx-4 mt-4 mb-32">
            <Text className="text-xl font-bold text-gray-800 mb-3 mt-3">
              {getTranslation("recentTransactions", language)}
            </Text>
            <Text className="text-sm text-gray-500 mb-3">
              {getTranslation("upTo50Last7Days", language)}
            </Text>

            {/* Transaction 1 */}
            <View className="bg-white p-4 rounded-lg border border-gray-200 mb-2">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">28 Jan</Text>
                  <Text className="text-sm font-bold text-gray-800 mb-1">
                    {getTranslation("transfer", language).toUpperCase()}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {getTranslation("from", language)} John Doe
                  </Text>
                </View>
                <Text className="text-base font-semibold text-green-600">
                  +150.00
                </Text>
              </View>
            </View>

            {/* Transaction 2 */}
            <View className="bg-white p-4 rounded-lg border border-gray-200">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">27 Jan</Text>
                  <Text className="text-sm font-bold text-gray-800 mb-1">
                    {getTranslation("payment", language).toUpperCase()}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {getTranslation("shoppingMallPurchase", language)}
                  </Text>
                </View>
                <Text className="text-base font-semibold text-gray-800">
                  -45.50
                </Text>
              </View>
            </View>
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
              <Text style={styles.modalTitle}>
                {getTranslation("selectAccount", language)}
              </Text>
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
                        {(() => {
                          const accountType =
                            account.accountType ||
                            (account.type === "foreign" ? "Foreign" : "Frank");
                          const firstWord = accountType.split(" ")[0];
                          return firstWord.substring(0, 3).toUpperCase();
                        })()}
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
          <Text style={styles.cobiText}>{spokenText || "Listening..."}</Text>
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
            {getTranslation("home", language)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/transferscreen")}
        >
          <FontAwesome5 name="exchange-alt" size={22} color="#888" />
          <Text style={styles.navItemText}>
            {getTranslation("payAndTransfer", language)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/more")}
        >
          <FontAwesome5 name="th-large" size={22} color="#888" />
          <Text style={styles.navItemText}>
            {getTranslation("more", language)}
          </Text>
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
    paddingBottom: 35,
    paddingTop: 12,
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
    bottom: 110,
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
