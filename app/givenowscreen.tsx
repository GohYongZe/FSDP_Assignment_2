import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

const getAmountFromInput = (input: string): number => {
    if (!input) return 0;
    const val = parseInt(input, 10);
    return val / 100;
};

export default function GiveNowAmountScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  
  const recipientName = params.nickName as string || 'Unknown';
  const recipientAccountNo = params.accountNo as string || 'Unknown';

  const [inputString, setInputString] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [showBalance, setShowBalance] = useState(false);
  
  const [myAccountNo, setMyAccountNo] = useState<string | null>(null);
  const [myAccountName, setMyAccountName] = useState<string | null>(null);

  useEffect(() => {
    fetchMyAccountDetails();
  }, []);

  const fetchMyAccountDetails = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
            const email = session.user.email;
            
            let { data: accountData } = await supabase
                .from('Localaccounts')
                .select('accountNo, balance, name')
                .eq('emailAddress', email)
                .single();
            
            if (!accountData) {
                const { data: foreignData } = await supabase
                    .from('Foreignaccounts')
                    .select('accountNo, balance, name')
                    .eq('emailAddress', email)
                    .single();
                accountData = foreignData;
            }

            if (accountData) {
                setMyAccountNo(accountData.accountNo);
                setMyAccountName(accountData.name);
                setBalance(parseFloat(accountData.balance) || 0);
            }
        }
    } catch (err) {
        console.error("Error fetching account:", err);
    }
  };

  const handleKeyPress = (key: string) => {
      if (key === 'backspace') {
          setInputString(prev => prev.slice(0, -1));
      } else {
          if (inputString.length < 9) {
             setInputString(prev => prev + key);
          }
      }
  };

  const handleNext = () => {
      const amount = getAmountFromInput(inputString);
      if (amount <= 0) {
          Alert.alert("Invalid Amount", "Please enter an amount greater than 0.");
          return;
      }

      if (!myAccountNo) {
          Alert.alert("Error", "Could not verify your account details.");
          return;
      }

      router.push({
        pathname: "/givereview",
        params: {
          recipientName, // who we are requesting from
          recipientAccountNo,
          amount: amount.toString(),
          senderAccountNo: myAccountNo, // who is requesting (me)
          senderName: myAccountName || 'Account',
          balance: balance.toString()
        }
      });
  };

  const formattedAmount = getAmountFromInput(inputString).toFixed(2);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 flex-col">
        {/* Header */}
        <View className="flex-row items-center p-4">
            <TouchableOpacity 
                onPress={() => {
                    if (navigation.canGoBack()) navigation.goBack();
                    else router.back();
                }} 
                className="p-2"
            >
                <MaterialIcons name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold ml-4">Request Money</Text>
        </View>

        {/* Amount Display */}
        <View className="items-center justify-center py-10">
            <Text className="text-5xl font-bold text-gray-900">
                {formattedAmount}<Text className="text-2xl text-gray-500"> SGD</Text>
            </Text>
        </View>

        {/* Details Cards */}
        <View className="px-6 space-y-4">
             {/* Requesting From Card */}
             <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex-row items-center">
                 <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                     <Text className="text-red-600 font-bold text-lg">{recipientName.charAt(0).toUpperCase()}</Text>
                 </View>
                 <View className="flex-1">
                     <Text className="text-gray-500 text-xs font-bold uppercase">Requesting From</Text>
                     <Text className="text-base font-bold text-gray-800">{recipientName}</Text>
                     <Text className="text-xs text-gray-500">{recipientAccountNo}</Text>
                 </View>
             </View>

             {/* Requester (Me) Card */}
             <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex-row items-center">
                 <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                      <MaterialIcons name="account-balance-wallet" size={20} color="#2563eb" />
                 </View>
                 <View className="flex-1">
                     <Text className="text-gray-500 text-xs font-bold uppercase">Requester (You)</Text>
                     <Text className="text-base font-bold text-gray-800">{myAccountName || 'Loading...'}</Text>
                     <View className="flex-row items-center mt-1">
                        <Text className="text-xs text-gray-500 mr-2">{myAccountNo}</Text>
                        <TouchableOpacity 
                            onPress={() => setShowBalance(!showBalance)}
                            className="bg-gray-200 px-2 py-0.5 rounded"
                        >
                            <Text className="text-xs text-gray-700 font-medium">
                                {showBalance ? `SGD ${balance.toFixed(2)}` : 'Show Balance'}
                            </Text>
                        </TouchableOpacity>
                     </View>
                 </View>
             </View>
        </View>

        <View className="flex-1" />

        {/* Keypad */}
        <View className="pb-8">
            <View className="flex-row flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <TouchableOpacity 
                        key={num}
                        onPress={() => handleKeyPress(num.toString())}
                        className="w-1/3 h-20 items-center justify-center"
                    >
                        <Text className="text-3xl font-semibold text-gray-800">{num}</Text>
                    </TouchableOpacity>
                ))}
                
                <View className="w-1/3 h-20 items-center justify-center"></View>

                <TouchableOpacity 
                    onPress={() => handleKeyPress('0')}
                    className="w-1/3 h-20 items-center justify-center"
                >
                    <Text className="text-3xl font-semibold text-gray-800">0</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleKeyPress('backspace')}
                    className="w-1/3 h-20 items-center justify-center"
                >
                    <MaterialIcons name="backspace" size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <View className="px-6 mt-4">
                <TouchableOpacity 
                    onPress={handleNext}
                    disabled={getAmountFromInput(inputString) <= 0}
                    className={`nav-button py-4 rounded-xl items-center flex-row justify-center ${getAmountFromInput(inputString) <= 0 ? 'bg-gray-300' : 'bg-red-600'}`}
                >
                    <Text className="text-white font-bold text-lg">Next</Text>
                </TouchableOpacity>
            </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
