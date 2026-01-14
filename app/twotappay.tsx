import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

// Default initial data matching the snippet
const INITIAL_BALANCE = 98.25;
const INITIAL_TRANSACTIONS = [
    { id: 1, name: 'CHICKEN RICE STALL', amount: -3.50, date: '10 November 2025' },
    { id: 2, name: 'UNIQLO', amount: -10.50, date: '9 November 2025' },
    { id: 3, name: 'NASI PADANG STALL', amount: -4.00, date: '9 November 2025' },
];

const ALLOWED_AMOUNTS = [5, 10, 20, 50, 100];

export default function TwoTapPay() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Use params for partial customization if a user is passed
  const linkedName = params.nickName as string || 'Two-Tap Transfer/Sum Ting';
  const accountNo = params.accountNo as string || 'Unknown Account';

  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  
  // Transfer interaction state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isTransferSuccessful, setIsTransferSuccessful] = useState(false);
  const [instruction, setInstruction] = useState("Tap to select amount.");

  const handleUnlink = async () => {
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

               // Need current user accountNo.
               // For simplicity, we can fetch it again or assume we can delete based on just email lookup logic which is complex here.
               // Better to fetch current user accountNo.
               const { data: localData } = await supabase.from('Localaccounts').select('accountNo').eq('emailAddress', session.user.email).maybeSingle();
               let myAccountNo = localData?.accountNo;
               
               if (!myAccountNo) {
                  const { data: foreignData } = await supabase.from('Foreignaccounts').select('accountNo').eq('emailAddress', session.user.email).maybeSingle();
                  myAccountNo = foreignData?.accountNo;
               }

               if (!myAccountNo) {
                   Alert.alert("Error", "Could not verify your account.");
                   return;
               }

               // Try deleting (if I am initiator)
               await supabase
                 .from('Linkedaccounts')
                 .delete()
                 .eq('accountNo', myAccountNo)
                 .eq('linkedWith', accountNo);

               await supabase
                 .from('Linkedaccounts')
                 .delete()
                 .eq('accountNo', accountNo)
                 .eq('linkedWith', myAccountNo);

               Alert.alert("Success", "Account unlinked.", [
                   { text: "OK", onPress: () => router.push('/linkaccounts') }
               ]);

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
        setInstruction("Tap again to transfer!");
    } else {
        // second tap on same amount -> confirm
        executeTransfer(amount);
    }
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

      {/* linked pay info */}
      <View className="items-center mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <Text className="text-gray-500 text-xs uppercase tracking-wide mb-1 font-bold">Paying to</Text>
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
        {ALLOWED_AMOUNTS.map((amt) => {
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
              key={amt}
              onPress={() => handleTransfer(amt)}
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
    </ScrollView>
  );
}
