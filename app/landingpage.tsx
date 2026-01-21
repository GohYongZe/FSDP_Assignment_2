import { FontAwesome6 } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase'; // Ensure this path matches your project structure

export default function HomePage() {
  const router = useRouter();
  
  // State from landingpage.tsx
  const [isHidden, setIsHidden] = useState(true);
  const [activeTab, setActiveTab] = useState('accounts');
  
  // State from homepage.tsx
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setUserName('Guest');
        setLoading(false);
        return;
      }

      // Try to fetch from Localaccounts first
      const { data: localData } = await supabase
        .from('Localaccounts')
        .select('name')
        .eq('emailAddress', user.email)
        .limit(1);

      if (localData && localData.length > 0) {
        setUserName(localData[0].name);
        setLoading(false);
        return;
      }

      // If not found in local, try Foreignaccounts
      const { data: foreignData } = await supabase
        .from('Foreignaccounts')
        .select('name')
        .eq('emailAddress', user.email)
        .limit(1);

      if (foreignData && foreignData.length > 0) {
        setUserName(foreignData[0].name);
      } else {
        setUserName(user.email?.split('@')[0] || 'User');
      }

      setLoading(false);
    } catch {
      setUserName('User');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut(); //
              if (error) {
                Alert.alert('Error', 'Failed to logout: ' + error.message);
              } else {
                router.replace('/landing'); // Navigate to login/landing
              }
            } catch {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#da291c" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header Section */}
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
        <Text className="text-3xl font-bold text-gray-800 mb-8">
          Welcome, {userName}
        </Text>
      </ImageBackground>

      {/* Quick Actions Card */}
      <View className="bg-white mx-4 -mt-12 p-5 rounded-xl shadow-lg flex-row justify-around relative">
        <TouchableOpacity className="absolute top-2 right-2">
          <FontAwesome6 name="gear" size={16} color="gray" />
        </TouchableOpacity>
        
        <View className="items-center">
          <TouchableOpacity 
            className="bg-gray-100 p-3 rounded-full mb-1"
            onPress={() => router.push('/TransferScreen')}
          >
            <FontAwesome6 name="comment-dollar" size={20} color="black" />
          </TouchableOpacity>
          <Text className="text-xs text-gray-600">PayNow</Text>
        </View>
        {/* Additional icons can be added here following the same pattern */}
      </View>

      {/* Account Tabs */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={() => setIsHidden(!isHidden)} className="mr-3">
          <FontAwesome6 
            name={isHidden ? "eye" : "eye-slash"} 
            size={20} 
            color={isHidden ? "#666" : "#da291c"} 
          />
        </TouchableOpacity>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {['accounts', 'cards', 'investments'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full border mr-2 ${activeTab === tab ? 'bg-red-600 border-red-600' : 'bg-white border-gray-300'}`}
            >
              <Text className={`capitalize ${activeTab === tab ? 'text-white font-bold' : 'text-gray-600'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Account Details Card */}
      <TouchableOpacity 
        className="bg-gray-50 mx-4 p-5 rounded-xl border border-gray-200"
        onPress={() => router.push('/account_details')}
      >
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
  );
}