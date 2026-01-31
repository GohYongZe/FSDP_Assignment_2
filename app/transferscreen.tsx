import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { supabase } from '../lib/supabase';

const TransferScreen = () => {
  const router = useRouter(); // keep for backup
  const navigation = useNavigation();
  
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const actions = [
    { name: "PayNow", icon: "mobile-alt", route: "/paynow" },
    { name: "GiveNow", icon: "hand-holding-usd", route: "/givenow" },
    { name: "Pay Bills", icon: "file-invoice-dollar", route: null },
    { name: "Local Transfer", icon: "university", route: null },
    { name: "Overseas Transfer", icon: "plane-departure", route: null },
    { name: "Credit Card Payment", icon: "credit-card", route: null },
  ];

  useEffect(() => {
     fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
      try {
          // 1. get user
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user?.email) return;

          // 2. get my account no
          let myAccountNo = '';
          let { data: localAcc } = await supabase
              .from('Localaccounts')
              .select('accountNo')
              .eq('emailAddress', session.user.email)
              .single();
          
          if (localAcc) {
              myAccountNo = localAcc.accountNo;
          } else {
              let { data: foreignAcc } = await supabase
                  .from('Foreignaccounts')
                  .select('accountNo')
                  .eq('emailAddress', session.user.email)
                  .single();
               if (foreignAcc) myAccountNo = foreignAcc.accountNo;
          }

          if (!myAccountNo) return;

          // 3. fetch recent transactions
          const { data: txData, error: txError } = await supabase
              .from('TransactionsHistory')
              .select('receiveraccountNo, created_at')
              .eq('senderaccountNo', myAccountNo)
              .order('created_at', { ascending: false })
              .limit(50); // get 50 to find dupes

          if (txError || !txData) return;

          // 4. filter unique receivers
          const uniqueReceivers = new Set();
          const uniqueList: string[] = [];
          
          for (const tx of txData) {
              if (tx.receiveraccountNo && !uniqueReceivers.has(tx.receiveraccountNo)) {
                  uniqueReceivers.add(tx.receiveraccountNo);
                  uniqueList.push(tx.receiveraccountNo);
                  if (uniqueList.length >= 10) break; // limit to 10
              }
          }

          // 5. fetch names for receivers
          const recipientsWithDetails = await Promise.all(uniqueList.map(async (accNo) => {
               // try local
               let { data: recLocal } = await supabase
                   .from('Localaccounts')
                   .select('name')
                   .eq('accountNo', accNo)
                   .single();
               
               if (recLocal) return { accountNo: accNo, name: recLocal.name };

               // try foreign
               let { data: recForeign } = await supabase
                   .from('Foreignaccounts')
                   .select('name')
                   .eq('accountNo', accNo)
                   .single();
               
               if (recForeign) return { accountNo: accNo, name: recForeign.name };

               return { accountNo: accNo, name: `User ${accNo.slice(-4)}` };
          }));

          // 6. format for ui
          const uiData = recipientsWithDetails.map((item, index) => ({
              id: item.accountNo,
              name: item.name,
              initials: item.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
              color: index % 2 === 0 ? "#005eb8" : "#da291c" // alternating colors
          }));

          setRecipients(uiData);

      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  const handleActionPress = (action: any) => {
      if (action.route) {
          router.push(action.route);
      } else {
          // placeholder
          console.log(`Pressed ${action.name}`);
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.headerText}>Pay & Transfer</Text>
        <TouchableOpacity>
          <Icon name="search" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Transfers Card */}
        <View style={styles.mainActionsCard}>
          <Text style={styles.sectionTitle}>Transfers</Text>
          <View style={styles.actionGrid}>
            {actions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.actionItem}
                onPress={() => handleActionPress(action)}
              >
                <Icon name={action.icon} size={28} color="#da291c" />
                <Text style={styles.actionLabel}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Recipients */}
        <View style={styles.recipientsSection}>
          <Text style={[styles.sectionTitle, { marginLeft: 15 }]}>Recent Recipients</Text>
          {loading ? (
             <ActivityIndicator color="#da291c" />
          ) : recipients.length === 0 ? (
             <Text style={{ marginLeft: 15, color: '#888' }}>No recent transfers found.</Text>
          ) : (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.recipientList}
            >
                {recipients.map((item) => (
                <TouchableOpacity 
                     key={item.id} 
                     style={styles.recipientItem}
                     onPress={() => router.push({ pathname: '/paynowscreen', params: { accountNo: item.id, nickName: item.name }})}
                >
                    <View
                    style={[
                        styles.recipientIcon,
                        { backgroundColor: item.color },
                    ]}
                    >
                    <Text style={styles.recipientInitials}>{item.initials}</Text>
                    </View>
                    <Text style={styles.recipientName} numberOfLines={1}>
                    {item.name}
                    </Text>
                </TouchableOpacity>
                ))}
            </ScrollView>
          )}
        </View>

        {/* Promo Card */}
        <TouchableOpacity style={styles.promoCard}>
          <View style={styles.promoContent}>
            <Icon
              name="bolt"
              size={16}
              color="#da291c"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.promoText}>
              Set up recurring payments for utilities and bills.
            </Text>
          </View>
          <Icon name="chevron-right" size={14} color="#555" />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          // @ts-ignore
          onPress={() => router.push("/homepage")}
        >
          <Icon name="home" size={22} color="#888" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, styles.navItemActive]}
          
        >
          <Icon name="exchange-alt" size={22} color="#da291c" />
          <Text style={[styles.navText, styles.navTextActive]}>
            Pay & Transfer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          // @ts-ignore
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
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#da291c",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: { fontSize: 20, fontWeight: "700", color: "#fff" },
  scrollContent: { paddingBottom: 20 },
  mainActionsCard: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionItem: { width: "30%", alignItems: "center", marginBottom: 20 },
  actionLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
    color: "#333",
  },
  recipientsSection: { marginVertical: 10 },
  recipientList: { paddingLeft: 15 },
  recipientItem: { width: 75, alignItems: "center", marginRight: 10 },
  recipientIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  recipientInitials: { color: "#fff", fontWeight: "600", fontSize: 16 },
  recipientName: { fontSize: 12, color: "#333" },
  promoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
  },
  promoContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  promoText: { fontSize: 13, color: "#555" },
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
  navItemActive: {},
  navTextActive: {
    color: "#da291c",
  },
});

export default TransferScreen;
