import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function PaymentReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const recipientName = params.recipientName as string;
  const recipientAccountNo = params.recipientAccountNo as string;
  const amountStr = params.amount as string;
  const senderAccountNo = params.senderAccountNo as string;
  const senderName = params.senderName as string; 

  const amount = parseFloat(amountStr);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('transfer_funds', {
          sender_account_no: senderAccountNo,     
          receiver_account_no: recipientAccountNo, 
          amount: amount,
          description: `PayNow to ${recipientName}`
      });

      if (error) throw error;
      if (data && data.error) throw new Error(data.error);

      // success
      const transactionId = data?.transaction_id || Date.now().toString();

      router.push({
          pathname: '/paymentsuccess',
          params: {
              amount: amount.toFixed(2),
              recipientName,
              recipientAccountNo,
              transactionId,
              date: new Date().toISOString()
          }
      });

    } catch (error: any) {
        Alert.alert("Transfer Failed", error.message || "An unknown error occurred.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* header */}
        <View className="flex-row items-center p-4">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
                <MaterialIcons name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold ml-4">Review Transfer</Text>
        </View>
        
        <View className="items-center py-8">
            <Text className="text-gray-500 text-lg">Amount to pay</Text>
            <Text className="text-4xl font-bold mt-2">SGD {amount.toFixed(2)}</Text>
        </View>

        <View className="px-6 space-y-4">
             {/* to card */}
             <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex-row items-center">
                 <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                     <Text className="text-red-600 font-bold text-lg">{recipientName?.charAt(0).toUpperCase()}</Text>
                 </View>
                 <View className="flex-1">
                     <Text className="text-gray-500 text-xs font-bold uppercase">To</Text>
                     <Text className="text-base font-bold text-gray-800">{recipientName}</Text>
                     <Text className="text-xs text-gray-500">{recipientAccountNo}</Text>
                 </View>
             </View>

             {/* from card */}
             <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex-row items-center">
                 <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                      <MaterialIcons name="account-balance-wallet" size={20} color="#2563eb" />
                 </View>
                 <View className="flex-1">
                     <Text className="text-gray-500 text-xs font-bold uppercase">From</Text>
                     <Text className="text-base font-bold text-gray-800">{senderName}</Text>
                     <Text className="text-xs text-gray-500">{senderAccountNo}</Text>
                 </View>
             </View>
        </View>

        <View className="flex-1" />

        <View className="p-6">
            <TouchableOpacity 
                onPress={handleConfirm}
                disabled={loading}
                className="bg-red-600 py-4 rounded-xl items-center"
            >
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Confirm Transfer</Text>}
            </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
