import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../lib/supabase';

interface Contact {
  id: string;
  name: string;
  nric?: string;
  contactNo?: string;
  accountNo: string;
  type: 'local' | 'foreign';
}

export default function PayNowScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'name' | 'nric'>('name');

  // load initial contacts
  useEffect(() => {
    fetchContacts('');
  }, []);

  const fetchContacts = async (query: string) => {
    setLoading(true);
    try {
      let dbQuery = supabase
        .from('Localaccounts')
        .select('accountId, name, nric, accountNo, contactNo')
        .limit(50);

      if (query.length > 0) {
        if (searchMode === 'name') {
           // search by name or phone
           dbQuery = dbQuery.or(`name.ilike.%${query}%, contactNo.ilike.%${query}%`);
        } else {
           // search by nric
           dbQuery = dbQuery.eq('nric', query);
        }
      }

      const { data, error } = await dbQuery;

      if (error) {
          console.error('Error fetching contacts:', error);
          setContacts([]);
          return;
      }

      const results: Contact[] = data ? data.map((item: any) => ({
        id: `local-${item.accountId}`,
        name: item.name,
        nric: item.nric,
        contactNo: item.contactNo,
        accountNo: item.accountNo,
        type: 'local',
      })) : [];

      setContacts(results);
    } catch (error) {
      console.error(error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // handle text change
  const handleSearchTextChange = (text: string) => {
      setSearchQuery(text);
      if (text.length === 0) {
          fetchContacts('');
      } else if (text.length > 1) {
          fetchContacts(text);
      }
  };

  const toggleSearchMode = () => {
      const newMode = searchMode === 'name' ? 'nric' : 'name';
      setSearchMode(newMode);
      setSearchQuery('');
      fetchContacts(''); // reset list
  };

  const handleSelectContact = (contact: Contact) => {
    router.push({
      pathname: '/paynowscreen',
      params: {
        accountNo: contact.accountNo,
        nickName: contact.name,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center p-4 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else router.back();
            }}
            className="mr-4"
          >
            <MaterialIcons name="arrow-back" size={24} color="#da291c" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">PayNow Transfer</Text>
        </View>

        {/* Search Bar Area */}
        <View className="p-4 bg-white">
          <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-semibold text-gray-500">
                  {searchMode === 'name' ? 'Search by Name or Mobile' : 'Search by NRIC'}
              </Text>
              <TouchableOpacity onPress={toggleSearchMode}>
                  <Text className="text-sm font-bold text-red-600">
                      {searchMode === 'name' ? 'Switch to NRIC Search' : 'Switch to Name Search'}
                  </Text>
              </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center bg-gray-100 rounded-xl p-3">
            <MaterialIcons name="search" size={24} color="#9ca3af" className="mr-2" />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder={searchMode === 'name' ? "Enter Name or Mobile No" : "Enter NRIC (e.g. S1234567A)"}
              value={searchQuery}
              onChangeText={handleSearchTextChange}
              autoCapitalize={searchMode === 'nric' ? "characters" : "none"}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchTextChange('')}>
                <MaterialIcons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contact List */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#da291c" />
          </View>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={() => (
              <View className="items-center mt-12">
                  <MaterialIcons name="contacts" size={48} color="#e5e7eb" className="mb-4" />
                  <Text className="text-gray-400">No contacts found</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectContact(item)}
                className="flex-row items-center py-4 border-b border-gray-100"
              >
                <View className="w-12 h-12 rounded-full justify-center items-center mr-4 bg-red-100">
                  <Text className="font-bold text-lg text-red-600">
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
                  <View className="flex-row items-center mt-1">
                     <MaterialIcons 
                        name={searchMode === 'name' ? "smartphone" : "badge"} 
                        size={14} 
                        color="#6b7280" 
                        className="mr-1" 
                     />
                     <Text className="text-sm text-gray-600">
                        {searchMode === 'name' ? (item.contactNo || 'No Number') : (item.nric || 'No NRIC')}
                     </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
