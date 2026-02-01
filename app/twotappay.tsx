import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { supabase } from '../lib/supabase';

// initial constants
const INITIAL_BALANCE = 0; // will be fetched
const DEFAULT_AMOUNTS = [5, 10, 20, 50, 100];

export default function TwoTapPay() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  
  const linkedName = params.nickName as string || 'Two-Tap Transfer/Sum Ting';
  const accountNo = params.accountNo as string || 'Unknown Account';

  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [linkedBalance, setLinkedBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<{ id: number; name: string; amount: number; date: string }[]>([]);
  const [buttonAmounts, setButtonAmounts] = useState<number[]>(DEFAULT_AMOUNTS);
  
  // transfer interaction
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isTransferSuccessful, setIsTransferSuccessful] = useState(false);
  const [instruction, setInstruction] = useState("Tap to select amount.");

  // editing amount
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAmountInput, setEditAmountInput] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [myAccountNo, setMyAccountNo] = useState<string | null>(null);
  const [myAccountName, setMyAccountName] = useState<string | null>(null);

  // request mode
  // const [mode, setMode] = useState<'pay' | 'request'>('pay'); // removed mode toggle
  const [isRequestProcessing, setIsRequestProcessing] = useState(false);
  // const [showRequestQR, setShowRequestQR] = useState(false);

  useEffect(() => {
    // check params
    if (params.amount) {
        const amt = parseFloat(params.amount as string);
        if (!isNaN(amt)) {
            setSelectedAmount(amt);
            setInstruction("Tap again to pay requested amount!");
        }
    }
  }, [params.amount]);

  useEffect(() => {
    // fetch transactions
    const fetchTransactions = async () => {
        if (!accountNo || accountNo === 'Unknown Account') return;

        const { data, error } = await supabase
            .from('TransactionsHistory')
            .select('*')
            .or(`senderaccountNo.eq.${accountNo},receiveraccountNo.eq.${accountNo}`)
            .order('created_at', { ascending: false })
            .limit(5);

        if (!error && data) {
             const formatted = data.map((tx: any) => { 
                const isIncomingToThem = tx.receiveraccountNo === accountNo;
                // Positive if they received (from Me), Negative if they sent (to Me)
                const sign = isIncomingToThem ? 1 : -1;
                const amt = parseFloat(tx.amount) * sign;
                
                // Determine display name (Sender)
                let senderDisplay = tx.senderaccountNo;
                if (tx.senderaccountNo === accountNo) {
                    senderDisplay = linkedName;
                } else if (myAccountNo && tx.senderaccountNo === myAccountNo) {
                    senderDisplay = `You (${myAccountName || 'Me'})`;
                }

                return {
                    id: tx.id,
                    name:  `From: ${senderDisplay}`, 
                    amount: amt,
                    date: new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                };
            });
            setTransactions(formatted);
        }
    };

    fetchTransactions();

    // realtime subscription
    const channel = supabase.channel('twotap_transactions')
        .on(
            'postgres_changes',
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'TransactionsHistory',
                filter: `receiveraccountNo=eq.${accountNo}`
            },
            () => { console.log("New incoming tx"); fetchTransactions(); }
        )
        .on(
            'postgres_changes',
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'TransactionsHistory',
                filter: `senderaccountNo=eq.${accountNo}`
            },
            () => { console.log("New outgoing tx"); fetchTransactions(); }
        )
        .subscribe();
    
    return () => {
        supabase.removeChannel(channel);
    };

  }, [accountNo, myAccountNo, myAccountName]); // re-run on identifiers

  useEffect(() => {
    // get current user
    // load preference
    const loadPreference = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const email = session.user.email;
        setCurrentUserEmail(email);

        // fetch my account
        try {
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
                let fetchedBalance = parseFloat(accountData.balance);
                // default 0 if invalid
                if (isNaN(fetchedBalance)) {
                    fetchedBalance = 0;
                }
                setBalance(fetchedBalance);
            }
        } catch (err) {
            console.error("Error fetching my account:", err);
        }

        // fetch linked account
        if (accountNo && accountNo !== 'Unknown Account') {
            try {
                let { data: linkedData } = await supabase
                    .from('Localaccounts')
                    .select('balance')
                    .eq('accountNo', accountNo)
                    .single();
                
                if (!linkedData) {
                    const { data: foreignData } = await supabase
                        .from('Foreignaccounts')
                        .select('balance')
                        .eq('accountNo', accountNo)
                        .single();
                    linkedData = foreignData;
                }
                
                if (linkedData) {
                    let linkedBal = parseFloat(linkedData.balance);
                    if (isNaN(linkedBal)) {
                        linkedBal = 0;
                    }
                    setLinkedBalance(linkedBal);
                }
            } catch (err) {
                console.error("Error fetching linked account:", err);
            }
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
                       { text: "OK", onPress: () => router.navigate('/linkaccounts') }
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
        // Just select it
        resetTransferState();
        setSelectedAmount(amount);
        setInstruction("Choose an action below:");
    } else {
       // Toggle off
       setSelectedAmount(null);
       setInstruction("Tap to select amount.");
    }
  };

  const handleRequest = async (amount: number) => {
    if (!myAccountNo) {
        Alert.alert("Error", "Your account information is missing.");
        return;
    }

    setInstruction("Sending request...");
    setIsRequestProcessing(true);

    try {
        const { error } = await supabase
            .from('PaymentRequests')
            .insert({
                sender_account_no: myAccountNo, // me (requester)
                receiver_account_no: accountNo, // them (payer)
                amount: amount,
                status: 'pending',
                description: `Request from ${myAccountName || 'User'}`
            });

        if (error) throw error;

        setIsTransferSuccessful(true);
        setInstruction(`Request for SGD ${amount} sent!`);
        Alert.alert("Request Sent", `You have requested SGD ${amount} from ${linkedName}.`);
        
    } catch (e: any) {
        console.error("Request Error:", e);
        Alert.alert("Error", "Failed to send request.");
        setInstruction("Request Failed.");
    } finally {
        setIsRequestProcessing(false);
        setTimeout(() => resetTransferState(), 2000);
    }
  };

  const executeTransfer = async (amount: number) => {
    setIsTransferSuccessful(true);
    setInstruction("Transferring...");

    try {
        // use secure rpc
        // sender: me
        // receiver: them
        const { data, error } = await supabase.rpc('transfer_funds', {
            sender_account_no: myAccountNo,     
            receiver_account_no: accountNo, 
            amount: amount,
            description: `Transfer to ${linkedName}`
        });

        if (error) throw error;
        if (data && data.error) throw new Error(data.error);

        // success - ui update
        setBalance(prev => prev - amount); 
        setLinkedBalance(prev => (prev !== null ? prev + amount : null));
        
        const newTransaction = {
            id: Date.now(), 
            name: `You (${myAccountName || 'Me'})`, 
            amount: -amount,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        };

        setTransactions(prev => [newTransaction, ...prev]);
        setInstruction(`Transferred SGD ${amount}!`);

    } catch (e: any) {
         console.error("Transfer Error:", e);
         Alert.alert("Transfer Failed", e.message || "Unknown error");
         setInstruction("Transfer Failed.");
    } finally {
        setTimeout(() => resetTransferState(), 1500);
    }
  };

  /* mode switcher removed */

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="flex-row items-center mb-6 mt-12 justify-between">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => {  
              if(navigation.canGoBack()) {
                navigation.goBack();
              } else {
                router.back();
              }
            }} className="mr-3 p-2">
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Two-Tap Pay</Text>
        </View>
        <TouchableOpacity onPress={handleUnlink} className="p-2 bg-red-50 rounded-lg">
           <Text className="text-red-600 font-semibold text-xs">Unlink</Text>
        </TouchableOpacity>
      </View>

      {/* mode switcher removed */}
      
      {/* balance (source) */}
      <View className="items-center mb-4">
        <Text className="text-gray-500 text-lg mb-1">Your Balance</Text>
        <Text className="text-4xl font-bold text-gray-900">{formatCurrency(balance)}</Text>
      </View>

      {/* linked pay info (destination) */}
      <View className="items-center mb-8 p-4 rounded-xl border bg-gray-50 border-gray-100">
        <Text className="text-gray-500 text-xs uppercase tracking-wide mb-1 font-bold">
            Linked With
        </Text>
        <Text className="text-xl font-bold text-gray-800">{linkedName}</Text>
        <Text className="text-gray-500 text-base font-medium">{accountNo}</Text>
        {linkedBalance !== null && (
            <Text className="text-gray-600 text-sm mt-2 font-medium">
                Linked Balance: {formatCurrency(linkedBalance)}
            </Text>
        )}
      </View>

      {/* instruction & status */}
      <View className="items-center mb-4 min-h-[40px]">
        {isRequestProcessing && (
            <ActivityIndicator size="small" color="#2563eb" className="mb-2" />
        )}
        <Text className="text-center text-lg text-blue-600 font-medium">
            {instruction}
        </Text>
      </View>

      {/* transfer buttons */}
      <View className="flex-row flex-wrap justify-center gap-4 mb-4">
        {buttonAmounts.map((amt, index) => {
          const isSelected = selectedAmount === amt;
          
          let bgClass = 'bg-white border-blue-500';
          let textClass = 'text-blue-500';

          if (isSelected) {
            bgClass = 'bg-blue-600 border-blue-600';
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

      {/* action buttons (visible when amount selected) */}
      {selectedAmount !== null && (
        <View className="flex-row gap-4 mb-8">
            <TouchableOpacity 
                onPress={() => executeTransfer(selectedAmount)}
                className="flex-1 bg-blue-600 py-4 rounded-xl items-center shadow-sm"
            >
                <Text className="text-white font-bold text-lg">Pay ${selectedAmount}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={() => handleRequest(selectedAmount)}
                className="flex-1 bg-white border-2 border-blue-600 py-4 rounded-xl items-center shadow-sm"
            >
                <Text className="text-blue-600 font-bold text-lg">Request ${selectedAmount}</Text>
            </TouchableOpacity>
        </View>
      )}

      {/* transactions list */}
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

      {/* custom amount edit modal */}
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


      {/* 
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
      */}
    </ScrollView>
  );
}
