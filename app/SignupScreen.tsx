import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../lib/supabase';

// Account type age ranges
const accountTypeAgeRanges: Record<string, { min: number; max: number | null }> = {
  '360 Account + OCBC 365 Credit Card': { min: 21, max: null },
  '360 Account': { min: 18, max: null },
  'Statement Savings Account': { min: 16, max: null },
  'Bonus+ Savings': { min: 16, max: null },
  'Monthly Savings Account': { min: 16, max: null },
  'OCBC Child Development Account (CDA) and Child Savings Account (CSA)': { min: 0, max: 12 },
  'OCBC MyOwn Account': { min: 7, max: 15 },
  'Personal Banking - live, work, or study in Singapore': { min: 18, max: null },
  'Premier Banking - Exclusive Wealth Privileges': { min: 21, max: null },
};

const SignupScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState('');
  const [nric, setNric] = useState('');
  const [nationality, setNationality] = useState('');
  const [accountType, setAccountType] = useState('');
  const [residency, setResidency] = useState('local');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAccountTypePicker, setShowAccountTypePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      setDob(selectedDate);
    }
    setShowDatePicker(false);
  };

  // Helper function to generate random digits
  const generateRandomDigits = (length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  };

  // Generate numeric account ID
  const generateNumericAccountId = (): number => {
    return Math.floor(10000000 + Math.random() * 90000000);
  };

  // Generate unique bank account number
  const generateUniqueAccountNumber = async (residency: string): Promise<string> => {
    let isUnique = false;
    let accountNo = '';
    
    while (!isUnique) {
      // Generate account number: Bank code (3) + Branch (3) + Account (6)
      accountNo = '734' + generateRandomDigits(3) + generateRandomDigits(6);
      
      // Check if account number already exists
      const tableName = residency === 'local' ? 'Localaccounts' : 'Foreignaccounts';
      const { data, error } = await supabase
        .from(tableName)
        .select('accountNo')
        .eq('accountNo', accountNo);
      
      if (error) {
        console.error('Error checking account number uniqueness:', error);
        isUnique = true;
      } else if (data.length === 0) {
        isUnique = true;
      }
    }
    
    return accountNo;
  };

  // Generate unique debit card number (for ALL accounts)
  const generateUniqueDebitCardNumber = async (residency: string): Promise<string> => {
    let isUnique = false;
    let debitCardNo = '';
    
    while (!isUnique) {
      // Generate 16-digit debit card number starting with 4321 (Visa debit format)
      debitCardNo = '4321' + generateRandomDigits(12);
      
      // Check if debit card number already exists
      const tableName = residency === 'local' ? 'Localaccounts' : 'Foreignaccounts';
      const { data, error } = await supabase
        .from(tableName)
        .select('debitCardNo')
        .eq('debitCardNo', debitCardNo);
      
      if (error) {
        console.error('Error checking debit card number uniqueness:', error);
        isUnique = true;
      } else if (data.length === 0) {
        isUnique = true;
      }
    }
    
    return debitCardNo;
  };

  // Generate unique credit card number (for credit card accounts only)
  const generateUniqueCreditCardNumber = async (residency: string): Promise<string> => {
    let isUnique = false;
    let creditCardNo = '';
    
    while (!isUnique) {
      // Generate 16-digit credit card number starting with 5555 (Mastercard)
      creditCardNo = '5555' + generateRandomDigits(12);
      
      // Check if credit card number already exists
      const tableName = residency === 'local' ? 'Localaccounts' : 'Foreignaccounts';
      const { data, error } = await supabase
        .from(tableName)
        .select('creditCardNo')
        .eq('creditCardNo', creditCardNo);
      
      if (error) {
        console.error('Error checking credit card number uniqueness:', error);
        isUnique = true;
      } else if (data.length === 0) {
        isUnique = true;
      }
    }
    
    return creditCardNo;
  };

  // Format card numbers with dashes
  const formatCardNumber = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/[-\s]/g, '');
    return cleanNumber.replace(/(\d{4})/g, '$1-').slice(0, -1);
  };

  const getAccountTypeOptions = () => {
    return residency === 'local'
      ? [
          { label: 'Select an option', value: '' },
          { label: '360 Account + OCBC 365 Credit Card', value: '360 Account + OCBC 365 Credit Card' },
          { label: '360 Account', value: '360 Account' },
          { label: 'Statement Savings Account', value: 'Statement Savings Account' },
          { label: 'Bonus+ Savings', value: 'Bonus+ Savings' },
          { label: 'Monthly Savings Account', value: 'Monthly Savings Account' },
          { label: 'OCBC Child Development Account (CDA) and Child Savings Account (CSA)', value: 'OCBC Child Development Account (CDA) and Child Savings Account (CSA)' },
          { label: 'OCBC MyOwn Account', value: 'OCBC MyOwn Account' },
        ]
      : [
          { label: 'Select an option', value: '' },
          {
            label: 'Personal Banking - live, work, or study in Singapore',
            value: 'Personal Banking - live, work, or study in Singapore',
          },
          { label: 'Premier Banking - Exclusive Wealth Privileges', value: 'Premier Banking - Exclusive Wealth Privileges' },
        ];
  };

  const getAccountTypeLabel = () => {
    const options = getAccountTypeOptions();
    const selected = options.find((opt) => opt.value === accountType);
    return selected?.label || 'Select an option';
  };

  const handleSignup = async () => {
    try {
      // Basic required fields validation
      if (!fullName || !email || !password || !nationality || !accountType) {
        const error = 'Please fill in all required fields';
        setErrorMessage(error);
        Alert.alert('Validation Error', error);
        return;
      }

      // Email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        const error = 'Please enter a valid email address';
        setErrorMessage(error);
        Alert.alert('Invalid Email', error);
        return;
      }

      // Phone validation
      let formattedPhone = phone.replace(/\s+/g, ''); // Remove all spaces
      if (residency === 'local') {
        // Singapore: 8 digits, starts with 8 or 9
        const phonePattern = /^(8|9)\d{7}$/;
        if (!phonePattern.test(formattedPhone)) {
          const error = 'Please enter a valid Singapore phone number (8 digits, starts with 8 or 9)';
          setErrorMessage(error);
          Alert.alert('Validation Error', error);
          return;
        }
        // Add +65 if not already present
        if (!formattedPhone.startsWith('+65')) {
          formattedPhone = '+65' + formattedPhone;
        }
      } else {
        const intlPhonePattern = /^\+?[0-9\s\-()]{7,20}$/;
        if (!intlPhonePattern.test(formattedPhone)) {
          setErrorMessage('Please enter a valid phone number');
          Alert.alert('Validation Error', 'Please enter a valid phone number');
          return;
        }
      }

      // Nationality validation (letters and spaces only)
      const nationalityPattern = /^[A-Za-z\s]+$/;
      if (!nationalityPattern.test(nationality)) {
        setErrorMessage('Please enter a valid nationality (letters and spaces only)');
        Alert.alert('Validation Error', 'Please enter a valid nationality (letters and spaces only)');
        return;
      }

      // NRIC validation (for local accounts, REQUIRED)
      if (residency === 'local') {
        if (!nric || nric.trim() === '') {
          setErrorMessage('NRIC is required for local accounts');
          Alert.alert('Validation Error', 'NRIC is required for local accounts');
          return;
        }
        
        const nricPattern = /^[STMFG]\d{7}[A-Z]$/i;
        if (!nricPattern.test(nric)) {
          setErrorMessage('Please enter a valid NRIC (e.g., S1234567A)');
          Alert.alert('Invalid NRIC', 'Please enter a valid NRIC (e.g., S1234567A)');
          return;
        }
      }

      // Date of Birth and Age validation
      const dobDate = new Date(dob);
      const today = new Date();
      if (dobDate >= today) {
        setErrorMessage('Date of birth must be in the past');
        Alert.alert('Invalid Date', 'Date of birth must be in the past');
        return;
      }

      // Calculate age more accurately
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }

      // Age validation based on account type
      const ageRange = accountTypeAgeRanges[accountType];
      if (ageRange) {
        if (age < ageRange.min) {
          const error = `Your age does not meet the requirements for this account type. Minimum age: ${ageRange.min} years`;
          setErrorMessage(error);
          Alert.alert('Age Requirement Not Met', error);
          return;
        }
        if (ageRange.max !== null && age > ageRange.max) {
          const error = `Your age does not meet the requirements for this account type. Maximum age: ${ageRange.max} years`;
          setErrorMessage(error);
          Alert.alert('Age Requirement Not Met', error);
          return;
        }
      }

      // Account type validation
      if (!accountType || accountType === '') {
        const error = "Please select a valid account type. 'Select an option' is not allowed";
        setErrorMessage(error);
        Alert.alert('Validation Error', error);
        return;
      }
      
      // Password validation
      if (password.length < 8) {
        const error = 'Password must be at least 8 characters long';
        setErrorMessage(error);
        Alert.alert('Password Too Short', error);
        return;
      }
      const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!passwordPattern.test(password)) {
        const error = 'Password must contain at least one letter and one number';
        setErrorMessage(error);
        Alert.alert('Invalid Password', error);
        return;
      }

      setLoading(true);
      setErrorMessage('');

      console.log('Creating account with:', { fullName, email, residency, accountType });

      // Check if email already has accounts in the database
      const localCheck = await supabase
        .from('Localaccounts')
        .select('*')
        .eq('emailAddress', email);

      const foreignCheck = await supabase
        .from('Foreignaccounts')
        .select('*')
        .eq('emailAddress', email);

      let existingAccounts: string[] = [];
      let existingUserData: any = null;

      if (localCheck.data && localCheck.data.length > 0) {
        existingAccounts = existingAccounts.concat(localCheck.data.map((acc: any) => acc.accountType));
        existingUserData = localCheck.data[0];
      }
      if (foreignCheck.data && foreignCheck.data.length > 0) {
        existingAccounts = existingAccounts.concat(foreignCheck.data.map((acc: any) => acc.accountType));
        if (!existingUserData) {
          existingUserData = foreignCheck.data[0];
        }
      }

      // Handle existing accounts
      if (existingAccounts.length > 0) {
        const accountsList = existingAccounts.join(', ');
        
        // Show alert asking if they want to add another account
        Alert.alert(
          'Existing Account Found',
          `This email already has the following account(s): ${accountsList}.\n\nDo you want to add another account with the same email?`,
          [
            {
              text: 'Cancel',
              onPress: () => {
                setLoading(false);
                setErrorMessage('Account creation cancelled. Please use a different email or login with your existing account');
              },
              style: 'cancel',
            },
            {
              text: 'Continue',
              onPress: async () => {
                // Validate that key details match existing accounts
                const detailsMatch = validateExistingDetails(existingUserData, {
                  name: fullName,
                  contactNo: formattedPhone,
                  address: address,
                  dateOfBirth: dob.toISOString().split('T')[0],
                  nationality: nationality,
                  nric: nric,
                });
                
                if (!detailsMatch.isValid) {
                  setLoading(false);
                  setErrorMessage(`The following details don't match your existing account:\n${detailsMatch.errors.join('\n')}\n\nPlease ensure all personal details match your existing account`);
                  return;
                }
                
                // Continue with account creation
                await createAccount(formattedPhone, true, existingUserData);
              },
            },
          ]
        );
        return;
      }

      // No existing account, proceed with normal signup
      await createAccount(formattedPhone, false, null);

    } catch (error) {
      setLoading(false);
      setErrorMessage(
        error instanceof Error ? error.message : 'Signup failed. Please try again.'
      );
    }
  };

  // Function to validate existing details
  const validateExistingDetails = (existingData: any, newData: any) => {
    const errors: string[] = [];
    
    // Check name (allow some flexibility with case and spacing)
    if (existingData.name && newData.name) {
      const existingName = existingData.name.toLowerCase().trim();
      const newName = newData.name.toLowerCase().trim();
      if (existingName !== newName) {
        errors.push(`• Name: Expected "${existingData.name}", but got "${newData.name}"`);
      }
    }
    
    // Check phone number (normalize format)
    if (existingData.contactNo && newData.contactNo) {
      const existingPhone = existingData.contactNo.replace(/\s+/g, '');
      const newPhone = newData.contactNo.replace(/\s+/g, '');
      if (existingPhone !== newPhone) {
        errors.push(`• Phone: Expected "${existingData.contactNo}", but got "${newData.contactNo}"`);
      }
    }
    
    // Check date of birth
    if (existingData.dateOfBirth && newData.dateOfBirth) {
      if (existingData.dateOfBirth !== newData.dateOfBirth) {
        errors.push(`• Date of Birth: Expected "${existingData.dateOfBirth}", but got "${newData.dateOfBirth}"`);
      }
    }
    
    // Check nationality
    if (existingData.nationality && newData.nationality) {
      const existingNat = existingData.nationality.toLowerCase().trim();
      const newNat = newData.nationality.toLowerCase().trim();
      if (existingNat !== newNat) {
        errors.push(`• Nationality: Expected "${existingData.nationality}", but got "${newData.nationality}"`);
      }
    }
    
    // Check NRIC for local accounts
    if (existingData.nric && newData.nric) {
      const existingNric = existingData.nric.toUpperCase().trim();
      const newNric = newData.nric.toUpperCase().trim();
      if (existingNric !== newNric) {
        errors.push(`• NRIC: Expected "${existingData.nric}", but got "${newData.nric}"`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  };

  // Function to create account
  const createAccount = async (formattedPhone: string, isExistingUser: boolean, existingUserData: any) => {
    try {
      const balance = 0;
      const accountNo = await generateUniqueAccountNumber(residency);
      const accountId = generateNumericAccountId();
      
      // Generate debit card number for ALL accounts
      const debitCardNo = await generateUniqueDebitCardNumber(residency);
      
      // Generate credit card number ONLY for accounts that include "Credit Card"
      let creditCardNo: string | null = null;
      if (accountType.includes('Credit Card') || accountType === '360 Account + OCBC 365 Credit Card') {
        creditCardNo = await generateUniqueCreditCardNumber(residency);
      }

      let authUserId = null;

      if (isExistingUser) {
        // User already exists, try to sign in with provided credentials
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (signInError) {
          setLoading(false);
          // More specific error handling for password mismatch
          if (signInError.message === 'Invalid login credentials') {
            // Check if they entered the same password as stored in database
            if (existingUserData && existingUserData.password) {
              if (password === existingUserData.password) {
                setErrorMessage('There seems to be an issue with authentication. The password matches your account but authentication failed. Please try logging in first, then create a new account');
              } else {
                setErrorMessage('Password mismatch! You previously used a different password for this email. Please use the same password as your existing account');
              }
            } else {
              setErrorMessage('This email is already registered with a different password. Please use the same password as your existing account');
            }
          } else {
            setErrorMessage('Error signing in: ' + signInError.message);
          }
          return;
        }

        authUserId = signInData.user?.id;
        console.log('Using existing Auth user:', authUserId);
        
      } else {
        // New user - create auth account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (authError) {
          if (authError.message === 'User already registered') {
            setLoading(false);
            setErrorMessage('This email is already registered. Please sign in or use a different email');
            return;
          } else {
            setLoading(false);
            setErrorMessage('Error creating account: ' + authError.message);
            return;
          }
        }

        // New user created successfully
        authUserId = authData.user?.id;
        console.log('Created new Auth user:', authUserId);

        // For new users, sign them in automatically
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (signInError) {
          console.error('Error signing in new user:', signInError.message);
          setLoading(false);
          setErrorMessage('Account created but unable to sign in. Please try logging in manually');
          return;
        }
      }
      
      const userData: any = {
        accountId: accountId,
        name: fullName,
        password: password,
        dateOfBirth: dob.toISOString().split('T')[0],
        address: address,
        contactNo: formattedPhone,
        emailAddress: email,
        nationality: nationality,
        accountType: accountType,
        balance: balance,
        accountNo: accountNo,
        debitCardNo: debitCardNo,
      };

      // Add credit card number if generated
      if (creditCardNo) {
        userData.creditCardNo = creditCardNo;
      }

      // Add NRIC for local accounts
      if (residency === 'local') {
        userData.nric = nric;
      }

      const tableName = residency === 'local' ? 'Localaccounts' : 'Foreignaccounts';
      console.log('Inserting into table:', tableName);

      const { data: dbData, error: dbError } = await supabase
        .from(tableName)
        .insert([userData]);

      if (dbError) {
        console.error('Error saving user data:', dbError.message);
        setLoading(false);
        setErrorMessage('Error saving user data: ' + dbError.message);
        return;
      }

      console.log('User data saved successfully:', dbData);
      
      setLoading(false);
      
      // Show success message with account details
      let successMessage = `Account created successfully!\nAccount Number: ${accountNo}\nDebit Card Number: ${formatCardNumber(debitCardNo)}`;
      if (creditCardNo) {
        successMessage += `\nCredit Card Number: ${formatCardNumber(creditCardNo)}`;
      }
      
      Alert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => router.replace('/homepage'),
        },
      ]);

    } catch (error) {
      setLoading(false);
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to create account. Please try again.'
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSingpassSignup = async () => {
    try {
      const singpassUrl = 'https://www.singpass.gov.sg';
      const canOpen = await Linking.canOpenURL(singpassUrl);
      if (canOpen) {
        await Linking.openURL(singpassUrl);
      } else {
        Alert.alert('Error', 'Unable to open Singpass website');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open Singpass website');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          // bounces={true}
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

          {/* Title */}
          <Text style={styles.title}>Create An Account With</Text>

          {/* Singpass Button */}
          <TouchableOpacity
            style={styles.singpassButton}
            onPress={handleSingpassSignup}
          >
            <Image
              source={require('../assets/images/singpass.png')}
              style={styles.singpassIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Or Separator */}
          <Text style={styles.orSeparator}>or</Text>

          {/* Error Alert */}
          {errorMessage ? (
            <View style={styles.alert}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color="#dc2626"
              />
              <Text style={styles.alertText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Personal Information Section */}
          <Text style={styles.mainTitle}>Personal Information</Text>

          {/* Residency Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Local/Foreign customer:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setResidency('local')}
              >
                <View
                  style={[
                    styles.radio,
                    residency === 'local' && styles.radioSelected,
                  ]}
                >
                  {residency === 'local' && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={styles.radioLabel}>Local</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setResidency('foreign')}
              >
                <View
                  style={[
                    styles.radio,
                    residency === 'foreign' && styles.radioSelected,
                  ]}
                >
                  {residency === 'foreign' && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={styles.radioLabel}>Foreign</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Full Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* NRIC (Only for local customers) */}
          {residency === 'local' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>NRIC:</Text>
              <TextInput
                style={styles.input}
                placeholder="S1234567A"
                value={nric}
                onChangeText={setNric}
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>
          )}

          {/* Date of Birth */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of Birth:</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: dob ? '#333' : '#999' }}>
                {dob ? dob.toLocaleDateString() : 'Select date'}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Address */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {residency === 'foreign' ? 'Singapore Address:' : 'Registered Address:'}
            </Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Street, unit, postal code"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </View>

          {/* Phone */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Number:</Text>
            <TextInput
              style={styles.input}
              placeholder="91234567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* Email */}
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

          {/* Nationality */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {residency === 'foreign' ? 'Nationality:' : 'Nationality/Citizenship:'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Singaporean"
              value={nationality}
              onChangeText={setNationality}
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          {/* Account Type Section */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Type:</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowAccountTypePicker(true)}
              disabled={loading}
            >
              <View style={styles.selectInputContent}>
                <Text
                  style={{
                    color: accountType ? '#333' : '#999',
                    fontSize: 14,
                  }}
                >
                  {getAccountTypeLabel()}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color="#333"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Learn More Link */}
          <TouchableOpacity style={styles.learnMoreContainer}>
            <Text style={styles.learnMore}>Learn More</Text>
          </TouchableOpacity>

          {/* Password Field (appears after account type selection) */}
          {accountType && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password (for logging in):</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a secure password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={() => {
                setFullName('');
                setEmail('');
                setPassword('');
                setPhone('');
                setAddress('');
                setNric('');
                setNationality('');
                setAccountType('');
                setErrorMessage('');
              }}
              disabled={loading}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By creating an account you agree to OCBC&apos;s{' '}
              <Text
                style={styles.footerLink}
                onPress={() => {
                  /* Navigate to terms */
                }}
              >
                terms and conditions
              </Text>
              {' '}and{' '}
              <Text
                style={styles.footerLink}
                onPress={() => {
                  /* Navigate to privacy policy */
                }}
              >
                privacy policy
              </Text>
              .
            </Text>
          </View>
          
          </View>
          </ImageBackground>
        </ScrollView>

        {/* Account Type Picker Modal */}
        <Modal
          visible={showAccountTypePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAccountTypePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Account Type</Text>
                <TouchableOpacity
                  onPress={() => setShowAccountTypePicker(false)}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color="#333"
                  />
                </TouchableOpacity>
              </View>
              <FlatList
                data={getAccountTypeOptions()}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      accountType === item.value && styles.optionItemSelected,
                    ]}
                    onPress={() => {
                      setAccountType(item.value);
                      setShowAccountTypePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        accountType === item.value && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {accountType === item.value && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color="#da291c"
                      />
                    )}
                  </TouchableOpacity>
                )}
                scrollEnabled={true}
              />
            </View>
          </View>
        </Modal>
      </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 80,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
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
    width: 320,
    height: 72,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  singpassButton: {
    borderWidth: 2,
    borderColor: '#da291c',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singpassIcon: {
    height: 16,
    width: 80,
  },
  orSeparator: {
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
    marginVertical: 12,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    marginTop: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 22,
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 10,
  },
  label: {
    fontWeight: '700',
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    textAlign: 'left',
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
  textarea: {
    minHeight: 60,
    height: 'auto',
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#da291c',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#da291c',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  selectInput: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    minHeight: 42,
  },
  selectInputContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionItemSelected: {
    backgroundColor: '#f5f5f5',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#da291c',
  },
  learnMoreContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  learnMore: {
    color: '#0c83bf',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#da291c',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.69)',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  footerLink: {
    color: '#0c83bf',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;
