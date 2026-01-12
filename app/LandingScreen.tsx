import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const LandingScreen = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/landing_page_bg.png')}
          style={styles.backgroundImage}
          resizeMode="stretch"
        />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Language Switch */}
          <View style={styles.languageSwitch}>
            <Text style={styles.languageSwitchText}>中文</Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Image
                source={require('../assets/images/easy_q_icon.png')}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>Easy Q</Text>
            </View>

            <View style={styles.feature}>
              <Image
                source={require('../assets/images/wealth_insights_icon.png')}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>Wealth Insights</Text>
            </View>

            <View style={styles.feature}>
              <Image
                source={require('../assets/images/locate_ocbc_icon.png')}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>Locate OCBC</Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.button, styles.buttonSignup]}
            onPress={() => router.push('/SignupScreen')}
          >
            <Text style={styles.buttonTextSignup}>
              Sign up as a new customer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonLogin]}
            onPress={() => router.push('/LoginScreen')}
          >
            <Text style={styles.buttonTextLogin}>Log in as existing customer</Text>
          </TouchableOpacity>

          {/* Security Advisory */}
          <Text style={styles.securityAdvisory}>
            Security advisory: Be aware of e-commerce scams. Do not click links
            or scan QR codes to make/collect payments - if an offer seems{' '}
            <Text style={styles.advisoryHighlight}>
              good to be true, it likely is.
            </Text>
          </Text>

          {/* Learn More */}
          <TouchableOpacity>
            <Text style={styles.learnMore}>Learn more</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  container: {
    flex: 1,
    position: 'relative',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 403,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  languageSwitch: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  languageSwitchText: {
    color: '#7691D3',
    fontSize: 13,
    fontWeight: '300',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  feature: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    marginBottom: 8,
  },
  featureText: {
    color: '#ABABAB',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  button: {
    width: '90%',
    maxWidth: 373,
    height: 45,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonSignup: {
    backgroundColor: '#3E525D',
    borderColor: '#3E525D',
  },
  buttonLogin: {
    backgroundColor: '#F5F6F5',
    borderColor: '#3E525D',
  },
  buttonTextSignup: {
    color: '#F5F6F5',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonTextLogin: {
    color: '#3E525D',
    fontSize: 14,
    fontWeight: '700',
  },
  securityAdvisory: {
    textAlign: 'center',
    color: '#AAABAD',
    fontSize: 11,
    lineHeight: 18,
    marginHorizontal: 14,
    marginTop: 20,
  },
  advisoryHighlight: {
    color: '#ACADAE',
    fontWeight: '400',
  },
  learnMore: {
    textAlign: 'center',
    color: '#97AECD',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 10,
  },
});

export default LandingScreen;
