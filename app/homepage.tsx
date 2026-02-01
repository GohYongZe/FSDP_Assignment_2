import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Link, useNavigation, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
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

interface Transaction {
  id: string;
  senderaccountNo: string;
  receiveraccountNo: string;
  amount: number;
  message: string;
  created_at: string;
}

type CobiAction =
  | { type: "navigate"; pathname: string; params?: Record<string, any> }
  | { type: "none" };

type CobiResult = {
  reply: string;
  action?: CobiAction;
};

type CobiMsg = { role: "user" | "assistant"; content: string };

const COBI_HISTORY_LIMIT = 10;

export default function HomePage() {
  const router = useRouter();
  const navigation = useNavigation();

  // ui state
  const [isHidden, setIsHidden] = useState(false);
  const [activeTab, setActiveTab] = useState("accounts");

  // user state
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  const manageAccountsButtonRef = useRef<View>(null);

  const tutorialSteps: TutorialStep[] = [
    {
      target: manageAccountsButtonRef,
      text: 'This button allows you to manage your linked accounts. You can add, remove, or view your connected accounts here.',
    },
  ];

  // language state
  const [language, setLanguage] = useState("en");

  // account state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // qr scanning
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // cobi states
  const [isCobiListening, setIsCobiListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [cobiReply, setCobiReply] = useState("");
  const [cobiBusy, setCobiBusy] = useState(false);
  const [cobiHistory, setCobiHistory] = useState<CobiMsg[]>([]);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const startedAtRef = useRef<number>(0);

  // load language preference
  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("selectedLanguage");
      if (savedLanguage) setLanguage(savedLanguage);
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    loadLanguage();
  }, []);

  useEffect(() => {
    if (selectedAccount?.accountNumber) {
      fetchTransactions(selectedAccount.accountNumber);

      const txChannel = supabase
        .channel(`home_transactions_${selectedAccount.accountNumber}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "TransactionsHistory",
            filter: `receiveraccountNo=eq.${selectedAccount.accountNumber}`,
          },
          () => {
            fetchTransactions(selectedAccount.accountNumber!);
            fetchUserData();
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "TransactionsHistory",
            filter: `senderaccountNo=eq.${selectedAccount.accountNumber}`,
          },
          () => {
            fetchTransactions(selectedAccount.accountNumber!);
            fetchUserData();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(txChannel);
      };
    }
  }, [selectedAccount]);

  const fetchTransactions = async (accountNo: string) => {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data, error } = await supabase
        .from("TransactionsHistory")
        .select("*")
        .or(`senderaccountNo.eq.${accountNo},receiveraccountNo.eq.${accountNo}`)
        .gte("created_at", threeDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) console.error("Error fetching transactions:", error);
      else setTransactions(data || []);
    } catch (err) {
      console.error("Err:", err);
    }
  };

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

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const parsed = JSON.parse(data);
      setShowScanner(false);

      if (parsed.type === "request") {
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
                      amount: parsed.amount,
                    },
                  } as any);
                },
              },
            ],
          );
        }
      } else if (parsed.accountNo) {
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
                } as any);
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
        setUserName("Guest");
        setLoading(false);
        return;
      }

      const allAccounts: Account[] = [];

      const { data: localData, error: localError } = await supabase
        .from("Localaccounts")
        .select("*")
        .eq("emailAddress", user.email);

      if (localError)
        console.error("Error fetching local accounts:", localError.message);

      if (localData?.length) {
        localData.forEach((acc: any) => {
          const accountTypes = acc.accountType
            ? acc.accountType.split("+").map((t: string) => t.trim())
            : [acc.accountType];

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

      if (foreignError)
        console.error("Error fetching foreign accounts:", foreignError.message);

      if (foreignData?.length) {
        foreignData.forEach((acc: any) => {
          const accountTypes = acc.accountType
            ? acc.accountType.split("+").map((t: string) => t.trim())
            : [acc.accountType];

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
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert(
                getTranslation("error", language),
                getTranslation("failedLogout", language) + ": " + error.message,
              );
            } else {
              router.replace("/landing");
            }
          },
        },
      ],
    );
  };

  // ------------------------
  // COBI: Push-to-talk flow
  // ------------------------
  const speak = (text: string) => {
    const t = (text ?? "").toString().trim();
    if (!t) return;
    Speech.stop();
    Speech.speak(t);
  };

  // IMPORTANT FIX:
  // Edge function expects `messages`, not `history`.
  // We'll convert cobiHistory -> messages, then send it.
  const callCobiAssistant = async (
    text: string,
    messages: CobiMsg[],
  ): Promise<CobiResult> => {
    const { data, error } = await supabase.functions.invoke("cobi-assistant", {
      body: {
        userName,
        language,
        selectedAccountNo: selectedAccount?.accountNumber ?? "",
        messages, // ✅ send as `messages`
        query: text, // optional; server can ignore
      },
    });

    if (error) throw error;
    return data as CobiResult;
  };

  const startCobiRecording = async () => {
    try {
      if (cobiBusy) return;

      setCobiReply("");
      setSpokenText("");
      setIsCobiListening(true);

      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Please allow microphone access.");
        setIsCobiListening(false);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await rec.startAsync();

      startedAtRef.current = Date.now();
      recordingRef.current = rec;
    } catch (e: any) {
      console.error(e);
      Alert.alert("Cobi", `Recording error: ${String(e?.message ?? e)}`);
      setIsCobiListening(false);
    }
  };

  const stopCobiRecording = async () => {
    setIsCobiListening(false);

    const rec = recordingRef.current;
    if (!rec) return;

    setCobiBusy(true);

    try {
      const durMs = Date.now() - startedAtRef.current;

      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error("No recording URI");
      if (durMs < 600) {
        setSpokenText("Too short—hold longer.");
        return;
      }

      const transcript = await transcribeWithOpenAI(uri);
      setSpokenText(transcript || "(No speech detected)");

      if (!transcript?.trim()) return;

      // 1) Add user's new message into local history
      const nextHistory: CobiMsg[] = [
        ...cobiHistory,
        { role: "user", content: transcript.trim() },
      ].slice(-COBI_HISTORY_LIMIT);

      // 2) Call server with full messages so it remembers clarifications
      const result = await callCobiAssistant(transcript.trim(), nextHistory);

      // 3) Add assistant reply into history
      const updatedHistory: CobiMsg[] = [
        ...nextHistory,
        { role: "assistant", content: (result?.reply ?? "").trim() },
      ]
        .filter((m) => m.content.trim().length > 0)
        .slice(-COBI_HISTORY_LIMIT);

      setCobiHistory(updatedHistory);

      if (result?.reply) {
        setCobiReply(result.reply);
        speak(result.reply);
      }

      if (result?.action?.type === "navigate") {
        router.push({
          pathname: result.action.pathname,
          params: result.action.params ?? {},
        } as any);
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert("Cobi", String(e?.message ?? e));
    } finally {
      setCobiBusy(false);
    }
  };

  const transcribeWithOpenAI = async (fileUri: string): Promise<string> => {
    const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!key) return "(No API key set)";

    const form = new FormData();
    form.append("model", "gpt-4o-mini-transcribe");
    // @ts-ignore
    form.append("file", { uri: fileUri, name: "audio.m4a", type: "audio/m4a" });

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return String(data.text ?? "");
  };

  // Payment Request Listener
  useEffect(() => {
    if (!selectedAccount?.accountNumber) return;

    const checkRequests = async () => {
      const { data } = await supabase
        .from("PaymentRequests")
        .select("*")
        .eq("receiver_account_no", selectedAccount.accountNumber)
        .eq("status", "pending");

      if (data && data.length > 0) {
        setPendingRequest(data[0]);
        setShowRequestModal(true);
      }
    };

    checkRequests();

    const channel = supabase
      .channel("home_requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "PaymentRequests",
          filter: `receiver_account_no=eq.${selectedAccount.accountNumber}`,
        },
        (payload) => {
          setPendingRequest(payload.new);
          setShowRequestModal(true);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedAccount?.accountNumber]);

  const handleAcceptRequest = async () => {
    if (!pendingRequest || !selectedAccount) return;

    try {
      const { data, error } = await supabase.rpc("transfer_funds", {
        sender_account_no: selectedAccount.accountNumber,
        receiver_account_no: pendingRequest.sender_account_no,
        amount: pendingRequest.amount,
        description: pendingRequest.description || `Payment Request Accepted`,
      });

      if (error) throw error;
      if (data && data.error) throw new Error(data.error);

      await supabase
        .from("PaymentRequests")
        .update({ status: "accepted" })
        .eq("id", pendingRequest.id);

      Alert.alert("Success", `Paid SGD ${pendingRequest.amount} to sender.`);
      setShowRequestModal(false);
      setPendingRequest(null);
      fetchUserData();
      if (selectedAccount?.accountNumber)
        fetchTransactions(selectedAccount.accountNumber);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDeclineRequest = async () => {
    if (!pendingRequest) return;
    await supabase
      .from("PaymentRequests")
      .update({ status: "declined" })
      .eq("id", pendingRequest.id);

    setShowRequestModal(false);
    setPendingRequest(null);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#da291c" />
      </View>
    );
  }

  const showCobiPopup =
    isCobiListening || cobiBusy || !!spokenText || !!cobiReply;

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="flex-1 bg-gray-100">
        {/* Header */}
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

        {/* Quick Actions */}
        <View className="bg-white mx-4 -mt-12 p-5 rounded-xl shadow-lg flex-row justify-around relative">
          <View className="items-center">
            <TouchableOpacity
              className="bg-gray-100 p-3 rounded-full mb-1"
              onPress={() => router.push("/paynow" as any)}
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
              onPress={() => router.push("/givenow" as any)}
            >
              <FontAwesome6
                name="hand-holding-dollar"
                size={20}
                color="black"
              />
            </TouchableOpacity>
            <Text className="text-xs text-gray-600">GiveNow</Text>
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

        {/* Tabs */}
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
                className={`px-5 py-2 rounded-full border mr-2 ${
                  activeTab === tab
                    ? "bg-red-600 border-red-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`capitalize ${
                    activeTab === tab ? "text-white font-bold" : "text-gray-600"
                  }`}
                >
                  {getTranslation(tab, language)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Account card */}
        {selectedAccount ? (
          <TouchableOpacity
            className="bg-[#f6ecec] mx-4 p-5 rounded-xl border border-gray-200"
            onPress={() =>
              router.push({
                pathname: "/accountdetails",
                params: {
                  accountType:
                    selectedAccount?.accountType ||
                    `OCBC ${
                      selectedAccount?.type === "foreign" ? "Foreign" : "FRANK"
                    } Account`,
                  balance: selectedAccount?.balance?.toFixed(2) || "0.00",
                  accountNumber: selectedAccount?.accountNumber || "",
                },
              } as any)
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
                      `OCBC ${
                        selectedAccount?.type === "foreign"
                          ? "Foreign"
                          : "FRANK"
                      } Account`}
                  </Text>
                  <Text
                    className={`text-base font-medium text-black-600 mt-1 ${
                      isHidden ? "bg-black-200 text-transparent" : ""
                    }`}
                  >
                    {isHidden
                      ? "•••••••••••"
                      : (() => {
                          const accNo =
                            selectedAccount?.accountNumber || "123456789";
                          if (accNo.length >= 9) {
                            return `${accNo.slice(0, 3)}-${accNo.slice(
                              3,
                              -3,
                            )}-${accNo.slice(-3)}`;
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
                className={`text-xl font-bold ${
                  isHidden ? "bg-black-200 text-transparent" : "text-black-800"
                }`}
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
                className={`text-base font-medium text-black-600 ${
                  isHidden ? "bg-black-200 text-transparent" : ""
                }`}
              >
                {isHidden
                  ? "••••••••••••"
                  : (() => {
                      const accNo =
                        selectedAccount?.accountNumber || "123456789";
                      const formatted =
                        accNo.match(/.{1,4}/g)?.join("-") || accNo;
                      return formatted;
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
            <View className="flex-row justify-between items-center mb-3 mt-3">
              <Text className="text-xl font-bold text-gray-800">
                {getTranslation("recentTransactions", language)}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/transactions",
                    params: { accountNo: selectedAccount.accountNumber },
                  } as any)
                }
              >
                <Text className="text-sm font-semibold text-red-600">
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-gray-500 mb-3">Past 3 days</Text>

            {transactions.length > 0 ? (
              transactions.map((tx) => {
                const isReceived =
                  tx.receiveraccountNo === selectedAccount.accountNumber;
                const amount = parseFloat(tx.amount.toString());
                const date = new Date(tx.created_at).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                  },
                );

                return (
                  <View
                    key={tx.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 mb-2"
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="text-xs text-gray-500 mb-1">
                          {date}
                        </Text>
                        <Text className="text-sm font-bold text-gray-800 mb-1">
                          {isReceived ? "RECEIVED" : "SENT"}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {tx.message ||
                            (isReceived
                              ? `From ${tx.senderaccountNo}`
                              : `To ${tx.receiveraccountNo}`)}
                        </Text>
                      </View>
                      <Text
                        className={`text-base font-semibold ${
                          isReceived ? "text-green-600" : "text-black"
                        }`}
                      >
                        {isReceived ? "+" : "-"}
                        {Math.abs(amount).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="p-4 rounded-lg border border-gray-200 bg-white items-center">
                <Text className="text-gray-500 italic">
                  No recent transactions
                </Text>
              </View>
            )}
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

      {/* Floating Cobi Button (hold to talk) */}
      <TouchableOpacity
        onPressIn={startCobiRecording}
        onPressOut={stopCobiRecording}
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

      {/* Cobi Popup */}
      {showCobiPopup && (
        <View style={styles.cobiPopup}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.cobiTitle}>Cobi Assistant</Text>
            <TouchableOpacity
              onPress={() => {
                setSpokenText("");
                setCobiReply("");
                setCobiHistory([]); // ✅ clear memory when closing
              }}
            >
              <Text style={{ color: "#666", fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cobiText}>
            {isCobiListening
              ? "Listening…"
              : spokenText
                ? `You: ${spokenText}`
                : "Ready"}
          </Text>

          {cobiBusy && <Text style={styles.cobiText}>Processing…</Text>}

          {!!cobiReply && (
            <Text style={[styles.cobiText, { marginTop: 8 }]}>
              Cobi: {cobiReply}
            </Text>
          )}
        </View>
      )}

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, styles.navItemActive]}
          onPress={() => navigation.navigate("homepage" as never)}
        >
          <FontAwesome5 name="home" size={22} color="#da291c" />
          <Text style={[styles.navItemText, styles.navItemTextActive]}>
            {getTranslation("home", language)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/transferscreen" as any)}
        >
          <FontAwesome5 name="exchange-alt" size={22} color="#888" />
          <Text style={styles.navItemText}>
            {getTranslation("payAndTransfer", language)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("more" as never)}
        >
          <FontAwesome5 name="th-large" size={22} color="#888" />
          <Text style={styles.navItemText}>
            {getTranslation("more", language)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Request Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showRequestModal}
        onRequestClose={() => {}}
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm items-center">
            <FontAwesome6
              name="money-bill-transfer"
              size={48}
              color="#2563eb"
              style={{ marginBottom: 16 }}
            />
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Request Received
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              <Text className="font-bold">
                {pendingRequest?.description || "Someone"}
              </Text>{" "}
              is requesting{" "}
              <Text className="font-bold">SGD {pendingRequest?.amount}</Text>.
            </Text>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={handleDeclineRequest}
                className="flex-1 py-3 bg-red-100 rounded-xl items-center"
              >
                <Text className="text-red-700 font-bold">Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAcceptRequest}
                className="flex-1 py-3 bg-green-600 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Pay Now</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  navItem: { flex: 1, alignItems: "center", paddingVertical: 6 },
  navItemActive: {},
  navItemText: { fontSize: 12, fontWeight: "500", color: "#888", marginTop: 4 },
  navItemTextActive: { color: "#da291c" },

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
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  modalClose: { fontSize: 24, color: "#666", fontWeight: "300" },
  accountList: { maxHeight: 400 },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  accountOptionSelected: { backgroundColor: "#f5f5f5" },
  accountIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e8a87c",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountIconText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  accountInfo: { flex: 1 },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  accountType: { fontSize: 13, color: "#666", marginBottom: 2 },
  accountNumber: { fontSize: 12, color: "#999" },

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
  cobiText: { fontStyle: "italic", fontSize: 12, color: "#666" },
});
