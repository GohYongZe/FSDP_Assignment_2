import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../lib/supabase';

// 
const INITIAL_BALANCE = 98.25;
const INITIAL_TRANSACTIONS = [
    { id: 1, name: 'CHICKEN RICE STALL', amount: -3.50, date: '10 November 2025' },
    { id: 2, name: 'UNIQLO', amount: -10.50, date: '9 November 2025' },
    { id: 3, name: 'NASI PADANG STALL', amount: -4.00, date: '9 November 2025' },
];

const DEFAULT_AMOUNTS = [5, 10, 20, 50, 100];

export default function TwoTapPay() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const linkedName = params.nickName as string || 'Two-Tap Transfer/Sum Ting';
  const accountNo = params.accountNo as string || 'Unknown Account';

  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [buttonAmounts, setButtonAmounts] = useState<number[]>(DEFAULT_AMOUNTS);
  
  // transfer interaction
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isTransferSuccessful, setIsTransferSuccessful] = useState(false);
  const [instruction, setInstruction] = useState("Tap to select amount.");

  // editing amt
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAmountInput, setEditAmountInput] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [myAccountNo, setMyAccountNo] = useState<string | null>(null);

  // request mode
  const [mode, setMode] = useState<'pay' | 'request'>('pay');
  const [showRequestQR, setShowRequestQR] = useState(false);

  useEffect(() => {
    // Check for pre-filled amount from params
    if (params.amount) {
        const amt = parseFloat(params.amount as string);
        if (!isNaN(amt)) {
            setSelectedAmount(amt);
            setInstruction("Tap again to pay requested amount!");
        }
    }
  }, [params.amount]);

  useEffect(() => {
    // get current user
    // load custom amount preference
    const loadPreference = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const email = session.user.email;
        setCurrentUserEmail(email);

        // fetch my account number
        try {
            let { data: accountData } = await supabase
                .from('Localaccounts')
                .select('accountNo')
                .eq('emailAddress', email)
                .single();
            
            if (!accountData) {
                const { data: foreignData } = await supabase
                    .from('Foreignaccounts')
                    .select('accountNo')
                    .eq('emailAddress', email)
                    .single();
                accountData = foreignData;
            }

            if (accountData) {
                setMyAccountNo(accountData.accountNo);
            }
        } catch (err) {
            console.error("Error fetching my account:", err);
        }

        const storageKey = `custom_buttons_${email}_${accountNo}`;
        try {
          const stored = await AsyncStorage.getItem(storageKey);
          if (stored) {
            setButtonAmounts(JSON.parse(stored));
          }
        } catch (e) {
          console.error("Failed to load custom buttons", e);
        }
      }
    };
    loadPreference();
  }, [accountNo]);

  const handleLongPressButton = (index: number, amount: number) => {
    if (isTransferSuccessful) return;
    setEditingIndex(index);
    setEditAmountInput(amount.toString());
    setShowEditModal(true);
  };

  const saveEditedAmount = async () => {
      const amt = parseFloat(editAmountInput);
      if (isNaN(amt) || amt <= 0) {
          Alert.alert("Invalid Amount", "Please enter a valid amount");
          return;
      }

      const newAmounts = [...buttonAmounts];
      if (editingIndex !== null) {
          newAmounts[editingIndex] = amt;
          setButtonAmounts(newAmounts);
      }

      setShowEditModal(false);
      resetTransferState();

      //  to storage
      if (currentUserEmail) {
          const storageKey = `custom_buttons_${currentUserEmail}_${accountNo}`;
          try {
              await AsyncStorage.setItem(storageKey, JSON.stringify(newAmounts));
          } catch (e) {
              console.error("Failed to save custom buttons", e);
          }
      }
      
      // auto-select it for convenience
      setSelectedAmount(amt);
      setInstruction("Tap again to transfer!");
  };

  const handleUnlink = async () => {
    if (!accountNo || accountNo === 'Unknown Account') {
        Alert.alert("Error", "Invalid account information.");
        return;
    }

    Alert.alert(
      "Unlink Account",
      "Are you sure you want to remove this linked account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Unlink", 
          style: "destructive", 
          onPress: async () => {
            try {
               const { data: { session } } = await supabase.auth.getSession();
               if (!session || !session.user || !session.user.email) {
                 Alert.alert("Error", "User not logged in.");
                 return;
               }

               let currentAccountNo = myAccountNo;
               if (!currentAccountNo) {
                   const { data: localData } = await supabase.from('Localaccounts').select('accountNo').eq('emailAddress', session.user.email).maybeSingle();
                   currentAccountNo = localData?.accountNo;
                   
                   if (!currentAccountNo) {
                      const { data: foreignData } = await supabase.from('Foreignaccounts').select('accountNo').eq('emailAddress', session.user.email).maybeSingle();
                      currentAccountNo = foreignData?.accountNo;
                   }
               }

               if (!currentAccountNo) {
                   Alert.alert("Error", "Could not verify your account.");
                   return;
               }

               const res1 = await supabase
                 .from('Linkedaccounts')
                 .delete({ count: 'exact' })
                 .eq('accountNo', currentAccountNo)
                 .eq('linkedWith', accountNo);

               const res2 = await supabase
                 .from('Linkedaccounts')
                 .delete({ count: 'exact' })
                 .eq('accountNo', accountNo)
                 .eq('linkedWith', currentAccountNo);

               if (res1.error || res2.error) {
                   console.error("Unlink error:", res1.error, res2.error);
                   Alert.alert("Error", "Failed to unlink account. Please check your connection.");
               } else {
                   Alert.alert("Success", "Account unlinked.", [
                       { text: "OK", onPress: () => router.push('/linkaccounts') }
                   ]);
               }

            } catch (e) {
              console.error(e);
            }
          } 
        }
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `SGD ${amount.toFixed(2)}`;
  };

  const resetTransferState = (msg = "Tap to select amount.") => {
    setIsTransferSuccessful(false);
    setSelectedAmount(null);
    setInstruction(msg);
  };

  const handleTransfer = (amount: number) => {
    if (isTransferSuccessful) {
        return; // to ignore clicks during 'success'
    }

    if (selectedAmount !== amount) {
        // first tap
        resetTransferState();
        setSelectedAmount(amount);
        setInstruction(mode === 'pay' ? "Tap again to transfer!" : "Tap again to request!");
    } else {
        // second tap on same amount -> confirm
        if (mode === 'pay') {
            executeTransfer(amount);
        } else {
            handleRequest(amount);
        }
    }
  };

  const handleRequest = (amount: number) => {
      setSelectedAmount(amount);
      if (!myAccountNo) {
          Alert.alert("Error", "Your account information is missing. Cannot generate request.");
          return;
      }
      setShowRequestQR(true);
      // Do not reset state yet, so the modal can read 'selectedAmount'
  };

  const executeTransfer = (amount: number) => {
    setIsTransferSuccessful(true);
    
    // Update balance
    const newBalance = balance + amount;
    setBalance(newBalance);

    // Create transaction
    const newTransaction = {
        id: Date.now(), 
        name: linkedName, 
        amount: amount,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setInstruction(`Transferred SGD ${amount}!`);

    // reset after delay when clicking
    setTimeout(() => {
        resetTransferState();
    }, 1500);
  };

  const handleModeChange = (newMode: 'pay' | 'request') => {
      setMode(newMode);
      if (newMode === 'request') {
          resetTransferState("Tap to select request amount.");
      } else {
          resetTransferState();
      }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="flex-row items-center mb-6 mt-2 justify-between">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Two-Tap Pay</Text>
        </View>
        <TouchableOpacity onPress={handleUnlink} className="p-2 bg-red-50 rounded-lg">
           <Text className="text-red-600 font-semibold text-xs">Unlink</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Switcher */}
      <View className="flex-row bg-gray-100 p-1 rounded-lg mb-6 h-12">
        <TouchableOpacity 
            onPress={() => handleModeChange('pay')}
            className={`flex-1 items-center justify-center rounded-md ${mode === 'pay' ? 'bg-white shadow-sm' : ''}`}
        >
            <Text className={`font-semibold ${mode === 'pay' ? 'text-blue-600' : 'text-gray-500'}`}>Pay Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            onPress={() => handleModeChange('request')}
            className={`flex-1 items-center justify-center rounded-md ${mode === 'request' ? 'bg-white shadow-sm' : ''}`}
        >
            <Text className={`font-semibold ${mode === 'request' ? 'text-blue-600' : 'text-gray-500'}`}>Request Mode</Text>
        </TouchableOpacity>
      </View>

      {/* linked pay info */}
      <View className={`items-center mb-6 p-4 rounded-xl border ${mode === 'pay' ? 'bg-blue-50 border-blue-100' : 'bg-green-50 border-green-100'}`}>
        <Text className="text-gray-500 text-xs uppercase tracking-wide mb-1 font-bold">
            {mode === 'pay' ? 'Paying to' : 'Requesting from'}
        </Text>
        <Text className="text-xl font-bold text-gray-800">{linkedName}</Text>
        <Text className="text-gray-500 text-base font-medium">{accountNo}</Text>
      </View>

      {/* Balance */}
      <View className="items-center mb-8">
        <Text className="text-gray-500 text-lg mb-1">Current Balance</Text>
        <Text className="text-4xl font-bold text-gray-900">{formatCurrency(balance)}</Text>
      </View>

      {/* Instruction */}
      <Text className="text-center text-lg text-blue-600 font-medium mb-4 min-h-[28px]">
        {instruction}
      </Text>

      {/* Transfer Buttons */}
      <View className="flex-row flex-wrap justify-center gap-4 mb-8">
        {buttonAmounts.map((amt, index) => {
          const isSelected = selectedAmount === amt;
          const isSuccess = isSelected && isTransferSuccessful;
          
          let bgClass = 'bg-white border-blue-500';
          let textClass = 'text-blue-500';

          if (isSuccess) {
            bgClass = 'bg-green-500 border-green-500';
            textClass = 'text-white';
          } else if (isSelected) {
            bgClass = 'bg-blue-500 border-blue-500';
            textClass = 'text-white';
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleTransfer(amt)}
              onLongPress={() => handleLongPressButton(index, amt)}
              delayLongPress={500}
              className={`w-24 h-24 rounded-full border-2 justify-center items-center shadow-sm ${bgClass}`}
            >
              <Text className={`text-xl font-bold ${textClass}`}>${amt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Transactions List */}
      <View className="mb-8">
        <Text className="text-xl font-bold text-gray-800 mb-4 ml-2">Recent Transactions</Text>
        {transactions.map((tx) => {
            const isCredit = tx.amount > 0;
            const amountText = isCredit ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2);
            const amountColor = isCredit ? 'text-green-600' : 'text-gray-800';

            return (
                <View key={tx.id} className="flex-row justify-between items-center bg-gray-50 p-4 rounded-lg mb-2">
                    <View>
                        <Text className="text-base font-semibold text-gray-800">{tx.name}</Text>
                        <Text className="text-sm text-gray-500">{tx.date}</Text>
                    </View>
                    <Text className={`text-base font-bold ${amountColor}`}>{amountText}</Text>
                </View>
            );
        })}
      </View>

      {/* Custom Amount Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end">
            <TouchableWithoutFeedback onPress={() => setShowEditModal(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="items-center mb-4">
                            <View className="w-12 h-1 bg-gray-300 rounded-full mb-4" />
                            <Text className="text-xl font-bold text-gray-800">
                                Edit Amount
                            </Text>
                            <Text className="text-gray-500 text-sm mb-2 text-center">
                                Change the preset amount for this merchant.
                            </Text>
                        </View>
                        <TextInput
                            className="text-4xl font-bold text-center text-gray-800 border-b-2 border-gray-200 py-4 mb-6"
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            value={editAmountInput}
                            onChangeText={setEditAmountInput}
                            autoFocus={true}
                        />
                        <TouchableOpacity 
                            onPress={saveEditedAmount}
                            className="bg-blue-600 py-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">Save Amount</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setShowEditModal(false)}
                            className="mt-4 py-2 items-center"
                        >
                            <Text className="text-gray-500 font-semibold">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Request QR Modal */}
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={showRequestQR}
        onRequestClose={() => {
            setShowRequestQR(false);
            resetTransferState();
        }}
      >
        <View className="flex-1 items-center justify-center bg-white p-8">
            <Text className="text-2xl font-bold mb-2">Requesting SGD {selectedAmount?.toFixed(2)}</Text>
            <Text className="text-gray-500 mb-8">Show this QR code to {linkedName}</Text>
            
            <View className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 items-center justify-center">
                {selectedAmount && myAccountNo && (
                    <QRCode
                       value={JSON.stringify({ 
                           type: 'request', 
                           accountNo: myAccountNo, 
                           amount: selectedAmount 
                       })}
                       size={250}
                    />
                )}
            </View>

            <TouchableOpacity 
                onPress={() => {
                    setShowRequestQR(false);
                    resetTransferState();
                }}
                className="mt-12 bg-gray-100 px-8 py-3 rounded-full"
            >
                <Text className="font-semibold text-gray-700">Close</Text>
            </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}
