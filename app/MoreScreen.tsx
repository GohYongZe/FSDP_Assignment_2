import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const MoreScreen = () => {
  const MenuSection = ({ title, items, hasViewMore = true }) => (
    <View style={styles.menuSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {hasViewMore && <TouchableOpacity><Text style={styles.viewMore}>View More</Text></TouchableOpacity>}
      </View>
      <View style={styles.iconGrid}>
        {items.map((item, index) => (
          <TouchableOpacity key={index} style={styles.gridItem}>
            <View style={styles.iconWrapper}>
              <Icon name={item.icon} size={24} color="#333" />
            </View>
            <Text style={styles.gridLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        <Text style={styles.headerText}>More</Text>
        <TouchableOpacity><Text style={styles.logoutLink}>Logout</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MenuSection title="Apply" items={[
          { label: 'Accounts', icon: 'user-friends' },
          { label: 'Cards', icon: 'credit-card' },
        ]} />

        <MenuSection title="Services" items={[
          { label: 'Report lost card', icon: 'clipboard-list' },
          { label: 'Reset card PIN', icon: 'sync-alt' },
          { label: 'Lock/Unlock card', icon: 'lock' },
          { label: 'Replace card', icon: 'undo' },
        ]} />

        <MenuSection title="Settings" items={[
          { label: 'Personal Details', icon: 'user-circle' },
          { label: 'Password', icon: 'lock' },
          { label: 'Linked Accounts', icon: 'link' },
          { label: 'Eye Tracker', icon: 'eye' },
        ]} />

        <MenuSection title="Help & Support" hasViewMore={false} items={[
          { label: 'Contact Bank', icon: 'address-book' },
          { label: 'FAQs', icon: 'question-circle' },
          { label: 'Tutorials', icon: 'book-open' },
        ]} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: { fontSize: 24, fontWeight: '700', color: '#333' },
  logoutLink: { fontSize: 15, color: '#005eb8', fontWeight: '600' },
  scrollContent: { paddingBottom: 30 },
  menuSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  viewMore: { fontSize: 13, color: '#005eb8', fontWeight: '500' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '33.33%', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
  iconWrapper: {
    width: 55,
    height: 55,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  gridLabel: { fontSize: 11, color: '#555', textAlign: 'center', lineHeight: 14 },
});

export default MoreScreen;