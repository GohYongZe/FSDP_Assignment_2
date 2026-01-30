import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const amount = params.amount as string;
  const recipientName = params.recipientName as string;
  const recipientAccountNo = params.recipientAccountNo as string;
  const dateStr = params.date as string || new Date().toISOString();
  
  const date = new Date(dateStr);
  const formattedDate = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-6 items-center">
          
          {/* close button */}
          <View className="w-full flex-row justify-end mb-4">
            <TouchableOpacity onPress={() => router.push('/homepage')}>
              <MaterialIcons name="close" size={30} color="#000" />
            </TouchableOpacity>
          </View>

          {/* success icon */}
          <View className="mb-6">
             <View className="bg-green-100 p-4 rounded-full">
                <MaterialIcons name="check" size={60} color="#16a34a" />
             </View>
          </View>

          <Text className="text-3xl font-bold text-gray-900 mb-8">{amount} SGD paid</Text>

          <View className="w-full space-y-6">
              <View>
                  <Text className="text-gray-500 text-sm font-bold uppercase mb-1">To</Text>
                  <Text className="text-xl font-bold text-gray-900">{recipientName}</Text>
                  <Text className="text-gray-500">{recipientAccountNo}</Text>
              </View>

              <View>
                  <Text className="text-gray-500 text-sm font-bold uppercase mb-1">When</Text>
                  <Text className="text-lg font-bold text-gray-900">{formattedDate}</Text>
              </View>
              
              <TouchableOpacity>
                <Text className="text-blue-600 font-medium">See transaction details</Text>
              </TouchableOpacity>
          </View>

          <View className="flex-1" />

          <View className="w-full pb-8">
              <TouchableOpacity 
                onPress={() => router.push('/paynow')} 
                className="bg-slate-800 py-4 rounded-lg items-center mb-4"
              >
                  <Text className="text-white font-bold text-lg">Go to Transfers</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push('/homepage')} 
                className="bg-white border border-gray-300 py-4 rounded-lg items-center"
              >
                  <Text className="text-gray-700 font-bold text-lg">Back to Home</Text>
              </TouchableOpacity>
          </View>

      </View>
    </SafeAreaView>
  );
}
