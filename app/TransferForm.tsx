import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
// 1. import expo router hooks
import { useLocalSearchParams, useRouter } from 'expo-router';

const TransferForm = () => {
  // 2. get params
  const { type } = useLocalSearchParams(); 
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* 3. navigation back */}
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="chevron-left" size={20} color="#005eb8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{type || 'Local'} Transfer</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Transfer Details</Text>
          
          <Text style={styles.label}>From Account</Text>
          <View style={styles.inputBox}>
            <Text style={styles.accountText}>OCBC FRANK Account (S$1,234.56)</Text>
          </View>

          {type === 'PayNow' ? (
            <>
              <Text style={styles.label}>Recipient&apos;s PayNow ID</Text>
              <TextInput style={styles.input} placeholder="Mobile/NRIC/UEN" />
            </>
          ) : (
            <>
              <Text style={styles.label}>Recipient Account Number</Text>
              <TextInput style={styles.input} placeholder="e.g. 123-456-789" />
            </>
          )}

          <Text style={styles.label}>Amount (SGD)</Text>
          <TextInput style={styles.input} keyboardType="numeric" placeholder="0.00" />

          <TouchableOpacity style={styles.submitBtn}>
            <Text style={styles.submitText}>Review Transfer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: '#fff',
    alignItems: 'center' 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  formCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  formTitle: { color: '#da291c', fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 13, color: '#666', marginBottom: 5, marginTop: 15 },
  input: { borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 8, fontSize: 16 },
  inputBox: { borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 8 },
  accountText: { fontSize: 14, color: '#333' },
  submitBtn: { backgroundColor: '#da291c', padding: 15, borderRadius: 8, marginTop: 30, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default TransferForm;