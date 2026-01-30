import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Landing = () => {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const translations = {
    en: {
      easyQ: "Easy Q",
      wealthInsights: "Wealth Insights",
      locateOCBC: "Locate OCBC",
      signupButton: "Sign up as a new customer",
      loginButton: "Log in as existing customer",
      securityAdvisory:
        "Security advisory: Be aware of e-commerce scams. Do not click links or scan QR codes to make/collect payments - if an offer seems",
      goodToBeTrueHighlight: "good to be true, it likely is.",
      learnMore: "Learn more",
      selectLanguage: "Select Language",
      languageChanged: "Language Changed",
      languageSwitched: "Language switched to",
    },
    zh: {
      easyQ: "简易排队",
      wealthInsights: "财富见解",
      locateOCBC: "查找华侨银行",
      signupButton: "注册为新客户",
      loginButton: "现有客户登录",
      securityAdvisory:
        "安全提示：警惕电子商务诈骗。不要点击链接或扫描二维码进行付款/收款 - 如果优惠看起来",
      goodToBeTrueHighlight: "好得令人难以置信，那可能就是骗局。",
      learnMore: "了解更多",
      selectLanguage: "选择语言",
      languageChanged: "语言已更改",
      languageSwitched: "语言已切换到",
    },
    ms: {
      easyQ: "Q Mudah",
      wealthInsights: "Wawasan Kekayaan",
      locateOCBC: "Cari OCBC",
      signupButton: "Daftar sebagai pelanggan baru",
      loginButton: "Log masuk sebagai pelanggan sedia ada",
      securityAdvisory:
        "Nasihat keselamatan: Berhati-hati dengan penipuan e-dagang. Jangan klik pautan atau imbas kod QR untuk membuat/mengumpul pembayaran - jika tawaran kelihatan",
      goodToBeTrueHighlight:
        "terlalu bagus untuk menjadi kenyataan, ia mungkin memang begitu.",
      learnMore: "Ketahui lebih lanjut",
      selectLanguage: "Pilih Bahasa",
      languageChanged: "Bahasa Ditukar",
      languageSwitched: "Bahasa ditukar kepada",
    },
    ta: {
      easyQ: "எளிய Q",
      wealthInsights: "செல்வ நுண்ணறிவுகள்",
      locateOCBC: "OCBC ஐக் கண்டறியவும்",
      signupButton: "புதிய வாடிக்கையாளராகப் பதிவு செய்யவும்",
      loginButton: "ஏற்கனவே உள்ள வாடிக்கையாளராக உள்நுழையவும்",
      securityAdvisory:
        "பாதுகாப்பு ஆலோசனை: மின்-வர்த்தக மோசடிகள் குறித்து எச்சரிக்கையாக இருங்கள். இணைப்புகளைக் கிளிக் செய்யாதீர்கள் அல்லது QR குறியீடுகளை ஸ்கேன் செய்யாதீர்கள் - ஒரு சலுகை",
      goodToBeTrueHighlight:
        "உண்மையாக இருக்க மிகவும் நன்றாகத் தோன்றினால், அது அப்படித்தான் இருக்கலாம்.",
      learnMore: "மேலும் அறிக",
      selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
      languageChanged: "மொழி மாற்றப்பட்டது",
      languageSwitched: "மொழி மாற்றப்பட்டது",
    },
    hi: {
      easyQ: "आसान Q",
      wealthInsights: "धन अंतर्दृष्टि",
      locateOCBC: "OCBC खोजें",
      signupButton: "नए ग्राहक के रूप में साइन अप करें",
      loginButton: "मौजूदा ग्राहक के रूप में लॉग इन करें",
      securityAdvisory:
        "सुरक्षा सलाह: ई-कॉमर्स घोटालों से सावधान रहें। भुगतान करने/एकत्र करने के लिए लिंक पर क्लिक न करें या QR कोड स्कैन न करें - यदि कोई ऑफ़र",
      goodToBeTrueHighlight:
        "सच होने के लिए बहुत अच्छा लगता है, तो यह संभवतः वही है।",
      learnMore: "और जानें",
      selectLanguage: "भाषा चुनें",
      languageChanged: "भाषा बदल दी गई",
      languageSwitched: "भाषा बदल दी गई",
    },
    ja: {
      easyQ: "イージーQ",
      wealthInsights: "ウェルスインサイト",
      locateOCBC: "OCBCを探す",
      signupButton: "新規顧客として登録",
      loginButton: "既存顧客としてログイン",
      securityAdvisory:
        "セキュリティ勧告：Eコマース詐欺にご注意ください。リンクをクリックしたり、QRコードをスキャンして支払いを行ったり収集したりしないでください - 申し出が",
      goodToBeTrueHighlight:
        "本当であるには良すぎるように見える場合、それはおそらくそうです。",
      learnMore: "もっと詳しく知る",
      selectLanguage: "言語を選択",
      languageChanged: "言語が変更されました",
      languageSwitched: "言語が切り替わりました",
    },
    ko: {
      easyQ: "쉬운 Q",
      wealthInsights: "재산 통찰력",
      locateOCBC: "OCBC 찾기",
      signupButton: "신규 고객으로 가입",
      loginButton: "기존 고객으로 로그인",
      securityAdvisory:
        "보안 권고: 전자 상거래 사기에 주의하십시오. 링크를 클릭하거나 QR 코드를 스캔하여 지불하거나 수집하지 마십시오 - 제안이",
      goodToBeTrueHighlight:
        "사실이기에 너무 좋아 보인다면 그럴 가능성이 높습니다.",
      learnMore: "자세히 알아보기",
      selectLanguage: "언어 선택",
      languageChanged: "언어가 변경되었습니다",
      languageSwitched: "언어가 다음으로 전환되었습니다",
    },
    es: {
      easyQ: "Q Fácil",
      wealthInsights: "Perspectivas de Riqueza",
      locateOCBC: "Localizar OCBC",
      signupButton: "Registrarse como nuevo cliente",
      loginButton: "Iniciar sesión como cliente existente",
      securityAdvisory:
        "Aviso de seguridad: Tenga cuidado con las estafas de comercio electrónico. No haga clic en enlaces ni escanee códigos QR para realizar/recopilar pagos - si una oferta parece",
      goodToBeTrueHighlight:
        "demasiado buena para ser verdad, probablemente lo sea.",
      learnMore: "Más información",
      selectLanguage: "Seleccionar idioma",
      languageChanged: "Idioma cambiado",
      languageSwitched: "Idioma cambiado a",
    },
    fr: {
      easyQ: "Q Facile",
      wealthInsights: "Aperçus de richesse",
      locateOCBC: "Localiser OCBC",
      signupButton: "S'inscrire en tant que nouveau client",
      loginButton: "Se connecter en tant que client existant",
      securityAdvisory:
        "Avis de sécurité : Méfiez-vous des escroqueries de commerce électronique. Ne cliquez pas sur les liens ou ne scannez pas les codes QR pour effectuer/collecter des paiements - si une offre semble",
      goodToBeTrueHighlight:
        "trop belle pour être vraie, elle l'est probablement.",
      learnMore: "En savoir plus",
      selectLanguage: "Sélectionner la langue",
      languageChanged: "Langue modifiée",
      languageSwitched: "Langue changée en",
    },
    de: {
      easyQ: "Einfaches Q",
      wealthInsights: "Vermögenseinblicke",
      locateOCBC: "OCBC finden",
      signupButton: "Als Neukunde anmelden",
      loginButton: "Als bestehender Kunde anmelden",
      securityAdvisory:
        "Sicherheitshinweis: Seien Sie sich E-Commerce-Betrug bewusst. Klicken Sie nicht auf Links oder scannen Sie QR-Codes, um Zahlungen zu tätigen/zu sammeln - wenn ein Angebot",
      goodToBeTrueHighlight:
        "zu gut aussieht, um wahr zu sein, ist es das wahrscheinlich auch.",
      learnMore: "Mehr erfahren",
      selectLanguage: "Sprache auswählen",
      languageChanged: "Sprache geändert",
      languageSwitched: "Sprache gewechselt zu",
    },
  };

  const t =
    translations[selectedLanguage as keyof typeof translations] ||
    translations.en;

  const languages = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
    { code: "ms", label: "Bahasa Melayu", flag: "🇲🇾" },
    { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
    { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
  ];

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

  const handleLanguageSelect = async (language: (typeof languages)[0]) => {
    setSelectedLanguage(language.code);
    setShowLanguageModal(false);
    try {
      await AsyncStorage.setItem("selectedLanguage", language.code);
    } catch (error) {
      console.log("Error saving language:", error);
    }
    Alert.alert(
      translations[language.code as keyof typeof translations].languageChanged,
      `${translations[language.code as keyof typeof translations].languageSwitched} ${language.label}`,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require("../assets/images/landing_page_bg.png")}
          style={styles.backgroundImage}
          resizeMode="stretch"
        />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Language Switch */}
          <TouchableOpacity
            style={styles.languageSwitch}
            onPress={() => setShowLanguageModal(true)}
          >
            <Text style={styles.languageSwitchText}>
              {languages.find((lang) => lang.code === selectedLanguage)?.flag}{" "}
              {languages.find((lang) => lang.code === selectedLanguage)?.label}
            </Text>
          </TouchableOpacity>

          {/* Language Selection Modal */}
          <Modal
            visible={showLanguageModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowLanguageModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t.selectLanguage}</Text>
                  <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.languageList}>
                  {languages.map((language) => (
                    <TouchableOpacity
                      key={language.code}
                      style={[
                        styles.languageOption,
                        selectedLanguage === language.code &&
                          styles.languageOptionSelected,
                      ]}
                      onPress={() => handleLanguageSelect(language)}
                    >
                      <Text style={styles.languageFlag}>{language.flag}</Text>
                      <Text
                        style={[
                          styles.languageLabel,
                          selectedLanguage === language.code &&
                            styles.languageLabelSelected,
                        ]}
                      >
                        {language.label}
                      </Text>
                      {selectedLanguage === language.code && (
                        <Text style={styles.checkMark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Image
                source={require("../assets/images/easy_q_icon.png")}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>{t.easyQ}</Text>
            </View>

            <View style={styles.feature}>
              <Image
                source={require("../assets/images/wealth_insights_icon.png")}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>{t.wealthInsights}</Text>
            </View>

            <View style={styles.feature}>
              <Image
                source={require("../assets/images/locate_ocbc_icon.png")}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>{t.locateOCBC}</Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.button, styles.buttonSignup]}
            onPress={() => router.push("/signup")}
          >
            <Text
              style={styles.buttonTextSignup}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t.signupButton}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonLogin]}
            onPress={() => router.push("/login")}
          >
            <Text
              style={styles.buttonTextLogin}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t.loginButton}
            </Text>
          </TouchableOpacity>

          {/* Security Advisory */}
          <Text style={styles.securityAdvisory}>
            {t.securityAdvisory}{" "}
            <Text style={styles.advisoryHighlight}>
              {t.goodToBeTrueHighlight}
            </Text>
          </Text>

          {/* Learn More */}
          <TouchableOpacity>
            <Text style={styles.learnMore}>{t.learnMore}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  container: {
    flex: 1,
    position: "relative",
    alignSelf: "center",
    width: "100%",
    maxWidth: 403,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  languageSwitch: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  languageSwitchText: {
    color: "#7691D3",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalClose: {
    fontSize: 24,
    color: "#666",
    fontWeight: "300",
  },
  languageList: {
    maxHeight: 400,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  languageOptionSelected: {
    backgroundColor: "#f5f5f5",
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageLabel: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  languageLabelSelected: {
    fontWeight: "600",
    color: "#da291c",
  },
  checkMark: {
    fontSize: 20,
    color: "#da291c",
    fontWeight: "bold",
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  feature: {
    alignItems: "center",
    width: 90,
  },
  featureIcon: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    marginBottom: 8,
  },
  featureText: {
    color: "#ABABAB",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 14,
  },
  button: {
    width: "90%",
    maxWidth: 373,
    minHeight: 45,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  buttonSignup: {
    backgroundColor: "#3E525D",
    borderColor: "#3E525D",
  },
  buttonLogin: {
    backgroundColor: "#F5F6F5",
    borderColor: "#3E525D",
  },
  buttonTextSignup: {
    color: "#F5F6F5",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 20,
  },
  buttonTextLogin: {
    color: "#3E525D",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 20,
  },
  securityAdvisory: {
    textAlign: "center",
    color: "#AAABAD",
    fontSize: 11,
    lineHeight: 20,
    marginHorizontal: 14,
    marginTop: 20,
    paddingBottom: 5,
  },
  advisoryHighlight: {
    color: "#ACADAE",
    fontWeight: "400",
  },
  learnMore: {
    textAlign: "center",
    color: "#97AECD",
    fontSize: 11,
    fontWeight: "700",
  },
});

export default Landing;
