
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

const TransferScreen = ({ navigation }: { navigation: any }) => {
  const router = useRouter();
  const recipients = [
    { id: "1", name: "John L.", initials: "JL", color: "#005eb8" },
    { id: "2", name: "Mary Y.", initials: "MY", color: "#da291c" },
    { id: "3", name: "Alex B.", initials: "AB", color: "#005eb8" },
    { id: "4", name: "Chen S.", initials: "CS", color: "#888" },
    { id: "5", name: "Tan H.", initials: "TH", color: "#005eb8" },
    { id: "6", name: "Lim C.", initials: "LC", color: "#28a745" },
  ];

  const actions = [
    { name: "PayNow", icon: "mobile-alt" },
    { name: "Local Transfer", icon: "university" },
    { name: "Overseas Transfer", icon: "plane-departure" },
    { name: "Pay Bills", icon: "file-invoice-dollar" },
    { name: "Credit Card Payment", icon: "credit-card" },
    { name: "Request Funds", icon: "hand-holding-usd" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.headerText}>Pay & Transfer</Text>
        <TouchableOpacity>
          <Icon name="search" size={18} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Transfers Card */}
        <View style={styles.mainActionsCard}>
          <Text style={styles.sectionTitle}>Transfers</Text>
          <View style={styles.actionGrid}>
            {actions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionItem}>
                <Icon name={action.icon} size={28} color="#da291c" />
                <Text style={styles.actionLabel}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Recipients */}
        <View style={styles.recipientsSection}>
          <Text style={styles.sectionTitle}>Recent Recipients</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recipientList}
          >
            {recipients.map((item) => (
              <View key={item.id} style={styles.recipientItem}>
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
              </View>
            ))}
          </ScrollView>
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
          onPress={() => router.push("/homepage")}
        >
          <Icon name="home" size={20} color="#888" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/transferscreen")}
        >
          <Icon name="exchange-alt" size={20} color="#da291c" />
          <Text
            style={[styles.navText, { color: "#da291c", fontWeight: "600" }]}
          >
            Pay & Transfer
          </Text>
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
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: { fontSize: 22, fontWeight: "700", color: "#333" },
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
  },
  navItem: { flex: 1, alignItems: "center" },
  navText: { fontSize: 11, marginTop: 4, fontWeight: "500", color: "#888" },
});

export default TransferScreen;
