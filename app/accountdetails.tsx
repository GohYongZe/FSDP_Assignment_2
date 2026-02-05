import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import {
  getTranslation,
  translateTransactionMessage,
} from "../lib/translations";

// enable animation for android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Transaction {
  id: number;
  senderaccountNo: string;
  receiveraccountNo: string;
  amount: string | number;
  description: string;
  message: string;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

const AccountDetailsScreen = ({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [language, setLanguage] = useState("en");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debitCardNumber, setDebitCardNumber] = useState<string>("");

  // get account data from params
  const accountType = (params.accountType as string) || "OCBC FRANK Account";
  const balance = (params.balance as string) || "1,234.56";
  const accountNumber = (params.accountNumber as string) || "";

  // Generate available months from transactions
  const getAvailableMonths = (): string[] => {
    if (transactions.length === 0) return [];

    const monthSet = new Set<string>();
    transactions.forEach((tx) => {
      const txDate = new Date(tx.created_at);
      const month = txDate.toLocaleString("en-US", { month: "short" });
      const year = txDate.getFullYear();
      monthSet.add(`${month} ${year}`);
    });

    // Convert to array and sort by date (most recent first)
    return Array.from(monthSet).sort((a, b) => {
      const [monthA, yearA] = a.split(" ");
      const [monthB, yearB] = b.split(" ");
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const months = getAvailableMonths();

  // translate month names
  const translateMonth = (monthYear: string) => {
    const [month, year] = monthYear.split(" ");
    const monthKey = month.toLowerCase();
    return `${getTranslation(monthKey, language)} ${year}`;
  };

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

  // Fetch transactions from database
  const fetchTransactions = async () => {
    if (!accountNumber) return;

    try {
      const { data, error } = await supabase
        .from("TransactionsHistory")
        .select("*")
        .or(
          `senderaccountNo.eq.${accountNumber},receiveraccountNo.eq.${accountNumber}`,
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        setTransactions(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Fetch debit card number
  const fetchDebitCardNumber = async () => {
    if (!accountNumber) return;

    try {
      // Try to fetch from Localaccounts first
      let { data, error } = await supabase
        .from("Localaccounts")
        .select("debitCardNumber")
        .eq("accountNo", accountNumber)
        .single();

      if (error || !data) {
        // Try Foreignaccounts if not found
        ({ data, error } = await supabase
          .from("Foreignaccounts")
          .select("debitCardNumber")
          .eq("accountNo", accountNumber)
          .single());
      }

      if (data && data.debitCardNumber) {
        setDebitCardNumber(data.debitCardNumber);
      }
    } catch (err) {
      console.error("Error fetching debit card number:", err);
    }
  };

  useEffect(() => {
    loadLanguage();
    fetchTransactions();
    fetchDebitCardNumber();
  }, [accountNumber]);

  // Set initial selected month when transactions are loaded
  useEffect(() => {
    if (transactions.length > 0 && !selectedMonth) {
      const availableMonths = getAvailableMonths();
      if (availableMonths.length > 0) {
        setSelectedMonth(availableMonths[0]);
      }
    }
  }, [transactions]);

  // Listen for new transactions
  useEffect(() => {
    if (!accountNumber) return;

    const txChannel = supabase
      .channel(`account_details_${accountNumber}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "TransactionsHistory",
          filter: `receiveraccountNo=eq.${accountNumber}`,
        },
        () => {
          fetchTransactions();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "TransactionsHistory",
          filter: `senderaccountNo=eq.${accountNumber}`,
        },
        () => {
          fetchTransactions();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(txChannel);
    };
  }, [accountNumber]);

  const toggleAdvanced = () => {
    // This creates a smooth slide-down effect when the button is pressed
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAdvanced(!showAdvanced);
  };

  const handleMenuPress = () => {
    Alert.alert(
      getTranslation("logout", language),
      getTranslation("logoutConfirm", language),
      [
        {
          text: getTranslation("logout", language),
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              router.replace("/landing");
            } catch (error) {
              console.error("Error logging out:", error);
              Alert.alert(
                getTranslation("error", language),
                getTranslation("failedLogout", language),
                [{ text: getTranslation("ok", language) }],
              );
            }
          },
        },
        { text: getTranslation("cancel", language), style: "cancel" },
      ],
    );
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
            <Text style={styles.balanceLabel}>
              {getTranslation("totalBalance", language)}
            </Text>
            <Text style={styles.balanceValue}>{balance} SGD</Text>
          </View>
          <View style={styles.balanceColumn}>
            <Text style={styles.balanceLabel}>
              {getTranslation("availableBalance", language)}
            </Text>
            <Text style={styles.balanceValue}>{balance} SGD</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {getTranslation("transactions", language)}
        </Text>

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
                {translateMonth(month)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transaction List - Dynamic Rendering Based on Selected Month */}
        <View style={styles.transactionList}>
          {transactions
            .filter((tx) => {
              const txDate = new Date(tx.created_at);
              const [monthName, year] = selectedMonth.split(" ");
              const monthIndex = months.indexOf(selectedMonth);
              if (monthIndex === -1) return false;

              const txMonth = txDate.toLocaleString("en-US", {
                month: "short",
              });
              const txYear = txDate.getFullYear().toString();

              return txMonth === monthName && txYear === year;
            })
            .map((tx) => {
              const isReceived = tx.receiveraccountNo === accountNumber;
              const amount = parseFloat(tx.amount.toString());
              const date = new Date(tx.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              });

              return (
                <View key={tx.id} style={styles.transactionItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.transDate}>{date}</Text>
                    <Text style={styles.transName}>
                      {isReceived
                        ? getTranslation("received", language)
                        : getTranslation("sent", language)}
                    </Text>
                    <Text style={styles.transDetails}>
                      {(() => {
                        const translated = translateTransactionMessage(
                          tx.message,
                          language,
                        );
                        return (
                          translated ||
                          (isReceived
                            ? `${getTranslation("from", language)} ${tx.senderaccountNo}`
                            : `${getTranslation("to", language)} ${tx.receiveraccountNo}`)
                        );
                      })()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.amount,
                      isReceived ? styles.deposit : styles.expense,
                    ]}
                  >
                    {isReceived ? "+" : "-"}
                    {amount.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          {transactions.filter((tx) => {
            const txDate = new Date(tx.created_at);
            const [monthName, year] = selectedMonth.split(" ");
            const txMonth = txDate.toLocaleString("en-US", { month: "short" });
            const txYear = txDate.getFullYear().toString();
            return txMonth === monthName && txYear === year;
          }).length === 0 && (
            <View style={styles.transactionItem}>
              <Text style={styles.transDetails}>
                {getTranslation("noTransactions", language) ||
                  "No transactions for this period"}
              </Text>
            </View>
          )}
        </View>

        {/* Toggle Button */}
        <TouchableOpacity style={styles.toggleButton} onPress={toggleAdvanced}>
          <Text style={styles.toggleButtonText}>
            {showAdvanced
              ? getTranslation("hideFullHistory", language)
              : getTranslation("viewFullHistory", language)}
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
            <Text style={styles.advancedTitle}>
              {getTranslation("accountManagement", language)}
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>
                {getTranslation("accountOpeningDate", language)}
              </Text>
              <Text style={styles.infoValue}>15 March 2018</Text>
            </View>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>
                {getTranslation("downloadStatements", language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>
                {getTranslation("changeNickname", language)}
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
          <Text style={styles.navText}>{getTranslation("home", language)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/transferscreen")}
        >
          <Icon name="exchange-alt" size={22} color="#888" />
          <Text style={styles.navText}>
            {getTranslation("payAndTransfer", language)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/more")}
        >
          <Icon name="th-large" size={22} color="#888" />
          <Text style={styles.navText}>{getTranslation("more", language)}</Text>
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
