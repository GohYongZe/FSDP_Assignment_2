import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

const Homepage = () => {
  const router = useRouter();
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
        console.log('No authenticated user found');
        setUserName('Guest');
        setLoading(false);
        return;
      }

      // Try to fetch from Localaccounts first
      const { data: localData, error: localError } = await supabase
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
      const { data: foreignData, error: foreignError } = await supabase
        .from('Foreignaccounts')
        .select('name')
        .eq('emailAddress', user.email)
        .limit(1);

      if (foreignData && foreignData.length > 0) {
        setUserName(foreignData[0].name);
      } else {
        // If no data found in either table, use email username
        setUserName(user.email?.split('@')[0] || 'User');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserName('User');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                Alert.alert('Error', 'Failed to logout: ' + error.message);
              } else {
                router.replace('/landing');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred during logout');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#da291c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome,</Text>
      <Text style={styles.userName}>{userName || 'User'}</Text>
      
      <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/linkaccounts')}>
        <Text style={styles.linkButtonText}>Manage Linked Accounts test</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.moreButton} onPress={() => router.push('/more')}>
        <Text style={styles.moreButtonText}>More Options</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#da291c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    backgroundColor: '#007AFF', // Blue color for action
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  moreButton: {
    backgroundColor: '#0c83bf',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  moreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Homepage;
