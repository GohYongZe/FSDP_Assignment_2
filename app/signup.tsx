import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

// Account type age ranges
const accountTypeAgeRanges: Record<
  string,
  { min: number; max: number | null }
> = {
  "360 Account + OCBC 365 Credit Card": { min: 21, max: null },
  "360 Account": { min: 18, max: null },
  "Statement Savings Account": { min: 16, max: null },
  "Bonus+ Savings": { min: 16, max: null },
  "Monthly Savings Account": { min: 16, max: null },
  "OCBC Child Development Account (CDA) and Child Savings Account (CSA)": {
    min: 0,
    max: 12,
  },
  "OCBC MyOwn Account": { min: 7, max: 15 },
  "Personal Banking - live, work, or study in Singapore": {
    min: 18,
    max: null,
  },
  "Premier Banking - Exclusive Wealth Privileges": { min: 21, max: null },
};

const Signup = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState("");
  const [nric, setNric] = useState("");
  const [nationality, setNationality] = useState("");
  const [accountType, setAccountType] = useState("");
  const [residency, setResidency] = useState("local");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAccountTypePicker, setShowAccountTypePicker] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const translations = {
    en: {
      createAccountWith: "Create An Account With",
      or: "or",
      personalInfo: "Personal Information",
      localForeign: "Local/Foreign customer:",
      local: "Local",
      foreign: "Foreign",
      fullName: "Full Name:",
      fullNamePlaceholder: "Enter full name",
      nric: "NRIC:",
      nricPlaceholder: "S1234567A",
      dob: "Date of Birth:",
      dobPlaceholder: "Select date",
      registeredAddress: "Registered Address:",
      singaporeAddress: "Singapore Address:",
      addressPlaceholder: "Street, unit, postal code",
      contactNumber: "Contact Number:",
      contactPlaceholder: "91234567",
      email: "Email Address:",
      emailPlaceholder: "you@example.com",
      nationalityCitizenship: "Nationality/Citizenship:",
      nationality: "Nationality:",
      nationalityPlaceholder: "e.g. Singaporean",
      accountType: "Account Type:",
      selectOption: "Select an option",
      learnMore: "Learn More",
      password: "Password (for logging in):",
      passwordPlaceholder: "Enter a secure password",
      createAccount: "Create Account",
      reset: "Reset",
      footerTerms: "By creating an account you agree to OCBC's",
      termsConditions: "terms and conditions",
      and: "and",
      privacyPolicy: "privacy policy",
      selectAccountType: "Select Account Type",
      fillAllFields: "Please fill in all required fields",
      validEmail: "Please enter a valid email address",
      invalidEmail: "Invalid Email",
      validPhone:
        "Please enter a valid Singapore phone number (8 digits, starts with 8 or 9)",
      validPhoneIntl: "Please enter a valid phone number",
      validNationality:
        "Please enter a valid nationality (letters and spaces only)",
      nricRequired: "NRIC is required for local accounts",
      validNRIC: "Please enter a valid NRIC (e.g., S1234567A)",
      invalidNRIC: "Invalid NRIC",
      dobPast: "Date of birth must be in the past",
      invalidDate: "Invalid Date",
      ageRequirement:
        "Your age does not meet the requirements for this account type. Minimum age:",
      ageRequirementMax:
        "Your age does not meet the requirements for this account type. Maximum age:",
      ageNotMet: "Age Requirement Not Met",
      years: "years",
      selectValidAccount:
        "Please select a valid account type. 'Select an option' is not allowed",
      validationError: "Validation Error",
      passwordShort: "Password must be at least 8 characters long",
      passwordTooShort: "Password Too Short",
      passwordInvalid:
        "Password must contain at least one letter and one number. Special characters are not allowed.",
      invalidPassword: "Invalid Password",
      existingAccountFound: "Existing Account Found",
      existingAccountMessage:
        "This email already has the following account(s):",
      addAnotherAccount:
        "Do you want to add another account with the same email?",
      cancel: "Cancel",
      continue: "Continue",
      accountCancelled:
        "Account creation cancelled. Please use a different email or login with your existing account",
      detailsNotMatch:
        "The following details don't match your existing account:",
      ensureMatch:
        "Please ensure all personal details match your existing account",
      success: "Success",
      accountCreated: "Account created successfully!",
      accountNumber: "Account Number:",
      debitCardNumber: "Debit Card Number:",
      creditCardNumber: "Credit Card Number:",
      ok: "OK",
    },
    zh: {
      createAccountWith: "创建账户",
      or: "或",
      personalInfo: "个人信息",
      localForeign: "本地/外国客户：",
      local: "本地",
      foreign: "外国",
      fullName: "全名：",
      fullNamePlaceholder: "输入全名",
      nric: "NRIC：",
      nricPlaceholder: "S1234567A",
      dob: "出生日期：",
      dobPlaceholder: "选择日期",
      registeredAddress: "注册地址：",
      singaporeAddress: "新加坡地址：",
      addressPlaceholder: "街道、单元、邮政编码",
      contactNumber: "联系电话：",
      contactPlaceholder: "91234567",
      email: "电子邮件地址：",
      emailPlaceholder: "you@example.com",
      nationalityCitizenship: "国籍/公民身份：",
      nationality: "国籍：",
      nationalityPlaceholder: "例如 新加坡人",
      accountType: "账户类型：",
      selectOption: "选择选项",
      learnMore: "了解更多",
      password: "密码（用于登录）：",
      passwordPlaceholder: "输入安全密码",
      createAccount: "创建账户",
      reset: "重置",
      footerTerms: "创建账户即表示您同意华侨银行的",
      termsConditions: "条款和条件",
      and: "和",
      privacyPolicy: "隐私政策",
      selectAccountType: "选择账户类型",
      fillAllFields: "请填写所有必填字段",
      validEmail: "请输入有效的电子邮件地址",
      invalidEmail: "无效的电子邮件",
      validPhone: "请输入有效的新加坡电话号码（8位数字，以8或9开头）",
      validPhoneIntl: "请输入有效的电话号码",
      validNationality: "请输入有效的国籍（仅限字母和空格）",
      nricRequired: "本地账户需要NRIC",
      validNRIC: "请输入有效的NRIC（例如，S1234567A)",
      invalidNRIC: "无效的NRIC",
      dobPast: "出生日期必须是过去的日期",
      invalidDate: "无效的日期",
      ageRequirement: "您的年龄不符合此账户类型的要求。最低年龄：",
      ageRequirementMax: "您的年龄不符合此账户类型的要求。最高年龄：",
      ageNotMet: "年龄要求不符",
      years: "岁",
      selectValidAccount: '请选择有效的账户类型。不允许"选择选项"',
      validationError: "验证错误",
      passwordShort: "密码必须至少8个字符",
      passwordTooShort: "密码太短",
      passwordInvalid:
        "密码必须包含至少一个字母和一个数字。不允许使用特殊字符。",
      invalidPassword: "无效的密码",
      existingAccountFound: "发现现有账户",
      existingAccountMessage: "此电子邮件已有以下账户：",
      addAnotherAccount: "您想使用相同的电子邮件添加另一个账户吗？",
      cancel: "取消",
      continue: "继续",
      accountCancelled: "账户创建已取消。请使用其他电子邮件或使用现有账户登录",
      detailsNotMatch: "以下详细信息与您的现有账户不匹配：",
      ensureMatch: "请确保所有个人详细信息与您的现有账户匹配",
      success: "成功",
      accountCreated: "账户创建成功！",
      accountNumber: "账户号码：",
      debitCardNumber: "借记卡号码：",
      creditCardNumber: "信用卡号码：",
      ok: "确定",
    },
    ms: {
      createAccountWith: "Cipta Akaun Dengan",
      or: "atau",
      personalInfo: "Maklumat Peribadi",
      localForeign: "Pelanggan Tempatan/Asing:",
      local: "Tempatan",
      foreign: "Asing",
      fullName: "Nama Penuh:",
      fullNamePlaceholder: "Masukkan nama penuh",
      nric: "NRIC:",
      nricPlaceholder: "S1234567A",
      dob: "Tarikh Lahir:",
      dobPlaceholder: "Pilih tarikh",
      registeredAddress: "Alamat Berdaftar:",
      singaporeAddress: "Alamat Singapura:",
      addressPlaceholder: "Jalan, unit, poskod",
      contactNumber: "Nombor Perhubungan:",
      contactPlaceholder: "91234567",
      email: "Alamat Emel:",
      emailPlaceholder: "anda@contoh.com",
      nationalityCitizenship: "Kewarganegaraan:",
      nationality: "Kewarganegaraan:",
      nationalityPlaceholder: "cth. Singapura",
      accountType: "Jenis Akaun:",
      selectOption: "Pilih pilihan",
      learnMore: "Ketahui Lebih Lanjut",
      password: "Kata Laluan (untuk log masuk):",
      passwordPlaceholder: "Masukkan kata laluan selamat",
      createAccount: "Cipta Akaun",
      reset: "Tetapkan Semula",
      footerTerms: "Dengan mencipta akaun anda bersetuju dengan",
      termsConditions: "terma dan syarat",
      and: "dan",
      privacyPolicy: "dasar privasi",
      selectAccountType: "Pilih Jenis Akaun",
      fillAllFields: "Sila isi semua medan yang diperlukan",
      validEmail: "Sila masukkan alamat emel yang sah",
      invalidEmail: "Emel Tidak Sah",
      validPhone:
        "Sila masukkan nombor telefon Singapura yang sah (8 digit, bermula dengan 8 atau 9)",
      validPhoneIntl: "Sila masukkan nombor telefon yang sah",
      validNationality:
        "Sila masukkan kewarganegaraan yang sah (huruf dan ruang sahaja)",
      nricRequired: "NRIC diperlukan untuk akaun tempatan",
      validNRIC: "Sila masukkan NRIC yang sah (cth., S1234567A)",
      invalidNRIC: "NRIC Tidak Sah",
      dobPast: "Tarikh lahir mestilah pada masa lalu",
      invalidDate: "Tarikh Tidak Sah",
      ageRequirement:
        "Umur anda tidak memenuhi keperluan untuk jenis akaun ini. Umur minimum:",
      ageRequirementMax:
        "Umur anda tidak memenuhi keperluan untuk jenis akaun ini. Umur maksimum:",
      ageNotMet: "Keperluan Umur Tidak Dipenuhi",
      years: "tahun",
      selectValidAccount:
        "Sila pilih jenis akaun yang sah. 'Pilih pilihan' tidak dibenarkan",
      validationError: "Ralat Pengesahan",
      passwordShort: "Kata laluan mestilah sekurang-kurangnya 8 aksara",
      passwordTooShort: "Kata Laluan Terlalu Pendek",
      passwordInvalid:
        "Kata laluan mesti mengandungi sekurang-kurangnya satu huruf dan satu nombor. Aksara khas tidak dibenarkan.",
      invalidPassword: "Kata Laluan Tidak Sah",
      existingAccountFound: "Akaun Sedia Ada Dijumpai",
      existingAccountMessage: "Emel ini sudah mempunyai akaun berikut:",
      addAnotherAccount:
        "Adakah anda mahu menambah akaun lain dengan emel yang sama?",
      cancel: "Batal",
      continue: "Teruskan",
      accountCancelled:
        "Penciptaan akaun dibatalkan. Sila gunakan emel yang berbeza atau log masuk dengan akaun sedia ada anda",
      detailsNotMatch:
        "Butiran berikut tidak sepadan dengan akaun sedia ada anda:",
      ensureMatch:
        "Sila pastikan semua butiran peribadi sepadan dengan akaun sedia ada anda",
      success: "Berjaya",
      accountCreated: "Akaun berjaya dicipta!",
      accountNumber: "Nombor Akaun:",
      debitCardNumber: "Nombor Kad Debit:",
      creditCardNumber: "Nombor Kad Kredit:",
      ok: "OK",
    },
    ta: {
      createAccountWith: "கணக்கை உருவாக்கவும்",
      or: "அல்லது",
      personalInfo: "தனிப்பட்ட தகவல்",
      localForeign: "உள்ளூர்/வெளிநாட்டு வாடிக்கையாளர்:",
      local: "உள்ளூர்",
      foreign: "வெளிநாடு",
      fullName: "முழு பெயர்:",
      fullNamePlaceholder: "முழு பெயரை உள்ளிடவும்",
      nric: "NRIC:",
      nricPlaceholder: "S1234567A",
      dob: "பிறந்த தேதி:",
      dobPlaceholder: "தேதியைத் தேர்ந்தெடுக்கவும்",
      registeredAddress: "பதிவு செய்யப்பட்ட முகவரி:",
      singaporeAddress: "சிங்கப்பூர் முகவரி:",
      addressPlaceholder: "தெரு, அலகு, அஞ்சல் குறியீடு",
      contactNumber: "தொடர்பு எண்:",
      contactPlaceholder: "91234567",
      email: "மின்னஞ்சல் முகவரி:",
      emailPlaceholder: "நீங்கள்@உதாரணம்.com",
      nationalityCitizenship: "தேசியம்/குடியுரிமை:",
      nationality: "தேசியம்:",
      nationalityPlaceholder: "எ.கா. சிங்கப்பூரியன்",
      accountType: "கணக்கு வகை:",
      selectOption: "ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும்",
      learnMore: "மேலும் அறிக",
      password: "கடவுச்சொல் (உள்நுழைவதற்கு):",
      passwordPlaceholder: "பாதுகாப்பான கடவுச்சொல்லை உள்ளிடவும்",
      createAccount: "கணக்கை உருவாக்கவும்",
      reset: "மீட்டமை",
      footerTerms: "கணக்கை உருவாக்குவதன் மூலம் நீங்கள் OCBC இன்",
      termsConditions: "விதிமுறைகள் மற்றும் நிபந்தனைகளை",
      and: "மற்றும்",
      privacyPolicy: "தனியுரிமை கொள்கையை",
      selectAccountType: "கணக்கு வகையைத் தேர்ந்தெடுக்கவும்",
      fillAllFields: "தேவையான அனைத்து புலங்களையும் நிரப்பவும்",
      validEmail: "சரியான மின்னஞ்சல் முகவரி உள்ளிடவும்",
      invalidEmail: "தவறான மின்னஞ்சல்",
      validPhone:
        "சரியான சிங்கப்பூர் தொலைபேசி எண்ணை உள்ளிடவும் (8 இலக்கங்கள், 8 அல்லது 9 உடன் தொடங்குகிறது)",
      validPhoneIntl: "சரியான தொலைபேசி எண்ணை உள்ளிடவும்",
      validNationality:
        "சரியான தேசியத்தை உள்ளிடவும் (எழுத்துக்கள் மற்றும் இடைவெளிகள் மட்டுமே)",
      nricRequired: "உள்ளூர் கணக்குகளுக்கு NRIC தேவை",
      validNRIC: "சரியான NRIC ஐ உள்ளிடவும் (எ.கா., S1234567A)",
      invalidNRIC: "தவறான NRIC",
      dobPast: "பிறந்த தேதி கடந்த காலத்தில் இருக்க வேண்டும்",
      invalidDate: "தவறான தேதி",
      ageRequirement:
        "உங்கள் வயது இந்த கணக்கு வகைக்கான தேவைகளை பூர்த்தி செய்யவில்லை. குறைந்தபட்ச வயது:",
      ageRequirementMax:
        "உங்கள் வயது இந்த கணக்கு வகைக்கான தேவைகளை பூர்த்தி செய்யவில்லை. அதிகபட்ச வயது:",
      ageNotMet: "வயது தேவை பூர்த்தி செய்யப்படவில்லை",
      years: "ஆண்டுகள்",
      selectValidAccount:
        "சரியான கணக்கு வகையைத் தேர்ந்தெடுக்கவும். 'ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும்' அனுமதிக்கப்படவில்லை",
      validationError: "சரிபார்ப்பு பிழை",
      passwordShort: "கடவுச்சொல் குறைந்தது 8 எழுத்துகளாக இருக்க வேண்டும்",
      passwordTooShort: "கடவுச்சொல் மிகவும் குறுகியது",
      passwordInvalid:
        "கடவுச்சொல் குறைந்தது ஒரு எழுத்து மற்றும் ஒரு எண்ணைக் கொண்டிருக்க வேண்டும். சிறப்பு எழுத்துக்கள் அனுமதிக்கப்படவில்லை.",
      invalidPassword: "தவறான கடவுச்சொல்",
      existingAccountFound: "ஏற்கனவே உள்ள கணக்கு கண்டுபிடிக்கப்பட்டது",
      existingAccountMessage:
        "இந்த மின்னஞ்சலில் ஏற்கனவே பின்வரும் கணக்குகள் உள்ளன:",
      addAnotherAccount:
        "அதே மின்னஞ்சலுடன் மற்றொரு கணக்கைச் சேர்க்க விரும்புகிறீர்களா?",
      cancel: "ரத்து",
      continue: "தொடர",
      accountCancelled:
        "கணக்கு உருவாக்கம் ரத்து செய்யப்பட்டது. வேறு மின்னஞ்சலைப் பயன்படுத்தவும் அல்லது உங்கள் ஏற்கனவே உள்ள கணக்கில் உள்நுழையவும்",
      detailsNotMatch:
        "பின்வரும் விவரங்கள் உங்கள் ஏற்கனவே உள்ள கணக்குடன் பொருந்தவில்லை:",
      ensureMatch:
        "Sila pastikan semua butiran peribadi sepadan dengan akaun sedia ada anda",
      success: "வெற்றி",
      accountCreated: "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது!",
      accountNumber: "கணக்கு எண்:",
      debitCardNumber: "பற்று அட்டை எண்:",
      creditCardNumber: "கடன் அட்டை எண்:",
      ok: "சரி",
    },
    hi: {
      createAccountWith: "खाता बनाएं",
      or: "या",
      personalInfo: "व्यक्तिगत जानकारी",
      localForeign: "स्थानीय/विदेशी ग्राहक:",
      local: "स्थानीय",
      foreign: "विदेशी",
      fullName: "पूरा नाम:",
      fullNamePlaceholder: "पूरा नाम दर्ज करें",
      nric: "NRIC:",
      nricPlaceholder: "S1234567A",
      dob: "जन्म तिथि:",
      dobPlaceholder: "तारीख चुनें",
      registeredAddress: "पंजीकृत पता:",
      singaporeAddress: "सिंगापुर पता:",
      addressPlaceholder: "गली, इकाई, डाक कोड",
      contactNumber: "संपर्क नंबर:",
      contactPlaceholder: "91234567",
      email: "ईमेल पता:",
      emailPlaceholder: "आप@उदाहरण.com",
      nationalityCitizenship: "राष्ट्रीयता/नागरिकता:",
      nationality: "राष्ट्रीयता:",
      nationalityPlaceholder: "उदा. सिंगापुरी",
      accountType: "खाता प्रकार:",
      selectOption: "एक विकल्प चुनें",
      learnMore: "और जानें",
      password: "पासवर्ड (लॉग इन के लिए):",
      passwordPlaceholder: "एक सुरक्षित पासवर्ड दर्ज करें",
      createAccount: "खाता बनाएं",
      reset: "रीसेट",
      footerTerms: "खाता बनाकर आप OCBC की",
      termsConditions: "नियम और शर्तों",
      and: "और",
      privacyPolicy: "गोपनीयता नीति",
      selectAccountType: "खाता प्रकार चुनें",
      fillAllFields: "कृपया सभी आवश्यक फ़ील्ड भरें",
      validEmail: "कृपया एक वैध ईमेल पता दर्ज करें",
      invalidEmail: "अमान्य ईमेल",
      validPhone:
        "कृपया एक वैध सिंगापुर फ़ोन नंबर दर्ज करें (8 अंक, 8 या 9 से शुरू)",
      validPhoneIntl: "कृपया एक वैध फ़ोन नंबर दर्ज करें",
      validNationality:
        "कृपया एक वैध राष्ट्रीयता दर्ज करें (केवल अक्षर और रिक्त स्थान)",
      nricRequired: "स्थानीय खातों के लिए NRIC आवश्यक है",
      validNRIC: "कृपया एक वैध NRIC दर्ज करें (उदा., S1234567A)",
      invalidNRIC: "अमान्य NRIC",
      dobPast: "जन्म तिथि भूतकाल में होनी चाहिए",
      invalidDate: "अमान्य तारीख",
      ageRequirement:
        "आपकी उम्र इस खाता प्रकार की आवश्यकताओं को पूरा नहीं करती है। न्यूनतम आयु:",
      ageRequirementMax:
        "आपकी उम्र इस खाता प्रकार की आवश्यकताओं को पूरा नहीं करती है। अधिकतम आयु:",
      ageNotMet: "आयु आवश्यकता पूरी नहीं हुई",
      years: "वर्ष",
      selectValidAccount:
        "कृपया एक वैध खाता प्रकार चुनें। 'एक विकल्प चुनें' की अनुमति नहीं है",
      validationError: "सत्यापन त्रुटि",
      passwordShort: "पासवर्ड कम से कम 8 वर्ण लंबा होना चाहिए",
      passwordTooShort: "पासवर्ड बहुत छोटा",
      passwordInvalid:
        "पासवर्ड में कम से कम एक अक्षर और एक संख्या होनी चाहिए। विशेष वर्णों की अनुमति नहीं है।",
      invalidPassword: "अमान्य पासवर्ड",
      existingAccountFound: "मौजूदा खाता मिला",
      existingAccountMessage: "इस ईमेल में पहले से निम्नलिखित खाता(खाते) हैं:",
      addAnotherAccount: "क्या आप उसी ईमेल के साथ एक और खाता जोड़ना चाहते हैं?",
      cancel: "रद्द करें",
      continue: "जारी रखें",
      accountCancelled:
        "खाता निर्माण रद्द कर दिया गया। कृपया एक अलग ईमेल का उपयोग करें या अपने मौजूदा खाते में लॉग इन करें",
      detailsNotMatch: "निम्नलिखित विवरण आपके मौजूदा खाते से मेल नहीं खाते:",
      ensureMatch:
        "कृपया सुनिश्चित करें कि सभी व्यक्तिगत विवरण आपके मौजूदा खाते से मेल खाते हैं",
      success: "सफलता",
      accountCreated: "खाता सफलतापूर्वक बनाया गया!",
      accountNumber: "खाता संख्या:",
      debitCardNumber: "डेबिट कार्ड नंबर:",
      creditCardNumber: "क्रेडिट कार्ड नंबर:",
      ok: "ठीक",
    },
    ja: {
      createAccountWith: "アカウントを作成",
      or: "または",
      personalInfo: "個人情報",
      localForeign: "ローカル/外国の顧客:",
      local: "ローカル",
      foreign: "外国",
      fullName: "フルネーム:",
      fullNamePlaceholder: "フルネームを入力",
      nric: "NRIC:",
      nricPlaceholder: "S1234567A",
      dob: "生年月日:",
      dobPlaceholder: "日付を選択",
      registeredAddress: "登録住所:",
      singaporeAddress: "シンガポールの住所:",
      addressPlaceholder: "通り、ユニット、郵便番号",
      contactNumber: "連絡先番号:",
      contactPlaceholder: "91234567",
      email: "メールアドレス:",
      emailPlaceholder: "you@example.com",
      nationalityCitizenship: "国籍/市民権:",
      nationality: "国籍:",
      nationalityPlaceholder: "例 シンガポール人",
      accountType: "アカウントタイプ:",
      selectOption: "オプションを選択",
      learnMore: "詳細",
      password: "パスワード（ログイン用）:",
      passwordPlaceholder: "安全なパスワードを入力",
      createAccount: "アカウントを作成",
      reset: "リセット",
      footerTerms: "アカウントを作成することにより、OCBCの",
      termsConditions: "利用規約",
      and: "および",
      privacyPolicy: "プライバシーポリシー",
      selectAccountType: "アカウントタイプを選択",
      fillAllFields: "すべての必須フィールドに入力してください",
      validEmail: "有効なメールアドレスを入力してください",
      invalidEmail: "無効なメール",
      validPhone:
        "有効なシンガポールの電話番号を入力してください（8桁、8または9で始まる）",
      validPhoneIntl: "有効な電話番号を入力してください",
      validNationality: "有効な国籍を入力してください（文字とスペースのみ）",
      nricRequired: "ローカルアカウントにはNRICが必要です",
      validNRIC: "有効なNRICを入力してください（例：S1234567A)",
      invalidNRIC: "無効なNRIC",
      dobPast: "生年月日は過去でなければなりません",
      invalidDate: "無効な日付",
      ageRequirement: "このアカウントタイプの要件を満たしていません。最小年齢:",
      ageRequirementMax:
        "このアカウントタイプの要件を満たしていません。最大年齢:",
      ageNotMet: "年齢要件が満たされていません",
      years: "歳",
      selectValidAccount:
        "有効なアカウントタイプを選択してください。'オプションを選択' は許可されていません",
      validationError: "検証エラー",
      passwordShort: "パスワードは8文字以上である必要があります",
      passwordTooShort: "パスワードが短すぎます",
      passwordInvalid:
        "パスワードには少なくとも1つの文字と1つの数字が含まれている必要があります。特殊文字は使用できません。",
      invalidPassword: "無効なパスワード",
      existingAccountFound: "既存のアカウントが見つかりました",
      existingAccountMessage: "このメールには既に次のアカウントがあります:",
      addAnotherAccount: "同じメールで別のアカウントを追加しますか？",
      cancel: "キャンセル",
      continue: "続ける",
      accountCancelled:
        "アカウント作成がキャンセルされました。別のメールを使用するか、既存のアカウントでログインしてください",
      detailsNotMatch: "次の詳細が既存のアカウントと一致しません:",
      ensureMatch:
        "すべての個人情報が既存のアカウントと一致することを確認してください",
      success: "成功",
      accountCreated: "アカウントが正常に作成されました！",
      accountNumber: "アカウント番号:",
      debitCardNumber: "デビットカード番号:",
      creditCardNumber: "クレジットカード番号:",
      ok: "OK",
    },
    ko: {
      createAccountWith: "계정 생성",
      or: "또는",
      personalInfo: "개인 정보",
      localForeign: "현지/외국 고객:",
      local: "현지",
      foreign: "외국",
      fullName: "전체 이름:",
      fullNamePlaceholder: "전체 이름 입력",
      nric: "NRIC:",
      nricPlaceholder: "S1234567A",
      dob: "생년월일:",
      dobPlaceholder: "날짜 선택",
      registeredAddress: "등록 주소:",
      singaporeAddress: "싱가포르 주소:",
      addressPlaceholder: "거리, 유닛, 우편번호",
      contactNumber: "연락처:",
      contactPlaceholder: "91234567",
      email: "이메일 주소:",
      emailPlaceholder: "you@example.com",
      nationalityCitizenship: "국적/시민권:",
      nationality: "국적:",
      nationalityPlaceholder: "예: 싱가포르인",
      accountType: "계정 유형:",
      selectOption: "옵션 선택",
      learnMore: "더 알아보기",
      password: "비밀번호(로그인용):",
      passwordPlaceholder: "안전한 비밀번호 입력",
      createAccount: "계정 생성",
      reset: "재설정",
      footerTerms: "계정을 생성하면 OCBC의",
      termsConditions: "이용 약관",
      and: "및",
      privacyPolicy: "개인정보 보호정책",
      selectAccountType: "계정 유형 선택",
      fillAllFields: "필수 입력란을 모두 작성하세요",
      validEmail: "유효한 이메일 주소를 입력하세요",
      invalidEmail: "잘못된 이메일",
      validPhone:
        "유효한 싱가포르 전화번호를 입력하세요(8자리, 8 또는 9로 시작)",
      validPhoneIntl: "유효한 전화번호를 입력하세요",
      validNationality: "유효한 국적을 입력하세요(문자와 공백만)",
      nricRequired: "로컬 계정에는 NRIC가 필요합니다",
      validNRIC: "유효한 NRIC를 입력하세요(예: S1234567A)",
      invalidNRIC: "잘못된 NRIC",
      dobPast: "생년월일은 과거여야 합니다",
      invalidDate: "잘못된 날짜",
      ageRequirement:
        "귀하의 연령이 이 계정 유형의 요구 사항을 충족하지 않습니다. 최소 연령:",
      ageRequirementMax:
        "귀하의 연령이 이 계정 유형의 요구 사항을 충족하지 않습니다. 최대 연령:",
      ageNotMet: "연령 요구 사항 미충족",
      years: "세",
      selectValidAccount:
        "유효한 계정 유형을 선택하세요. '옵션 선택'은 허용되지 않습니다",
      validationError: "검증 오류",
      passwordShort: "비밀번호는 최소 8자 이상이어야 합니다",
      passwordTooShort: "비밀번호가 너무 짧습니다",
      passwordInvalid:
        "비밀번호는 최소한 하나의 문자와 하나의 숫자를 포함해야 합니다. 특수 문자는 허용되지 않습니다.",
      invalidPassword: "잘못된 비밀번호",
      existingAccountFound: "기존 계정 발견",
      existingAccountMessage: "이 이메일에는 이미 다음 계정이 있습니다:",
      addAnotherAccount: "같은 이메일로 다른 계정을 추가하시겠습니까?",
      cancel: "취소",
      continue: "계속",
      accountCancelled:
        "계정 생성이 취소되었습니다. 다른 이메일을 사용하거나 기존 계정으로 로그인하세요",
      detailsNotMatch: "다음 세부 정보가 기존 계정과 일치하지 않습니다:",
      ensureMatch: "모든 개인 정보가 기존 계정과 일치하는지 확인하세요",
      success: "성공",
      accountCreated: "계정이 성공적으로 생성되었습니다!",
      accountNumber: "계정 번호:",
      debitCardNumber: "직불 카드 번호:",
      creditCardNumber: "신용 카드 번호:",
      ok: "확인",
    },
    es: {
      createAccountWith: "Crear una cuenta con",
      or: "o",
      personalInfo: "Información personal",
      localForeign: "Cliente local/extranjero:",
      local: "Local",
      foreign: "Extranjero",
      fullName: "Nombre completo:",
      fullNamePlaceholder: "Ingrese el nombre completo",
      nric: "NRIC:",
      nricPlaceholder: "S1234567A",
      dob: "Fecha de nacimiento:",
      dobPlaceholder: "Seleccione la fecha",
      registeredAddress: "Dirección registrada:",
      singaporeAddress: "Dirección de Singapur:",
      addressPlaceholder: "Calle, unidad, código postal",
      contactNumber: "Número de contacto:",
      contactPlaceholder: "91234567",
      email: "Dirección de correo electrónico:",
      emailPlaceholder: "tu@ejemplo.com",
      nationalityCitizenship: "Nacionalidad/Ciudadanía:",
      nationality: "Nacionalidad:",
      nationalityPlaceholder: "ex. Singapourien",
      accountType: "Tipo de cuenta:",
      selectOption: "Seleccione una opción",
      learnMore: "Más información",
      password: "Contraseña (para iniciar sesión):",
      passwordPlaceholder: "Ingrese una contraseña segura",
      createAccount: "Crear cuenta",
      reset: "Restablecer",
      footerTerms: "Al crear una cuenta, acepta los",
      termsConditions: "términos y condiciones",
      and: "y la",
      privacyPolicy: "política de privacidad",
      selectAccountType: "Seleccionar tipo de cuenta",
      fillAllFields: "Veuillez remplir tous les champs obligatoires",
      validEmail: "Veuillez entrer une adresse e-mail valide",
      invalidEmail: "E-mail non valide",
      validPhone:
        "Veuillez entrer un numéro de téléphone de Singapour valide (8 chiffres, commence par 8 ou 9)",
      validPhoneIntl: "Veuillez entrer un numéro de téléphone valide",
      validNationality:
        "Veuillez entrer une nationalité valide (lettres et espaces uniquement)",
      nricRequired: "NRIC requis pour les comptes locaux",
      validNRIC: "Veuillez entrer un NRIC valide (ex., S1234567A)",
      invalidNRIC: "NRIC non valide",
      dobPast: "La date de naissance doit être dans le passé",
      invalidDate: "Date non valide",
      ageRequirement:
        "Votre âge ne répond pas aux exigences pour ce type de compte. Edad mínima:",
      ageRequirementMax:
        "Votre âge ne répond pas aux exigences pour ce type de compte. Edad máxima:",
      ageNotMet: "Exigence d'âge non satisfaite",
      years: "ans",
      selectValidAccount:
        "Veuillez sélectionner un type de compte valide. 'Sélectionnez une option' n'est pas autorisé",
      validationError: "Erreur de validation",
      passwordShort: "Le mot de passe doit contenir au moins 8 caractères",
      passwordTooShort: "Mot de passe trop court",
      passwordInvalid:
        "Le mot de passe doit contenir au moins une lettre et un chiffre. Les caractères spéciaux ne sont pas autorisés.",
      invalidPassword: "Mot de passe non valide",
      existingAccountFound: "Compte existant trouvé",
      existingAccountMessage: "Cet e-mail a déjà les comptes suivants:",
      addAnotherAccount:
        "Voulez-vous ajouter un autre compte avec le même e-mail?",
      cancel: "Annuler",
      continue: "Continuer",
      accountCancelled:
        "Création de compte annulée. Veuillez utiliser un e-mail différent ou vous connecter avec votre compte existant",
      detailsNotMatch:
        "Les détails suivants ne correspondent pas à votre compte existant:",
      ensureMatch:
        "Veuillez vous assurer que toutes les informations personnelles correspondent à votre compte existant",
      success: "Succès",
      accountCreated: "Compte créé avec succès!",
      accountNumber: "Numéro de compte:",
      debitCardNumber: "Número de tarjeta de débito:",
      creditCardNumber: "Número de tarjeta de crédito:",
      ok: "OK",
    },
    fr: {
      createAccountWith: "Créer un compte avec",
      or: "ou",
      personalInfo: "Informations personnelles",
      localForeign: "Client local/étranger:",
      local: "Local",
      foreign: "Étranger",
      fullName: "Nom complet:",
      fullNamePlaceholder: "Entrez le nom complet",
      nric: "NRIC:",
      nricPlaceholder: "S1234567A",
      dob: "Date de naissance:",
      dobPlaceholder: "Sélectionnez la date",
      registeredAddress: "Adresse enregistrée:",
      singaporeAddress: "Adresse à Singapour:",
      addressPlaceholder: "Rue, unité, code postal",
      contactNumber: "Numéro de contact:",
      contactPlaceholder: "91234567",
      email: "Adresse e-mail:",
      emailPlaceholder: "vous@exemple.com",
      nationalityCitizenship: "Nationalité/Citoyenneté:",
      nationality: "Nationalité:",
      nationalityPlaceholder: "ex. Singapourien",
      accountType: "Type de compte:",
      selectOption: "Sélectionnez une option",
      learnMore: "En savoir plus",
      password: "Mot de passe (pour se connecter):",
      passwordPlaceholder: "Entrez un mot de passe sécurisé",
      createAccount: "Créer un compte",
      reset: "Réinitialiser",
      footerTerms: "En créant un compte, vous acceptez les",
      termsConditions: "termes et conditions",
      and: "et la",
      privacyPolicy: "politique de confidentialité",
      selectAccountType: "Sélectionner le type de compte",
      fillAllFields: "Veuillez remplir tous les champs obligatoires",
      validEmail: "Veuillez entrer une adresse e-mail valide",
      invalidEmail: "E-mail non valide",
      validPhone:
        "Veuillez entrer un numéro de téléphone de Singapour valide (8 chiffres, commence par 8 ou 9)",
      validPhoneIntl: "Veuillez entrer un numéro de téléphone valide",
      validNationality:
        "Veuillez entrer une nationalité valide (lettres et espaces uniquement)",
      nricRequired: "NRIC requis pour les comptes locaux",
      validNRIC: "Veuillez entrer un NRIC valide (ex., S1234567A)",
      invalidNRIC: "NRIC non valide",
      dobPast: "La date de naissance doit être dans le passé",
      invalidDate: "Date non valide",
      ageRequirement:
        "Votre âge ne répond pas aux exigences pour ce type de compte. Âge minimum:",
      ageRequirementMax:
        "Votre âge ne répond pas aux exigences pour ce type de compte. Âge maximum:",
      ageNotMet: "Exigence d'âge non satisfaite",
      years: "ans",
      selectValidAccount:
        "Veuillez sélectionner un type de compte valide. 'Sélectionnez une option' n'est pas autorisé",
      validationError: "Erreur de validation",
      passwordShort: "Le mot de passe doit contenir au moins 8 caractères",
      passwordTooShort: "Mot de passe trop court",
      passwordInvalid:
        "Le mot de passe doit contenir au moins une lettre et un chiffre. Les caractères spéciaux ne sont pas autorisés.",
      invalidPassword: "Mot de passe non valide",
      existingAccountFound: "Compte existant trouvé",
      existingAccountMessage: "Cet e-mail a déjà les comptes suivants:",
      addAnotherAccount:
        "Voulez-vous ajouter un autre compte avec le même e-mail?",
      cancel: "Annuler",
      continue: "Continuer",
      accountCancelled:
        "Création de compte annulée. Veuillez utiliser un e-mail différent ou vous connecter avec votre compte existant",
      detailsNotMatch:
        "Les détails suivants ne correspondent pas à votre compte existant:",
      ensureMatch:
        "Veuillez vous assurer que toutes les informations personnelles correspondent à votre compte existant",
      success: "Succès",
      accountCreated: "Compte créé avec succès!",
      accountNumber: "Numéro de compte:",
      debitCardNumber: "Numéro de carte de débit:",
      creditCardNumber: "Numéro de carte de crédit:",
      ok: "OK",
    },
    de: {
      createAccountWith: "Konto erstellen mit",
      or: "oder",
      personalInfo: "Persönliche Informationen",
      localForeign: "Lokaler/Ausländischer Kunde:",
      local: "Lokal",
      foreign: "Ausländisch",
      fullName: "Vollständiger Name:",
      fullNamePlaceholder: "Vollständigen Namen eingeben",
      nric: "NRIC:",
      nricPlaceholder: "S1234567A",
      dob: "Geburtsdatum:",
      dobPlaceholder: "Datum auswählen",
      registeredAddress: "Registrierte Adresse:",
      singaporeAddress: "Singapur-Adresse:",
      addressPlaceholder: "Straße, Einheit, Postleitzahl",
      contactNumber: "Kontaktnummer:",
      contactPlaceholder: "91234567",
      email: "E-Mail-Adresse:",
      emailPlaceholder: "sie@beispiel.com",
      nationalityCitizenship: "Nationalität/Staatsbürgerschaft:",
      nationality: "Nationalität:",
      nationalityPlaceholder: "z.B. Singapurisch",
      accountType: "Kontotyp:",
      selectOption: "Option auswählen",
      learnMore: "Mehr erfahren",
      password: "Passwort (zum Anmelden):",
      passwordPlaceholder: "Sicheres Passwort eingeben",
      createAccount: "Konto erstellen",
      reset: "Zurücksetzen",
      footerTerms: "Durch Erstellen eines Kontos stimmen Sie den",
      termsConditions: "Nutzungsbedingungen",
      and: "und der",
      privacyPolicy: "Datenschutzrichtlinie",
      selectAccountType: "Kontotyp auswählen",
      fillAllFields: "Bitte füllen Sie alle Pflichtfelder aus",
      validEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      invalidEmail: "Ungültige E-Mail",
      validPhone:
        "Bitte geben Sie eine gültige Singapur-Telefonnummer ein (8 Ziffern, beginnt mit 8 oder 9)",
      validPhoneIntl: "Bitte geben Sie eine gültige Telefonnummer ein",
      validNationality:
        "Bitte geben Sie eine gültige Nationalität ein (nur Buchstaben und Leerzeichen)",
      nricRequired: "NRIC ist für lokale Konten erforderlich",
      validNRIC: "Bitte geben Sie eine gültige NRIC ein (z.B. S1234567A)",
      invalidNRIC: "Ungültige NRIC",
      dobPast: "Das Geburtsdatum muss in der Vergangenheit liegen",
      invalidDate: "Ungültiges Datum",
      ageRequirement:
        "Ihr Alter erfüllt nicht die Anforderungen für diesen Kontotyp. Mindestalter:",
      ageRequirementMax:
        "Ihr Alter erfüllt nicht die Anforderungen für diesen Kontotyp. Höchstalter:",
      ageNotMet: "Altersanforderung nicht erfüllt",
      years: "Jahre",
      selectValidAccount:
        "Bitte wählen Sie einen gültigen Kontotyp aus. 'Option auswählen' ist nicht zulässig",
      validationError: "Validierungsfehler",
      passwordShort: "Das Passwort muss mindestens 8 Zeichen lang sein",
      passwordTooShort: "Passwort zu kurz",
      passwordInvalid:
        "Das Passwort muss mindestens einen Buchstaben und eine Zahl enthalten. Sonderzeichen sind nicht erlaubt.",
      invalidPassword: "Ungültiges Passwort",
      existingAccountFound: "Bestehendes Konto gefunden",
      existingAccountMessage: "Diese E-Mail hat bereits folgende Konten:",
      addAnotherAccount:
        "Möchten Sie ein weiteres Konto mit derselben E-Mail hinzufügen?",
      cancel: "Abbrechen",
      continue: "Fortfahren",
      accountCancelled:
        "Kontoerstellung abgebrochen. Bitte verwenden Sie eine andere E-Mail oder melden Sie sich mit Ihrem bestehenden Konto an",
      detailsNotMatch:
        "Die folgenden Details stimmen nicht mit Ihrem bestehenden Konto überein:",
      ensureMatch:
        "Bitte stellen Sie sicher, dass alle persönlichen Daten mit Ihrem bestehenden Konto übereinstimmen",
      success: "Erfolg",
      accountCreated: "Konto erfolgreich erstellt!",
      accountNumber: "Kontonummer:",
      debitCardNumber: "Debitkartennummer:",
      creditCardNumber: "Kreditkartennummer:",
      ok: "OK",
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

  const handleDateChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      setDob(selectedDate);
    }
    setShowDatePicker(false);
  };

  // Helper function to generate random digits
  const generateRandomDigits = (length: number): string => {
    let result = "";
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
  const generateUniqueAccountNumber = async (
    residency: string,
  ): Promise<string> => {
    let isUnique = false;
    let accountNo = "";

    while (!isUnique) {
      // Generate account number: Bank code (3) + Branch (3) + Account (6)
      accountNo = "734" + generateRandomDigits(3) + generateRandomDigits(6);

      // Check if account number already exists
      const tableName =
        residency === "local" ? "Localaccounts" : "Foreignaccounts";
      const { data, error } = await supabase
        .from(tableName)
        .select("accountNo")
        .eq("accountNo", accountNo);

      if (error) {
        console.error("Error checking account number uniqueness:", error);
        isUnique = true;
      } else if (data.length === 0) {
        isUnique = true;
      }
    }

    return accountNo;
  };

  // Generate unique debit card number (for ALL accounts)
  const generateUniqueDebitCardNumber = async (
    residency: string,
  ): Promise<string> => {
    let isUnique = false;
    let debitCardNo = "";

    while (!isUnique) {
      // Generate 16-digit debit card number starting with 4321 (Visa debit format)
      debitCardNo = "4321" + generateRandomDigits(12);

      // Check if debit card number already exists
      const tableName =
        residency === "local" ? "Localaccounts" : "Foreignaccounts";
      const { data, error } = await supabase
        .from(tableName)
        .select("debitCardNo")
        .eq("debitCardNo", debitCardNo);

      if (error) {
        console.error("Error checking debit card number uniqueness:", error);
        isUnique = true;
      } else if (data.length === 0) {
        isUnique = true;
      }
    }

    return debitCardNo;
  };

  // Generate unique credit card number (for credit card accounts only)
  const generateUniqueCreditCardNumber = async (
    residency: string,
  ): Promise<string> => {
    let isUnique = false;
    let creditCardNo = "";

    while (!isUnique) {
      // Generate 16-digit credit card number starting with 5555 (Mastercard)
      creditCardNo = "5555" + generateRandomDigits(12);

      // Check if credit card number already exists
      const tableName =
        residency === "local" ? "Localaccounts" : "Foreignaccounts";
      const { data, error } = await supabase
        .from(tableName)
        .select("creditCardNo")
        .eq("creditCardNo", creditCardNo);

      if (error) {
        console.error("Error checking credit card number uniqueness:", error);
        isUnique = true;
      } else if (data.length === 0) {
        isUnique = true;
      }
    }

    return creditCardNo;
  };

  // Format card numbers with dashes
  const formatCardNumber = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/[-\s]/g, "");
    return cleanNumber.replace(/(\d{4})/g, "$1-").slice(0, -1);
  };

  const getAccountTypeOptions = () => {
    return residency === "local"
      ? [
          { label: t.selectOption, value: "" },
          {
            label: "360 Account + OCBC 365 Credit Card",
            value: "360 Account + OCBC 365 Credit Card",
          },
          { label: "360 Account", value: "360 Account" },
          {
            label: "Statement Savings Account",
            value: "Statement Savings Account",
          },
          { label: "Bonus+ Savings", value: "Bonus+ Savings" },
          {
            label: "Monthly Savings Account",
            value: "Monthly Savings Account",
          },
          {
            label:
              "OCBC Child Development Account (CDA) and Child Savings Account (CSA)",
            value:
              "OCBC Child Development Account (CDA) and Child Savings Account (CSA)",
          },
          { label: "OCBC MyOwn Account", value: "OCBC MyOwn Account" },
        ]
      : [
          { label: t.selectOption, value: "" },
          {
            label: "Personal Banking - live, work, or study in Singapore",
            value: "Personal Banking - live, work, or study in Singapore",
          },
          {
            label: "Premier Banking - Exclusive Wealth Privileges",
            value: "Premier Banking - Exclusive Wealth Privileges",
          },
        ];
  };

  const getAccountTypeLabel = () => {
    const options = getAccountTypeOptions();
    const selected = options.find((opt) => opt.value === accountType);
    return selected?.label || t.selectOption;
  };

  const handleSignup = async () => {
    try {
      // Basic required fields validation
      if (!fullName || !email || !password || !nationality || !accountType) {
        const error = t.fillAllFields;
        setErrorMessage(error);
        Alert.alert(t.validationError, error);
        return;
      }

      // Email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        const error = t.validEmail;
        setErrorMessage(error);
        Alert.alert(t.invalidEmail, error);
        return;
      }

      // Phone validation
      let formattedPhone = phone.replace(/\s+/g, ""); // Remove all spaces
      if (residency === "local") {
        // Singapore: 8 digits, starts with 8 or 9
        const phonePattern = /^(8|9)\d{7}$/;
        if (!phonePattern.test(formattedPhone)) {
          const error = t.validPhone;
          setErrorMessage(error);
          Alert.alert(t.validationError, error);
          return;
        }
        // Add +65 if not already present
        if (!formattedPhone.startsWith("+65")) {
          formattedPhone = "+65" + formattedPhone;
        }
      } else {
        const intlPhonePattern = /^\+?[0-9\s\-()]{7,20}$/;
        if (!intlPhonePattern.test(formattedPhone)) {
          setErrorMessage(t.validPhoneIntl);
          Alert.alert(t.validationError, t.validPhoneIntl);
          return;
        }
      }

      // Nationality validation (letters and spaces only)
      const nationalityPattern = /^[A-Za-z\s]+$/;
      if (!nationalityPattern.test(nationality)) {
        setErrorMessage(t.validNationality);
        Alert.alert(t.validationError, t.validNationality);
        return;
      }

      // NRIC validation (for local accounts, REQUIRED)
      if (residency === "local") {
        if (!nric || nric.trim() === "") {
          setErrorMessage(t.nricRequired);
          Alert.alert(t.validationError, t.nricRequired);
          return;
        }

        const nricPattern = /^[STMFG]\d{7}[A-Z]$/i;
        if (!nricPattern.test(nric)) {
          setErrorMessage(t.validNRIC);
          Alert.alert(t.invalidNRIC, t.validNRIC);
          return;
        }
      }

      // Date of Birth and Age validation
      const dobDate = new Date(dob);
      const today = new Date();
      if (dobDate >= today) {
        setErrorMessage(t.dobPast);
        Alert.alert(t.invalidDate, t.dobPast);
        return;
      }

      // Calculate age more accurately
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dobDate.getDate())
      ) {
        age--;
      }

      // Age validation based on account type
      const ageRange = accountTypeAgeRanges[accountType];
      if (ageRange) {
        if (age < ageRange.min) {
          const error = `${t.ageRequirement} ${ageRange.min} ${t.years}`;
          setErrorMessage(error);
          Alert.alert(t.ageNotMet, error);
          return;
        }
        if (ageRange.max !== null && age > ageRange.max) {
          const error = `${t.ageRequirementMax} ${ageRange.max} ${t.years}`;
          setErrorMessage(error);
          Alert.alert(t.ageNotMet, error);
          return;
        }
      }

      // Account type validation
      if (!accountType || accountType === "") {
        const error = t.selectValidAccount;
        setErrorMessage(error);
        Alert.alert(t.validationError, error);
        return;
      }

      // Password validation
      if (password.length < 8) {
        const error = t.passwordShort;
        setErrorMessage(error);
        Alert.alert(t.passwordTooShort, error);
        return;
      }
      // Updated password pattern: Only letters and numbers, no special characters
      const passwordPattern = /^[A-Za-z0-9]{8,}$/;
      if (!passwordPattern.test(password)) {
        const error = t.passwordInvalid;
        setErrorMessage(error);
        Alert.alert(t.invalidPassword, error);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      console.log("Creating account with:", {
        fullName,
        email,
        residency,
        accountType,
      });

      // Check if email already has accounts in the database
      const localCheck = await supabase
        .from("Localaccounts")
        .select("*")
        .eq("emailAddress", email);

      const foreignCheck = await supabase
        .from("Foreignaccounts")
        .select("*")
        .eq("emailAddress", email);

      let existingAccounts: string[] = [];
      let existingUserData: any = null;

      if (localCheck.data && localCheck.data.length > 0) {
        existingAccounts = existingAccounts.concat(
          localCheck.data.map((acc: any) => acc.accountType),
        );
        existingUserData = localCheck.data[0];
      }
      if (foreignCheck.data && foreignCheck.data.length > 0) {
        existingAccounts = existingAccounts.concat(
          foreignCheck.data.map((acc: any) => acc.accountType),
        );
        if (!existingUserData) {
          existingUserData = foreignCheck.data[0];
        }
      }

      // Handle existing accounts
      if (existingAccounts.length > 0) {
        const accountsList = existingAccounts.join(", ");

        // Show alert asking if they want to add another account
        Alert.alert(
          t.existingAccountFound,
          `${t.existingAccountMessage} ${accountsList}.\n\n${t.addAnotherAccount}`,
          [
            {
              text: t.cancel,
              onPress: () => {
                setLoading(false);
                setErrorMessage(t.accountCancelled);
              },
              style: "cancel",
            },
            {
              text: t.continue,
              onPress: async () => {
                // Validate that key details match existing accounts
                const detailsMatch = validateExistingDetails(existingUserData, {
                  name: fullName,
                  contactNo: formattedPhone,
                  address: address,
                  dateOfBirth: dob.toISOString().split("T")[0],
                  nationality: nationality,
                  nric: nric,
                });

                if (!detailsMatch.isValid) {
                  setLoading(false);
                  setErrorMessage(
                    `${t.detailsNotMatch}\n${detailsMatch.errors.join("\n")}\n\n${t.ensureMatch}`,
                  );
                  return;
                }

                // Continue with account creation
                await createAccount(formattedPhone, true, existingUserData);
              },
            },
          ],
        );
        return;
      }

      // No existing account, proceed with normal signup
      await createAccount(formattedPhone, false, null);
    } catch (error) {
      setLoading(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Signup failed. Please try again.",
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
        errors.push(
          `• Name: Expected "${existingData.name}", but got "${newData.name}"`,
        );
      }
    }

    // Check phone number (normalize format)
    if (existingData.contactNo && newData.contactNo) {
      const existingPhone = existingData.contactNo.replace(/\s+/g, "");
      const newPhone = newData.contactNo.replace(/\s+/g, "");
      if (existingPhone !== newPhone) {
        errors.push(
          `• Phone: Expected "${existingData.contactNo}", but got "${newData.contactNo}"`,
        );
      }
    }

    // Check date of birth
    if (existingData.dateOfBirth && newData.dateOfBirth) {
      if (existingData.dateOfBirth !== newData.dateOfBirth) {
        errors.push(
          `• Date of Birth: Expected "${existingData.dateOfBirth}", but got "${newData.dateOfBirth}"`,
        );
      }
    }

    // Check nationality
    if (existingData.nationality && newData.nationality) {
      const existingNat = existingData.nationality.toLowerCase().trim();
      const newNat = newData.nationality.toLowerCase().trim();
      if (existingNat !== newNat) {
        errors.push(
          `• Nationality: Expected "${existingData.nationality}", but got "${newData.nationality}"`,
        );
      }
    }

    // Check NRIC for local accounts
    if (existingData.nric && newData.nric) {
      const existingNric = existingData.nric.toUpperCase().trim();
      const newNric = newData.nric.toUpperCase().trim();
      if (existingNric !== newNric) {
        errors.push(
          `• NRIC: Expected "${existingData.nric}", but got "${newData.nric}"`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  };

  // Function to create account
  const createAccount = async (
    formattedPhone: string,
    isExistingUser: boolean,
    existingUserData: any,
  ) => {
    try {
      // Generate random initial balance between 1000 and 5000 for new accounts
      const balance = (Math.random() * (5000 - 1000) + 1000).toFixed(2);
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
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });

        if (signInError) {
          setLoading(false);
          // More specific error handling for password mismatch
          if (signInError.message === "Invalid login credentials") {
            // Check if they entered the same password as stored in database
            if (existingUserData && existingUserData.password) {
              if (password === existingUserData.password) {
                setErrorMessage(
                  "There seems to be an issue with authentication. The password matches your account but authentication failed. Please try logging in first, then create a new account",
                );
              } else {
                setErrorMessage(
                  "Password mismatch! You previously used a different password for this email. Please use the same password as your existing account",
                );
              }
            } else {
              setErrorMessage(
                "This email is already registered with a different password. Please use the same password as your existing account",
              );
            }
          } else {
            setErrorMessage("Error signing in: " + signInError.message);
          }
          return;
        }

        authUserId = signInData.user?.id;
        console.log("Using existing Auth user:", authUserId);
      } else {
        // New user - create auth account
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: email,
            password: password,
          },
        );

        if (authError) {
          if (authError.message === "User already registered") {
            setLoading(false);
            setErrorMessage(
              "This email is already registered. Please sign in or use a different email",
            );
            return;
          } else {
            setLoading(false);
            setErrorMessage("Error creating account: " + authError.message);
            return;
          }
        }

        // New user created successfully
        authUserId = authData.user?.id;
        console.log("Created new Auth user:", authUserId);

        // For new users, sign them in automatically
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });

        if (signInError) {
          console.error("Error signing in new user:", signInError.message);
          setLoading(false);
          setErrorMessage(
            "Account created but unable to sign in. Please try logging in manually",
          );
          return;
        }
      }

      // Check if account type contains "+"
      const accountTypes = accountType.includes("+")
        ? accountType.split("+").map((type) => type.trim())
        : [accountType];

      const tableName =
        residency === "local" ? "Localaccounts" : "Foreignaccounts";
      const createdAccounts: Array<{
        accountNo: string;
        debitCardNo?: string;
        creditCardNo?: string;
        accountType: string;
      }> = [];

      // Create an account for each type
      for (const singleAccountType of accountTypes) {
        const accountNo = await generateUniqueAccountNumber(residency);
        const accountId = generateNumericAccountId();

        // Check if this is a credit card account
        const isCreditCardAccount = singleAccountType
          .toLowerCase()
          .includes("credit card");

        // Generate debit card number ONLY for non-credit card accounts
        let debitCardNo: string | null = null;
        if (!isCreditCardAccount) {
          debitCardNo = await generateUniqueDebitCardNumber(residency);
        }

        // Generate credit card number ONLY for credit card accounts
        let creditCardNo: string | null = null;
        if (isCreditCardAccount) {
          creditCardNo = await generateUniqueCreditCardNumber(residency);
        }

        const userData: any = {
          accountId: accountId,
          name: fullName,
          password: password,
          dateOfBirth: dob.toISOString().split("T")[0],
          address: address,
          contactNo: formattedPhone,
          emailAddress: email,
          nationality: nationality,
          accountType: singleAccountType,
          balance: balance,
          accountNo: accountNo,
        };

        // Add debit card number if generated
        if (debitCardNo) {
          userData.debitCardNo = debitCardNo;
        }

        // Add credit card number if generated
        if (creditCardNo) {
          userData.creditCardNo = creditCardNo;
        }

        // Add NRIC for local accounts
        if (residency === "local") {
          userData.nric = nric;
        }

        console.log(
          "Inserting into table:",
          tableName,
          "Account Type:",
          singleAccountType,
        );

        const { data: dbData, error: dbError } = await supabase
          .from(tableName)
          .insert([userData]);

        if (dbError) {
          console.error("Error saving user data:", dbError.message);
          setLoading(false);
          setErrorMessage("Error saving user data: " + dbError.message);
          return;
        }

        console.log("User data saved successfully:", dbData);

        // Store created account details
        createdAccounts.push({
          accountNo,
          debitCardNo: debitCardNo || undefined,
          creditCardNo: creditCardNo || undefined,
          accountType: singleAccountType,
        });
      }

      setLoading(false);

      // Show success message with all created account details
      let successMessage = `${t.accountCreated}\n\n`;

      createdAccounts.forEach((account, index) => {
        successMessage += `Account ${index + 1}: ${account.accountType}\n`;
        successMessage += `${t.accountNumber} ${account.accountNo}\n`;
        if (account.debitCardNo) {
          successMessage += `${t.debitCardNumber} ${formatCardNumber(account.debitCardNo)}`;
        }
        if (account.creditCardNo) {
          successMessage += `${t.creditCardNumber} ${formatCardNumber(account.creditCardNo)}`;
        }
        if (index < createdAccounts.length - 1) {
          successMessage += "\n\n";
        }
      });

      Alert.alert(t.success, successMessage, [
        {
          text: t.ok,
          onPress: () => router.replace("/homepage"),
        },
      ]);
    } catch (error) {
      setLoading(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again.",
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSingpassSignup = async () => {
    try {
      const singpassUrl = "https://www.singpass.gov.sg";
      const canOpen = await Linking.canOpenURL(singpassUrl);
      if (canOpen) {
        await Linking.openURL(singpassUrl);
      } else {
        Alert.alert("Error", "Unable to open Singpass website");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open Singpass website");
    }
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
            // bounces={true}
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

                {/* Title */}
                <Text style={styles.title}>{t.createAccountWith}</Text>

                {/* Singpass Button */}
                <TouchableOpacity
                  style={styles.singpassButton}
                  onPress={handleSingpassSignup}
                >
                  <Image
                    source={require("../assets/images/singpass.png")}
                    style={styles.singpassIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* Or Separator */}
                <Text style={styles.orSeparator}>{t.or}</Text>

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
                <Text style={styles.mainTitle}>{t.personalInfo}</Text>

                {/* Residency Selection */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t.localForeign}</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setResidency("local")}
                    >
                      <View
                        style={[
                          styles.radio,
                          residency === "local" && styles.radioSelected,
                        ]}
                      >
                        {residency === "local" && (
                          <View style={styles.radioDot} />
                        )}
                      </View>
                      <Text style={styles.radioLabel}>{t.local}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.radioOption}
                      onPress={() => setResidency("foreign")}
                    >
                      <View
                        style={[
                          styles.radio,
                          residency === "foreign" && styles.radioSelected,
                        ]}
                      >
                        {residency === "foreign" && (
                          <View style={styles.radioDot} />
                        )}
                      </View>
                      <Text style={styles.radioLabel}>{t.foreign}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Full Name */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t.fullName}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t.fullNamePlaceholder}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                </View>

                {/* NRIC (Only for local customers) */}
                {residency === "local" && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{t.nric}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t.nricPlaceholder}
                      value={nric}
                      onChangeText={setNric}
                      placeholderTextColor="#999"
                      editable={!loading}
                    />
                  </View>
                )}

                {/* Date of Birth */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t.dob}</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={{ color: dob ? "#333" : "#999" }}>
                      {dob ? dob.toLocaleDateString() : t.dobPlaceholder}
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
                    {residency === "foreign"
                      ? t.singaporeAddress
                      : t.registeredAddress}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    placeholder={t.addressPlaceholder}
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
                  <Text style={styles.label}>{t.contactNumber}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t.contactPlaceholder}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                </View>

                {/* Email */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t.email}</Text>
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

                {/* Nationality */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {residency === "foreign"
                      ? t.nationality
                      : t.nationalityCitizenship}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t.nationalityPlaceholder}
                    value={nationality}
                    onChangeText={setNationality}
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                </View>

                {/* Account Type Section */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t.accountType}</Text>
                  <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setShowAccountTypePicker(true)}
                    disabled={loading}
                  >
                    <View style={styles.selectInputContent}>
                      <Text
                        style={{
                          color: accountType ? "#333" : "#999",
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
                  <Text style={styles.learnMore}>{t.learnMore}</Text>
                </TouchableOpacity>

                {/* Password Field (appears after account type selection) */}
                {accountType && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{t.password}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t.passwordPlaceholder}
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
                    style={[
                      styles.button,
                      styles.submitButton,
                      loading && styles.buttonDisabled,
                    ]}
                    onPress={handleSignup}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>{t.createAccount}</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.resetButton]}
                    onPress={() => {
                      setFullName("");
                      setEmail("");
                      setPassword("");
                      setPhone("");
                      setAddress("");
                      setNric("");
                      setNationality("");
                      setAccountType("");
                      setErrorMessage("");
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.resetButtonText}>{t.reset}</Text>
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    {t.footerTerms}{" "}
                    <Text
                      style={styles.footerLink}
                      onPress={() => {
                        /* Navigate to terms */
                      }}
                    >
                      {t.termsConditions}
                    </Text>{" "}
                    {t.and}{" "}
                    <Text
                      style={styles.footerLink}
                      onPress={() => {
                        /* Navigate to privacy policy */
                      }}
                    >
                      {t.privacyPolicy}
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
                  <Text style={styles.modalTitle}>{t.selectAccountType}</Text>
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
                          accountType === item.value &&
                            styles.optionTextSelected,
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
    paddingBottom: 80,
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
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
    width: 320,
    height: 72,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  singpassButton: {
    borderWidth: 2,
    borderColor: "#da291c",
    backgroundColor: "#fff",
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  singpassIcon: {
    height: 16,
    width: 80,
  },
  orSeparator: {
    textAlign: "center",
    color: "#666",
    fontWeight: "600",
    marginVertical: 12,
  },
  alert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderColor: "#dc2626",
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    marginTop: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    lineHeight: 20,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 22,
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 10,
  },
  label: {
    fontWeight: "700",
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    textAlign: "left",
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
  textarea: {
    minHeight: 60,
    height: "auto",
    paddingTop: 8,
    textAlignVertical: "top",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#da291c",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#da291c",
  },
  radioLabel: {
    fontSize: 14,
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  selectInput: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    backgroundColor: "#fff",
    justifyContent: "center",
    minHeight: 42,
  },
  selectInputContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionItemSelected: {
    backgroundColor: "#f5f5f5",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: "#da291c",
  },
  learnMoreContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  learnMore: {
    color: "#0c83bf",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#da291c",
  },
  resetButton: {
    backgroundColor: "rgba(255, 255, 255, 0.69)",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  resetButtonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  footerText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  footerLink: {
    color: "#0c83bf",
    textDecorationLine: "underline",
  },
});

export default Signup;
