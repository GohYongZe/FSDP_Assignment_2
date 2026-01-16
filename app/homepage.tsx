import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import GuidedTutorial, { TutorialStep } from './components/GuidedTutorial';

const Homepage = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  const manageAccountsButtonRef = useRef<View>(null);

  const tutorialSteps: TutorialStep[] = [
    {
      target: manageAccountsButtonRef,
      text: 'This button allows you to manage your linked accounts. You can add, remove, or view your connected accounts here.',
    },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
        setLoading(false);
        return;
      }

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
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/LandingScreen');
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
      <TouchableOpacity style={styles.helpButton} onPress={() => setShowTutorial(true)}>
        <FontAwesome name="question-circle-o" size={30} color="#da291c" />
      </TouchableOpacity>
      <Text style={styles.welcomeText}>Welcome,</Text>
      <Text style={styles.userName}>{userName || 'User'}</Text>
      
      <TouchableOpacity ref={manageAccountsButtonRef} style={styles.linkButton} onPress={() => router.push('/linkaccounts')}>
        <Text style={styles.linkButtonText}>Manage Linked Accounts test</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      {showTutorial && <GuidedTutorial steps={tutorialSteps} onClose={() => setShowTutorial(false)} />}
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
  helpButton: {
    position: 'absolute',
    top: 50,
    right: 20,
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
    backgroundColor: '#007AFF',
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
});

export default Homepage;
