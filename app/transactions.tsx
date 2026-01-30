import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  senderaccountNo: string;
  receiveraccountNo: string;
  amount: number;
  message: string;
  created_at: string;
}

export default function TransactionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const accountNo = params.accountNo as string;
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();

    // Real-time subscription
    const channel = supabase.channel('transactions_screen')
        .on(
            'postgres_changes',
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'TransactionsHistory',
                filter: `receiveraccountNo=eq.${accountNo}`
            },
            () => { console.log("New incoming tx (Transactions Screen)"); fetchTransactions(); }
        )
        .on(
            'postgres_changes',
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'TransactionsHistory',
                filter: `senderaccountNo=eq.${accountNo}`
            },
            () => { console.log("New outgoing tx (Transactions Screen)"); fetchTransactions(); }
        )
        .subscribe();
    
    return () => {
        supabase.removeChannel(channel);
    };

  }, [accountNo]);

  const fetchTransactions = async () => {
    if (!accountNo) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('TransactionsHistory')
        .select('*')
        .or(`senderaccountNo.eq.${accountNo},receiveraccountNo.eq.${accountNo}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        setTransactions(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });


  // Filter Transactions by Selected Month
  const filteredTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.created_at);
      return txDate.getMonth() === selectedMonth.getMonth() && 
             txDate.getFullYear() === selectedMonth.getFullYear();
  });

  const changeMonth = (direction: 'prev' | 'next') => {
      const newDate = new Date(selectedMonth);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      setSelectedMonth(newDate);
  };

  const renderTransactionItem = (tx: Transaction) => {
      const isReceived = tx.receiveraccountNo === accountNo;
      const amount = parseFloat(tx.amount.toString());
      
      return (
        <View key={tx.id} className="bg-white p-4 rounded-lg border border-gray-100 mb-3 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">{formatDate(tx.created_at)}</Text>
              <Text className="text-sm font-bold text-gray-800 mb-1">
                {isReceived ? "RECEIVED" : "SENT"}
              </Text>
              <Text className="text-sm text-gray-600">
                {tx.message || (isReceived ? `From ${tx.senderaccountNo}` : `To ${tx.receiveraccountNo}`)}
              </Text>
            </View>
            <Text className={`text-base font-semibold ${isReceived ? 'text-green-600' : 'text-black'}`}>
              {isReceived ? '+' : '-'}{Math.abs(amount).toFixed(2)}
            </Text>
          </View>
        </View>
      );
  };

  const currentMonthLabel = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Previous Month Label
  const prevMonthDate = new Date(selectedMonth);
  prevMonthDate.setDate(1);
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonthLabel = prevMonthDate.toLocaleString('default', { month: 'short' });

   // Next Month Label
  const nextMonthDate = new Date(selectedMonth);
  nextMonthDate.setDate(1);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const nextMonthLabel = nextMonthDate.toLocaleString('default', { month: 'short' });

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-100 mt-8">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Transaction History</Text>
      </View>

      {/* Month Selector */}
      <View className="flex-row justify-between items-center bg-gray-50 px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={() => changeMonth('prev')} className="p-2 flex-row items-center">
              <MaterialIcons name="chevron-left" size={24} color="#374151" />
              <Text className="text-gray-400 text-xs ml-1">{prevMonthLabel}</Text>
          </TouchableOpacity>
          
          <Text className="text-lg font-bold text-gray-800 w-32 text-center">
              {currentMonthLabel}
          </Text>

          <TouchableOpacity onPress={() => changeMonth('next')} className="p-2 flex-row items-center">
              <Text className="text-gray-400 text-xs mr-1">{nextMonthLabel}</Text>
              <MaterialIcons name="chevron-right" size={24} color="#374151" />
          </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#da291c" />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          {filteredTransactions.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-gray-500">No transactions in {currentMonthLabel}.</Text>
            </View>
          ) : (
             <View className="mb-6">
                {/* <Text className="text-lg font-bold text-gray-800 mb-3 ml-1">{currentMonthLabel}</Text> */}
                {filteredTransactions.map(renderTransactionItem)}
             </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
