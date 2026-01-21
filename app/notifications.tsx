import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
// Note: Ensure you have 'react-native-vector-icons' installed
import Icon from 'react-native-vector-icons/FontAwesome5';

const NotificationsScreen = ({ navigation }: { navigation: any }) => {
  // Mock Notification Data based on your HTML source
  const [notifications, setNotifications] = useState([
    { id: '1', title: "Transaction Alert", content: "S$150.00 transferred successfully to Alex B.", icon: "exchange-alt", time: "5 mins ago", read: false },
    { id: '2', title: "Card Status Update", content: "Your new OCBC Credit Card has been approved and shipped.", icon: "credit-card", time: "1 hour ago", read: false },
    { id: '3', title: "Promotional Offer", content: "Earn 5% cashback on groceries this weekend!", icon: "gift", time: "Yesterday", read: true },
    { id: '4', title: "System Message", content: "Scheduled maintenance tonight at 11 PM. Services may be briefly impacted.", icon: "wrench", time: "2 days ago", read: true },
    { id: '5', title: "Statement Ready", content: "Your monthly e-Statement for October is now available.", icon: "file-pdf", time: "1 week ago", read: true },
  ]);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const handleNotificationClick = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
  };

  const hasUnread = notifications.some(n => !n.read);

  const renderItem = ({ item }: { item: { id: string; title: string; content: string; icon: string; time: string; read: boolean } }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unreadItem]} 
      onPress={() => handleNotificationClick(item.id)}
      activeOpacity={0.7}
    >
      <Icon 
        name={item.icon} 
        size={20} 
        color={item.read ? '#888' : '#da291c'} 
        style={styles.notificationIcon} 
      />
      {/* FIXED: Changed <div> to <View> for mobile compatibility */}
      <View style={styles.notificationContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.headerText}>Notifications</Text>
        {hasUnread && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.actionLink}>Mark All As Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List or Empty State */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listPadding}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="check-circle" size={40} color="#ccc" />
          <Text style={styles.emptyText}>You&apos;re all caught up! No new notifications.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  actionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#005eb8',
  },
  listPadding: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  unreadItem: {
    backgroundColor: '#fff5f5', // Light red for unread
    borderLeftWidth: 5,
    borderLeftColor: '#da291c', // OCBC Red highlight
    paddingLeft: 15,
  },
  notificationIcon: {
    marginRight: 15,
    marginTop: 4,
    width: 25,
    textAlign: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default NotificationsScreen;