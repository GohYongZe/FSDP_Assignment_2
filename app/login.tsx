import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../lib/supabase";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const translations = {
    en: {
      welcomeBack: "Welcome Back",
      welcomeSubtitle: "Log in to access your OCBC banking services",
      emailLabel: "Email Address:",
      emailPlaceholder: "you@example.com",
      passwordLabel: "Password:",
      passwordPlaceholder: "Enter your password",
      rememberMe: "Remember me on this device",
      loginButton: "Login",
      newToOCBC: "New to OCBC? ",
      createAccount: "Create an Account",
      fillAllFields: "Please fill in all fields",
      loginSuccess: "Success",
      loginSuccessMessage: "Login successful! Redirecting...",
      loginFailed: "Login failed. Please try again.",
    },
    zh: {
      welcomeBack: "欢迎回来",
      welcomeSubtitle: "登录以访问您的华侨银行服务",
      emailLabel: "电子邮件地址：",
      emailPlaceholder: "you@example.com",
      passwordLabel: "密码：",
      passwordPlaceholder: "输入您的密码",
      rememberMe: "在此设备上记住我",
      loginButton: "登录",
      newToOCBC: "初次使用华侨银行？",
      createAccount: "创建账户",
      fillAllFields: "请填写所有字段",
      loginSuccess: "成功",
      loginSuccessMessage: "登录成功！正在跳转...",
      loginFailed: "登录失败。请再试一次。",
    },
    ms: {
      welcomeBack: "Selamat Kembali",
      welcomeSubtitle:
        "Log masuk untuk mengakses perkhidmatan perbankan OCBC anda",
      emailLabel: "Alamat Emel:",
      emailPlaceholder: "anda@contoh.com",
      passwordLabel: "Kata Laluan:",
      passwordPlaceholder: "Masukkan kata laluan anda",
      rememberMe: "Ingat saya pada peranti ini",
      loginButton: "Log Masuk",
      newToOCBC: "Baharu ke OCBC? ",
      createAccount: "Cipta Akaun",
      fillAllFields: "Sila isi semua medan",
      loginSuccess: "Berjaya",
      loginSuccessMessage: "Log masuk berjaya! Mengalihkan...",
      loginFailed: "Log masuk gagal. Sila cuba lagi.",
    },
    ta: {
      welcomeBack: "மீண்டும் வரவேற்கிறோம்",
      welcomeSubtitle: "உங்கள் OCBC வங்கி சேவைகளை அணுக உள்நுழையவும்",
      emailLabel: "மின்னஞ்சல் முகவரி:",
      emailPlaceholder: "நீங்கள்@உதாரணம்.com",
      passwordLabel: "கடவுச்சோல்:",
      passwordPlaceholder: "உங்கள் கடவுச்சோல்லை உள்ளிடவும்",
      rememberMe: "இந்த சாதனத்தில் என்னை நினைவில் வைக்கவும்",
      loginButton: "உள்நுழையவும்",
      newToOCBC: "OCBC க்கு புதிதா? ",
      createAccount: "கணக்கை உருவாக்கவும்",
      fillAllFields: "அனைத்து புலங்களையும் நிரப்பவும்",
      loginSuccess: "வெற்றி",
      loginSuccessMessage: "உள்நுழைவு வெற்றிகரமாக இருந்தது! மாற்றுதல்...",
      loginFailed: "உள்நுழைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
    },
    hi: {
      welcomeBack: "पुनः स्वागत है",
      welcomeSubtitle: "अपनी OCBC बैंकिंग सेवाओं तक पहुंचने के लिए लॉग इन करें",
      emailLabel: "ईमेल पता:",
      emailPlaceholder: "आप@उदाहरण.com",
      passwordLabel: "पासवर्ड:",
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
      rememberMe: "इस डिवाइस पर मुझे याद रखें",
      loginButton: "लॉग इन करें",
      newToOCBC: "OCBC में नए? ",
      createAccount: "खाता बनाएं",
      fillAllFields: "कृपया सभी फ़ील्ड भरें",
      loginSuccess: "सफलता",
      loginSuccessMessage: "लॉगिन सफल! पुनर्निर्देशित कर रहे हैं...",
      loginFailed: "लॉगिन विफल। कृपया पुनः प्रयास करें।",
    },
    ja: {
      welcomeBack: "お帰りなさい",
      welcomeSubtitle:
        "OCBCバンキングサービスにアクセスするためにログインしてください",
      emailLabel: "メールアドレス：",
      emailPlaceholder: "you@example.com",
      passwordLabel: "パスワード：",
      passwordPlaceholder: "パスワードを入力",
      rememberMe: "このデバイスで記憶する",
      loginButton: "ログイン",
      newToOCBC: "OCBCが初めてですか？",
      createAccount: "アカウントを作成",
      fillAllFields: "すべてのフィールドを入力してください",
      loginSuccess: "成功",
      loginSuccessMessage: "ログイン成功！リダイレクト中...",
      loginFailed: "ログインに失敗しました。もう一度お試しください。",
    },
    ko: {
      welcomeBack: "다시 오신 것을 환영합니다",
      welcomeSubtitle: "OCBC 뱅킹 서비스에 액세스하려면 로그인하세요",
      emailLabel: "이메일 주소:",
      emailPlaceholder: "you@example.com",
      passwordLabel: "비밀번호:",
      passwordPlaceholder: "비밀번호를 입력하세요",
      rememberMe: "이 기기에 내 정보 기억하기",
      loginButton: "로그인",
      newToOCBC: "OCBC가 처음이신가요? ",
      createAccount: "계정 만들기",
      fillAllFields: "모든 필드를 작성해주세요",
      loginSuccess: "성공",
      loginSuccessMessage: "로그인 성공! 리디렉션 중...",
      loginFailed: "로그인에 실패했습니다. 다시 시도해주세요.",
    },
    es: {
      welcomeBack: "Bienvenido de nuevo",
      welcomeSubtitle:
        "Inicie sesión para acceder a sus servicios bancarios de OCBC",
      emailLabel: "Correo electrónico:",
      emailPlaceholder: "tu@ejemplo.com",
      passwordLabel: "Contraseña:",
      passwordPlaceholder: "Ingrese su contraseña",
      rememberMe: "Recuérdame en este dispositivo",
      loginButton: "Iniciar sesión",
      newToOCBC: "¿Nuevo en OCBC? ",
      createAccount: "Crear una cuenta",
      fillAllFields: "Por favor, complete todos los campos",
      loginSuccess: "Éxito",
      loginSuccessMessage: "¡Inicio de sesión exitoso! Redirigiendo...",
      loginFailed: "Inicio de sesión fallido. Por favor, inténtelo de nuevo.",
    },
    fr: {
      welcomeBack: "Bon retour",
      welcomeSubtitle:
        "Connectez-vous pour accéder à vos services bancaires OCBC",
      emailLabel: "Adresse e-mail:",
      emailPlaceholder: "vous@exemple.com",
      passwordLabel: "Mot de passe:",
      passwordPlaceholder: "Entrez votre mot de passe",
      rememberMe: "Se souvenir de moi sur cet appareil",
      loginButton: "Connexion",
      newToOCBC: "Nouveau chez OCBC? ",
      createAccount: "Créer un compte",
      fillAllFields: "Veuillez remplir tous les champs",
      loginSuccess: "Succès",
      loginSuccessMessage: "Connexion réussie! Redirection...",
      loginFailed: "Échec de la connexion. Veuillez réessayer.",
    },
    de: {
      welcomeBack: "Willkommen zurück",
      welcomeSubtitle:
        "Melden Sie sich an, um auf Ihre OCBC-Bankdienstleistungen zuzugreifen",
      emailLabel: "E-Mail-Adresse:",
      emailPlaceholder: "sie@beispiel.com",
      passwordLabel: "Passwort:",
      passwordPlaceholder: "Geben Sie Ihr Passwort ein",
      rememberMe: "Auf diesem Gerät an mich erinnern",
      loginButton: "Anmelden",
      newToOCBC: "Neu bei OCBC? ",
      createAccount: "Konto erstellen",
      fillAllFields: "Bitte füllen Sie alle Felder aus",
      loginSuccess: "Erfolg",
      loginSuccessMessage: "Anmeldung erfolgreich! Weiterleitung...",
      loginFailed: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    },
  };

  const t =
    translations[selectedLanguage as keyof typeof translations] ||
    translations.en;

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem("selectedLanguage");
      if (savedLang) {
        setSelectedLanguage(savedLang);
      }
    } catch (error) {
      console.log("Error loading language:", error);
    }
  };

  const handleLogin = async () => {
    // Trim and validate inputs
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage(t.fillAllFields);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      console.log("Attempting login with email:", trimmedEmail);

      // Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        console.log("Login error:", error.message);
        setLoading(false);

        // Provide user-friendly error messages
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMessage("Please verify your email before logging in.");
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data?.user) {
        console.log("Login successful for user:", data.user.id);

        // Optional: Fetch user data from database
        try {
          const { data: localData } = await supabase
            .from("Localaccounts")
            .select("*")
            .eq("emailAddress", trimmedEmail);

          if (!localData || localData.length === 0) {
            const { data: foreignData } = await supabase
              .from("Foreignaccounts")
              .select("*")
              .eq("emailAddress", trimmedEmail);

            if (foreignData && foreignData.length > 0) {
              console.log("Found foreign account");
            }
          } else {
            console.log("Found local account");
          }
        } catch (dbError) {
          console.log("Database query error (non-critical):", dbError);
          // Continue to homepage even if database query fails
        }

        setLoading(false);

        // Navigate to homepage
        console.log("Navigating to homepage...");
        router.replace("/homepage");
      } else {
        setLoading(false);
        setErrorMessage("Login failed. Please try again.");
      }
    } catch (error) {
      console.log("Unexpected error during login:", error);
      setLoading(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}
          >
            <ImageBackground
              source={require("../assets/images/ocbc_building.png")}
              style={styles.backgroundImage}
              resizeMode="cover"
            >
              <View style={styles.innerContent}>
                {/* Back Button */}
                <View style={styles.authContainer}>
                  <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                  >
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
                    source={require("../assets/images/ocbc_bank_logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>

                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                  <Text style={styles.welcomeTitle}>{t.welcomeBack}</Text>
                  <Text style={styles.welcomeSubtitle}>
                    {t.welcomeSubtitle}
                  </Text>
                </View>

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

                {/* Form */}
                <View style={styles.form}>
                  {/* Email Field */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{t.emailLabel}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t.emailPlaceholder}
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
                    <Text style={styles.label}>{t.passwordLabel}</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder={t.passwordPlaceholder}
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
                          name={showPassword ? "eye-off" : "eye"}
                          size={20}
                          color={showPassword ? "#005eb8" : "#666"}
                        />
                      </TouchableOpacity>
                    </View>
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
                      <Text style={styles.buttonText}>{t.loginButton}</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Sign Up Link */}
                <View style={styles.signupSection}>
                  <Text style={styles.signupText}>{t.newToOCBC}</Text>
                  <TouchableOpacity onPress={handleSignUp}>
                    <Text style={[styles.link, styles.signupLink]}>
                      {t.createAccount}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#fff",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
    alignSelf: "center",
  },
  authContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backButton: {
    marginRight: 12,
    padding: 5,
  },
  brand: {
    alignItems: "center",
    marginBottom: 18,
  },
  logo: {
    width: 265,
    height: 60,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  alert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  alertText: {
    color: "#dc2626",
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
    fontWeight: "700",
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#333",
    height: 42,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    backgroundColor: "#fff",
    paddingRight: 8,
    height: 42,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
    borderWidth: 0,
    height: 42,
  },
  togglePasswordBtn: {
    padding: 8,
  },
  formRowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#005eb8",
    borderColor: "#005eb8",
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  link: {
    color: "#005eb8",
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#da291c",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  signupSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 12,
    color: "#333",
  },
  signupLink: {
    marginLeft: 4,
  },
});

export default Login;
