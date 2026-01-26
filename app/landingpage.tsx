import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
<<<<<<< HEAD
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "@jamsch/expo-speech-recognition";
=======
>>>>>>> 853b5eb9a8c796bf059702a838e5ff1208a9175e

export default function HomePage() {
  const router = useRouter();
  const [isHidden, setIsHidden] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
=======

  // Cobi Assistant State (Simulated)
>>>>>>> 853b5eb9a8c796bf059702a838e5ff1208a9175e
  const [isCobiListening, setIsCobiListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

<<<<<<< HEAD
  // VOICE EVENT LISTENERS
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      setSpokenText(transcript);
      // Process when the user stops speaking or a final result is found
      if (event.isFinal) {
        processCommandWithCobi(transcript);
      }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("Cobi Voice Error:", event.error, event.message);
    setIsCobiListening(false);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsCobiListening(false);
  });

  // LOGIC FUNCTIONS
=======
  // --- LOGIC FUNCTIONS ---

>>>>>>> 853b5eb9a8c796bf059702a838e5ff1208a9175e
  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: localData } = await supabase.from('Localaccounts').select('name').eq('emailAddress', user.email).limit(1);
      setUserName(localData?.[0]?.name || user.email?.split('@')[0] || 'User');
      setLoading(false);
    } catch { setLoading(false); }
  };

  const handleCobiPress = async () => {
<<<<<<< HEAD
    if (isCobiListening) {
      ExpoSpeechRecognitionModule.stop();
      setIsCobiListening(false);
    } else {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      // Robust permission check for Android and iOS
      if (result.status !== 'granted' && !result.granted) {
        Alert.alert("Permission Denied", "Cobi needs microphone access to help you.");
        return;
      }

      setSpokenText('');
      setIsCobiListening(true);
      // Continuous mode keeps the mic active for longer sentences
      ExpoSpeechRecognitionModule.start({ 
        lang: "en-US",
        continuous: true,
        interimResults: true 
      });
    }
=======
    Alert.alert("Feature unavailable", "Voice assistant is currently disabled in this environment.");
>>>>>>> 853b5eb9a8c796bf059702a838e5ff1208a9175e
  };

  const processCommandWithCobi = async (text: string) => {
    try {
      const { data } = await supabase.functions.invoke('cobi-assistant', {
        body: { query: text, userName: userName }
      });
      if (data?.message) {
        Alert.alert("Cobi", data.message);
        fetchUserData(); // Refresh local balance after transaction
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#da291c" /></View>;

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-gray-100">
        <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1565967511849-76a60a16170' }} className="h-56 p-5 justify-between">
          <View className="flex-row justify-between items-center mt-8">
            <FontAwesome6 name="expand" size={24} color="black" />
            <TouchableOpacity onPress={() => router.replace('/landing')}><Text className="text-blue-700 font-bold">Logout</Text></TouchableOpacity>
          </View>
          <Text className="text-3xl font-bold text-gray-800 mb-8">Welcome, {userName}</Text>
        </ImageBackground>

        <View className="bg-white mx-4 -mt-12 p-5 rounded-xl shadow-lg flex-row justify-around">
          <TouchableOpacity onPress={() => router.push('/transferscreen')} className="items-center">
            <View className="bg-gray-100 p-3 rounded-full mb-1"><FontAwesome6 name="comment-dollar" size={20} color="black" /></View>
            <Text className="text-xs text-gray-600">PayNow</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center p-4">
          <TouchableOpacity onPress={() => setIsHidden(!isHidden)} className="mr-3">
            <FontAwesome6 name={isHidden ? "eye" : "eye-slash"} size={20} color={isHidden ? "#666" : "#da291c"} />
          </TouchableOpacity>
          <Text className="font-bold text-lg">OCBC FRANK Account</Text>
        </View>

        <View className="bg-gray-50 mx-4 p-5 rounded-xl border border-gray-200">
          <Text className="text-gray-400 text-sm">Available balance</Text>
          <Text className={`text-lg font-bold ${isHidden ? 'bg-gray-200 text-transparent' : 'text-gray-800'}`}>
            {isHidden ? '••••••' : 'S$ 1,234.56'}
          </Text>
        </View>
      </ScrollView>

      {/* COBI BUTTON */}
      <TouchableOpacity 
        onPress={handleCobiPress}
        className={`absolute bottom-24 right-6 w-16 h-16 rounded-full items-center justify-center shadow-2xl ${isCobiListening ? 'bg-red-600' : 'bg-blue-600'}`}
      >
        <FontAwesome6 name={isCobiListening ? "microphone" : "wand-magic-sparkles"} size={24} color="white" />
      </TouchableOpacity>
      
      {isCobiListening && (
        <View className="absolute bottom-40 right-6 bg-white p-4 rounded-2xl shadow-xl border border-blue-100 w-64">
          <Text className="font-bold text-blue-600 mb-1">Cobi Assistant</Text>
          <Text className="text-gray-600 text-xs italic">{spokenText || "Listening..."}</Text>
        </View>
      )}
    </View>
  );
}