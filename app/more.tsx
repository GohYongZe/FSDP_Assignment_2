import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface MoreProps {
  navigation?: any;
}

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  category: string;
  route?: string;
  action?: () => void;
}

const More = ({ navigation }: MoreProps) => {
  const router = useRouter();

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      if (savedLang) {
        setSelectedLanguage(savedLang);
      }
    } catch (error) {
      console.log('Error loading language:', error);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  const translations: Record<string, any> = {
    en: {
      more: 'More',
      logout: 'Logout',
      searchPlaceholder: 'Search for services...',
      apply: 'Apply',
      cardServices: 'Card Services',
      linkedServices: 'Linked Services',
      settings: 'Settings',
      helpSupport: 'Help & Support',
      viewMore: 'View More',
      comingSoon: 'Coming Soon',
      featureAvailable: 'feature will be available soon.',
      home: 'Home',
      payTransfer: 'Pay & Transfer',
      selectLanguage: 'Select Language',
      languageChanged: 'Language Changed',
      languageSwitched: 'Language switched to',
      accounts: 'Accounts',
      cards: 'Cards',
      reportLostCard: 'Report lost card',
      resetCardPIN: 'Reset card PIN',
      lockUnlockCard: 'Lock/Unlock card',
      replaceCard: 'Replace card',
      linkedAccounts: 'Linked Accounts',
      linkedCards: 'Linked Cards',
      payNow: 'PayNow',
      changeLanguage: 'Change Language',
      notifications: 'Notifications',
      security: 'Security & Privacy',
      enableEyeTracker: 'Enable Eye Tracker',
      contactBank: 'Contact Bank',
      faqs: 'FAQs',
      guidedTutorials: 'Guided Tutorials',
      moneyLock: 'Money Lock',
      chequeServices: 'Cheque Services',
      accountsCategory: 'Accounts',
      viewStatements: 'View Statements',
      documents: 'Documents',
      transferMoney: 'Transfer Money',
      paymentsTransfers: 'Payments & Transfers',
      topUpPrepaid: 'Top Up Prepaid Card',
      qrCashWithdrawal: 'QR Cash Withdrawal',
      updatePersonalDetails: 'Update Personal Details',
      changePassword: 'Change Password',
      manageLoginToken: 'Manage Login & Token',
      textSizeDisplay: 'Text Size & Display',
      noResultsFound: 'No results found',
      tryDifferentKeywords: 'Try searching for different keywords',
    },
    zh: {
      more: '更多',
      logout: '登出',
      searchPlaceholder: '搜索服务...',
      apply: '申请',
      cardServices: '卡片服务',
      linkedServices: '链接服务',
      settings: '设置',
      helpSupport: '帮助与支持',
      viewMore: '查看更多',
      comingSoon: '即将推出',
      featureAvailable: '功能即将推出。',
      home: '首页',
      payTransfer: '支付和转账',
      selectLanguage: '选择语言',
      languageChanged: '语言已更改',
      languageSwitched: '语言已切换至',
      accounts: '账户',
      cards: '卡片',
      reportLostCard: '报失卡片',
      resetCardPIN: '重置卡密码',
      lockUnlockCard: '锁定/解锁卡片',
      replaceCard: '更换卡片',
      linkedAccounts: '关联账户',
      linkedCards: '关联卡片',
      payNow: 'PayNow',
      changeLanguage: '更改语言',
      notifications: '通知',
      security: '安全与隐私',
      enableEyeTracker: '启用眼动追踪',
      contactBank: '联系银行',
      faqs: '常见问题',
      guidedTutorials: '新手教程',
      moneyLock: '资金锁定',
      chequeServices: '支票服务',
      accountsCategory: '账户',
      viewStatements: '查看对账单',
      documents: '文件',
      transferMoney: '转账',
      paymentsTransfers: '支付与转账',
      topUpPrepaid: '充值预付卡',
      qrCashWithdrawal: '二维码取款',
      updatePersonalDetails: '更新个人信息',
      changePassword: '修改密码',
      manageLoginToken: '管理登录与令牌',
      textSizeDisplay: '文本大小和显示',
      noResultsFound: '未找到结果',
      tryDifferentKeywords: '请尝试搜索不同的关键词',
    },
    ms: {
      more: 'Lagi',
      logout: 'Log Keluar',
      searchPlaceholder: 'Cari perkhidmatan...',
      apply: 'Mohon',
      cardServices: 'Perkhidmatan Kad',
      linkedServices: 'Perkhidmatan Terpaut',
      settings: 'Tetapan',
      helpSupport: 'Bantuan & Sokongan',
      viewMore: 'Lihat Lagi',
      comingSoon: 'Akan Datang',
      featureAvailable: 'ciri akan tersedia tidak lama lagi.',
      home: 'Laman Utama',
      payTransfer: 'Bayar & Pindah',
      selectLanguage: 'Pilih Bahasa',
      languageChanged: 'Bahasa Ditukar',
      languageSwitched: 'Bahasa ditukar kepada',
      accounts: 'Akaun',
      cards: 'Kad',
      reportLostCard: 'Laporkan kad hilang',
      resetCardPIN: 'Set semula PIN kad',
      lockUnlockCard: 'Kunci/Buka kad',
      replaceCard: 'Ganti kad',
      linkedAccounts: 'Akaun Terpaut',
      linkedCards: 'Kad Terpaut',
      payNow: 'PayNow',
      changeLanguage: 'Tukar Bahasa',
      notifications: 'Notifikasi',
      security: 'Keselamatan & Privasi',
      enableEyeTracker: 'Aktifkan Penjejak Mata',
      contactBank: 'Hubungi Bank',
      faqs: 'Soalan Lazim',
      guidedTutorials: 'Tutorial Berpandu',
      moneyLock: 'Kunci Wang',
      chequeServices: 'Perkhidmatan Cek',
      accountsCategory: 'Akaun',
      viewStatements: 'Lihat Penyata',
      documents: 'Dokumen',
      transferMoney: 'Pindahkan Wang',
      paymentsTransfers: 'Bayaran & Pemindahan',
      topUpPrepaid: 'Tambah Nilai Kad Prabayar',
      qrCashWithdrawal: 'Pengeluaran Tunai QR',
      updatePersonalDetails: 'Kemas Kini Butiran Peribadi',
      changePassword: 'Tukar Kata Laluan',
      manageLoginToken: 'Urus Log Masuk & Token',
      textSizeDisplay: 'Saiz Teks & Paparan',
      noResultsFound: 'Tiada hasil ditemui',
      tryDifferentKeywords: 'Cuba cari kata kunci yang berbeza',
    },
    ta: {
      more: 'மேலும்',
      logout: 'வெளியேறு',
      searchPlaceholder: 'சேவைகளைத் தேடுங்கள்...',
      apply: 'விண்ணப்பிக்கவும்',
      cardServices: 'அட்டை சேவைகள்',
      linkedServices: 'இணைக்கப்பட்ட சேவைகள்',
      settings: 'அமைப்புகள்',
      helpSupport: 'உதவி & ஆதரவு',
      viewMore: 'மேலும் காண்க',
      comingSoon: 'விரைவில்',
      featureAvailable: 'அம்சம் விரைவில் கிடைக்கும்.',
      home: 'முகப்பு',
      payTransfer: 'செலுத்து & மாற்று',
      selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
      languageChanged: 'மொழி மாற்றப்பட்டது',
      languageSwitched: 'மொழி மாற்றப்பட்டது',
      accounts: 'கணக்குகள்',
      cards: 'அட்டைகள்',
      reportLostCard: 'தொலைந்த அட்டையைப் புகாரளிக்கவும்',
      resetCardPIN: 'அட்டை பின்னை மீட்டமை',
      lockUnlockCard: 'அட்டையைப் பூட்டு/திற',
      replaceCard: 'அட்டையை மாற்றவும்',
      linkedAccounts: 'இணைக்கப்பட்ட கணக்குகள்',
      linkedCards: 'இணைக்கப்பட்ட அட்டைகள்',
      payNow: 'PayNow',
      changeLanguage: 'மொழியை மாற்று',
      notifications: 'அறிவிப்புகள்',
      security: 'பாதுகாப்பு & தனியுரிமை',
      enableEyeTracker: 'கண் டிராக்கரை இயக்கு',
      contactBank: 'வங்கியைத் தொடர்பு கொள்ளுங்கள்',
      faqs: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      guidedTutorials: 'வழிகாட்டப்பட்ட பயிற்சிகள்',
      moneyLock: 'பண பூட்டு',
      chequeServices: 'காசோலை சேவைகள்',
      accountsCategory: 'கணக்குகள்',
      viewStatements: 'அறிக்கைகளைக் காண்க',
      documents: 'ஆவணங்கள்',
      transferMoney: 'பணம் மாற்று',
      paymentsTransfers: 'பணம் செலுத்துதல் & பரிமாற்றங்கள்',
      topUpPrepaid: 'ப்ரீபெய்ட் கார்ட் டாப் அப்',
      qrCashWithdrawal: 'QR பணம் எடுத்தல்',
      updatePersonalDetails: 'தனிப்பட்ட விவரங்களைப் புதுப்பிக்கவும்',
      changePassword: 'கடவுச்சொல்லை மாற்று',
      manageLoginToken: 'உள்நுழைவு & டோக்கனை நிர்வகிக்கவும்',
      textSizeDisplay: 'உரை அளவு & காட்சி',
      noResultsFound: 'எந்த முடிவுகளும் கிடைக்கவில்லை',
      tryDifferentKeywords: 'வெவ்வேறு முக்கிய வார்த்தைகளைத் தேட முயற்சிக்கவும்',
    },
    hi: {
      more: 'और',
      logout: 'लॉग आउट',
      searchPlaceholder: 'सेवाएं खोजें...',
      apply: 'आवेदन करें',
      cardServices: 'कार्ड सेवाएं',
      linkedServices: 'लिंक की गई सेवाएं',
      settings: 'सेटिंग्स',
      helpSupport: 'मदद और सहायता',
      viewMore: 'और देखें',
      comingSoon: 'जल्द आ रहा है',
      featureAvailable: 'फीचर जल्द ही उपलब्ध होगा।',
      home: 'होम',
      payTransfer: 'भुगतान और स्थानांतरण',
      selectLanguage: 'भाषा चुनें',
      languageChanged: 'भाषा बदल गई',
      languageSwitched: 'भाषा बदल गई',
      accounts: 'खाते',
      cards: 'कार्ड',
      reportLostCard: 'खोया हुआ कार्ड रिपोर्ट करें',
      resetCardPIN: 'कार्ड पिन रीसेट करें',
      lockUnlockCard: 'कार्ड लॉक/अनलॉक करें',
      replaceCard: 'कार्ड बदलें',
      linkedAccounts: 'लिंक किए गए खाते',
      linkedCards: 'लिंक किए गए कार्ड',
      payNow: 'PayNow',
      changeLanguage: 'भाषा बदलें',
      notifications: 'सूचनाएं',
      security: 'सुरक्षा और गोपनीयता',
      enableEyeTracker: 'आई ट्रैकर सक्षम करें',
      contactBank: 'बैंक से संपर्क करें',
      faqs: 'अक्सर पूछे जाने वाले प्रश्न',
      guidedTutorials: 'निर्देशित ट्यूटोरियल',
      moneyLock: 'मनी लॉक',
      chequeServices: 'चेक सेवाएं',
      accountsCategory: 'खाते',
      viewStatements: 'स्टेटमेंट देखें',
      documents: 'दस्तावेज़',
      transferMoney: 'पैसे ट्रांसफर करें',
      paymentsTransfers: 'भुगतान और स्थानांतरण',
      topUpPrepaid: 'प्रीपेड कार्ड टॉप अप करें',
      qrCashWithdrawal: 'QR नकद निकासी',
      updatePersonalDetails: 'व्यक्तिगत विवरण अपडेट करें',
      changePassword: 'पासवर्ड बदलें',
      manageLoginToken: 'लॉगिन और टोकन प्रबंधित करें',
      textSizeDisplay: 'टेक्स्ट साइज़ और डिस्प्ले',
      noResultsFound: 'कोई परिणाम नहीं मिला',
      tryDifferentKeywords: 'विभिन्न कीवर्ड खोजने का प्रयास करें',
    },
    ja: {
      more: 'もっと',
      logout: 'ログアウト',
      searchPlaceholder: 'サービスを検索...',
      apply: '申請',
      cardServices: 'カードサービス',
      linkedServices: 'リンクされたサービス',
      settings: '設定',
      helpSupport: 'ヘルプとサポート',
      viewMore: 'もっと見る',
      comingSoon: '近日公開',
      featureAvailable: '機能は近日中に利用可能になります。',
      home: 'ホーム',
      payTransfer: '支払いと送金',
      selectLanguage: '言語を選択',
      languageChanged: '言語が変更されました',
      languageSwitched: '言語が変更されました',
      accounts: 'アカウント',
      cards: 'カード',
      reportLostCard: '紛失カードの報告',
      resetCardPIN: 'カードPINのリセット',
      lockUnlockCard: 'カードのロック/ロック解除',
      replaceCard: 'カードの交換',
      linkedAccounts: 'リンクされたアカウント',
      linkedCards: 'リンクされたカード',
      payNow: 'PayNow',
      changeLanguage: '言語の変更',
      notifications: '通知',
      security: 'セキュリティとプライバシー',
      enableEyeTracker: 'アイトラッカーを有効にする',
      contactBank: '銀行に連絡',
      faqs: 'よくある質問',
      guidedTutorials: 'ガイド付きチュートリアル',
      moneyLock: 'マネーロック',
      chequeServices: '小切手サービス',
      accountsCategory: 'アカウント',
      viewStatements: '明細書を表示',
      documents: 'ドキュメント',
      transferMoney: '送金',
      paymentsTransfers: '支払いと送金',
      topUpPrepaid: 'プリペイドカードのトップアップ',
      qrCashWithdrawal: 'QR現金引き出し',
      updatePersonalDetails: '個人情報の更新',
      changePassword: 'パスワードの変更',
      manageLoginToken: 'ログインとトークンの管理',
      textSizeDisplay: 'テキストサイズと表示',
      noResultsFound: '結果が見つかりません',
      tryDifferentKeywords: '別のキーワードで検索してみてください',
    },
    ko: {
      more: '더보기',
      logout: '로그아웃',
      searchPlaceholder: '서비스 검색...',
      apply: '신청',
      cardServices: '카드 서비스',
      linkedServices: '연결된 서비스',
      settings: '설정',
      helpSupport: '도움말 및 지원',
      viewMore: '더 보기',
      comingSoon: '곧 출시',
      featureAvailable: '기능이 곧 제공됩니다.',
      home: '홈',
      payTransfer: '결제 및 송금',
      selectLanguage: '언어 선택',
      languageChanged: '언어가 변경되었습니다',
      languageSwitched: '언어가 변경되었습니다',
      accounts: '계정',
      cards: '카드',
      reportLostCard: '분실 카드 신고',
      resetCardPIN: '카드 PIN 재설정',
      lockUnlockCard: '카드 잠금/잠금 해제',
      replaceCard: '카드 교체',
      linkedAccounts: '연결된 계정',
      linkedCards: '연결된 카드',
      payNow: 'PayNow',
      changeLanguage: '언어 변경',
      notifications: '알림',
      security: '보안 및 개인정보',
      enableEyeTracker: '아이 트래커 활성화',
      contactBank: '은행 연락',
      faqs: '자주 묻는 질문',
      guidedTutorials: '가이드 튜토리얼',
      moneyLock: '머니 락',
      chequeServices: '수표 서비스',
      accountsCategory: '계정',
      viewStatements: '명세서 보기',
      documents: '문서',
      transferMoney: '송금',
      paymentsTransfers: '결제 및 송금',
      topUpPrepaid: '선불 카드 충전',
      qrCashWithdrawal: 'QR 현금 인출',
      updatePersonalDetails: '개인 정보 업데이트',
      changePassword: '비밀번호 변경',
      manageLoginToken: '로그인 및 토큰 관리',
      textSizeDisplay: '텍스트 크기 및 표시',
      noResultsFound: '결과를 찾을 수 없습니다',
      tryDifferentKeywords: '다른 키워드로 검색해 보세요',
    },
    es: {
      more: 'Más',
      logout: 'Cerrar sesión',
      searchPlaceholder: 'Buscar servicios...',
      apply: 'Aplicar',
      cardServices: 'Servicios de tarjeta',
      linkedServices: 'Servicios vinculados',
      settings: 'Configuración',
      helpSupport: 'Ayuda y soporte',
      viewMore: 'Ver más',
      comingSoon: 'Próximamente',
      featureAvailable: 'la función estará disponible pronto.',
      home: 'Inicio',
      payTransfer: 'Pagar y transferir',
      selectLanguage: 'Seleccionar idioma',
      languageChanged: 'Idioma cambiado',
      languageSwitched: 'Idioma cambiado a',
      accounts: 'Cuentas',
      cards: 'Tarjetas',
      reportLostCard: 'Reportar tarjeta perdida',
      resetCardPIN: 'Restablecer PIN de tarjeta',
      lockUnlockCard: 'Bloquear/Desbloquear tarjeta',
      replaceCard: 'Reemplazar tarjeta',
      linkedAccounts: 'Cuentas vinculadas',
      linkedCards: 'Tarjetas vinculadas',
      payNow: 'PayNow',
      changeLanguage: 'Cambiar idioma',
      notifications: 'Notificaciones',
      security: 'Seguridad y privacidad',
      enableEyeTracker: 'Habilitar rastreador ocular',
      contactBank: 'Contactar banco',
      faqs: 'Preguntas frecuentes',
      guidedTutorials: 'Tutoriales guiados',
      moneyLock: 'Bloqueo de dinero',
      chequeServices: 'Servicios de cheques',
      accountsCategory: 'Cuentas',
      viewStatements: 'Ver extractos',
      documents: 'Documentos',
      transferMoney: 'Transferir dinero',
      paymentsTransfers: 'Pagos y transferencias',
      topUpPrepaid: 'Recargar tarjeta prepago',
      qrCashWithdrawal: 'Retiro de efectivo QR',
      updatePersonalDetails: 'Actualizar datos personales',
      changePassword: 'Cambiar contraseña',
      manageLoginToken: 'Administrar inicio de sesión y token',
      textSizeDisplay: 'Tamaño de texto y pantalla',
      noResultsFound: 'No se encontraron resultados',
      tryDifferentKeywords: 'Intenta buscar diferentes palabras clave',
    },
    fr: {
      more: 'Plus',
      logout: 'Se déconnecter',
      searchPlaceholder: 'Rechercher des services...',
      apply: 'Postuler',
      cardServices: 'Services de carte',
      linkedServices: 'Services liés',
      settings: 'Paramètres',
      helpSupport: 'Aide et support',
      viewMore: 'Voir plus',
      comingSoon: 'Bientôt disponible',
      featureAvailable: 'la fonctionnalité sera bientôt disponible.',
      home: 'Accueil',
      payTransfer: 'Payer et transférer',
      selectLanguage: 'Sélectionner la langue',
      languageChanged: 'Langue changée',
      languageSwitched: 'Langue changée en',
      accounts: 'Comptes',
      cards: 'Cartes',
      reportLostCard: 'Signaler une carte perdue',
      resetCardPIN: 'Réinitialiser le PIN de la carte',
      lockUnlockCard: 'Verrouiller/Déverrouiller la carte',
      replaceCard: 'Remplacer la carte',
      linkedAccounts: 'Comptes liés',
      linkedCards: 'Cartes liées',
      payNow: 'PayNow',
      changeLanguage: 'Changer de langue',
      notifications: 'Notifications',
      security: 'Sécurité et confidentialité',
      enableEyeTracker: 'Activer le suivi oculaire',
      contactBank: 'Contacter la banque',
      faqs: 'FAQ',
      guidedTutorials: 'Tutoriels guidés',
      moneyLock: 'Verrouillage d\'argent',
      chequeServices: 'Services de chèques',
      accountsCategory: 'Comptes',
      viewStatements: 'Voir les relevés',
      documents: 'Documents',
      transferMoney: 'Transférer de l\'argent',
      paymentsTransfers: 'Paiements et virements',
      topUpPrepaid: 'Recharger la carte prépayée',
      qrCashWithdrawal: 'Retrait d\'espèces QR',
      updatePersonalDetails: 'Mettre à jour les informations personnelles',
      changePassword: 'Changer le mot de passe',
      manageLoginToken: 'Gérer la connexion et le token',
      textSizeDisplay: 'Taille du texte et affichage',
      noResultsFound: 'Aucun résultat trouvé',
      tryDifferentKeywords: 'Essayez de rechercher des mots-clés différents',
    },
    de: {
      more: 'Mehr',
      logout: 'Abmelden',
      searchPlaceholder: 'Dienste suchen...',
      apply: 'Anwenden',
      cardServices: 'Kartendienste',
      linkedServices: 'Verknüpfte Dienste',
      settings: 'Einstellungen',
      helpSupport: 'Hilfe & Support',
      viewMore: 'Mehr anzeigen',
      comingSoon: 'Demnächst verfügbar',
      featureAvailable: 'Funktion wird bald verfügbar sein.',
      home: 'Startseite',
      payTransfer: 'Zahlen & Überweisen',
      selectLanguage: 'Sprache wählen',
      languageChanged: 'Sprache geändert',
      languageSwitched: 'Sprache gewechselt zu',
      accounts: 'Konten',
      cards: 'Karten',
      reportLostCard: 'Verlorene Karte melden',
      resetCardPIN: 'Karten-PIN zurücksetzen',
      lockUnlockCard: 'Karte sperren/entsperren',
      replaceCard: 'Karte ersetzen',
      linkedAccounts: 'Verknüpfte Konten',
      linkedCards: 'Verknüpfte Karten',
      payNow: 'PayNow',
      changeLanguage: 'Sprache ändern',
      notifications: 'Benachrichtigungen',
      security: 'Sicherheit & Datenschutz',
      enableEyeTracker: 'Eye-Tracker aktivieren',
      contactBank: 'Bank kontaktieren',
      faqs: 'Häufig gestellte Fragen',
      guidedTutorials: 'Geführte Tutorials',
      moneyLock: 'Geldsperre',
      chequeServices: 'Scheckdienste',
      accountsCategory: 'Konten',
      viewStatements: 'Kontoauszüge anzeigen',
      documents: 'Dokumente',
      transferMoney: 'Geld überweisen',
      paymentsTransfers: 'Zahlungen und Überweisungen',
      topUpPrepaid: 'Prepaid-Karte aufladen',
      qrCashWithdrawal: 'QR-Bargeldabhebung',
      updatePersonalDetails: 'Persönliche Daten aktualisieren',
      changePassword: 'Passwort ändern',
      manageLoginToken: 'Anmeldung und Token verwalten',
      textSizeDisplay: 'Textgröße und Anzeige',
      noResultsFound: 'Keine Ergebnisse gefunden',
      tryDifferentKeywords: 'Versuchen Sie andere Suchbegriffe',
    },
  };

  const t = translations[selectedLanguage] || translations.en;

  const handleLanguageSelect = async (language: typeof languages[0]) => {
    setSelectedLanguage(language.code);
    setShowLanguageModal(false);
    try {
      await AsyncStorage.setItem('selectedLanguage', language.code);
    } catch (error) {
      console.log('Error saving language:', error);
    }
    Alert.alert(translations[language.code].languageChanged, `${translations[language.code].languageSwitched} ${language.label}`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => router.replace('/landing'),
        },
      ]
    );
  };

  // All menu items with their categories
  const allMenuItems: MenuItem[] = [
    // Apply
    { id: '1', icon: 'user-friends', label: t.accounts, category: t.apply },
    { id: '2', icon: 'credit-card', label: t.cards, category: t.apply },
    
    // Card Services
    { id: '3', icon: 'clipboard-list', label: t.reportLostCard, category: t.cardServices },
    { id: '4', icon: 'sync-alt', label: t.resetCardPIN, category: t.cardServices },
    { id: '5', icon: 'lock', label: t.lockUnlockCard, category: t.cardServices },
    { id: '6', icon: 'undo', label: t.replaceCard, category: t.cardServices },
    
    // Accounts
    { id: '7', icon: 'money-bill-wave', label: t.moneyLock, category: t.accountsCategory },
    { id: '8', icon: 'file-alt', label: t.chequeServices, category: t.accountsCategory },
    
    // Documents
    { id: '9', icon: 'file-signature', label: t.viewStatements, category: t.documents },
    
    // Payments & Transfers
    { id: '10', icon: 'exchange-alt', label: t.transferMoney, category: t.paymentsTransfers, route: 'Transfer' },
    { id: '11', icon: 'credit-card', label: t.topUpPrepaid, category: t.paymentsTransfers },
    { id: '12', icon: 'qrcode', label: t.qrCashWithdrawal, category: t.paymentsTransfers },
    
    // Settings
    { id: '13', icon: 'user-circle', label: t.updatePersonalDetails, category: t.settings },
    { id: '14', icon: 'lock', label: t.changePassword, category: t.settings },
    { id: '15', icon: 'sign-in-alt', label: t.manageLoginToken, category: t.settings },
    { id: '16', icon: 'text-height', label: t.textSizeDisplay, category: t.settings },
    { id: '17', icon: 'language', label: t.changeLanguage, category: t.settings, action: () => setShowLanguageModal(true) },
    { id: '18', icon: 'link', label: t.linkedAccounts, category: t.settings, route: 'LinkedAccounts' },
    { id: '19', icon: 'eye', label: t.enableEyeTracker, category: t.settings, route: 'EyeTracker' },
    
    // Help & Support
    { id: '20', icon: 'address-book', label: t.contactBank, category: t.helpSupport },
    { id: '21', icon: 'question-circle', label: t.faqs, category: t.helpSupport },
    { id: '22', icon: 'book-open', label: t.guidedTutorials, category: t.helpSupport },
  ];

  // Filter items based on search query
  const filteredItems = searchQuery.trim()
    ? allMenuItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allMenuItems;

  // Group filtered items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const handleItemPress = (item: MenuItem) => {
    if (item.route) {
      router.push(item.route as any);
    } else if (item.action) {
      item.action();
    } else {
      Alert.alert(t.comingSoon, `${item.label} ${t.featureAvailable}`);
    }
  };

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 name={item.icon} size={20} color="#333" solid />
      </View>
      <Text style={styles.menuItemLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderSection = (category: string, items: MenuItem[]) => (
    <View key={category} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{category}</Text>
        <TouchableOpacity onPress={() => Alert.alert(t.viewMore, `${t.viewMore} ${category}`)}>
          <Text style={styles.viewMore}>{t.viewMore}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.iconGrid}>
        {items.map((item) => renderMenuItem(item))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.more}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutLink}>{t.logout}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Menu Sections */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {searchQuery.trim() && filteredItems.length === 0 ? (
            <View style={styles.noResults}>
              <MaterialCommunityIcons name="magnify" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>{t.noResultsFound}</Text>
              <Text style={styles.noResultsSubtext}>
                {t.tryDifferentKeywords}
              </Text>
            </View>
          ) : (
            Object.entries(groupedItems).map(([category, items]) =>
              renderSection(category, items)
            )
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/')}
          >
            <FontAwesome5 name="home" size={22} color="#888" />
            <Text style={styles.navItemText}>{t.home}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => Alert.alert(t.comingSoon, `${t.payTransfer} ${t.featureAvailable}`)}
          >
            <FontAwesome5 name="exchange-alt" size={22} color="#da291c" />
            <Text style={[styles.navItemText, styles.navItemTextActive]}>{t.payTransfer}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
            <FontAwesome5 name="th-large" size={22} color="#da291c" />
            <Text style={[styles.navItemText, styles.navItemTextActive]}>{t.more}</Text>
          </TouchableOpacity>
        </View>

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
                      selectedLanguage === language.code && styles.languageOptionSelected
                    ]}
                    onPress={() => handleLanguageSelect(language)}
                  >
                    <Text style={styles.languageFlag}>{language.flag}</Text>
                    <Text style={[
                      styles.languageLabel,
                      selectedLanguage === language.code && styles.languageLabelSelected
                    ]}>
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
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#da291c',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  logoutLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  viewMore: {
    fontSize: 13,
    color: '#005eb8',
    fontWeight: '500',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  menuItem: {
    width: '33.333%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuItemLabel: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    lineHeight: 16,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  navItemActive: {
    // Active state
  },
  navItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
    marginTop: 4,
  },
  navItemTextActive: {
    color: '#da291c',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  languageList: {
    maxHeight: 400,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageOptionSelected: {
    backgroundColor: '#f5f5f5',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  languageLabelSelected: {
    fontWeight: '600',
    color: '#da291c',
  },
  checkMark: {
    fontSize: 20,
    color: '#da291c',
    fontWeight: 'bold',
  },
});

export default More;
