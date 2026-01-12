import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        setLoading(false);
        setErrorMessage(error.message);
        return;
      }
      
      if (data.user) {
        setLoading(false);
        Alert.alert('Success', 'Login successful! Redirecting...', [
          {
            text: 'OK',
            onPress: () => router.replace('/homepage'),
          },
        ]);
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage(
        error instanceof Error ? error.message : 'Login failed. Please try again.'
      );
    }
  };

  const handleSignUp = () => {
    router.push('/SignupScreen');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={true}
        >
          <ImageBackground
            source={require('../assets/images/ocbc_building.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
          <View style={styles.innerContent}>
          {/* Back Button */}
          <View style={styles.authContainer}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color="#333"
              />
            </TouchableOpacity>
          </View>

          {/* Brand Logo */}
          <View style={styles.brand}>
            <Image
              source={require('../assets/images/ocbc_bank_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Log in to access your OCBC banking services
            </Text>
          </View>

          {/* Error Alert */}
          {errorMessage ? (
            <View style={styles.alert}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#dc2626" />
              <Text style={styles.alertText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address:</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            {/* Password Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password:</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.togglePasswordBtn}
                  disabled={loading}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={showPassword ? '#005eb8' : '#666'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  rememberMe && styles.checkboxChecked,
                ]}
                onPress={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && (
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color="#fff"
                  />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>
                Remember me on this device
              </Text>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupSection}>
            <Text style={styles.signupText}>New to OCBC? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={[styles.link, styles.signupLink]}>
                Create an Account
              </Text>
            </TouchableOpacity>
          </View>
          </View>
          </ImageBackground>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'center',
  },
  authContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    marginRight: 12,
    padding: 5,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 265,
    height: 60,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  alertText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  form: {
    gap: 10,
    marginBottom: 0,
  },
  formGroup: {
    marginBottom: 10,
  },
  label: {
    fontWeight: '700',
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
    height: 42,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    backgroundColor: '#fff',
    paddingRight: 8,
    height: 42,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    borderWidth: 0,
    height: 42,
  },
  togglePasswordBtn: {
    padding: 8,
  },
  formRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#005eb8',
    borderColor: '#005eb8',
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  link: {
    color: '#005eb8',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#da291c',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 12,
    color: '#333',
  },
  signupLink: {
    marginLeft: 4,
  },
});

export default LoginScreen;
