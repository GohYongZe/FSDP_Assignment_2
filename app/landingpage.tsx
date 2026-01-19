import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';

export default function HomePage() {
  // State for data visibility (replacing your toggleDataVisibility JS function)
  const [isHidden, setIsHidden] = useState(true);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('accounts');

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* --- Header Section (dashboard-header) --- */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1565967511849-76a60a16170' }}
        className="h-56 p-5 justify-between"
      >
        <View className="flex-row justify-between items-center">
          <FontAwesome6 name="expand" size={24} color="black" />
          <View className="flex-row items-center space-x-4">
            <Link href="/notifications"><FontAwesome6 name="bell" size={24} color="black" /></Link>
            <Link href="/landing" className="text-blue-700 font-bold">Logout</Link>
          </View>
        </View>
        <Text className="text-3xl font-bold text-gray-800 mb-8">Welcome</Text>
      </ImageBackground>

      {/* --- Floating Quick Actions (quick-actions-card) --- */}
      <View className="bg-white mx-4 -mt-12 p-5 rounded-xl shadow-lg flex-row justify-around relative">
        <TouchableOpacity className="absolute top-2 right-2">
          <FontAwesome6 name="gear" size={16} color="gray" />
        </TouchableOpacity>
        
        <View className="items-center">
          <View className="bg-gray-100 p-3 rounded-full mb-1">
            <FontAwesome6 name="comment-dollar" size={20} color="black" />
          </View>
          <Text className="text-xs text-gray-600">PayNow</Text>
        </View>
        {/* ... Repeat for other actions */}
      </View>

      {/* --- Account Tabs (tabs-container) --- */}
      <View className="flex-row items-center p-4 space-x-2">
        <TouchableOpacity onPress={() => setIsHidden(!isHidden)}>
          <FontAwesome6 
            name={isHidden ? "eye" : "eye-slash"} 
            size={20} 
            color={isHidden ? "#666" : "#da291c"} 
          />
        </TouchableOpacity>
        
        {['accounts', 'cards', 'investments'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full border ${activeTab === tab ? 'bg-red-600 border-red-600' : 'bg-white border-gray-300'}`}
          >
            <Text className={`capitalize ${activeTab === tab ? 'text-white font-bold' : 'text-gray-600'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- Account Details Card (account-card) --- */}
      <Link href="/account_details" asChild>
        <TouchableOpacity className="bg-gray-50 mx-4 p-5 rounded-xl border border-gray-200">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="bg-orange-300 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold text-xs">FRA</Text>
              </View>
              <View>
                <Text className="font-bold">OCBC FRANK Account</Text>
                <Text className={`text-xs text-gray-500 ${isHidden ? 'bg-gray-300' : ''}`}>
                  {isHidden ? '••••••••' : '123-45678-9'}
                </Text>
              </View>
            </View>
            <FontAwesome6 name="chevron-right" size={16} color="gray" />
          </View>
          
          <View className="border-b border-gray-100 pb-3 mb-3 flex-row justify-between items-end">
            <Text className="text-gray-400 text-sm">Available balance</Text>
            <Text className={`text-lg font-bold ${isHidden ? 'bg-gray-300' : ''}`}>
              {isHidden ? '••••••' : 'S$ 1,234.56'}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}