import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

interface UserAccount {
  id: string;
  emailAddress: string;
  accountNo: string;
  name?: string;
}

export default function LinkToAccount() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [accountNumber, setAccountNumber] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.accountNo) setAccountNumber(params.accountNo as string);
    if (params.name) setNickname(params.name as string);
  }, [params]);
  
  // Camera State
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleScan = () => {
      if (!permission) {
          requestPermission();
          return;
      }
      if (!permission.granted) {
          Alert.alert("Permission Required", "Camera permission is needed to scan QR codes.", [
              { text: "Cancel", style: "cancel" },
              { text: "Grant", onPress: requestPermission }
          ]);
          return;
      }
      setScanned(false);
      setShowScanner(true);
  };

  const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
      setScanned(true);
      setShowScanner(false);
      try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.accountNo) {
            setAccountNumber(parsed.accountNo);
            if (parsed.name) {
                setNickname(parsed.name);
            }
            Alert.alert("Scanned!", `Account ${parsed.accountNo} found.`);
          } else {
              Alert.alert("Invalid QR", "This QR code does not contain account info.");
          }
      } catch (e) {
          Alert.alert("Error", "Could not parse QR code data.");
      }
  };

  const fetchCurrentUser = async (): Promise<UserAccount | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("User not logged in.");
        return null;
      }
      const user = session.user;
      if (!user.email) return null;

      // localaccounts
      let { data: accountData } = await supabase
        .from('Localaccounts')
        .select('*')
        .eq('emailAddress', user.email)
        .single();

      if (!accountData) {
        // foreignaccounts
        let { data: foreignData } = await supabase
          .from('Foreignaccounts')
          .select('*')
          .eq('emailAddress', user.email)
          .single();
        accountData = foreignData;
      }

      return accountData;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleLinkAccount = async () => {
    if (!accountNumber.trim() || !nickname.trim()) {
      Alert.alert('Error', 'Please fill in both account number and nickname.');
      return;
    }

    setLoading(true);
    try {
      const currentUser = await fetchCurrentUser();

      if (!currentUser || !currentUser.accountNo) {
        Alert.alert('Error', 'User not logged in or account number not available.');
        setLoading(false);
        return;
      }

      if (currentUser.accountNo === accountNumber) {
        Alert.alert('Error', 'You cannot link your own account.');
        setLoading(false);
        return;
      }

      const newLink = {
        accountNo: currentUser.accountNo,
        linkedWith: accountNumber,
        nickName: nickname,
        requestStatus: 'Pending'
      };

      const { error } = await supabase
        .from('Linkedaccounts')
        .insert([newLink]);

      if (error) {
        console.error('Error linking account:', error);
        Alert.alert('Error', `Failed to link account: ${error.message}`);
      } else {
        Alert.alert(
          'Success', 
          'Account link request sent successfully!', 
          [{ text: 'OK', onPress: () => router.back() }] // back to the previous screen
        );
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="flex-row items-center mb-6 mt-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Link a New Account</Text>
      </View>

      <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <Text className="text-gray-600 mb-6 font-medium">
          Enter the details of the account you want to link. The owner will need to approve your request.
        </Text>

        <View className="mb-4">
          <Text className="block text-sm font-medium text-gray-700 mb-1">Account Number</Text>
          <View className="flex-row gap-2">
            <TextInput
              className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800"
              placeholder="e.g. 1234567890"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              autoCapitalize="none"
            />
            <TouchableOpacity 
                onPress={handleScan}
                className="bg-gray-800 w-12 rounded-lg items-center justify-center active:bg-gray-700"
            >
                <MaterialIcons name="qr-code-scanner" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-6">
          <Text className="block text-sm font-medium text-gray-700 mb-1">Nickname</Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800"
            placeholder="e.g. Mom, John"
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="words"
          />
        </View>

        <TouchableOpacity
          onPress={handleLinkAccount}
          disabled={loading}
          className={`w-full py-3 rounded-lg flex-row justify-center items-center ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
        >
          {loading ? (
             <ActivityIndicator color="white" className="mr-2" />
          ) : null}
          <Text className="text-white font-bold text-lg">
            {loading ? 'Sending Request...' : 'Send Link Request'}
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
                 <Text className="text-white text-lg font-bold bg-black/50 p-2 rounded-lg">Scan Account QR</Text>
            </View>
            <TouchableOpacity 
                onPress={() => setShowScanner(false)}
                className="absolute top-4 right-4 bg-white/20 p-2 rounded-full"
            >
                <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}
