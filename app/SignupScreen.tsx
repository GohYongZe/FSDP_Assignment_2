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
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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

  const getAccountTypeOptions = () => {
    return residency === 'local'
      ? [
          { label: 'Select an option', value: '' },
          { label: '360 Account + OCBC 365 Credit Card', value: '360-credit' },
          { label: '360 Account', value: '360' },
          { label: 'Statement Savings Account', value: 'statement-savings' },
          { label: 'Bonus + Savings', value: 'bonus-savings' },
          { label: 'Monthly Savings Accounts', value: 'monthly-savings' },
          { label: 'OCBC Child Development Account (CDA)', value: 'cda' },
          { label: '360 Account + OCBC MyOwn Account', value: '360-myown' },
        ]
      : [
          { label: 'Select an option', value: '' },
          {
            label: 'Personal Banking - live, work, or study in Singapore',
            value: 'personal',
          },
          { label: 'Premier Banking - Exclusive Wealth Privileges', value: 'premier' },
        ];
  };

  const getAccountTypeLabel = () => {
    const options = getAccountTypeOptions();
    const selected = options.find((opt) => opt.value === accountType);
    return selected?.label || 'Select an option';
  };

  const handleSignup = async () => {
    // Validation
    if (!fullName || !email || !password || !phone || !address || !nationality || !accountType) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (residency === 'local' && !nric) {
      setErrorMessage('NRIC is required for local customers');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // TODO: Integrate with Supabase authentication
      // const { data, error } = await supabase.auth.signUp({
      //   email: email,
      //   password: password,
      // });

      // TODO: Save user information to database
      // const { data, insertError } = await supabase.from('users').insert([{
      //   email,
      //   fullName,
      //   phone,
      //   dateOfBirth: dob,
      //   address,
      //   nric: residency === 'local' ? nric : null,
      //   nationality,
      //   accountType,
      //   residency,
      // }]);

      setTimeout(() => {
        setLoading(false);
        Alert.alert('Success', 'Account created successfully!', [
          {
            text: 'OK',
            onPress: () => router.replace('/LoginScreen'),
          },
        ]);
      }, 1500);
    } catch (error) {
      setLoading(false);
      setErrorMessage(
        error instanceof Error ? error.message : 'Signup failed. Please try again.'
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
                size={20}
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
              By creating an account you agree to OCBC's{' '}
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
    fontSize: 12,
    flex: 1,
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
