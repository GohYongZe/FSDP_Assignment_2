import { FontAwesome6 } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
// Import the new Expo-compatible voice library
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "@jamsch/expo-speech-recognition";

export default function HomePage() {
  const router = useRouter();
  
  // Existing LandingPage State
  const [isHidden, setIsHidden] = useState(true);
  const [activeTab, setActiveTab] = useState('accounts');
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Cobi Assistant State
  const [isCobiListening, setIsCobiListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  // --- COBI VOICE LISTENERS ---
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      setSpokenText(transcript);
      // Automatically send the text to your Supabase "Brain"
      processCommandWithCobi(transcript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("Cobi Voice Error:", event.error, event.message);
    setIsCobiListening(false);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsCobiListening(false);
  });

  // --- LOGIC FUNCTIONS ---

  const fetchUserData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setUserName('Guest');
        setLoading(false);
        return;
      }

      const { data: localData } = await supabase
        .from('Localaccounts')
        .select('name')
        .eq('emailAddress', user.email)
        .limit(1);

      if (localData && localData.length > 0) {
        setUserName(localData[0].name);
      } else {
        setUserName(user.email?.split('@')[0] || 'User');
      }
      setLoading(false);
    } catch {
      setUserName('User');
      setLoading(false);
    }
  };

  const handleCobiPress = async () => {
    if (isCobiListening) {
      ExpoSpeechRecognitionModule.stop();
      setIsCobiListening(false);
    } else {
      // Request permissions before starting
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert("Permission Denied", "Cobi needs microphone access to help you.");
        return;
      }

      setSpokenText('');
      setIsCobiListening(true);
      ExpoSpeechRecognitionModule.start({ lang: "en-US" });
    }
  };

  const processCommandWithCobi = async (text: string) => {
    try {
      // Call your Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('cobi-assistant', {
        body: { query: text, userName: userName }
      });
      
      if (data?.message) {
        Alert.alert("Cobi", data.message);
        fetchUserData(); // Refresh the balance displayed on screen
      }
    } catch (err) {
      console.error("Cobi Processing Error:", err);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/landing');
      }},
    ]);
  };

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#da291c" />
    </View>
  );

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-gray-100">
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1565967511849-76a60a16170' }}
          className="h-56 p-5 justify-between"
        >
          <View className="flex-row justify-between items-center mt-8">
            <FontAwesome6 name="expand" size={24} color="black" />
            <View className="flex-row items-center">
              <Link href="/notifications" className="mr-4">
                <FontAwesome6 name="bell" size={24} color="black" />
              </Link>
              <TouchableOpacity onPress={handleLogout}>
                <Text className="text-blue-700 font-bold">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-8">Welcome, {userName}</Text>
        </ImageBackground>

        {/* Quick Actions */}
        <View className="bg-white mx-4 -mt-12 p-5 rounded-xl shadow-lg flex-row justify-around relative">
          <View className="items-center">
            <TouchableOpacity className="bg-gray-100 p-3 rounded-full mb-1" onPress={() => router.push('/TransferScreen')}>
              <FontAwesome6 name="comment-dollar" size={20} color="black" />
            </TouchableOpacity>
            <Text className="text-xs text-gray-600">PayNow</Text>
          </View>
        </View>

        {/* Account Tabs & Balance Section */}
        <View className="flex-row items-center p-4">
          <TouchableOpacity onPress={() => setIsHidden(!isHidden)} className="mr-3">
            <FontAwesome6 name={isHidden ? "eye" : "eye-slash"} size={20} color={isHidden ? "#666" : "#da291c"} />
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {['accounts', 'cards', 'investments'].map((tab) => (
              <TouchableOpacity 
                key={tab} 
                onPress={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full border mr-2 ${activeTab === tab ? 'bg-red-600 border-red-600' : 'bg-white border-gray-300'}`}
              >
                <Text className={`capitalize ${activeTab === tab ? 'text-white font-bold' : 'text-gray-600'}`}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity className="bg-gray-50 mx-4 p-5 rounded-xl border border-gray-200" onPress={() => router.push('/accountdetails')}>
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="bg-orange-300 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold text-xs">FRA</Text>
              </View>
              <View>
                <Text className="font-bold text-gray-800">OCBC FRANK Account</Text>
                <Text className={`text-xs text-gray-500 ${isHidden ? 'bg-gray-200 text-transparent' : ''}`}>
                  {isHidden ? '••••••••' : '123-45678-9'}
                </Text>
              </View>
            </View>
            <FontAwesome6 name="chevron-right" size={16} color="gray" />
          </View>
          <View className="border-t border-gray-200 pt-3 flex-row justify-between items-end">
            <Text className="text-gray-400 text-sm">Available balance</Text>
            <Text className={`text-lg font-bold ${isHidden ? 'bg-gray-200 text-transparent' : 'text-gray-800'}`}>
              {isHidden ? '••••••' : 'S$ 1,234.56'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* --- COBI FLOATING BUTTON UI --- */}
      <TouchableOpacity 
        onPress={handleCobiPress}
        className={`absolute bottom-24 right-6 w-16 h-16 rounded-full items-center justify-center shadow-2xl ${isCobiListening ? 'bg-red-600' : 'bg-blue-600'}`}
      >
        <FontAwesome6 name={isCobiListening ? "microphone" : "wand-magic-sparkles"} size={24} color="white" />
      </TouchableOpacity>
      
      {isCobiListening && (
        <View className="absolute bottom-40 right-6 bg-white p-4 rounded-2xl shadow-xl border border-blue-100 w-64">
          <View className="flex-row items-center mb-1">
            <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
            <Text className="font-bold text-blue-600">Cobi Assistant</Text>
          </View>
          <Text className="text-gray-600 text-xs italic">
            {spokenText || "Listening..."}
          </Text>
        </View>
      )}
    </View>
  );
}