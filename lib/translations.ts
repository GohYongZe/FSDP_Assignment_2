export const translations: Record<string, any> = {
  en: {
    // Homepage
    welcome: "Welcome",
    switchAccount: "Switch Account",
    payNow: "PayNow",
    scan: "Scan",
    customise: "Customise",
    accounts: "Accounts",
    cards: "Cards",
    investments: "Investments",
    availableBalance: "Available balance",
    debitCardNo: "Debit card no.",
    creditCardNo: "Credit card no.",
    recentTransactions: "Recent Transactions",
    upTo50Last7Days: "Up to 50 (last 7 days only)",
    viewAll: "View All",
    past3Days: "Past 3 days",
    received: "RECEIVED",
    sent: "SENT",
    noRecentTransactions: "No recent transactions",
    transfer: "TRANSFER",
    payment: "PAYMENT",
    from: "From",
    to: "To",
    selectAccount: "Select Account",
    noTransactions: "No transactions for this period",
    noAccountsFound: "No accounts found. Please contact support.",
    home: "Home",
    payAndTransfer: "Pay & Transfer",
    more: "More",
    shoppingMallPurchase: "Shopping Mall Purchase",
    logout: "Logout",
    logoutConfirm: "Are you sure you want to logout?",
    cancel: "Cancel",
    error: "Error",
    success: "Success",
    failedLogout: "Failed to logout",
    unexpectedError: "An unexpected error occurred",
    ok: "OK",
    cobi: "Cobi",
    recordingError: "Recording error",
    recordingInProgress: "A recording is already in progress. Please wait.",
    tooShort: "Too short—hold longer.",
    noSpeechDetected: "(No speech detected)",
    
    // Camera/QR Scanner
    permission: "Permission",
    cameraPermissionRequired: "Camera permission is required to scan QR codes.",
    invalidQR: "Invalid QR",
    qrNotRecognized: "This QR code is not recognized.",
    couldNotParseQR: "Could not parse QR code.",
    
    // Payment Request
    paymentRequest: "Payment Request",
    paymentRequestMessage: "Do you want to pay SGD {amount} to {accountNo}?",
    paymentSuccessMessage: "Paid SGD {amount} to sender.",
    pay: "Pay",
    
    // Link Account
    linkAccount: "Link Account",
    linkAccountMessage: "Found account: {accountNo}. Do you want to link?",
    link: "Link",
    
    // No Accounts
    noAccountsFoundTitle: "No Accounts Found",
    noAccountsFoundMessage: "No bank accounts are linked to this email. Please contact support or create an account.",
    failedToLoadAccounts: "Failed to load account data. Please try again.",
    
    // Feature Unavailable
    featureUnavailable: "Feature Unavailable",
    voiceCommandsDisabled: "Voice commands are currently disabled in this environment.",
    
    // Months
    jan: "Jan",
    feb: "Feb",
    mar: "Mar",
    apr: "Apr",
    may: "May",
    jun: "Jun",
    jul: "Jul",
    aug: "Aug",
    sep: "Sep",
    oct: "Oct",
    nov: "Nov",
    dec: "Dec",
    
    // Account Details
    accountDetails: "Account Details",
    totalBalance: "Total Balance",
    transactions: "Transactions",
    hideFullHistory: "Hide Full History and Management",
    viewFullHistory: "View Full History and Management",
    accountManagement: "Account Management",
    accountOpeningDate: "Account Opening Date",
    downloadStatements: "Download e-Statements",
    changeNickname: "Change Account Nickname",
    salaryDeposit: "Salary Deposit",
    supermarketPurchase: "Supermarket Purchase",
    
    // Transaction messages
    paymentRequestFrom: "Payment Request from {name}",
    paymentRequestAccepted: "Payment Request Accepted",
    transferFrom: "Transfer from {name}",
    transferTo: "Transfer to {name}",
    
    // Transaction types
    transactionTransfer: "TRANSFER",
    transactionPayment: "PAYMENT",
    transactionDebit: "DEBIT",
    transactionCredit: "CREDIT",
  },
  zh: {
    // Homepage
    welcome: "欢迎",
    switchAccount: "切换账户",
    payNow: "立即支付",
    scan: "扫描",
    customise: "自定义",
    accounts: "账户",
    cards: "卡片",
    investments: "投资",
    availableBalance: "可用余额",
    debitCardNo: "借记卡号",
    creditCardNo: "信用卡号",
    recentTransactions: "最近交易",
    upTo50Last7Days: "最多50笔（仅最近7天）",
    viewAll: "查看全部",
    past3Days: "过去3天",
    received: "已收款",
    sent: "已付款",
    noRecentTransactions: "暂无最近交易",
    transfer: "转账",
    payment: "付款",
    from: "来自",
    to: "至",
    selectAccount: "选择账户",
    noTransactions: "此期间没有交易",
    noAccountsFound: "未找到账户。请联系支持。",
    home: "首页",
    payAndTransfer: "支付和转账",
    more: "更多",
    shoppingMallPurchase: "商场购物",
    logout: "登出",
    logoutConfirm: "您确定要登出吗？",
    cancel: "取消",
    error: "错误",
    success: "成功",
    failedLogout: "登出失败",
    unexpectedError: "发生意外错误",
    ok: "确定",
    cobi: "Cobi",
    recordingError: "录音错误",
    recordingInProgress: "录音正在进行中。请稍候。",
    tooShort: "太短了—请按住更长时间。",
    noSpeechDetected: "（未检测到语音）",
    
    // Camera/QR Scanner
    permission: "权限",
    cameraPermissionRequired: "扫描二维码需要相机权限。",
    invalidQR: "无效二维码",
    qrNotRecognized: "无法识别此二维码。",
    couldNotParseQR: "无法解析二维码。",
    
    // Payment Request
    paymentRequest: "付款请求",
    paymentRequestMessage: "您要向 {accountNo} 支付 {amount} 新元吗？",
    paymentSuccessMessage: "已向发送者支付 {amount} 新元。",
    pay: "支付",
    
    // Link Account
    linkAccount: "关联账户",
    linkAccountMessage: "找到账户：{accountNo}。您要关联吗？",
    link: "关联",
    
    // No Accounts
    noAccountsFoundTitle: "未找到账户",
    noAccountsFoundMessage: "此邮箱未关联任何银行账户。请联系支持或创建账户。",
    failedToLoadAccounts: "加载账户数据失败。请重试。",
    
    // Feature Unavailable
    featureUnavailable: "功能不可用",
    voiceCommandsDisabled: "此环境中当前禁用语音命令。",
    
    // Months
    jan: "1月",
    feb: "2月",
    mar: "3月",
    apr: "4月",
    may: "5月",
    jun: "6月",
    jul: "7月",
    aug: "8月",
    sep: "9月",
    oct: "10月",
    nov: "11月",
    dec: "12月",
    
    // Account Details
    accountDetails: "账户详情",
    totalBalance: "总余额",
    transactions: "交易记录",
    hideFullHistory: "隐藏完整历史和管理",
    viewFullHistory: "查看完整历史和管理",
    accountManagement: "账户管理",
    accountOpeningDate: "账户开户日期",
    downloadStatements: "下载电子对账单",
    changeNickname: "更改账户昵称",
    salaryDeposit: "工资存款",
    supermarketPurchase: "超市购物",
    
    // Transaction messages
    paymentRequestFrom: "来自 {name} 的付款请求",
    paymentRequestAccepted: "付款请求已接受",
    transferFrom: "来自 {name} 的转账",
    transferTo: "转账至 {name}",
    
    // Transaction types
    transactionTransfer: "转账",
    transactionPayment: "付款",
    transactionDebit: "借记",
    transactionCredit: "贷记",
  },
  ms: {
    // Homepage
    welcome: "Selamat Datang",
    switchAccount: "Tukar Akaun",
    payNow: "Bayar Sekarang",
    scan: "Imbas",
    customise: "Sesuaikan",
    accounts: "Akaun",
    cards: "Kad",
    investments: "Pelaburan",
    availableBalance: "Baki tersedia",
    debitCardNo: "No. kad debit",
    creditCardNo: "No. kad kredit",
    recentTransactions: "Transaksi Terkini",
    upTo50Last7Days: "Sehingga 50 (7 hari terakhir sahaja)",
    viewAll: "Lihat Semua",
    past3Days: "3 hari lepas",
    received: "DITERIMA",
    sent: "DIHANTAR",
    noRecentTransactions: "Tiada transaksi terkini",
    transfer: "PINDAHAN",
    payment: "PEMBAYARAN",
    from: "Dari",
    to: "Kepada",
    selectAccount: "Pilih Akaun",
    noTransactions: "Tiada transaksi untuk tempoh ini",
    noAccountsFound: "Tiada akaun dijumpai. Sila hubungi sokongan.",
    home: "Rumah",
    payAndTransfer: "Bayar & Pindah",
    more: "Lagi",
    shoppingMallPurchase: "Pembelian Pusat Beli-belah",
    logout: "Log Keluar",
    logoutConfirm: "Adakah anda pasti mahu log keluar?",
    cancel: "Batal",
    error: "Ralat",
    success: "Berjaya",
    failedLogout: "Gagal log keluar",
    unexpectedError: "Ralat yang tidak dijangka berlaku",
    ok: "OK",
    cobi: "Cobi",
    recordingError: "Ralat rakaman",
    recordingInProgress: "Rakaman sedang dijalankan. Sila tunggu.",
    tooShort: "Terlalu pendek—tahan lebih lama.",
    noSpeechDetected: "(Tiada pertuturan dikesan)",
    
    // Camera/QR Scanner
    permission: "Kebenaran",
    cameraPermissionRequired: "Kebenaran kamera diperlukan untuk mengimbas kod QR.",
    invalidQR: "QR Tidak Sah",
    qrNotRecognized: "Kod QR ini tidak dikenali.",
    couldNotParseQR: "Tidak dapat menghurai kod QR.",
    
    // Payment Request
    paymentRequest: "Permintaan Bayaran",
    paymentRequestMessage: "Adakah anda mahu membayar SGD {amount} kepada {accountNo}?",
    paymentSuccessMessage: "Telah membayar SGD {amount} kepada pengirim.",
    pay: "Bayar",
    
    // Link Account
    linkAccount: "Pautkan Akaun",
    linkAccountMessage: "Akaun dijumpai: {accountNo}. Adakah anda mahu pautkan?",
    link: "Pautkan",
    
    // No Accounts
    noAccountsFoundTitle: "Tiada Akaun Dijumpai",
    noAccountsFoundMessage: "Tiada akaun bank dipautkan ke e-mel ini. Sila hubungi sokongan atau cipta akaun.",
    failedToLoadAccounts: "Gagal memuatkan data akaun. Sila cuba lagi.",
    
    // Feature Unavailable
    featureUnavailable: "Ciri Tidak Tersedia",
    voiceCommandsDisabled: "Arahan suara sedang dilumpuhkan dalam persekitaran ini.",
    
    // Months
    jan: "Jan",
    feb: "Feb",
    mar: "Mac",
    apr: "Apr",
    may: "Mei",
    jun: "Jun",
    jul: "Jul",
    aug: "Ogos",
    sep: "Sep",
    oct: "Okt",
    nov: "Nov",
    dec: "Dis",
    
    // Account Details
    accountDetails: "Butiran Akaun",
    totalBalance: "Jumlah Baki",
    transactions: "Transaksi",
    hideFullHistory: "Sembunyikan Sejarah Penuh dan Pengurusan",
    viewFullHistory: "Lihat Sejarah Penuh dan Pengurusan",
    accountManagement: "Pengurusan Akaun",
    accountOpeningDate: "Tarikh Pembukaan Akaun",
    downloadStatements: "Muat Turun Penyata Elektronik",
    changeNickname: "Tukar Nama Panggilan Akaun",
    salaryDeposit: "Deposit Gaji",
    supermarketPurchase: "Pembelian Pasar Raya",
    
    // Transaction messages
    paymentRequestFrom: "Permintaan Bayaran dari {name}",
    paymentRequestAccepted: "Permintaan Bayaran Diterima",
    transferFrom: "Pindahan dari {name}",
    transferTo: "Pindahan ke {name}",
    
    // Transaction types
    transactionTransfer: "PINDAHAN",
    transactionPayment: "PEMBAYARAN",
    transactionDebit: "DEBIT",
    transactionCredit: "KREDIT",
  },
  ta: {
    // Homepage
    welcome: "வரவேற்கிறோம்",
    switchAccount: "கணக்கை மாற்று",
    payNow: "இப்போது செலுத்து",
    scan: "ஸ்கேன்",
    customise: "தனிப்பயனாக்கு",
    accounts: "கணக்குகள்",
    cards: "அட்டைகள்",
    investments: "முதலீடுகள்",
    availableBalance: "கிடைக்கும் இருப்பு",
    debitCardNo: "டெபிட் அட்டை எண்",
    creditCardNo: "கடன் அட்டை எண்",
    recentTransactions: "சமீபத்திய பரிவர்த்தனைகள்",
    upTo50Last7Days: "50 வரை (கடந்த 7 நாட்கள் மட்டும்)",
    viewAll: "அனைத்தையும் பார்",
    past3Days: "கடந்த 3 நாட்கள்",
    received: "பெறப்பட்டது",
    sent: "அனுப்பப்பட்டது",
    noRecentTransactions: "சமீபத்திய பரிவர்த்தனைகள் இல்லை",
    transfer: "பரிமாற்றம்",
    payment: "கட்டணம்",
    from: "இருந்து",
    to: "வரை",
    selectAccount: "கணக்கைத் தேர்ந்தெடுக்கவும்",
    noTransactions: "இந்த காலத்திற்கான பரிவர்த்தனைகள் இல்லை",
    noAccountsFound: "கணக்குகள் எதுவும் இல்லை. ஆதரவைத் தொடர்பு கொள்ளவும்.",
    home: "முகப்பு",
    payAndTransfer: "செலுத்து மற்றும் மாற்று",
    more: "மேலும்",
    shoppingMallPurchase: "ஷாப்பிங் மால் கொள்முதல்",
    logout: "வெளியேறு",
    logoutConfirm: "நீங்கள் வெளியேற விரும்புகிறீர்களா?",
    cancel: "ரத்து",
    error: "பிழை",
    success: "வெற்றி",
    failedLogout: "வெளியேற தவறியது",
    unexpectedError: "எதிர்பாராத பிழை ஏற்பட்டது",
    ok: "சரி",
    cobi: "Cobi",
    recordingError: "பதிவு பிழை",
    recordingInProgress: "பதிவு ஏற்கனவே நடந்து கொண்டிருக்கிறது. காத்திருக்கவும்.",
    tooShort: "மிகவும் சிறிது—நீண்ட நேரம் பிடிக்கவும்.",
    noSpeechDetected: "(ஏனும் பேச்சு கண்டறியவில்லை)",
    
    // Camera/QR Scanner
    permission: "அனுமதி",
    cameraPermissionRequired: "QR கோடுகளை ஸ்கேன் செய்ய கேமரா அனுமதி தேவை.",
    invalidQR: "சரியல்லாத QR",
    qrNotRecognized: "இந்த QR கோட் அங்கீகரிக்கப்படவில்லை.",
    couldNotParseQR: "QR கோடை பகுத்தறுக்க முடியவில்லை.",
    
    // Payment Request
    paymentRequest: "கட்டண கோரிக்கை",
    paymentRequestMessage: "{accountNo} க்கு SGD {amount} செலுத்த விரும்புகிறீர்களா?",
    pay: "செலுத்து",
    
    // Link Account
    linkAccount: "கணக்கை இணை",
    linkAccountMessage: "கணக்கு கண்டுபிடிக்கப்பட்டது: {accountNo}. இணைக்க விரும்புகிறீர்களா?",
    link: "இணை",
    
    // No Accounts
    noAccountsFoundTitle: "கணக்குகள் இல்லை",
    noAccountsFoundMessage: "இந்த மின்னஞ்சலுக்கு வங்கி கணக்குகள் இணைக்கப்படவில்லை. ஆதரவை தொடர்பு கொள்ளவும் அல்லது கணக்கை உருவாக்கவும்.",
    failedToLoadAccounts: "கணக்கு தரவை ஏற்ற தவறியது. மீண்டும் முயற்சிக்கவும்.",
    
    // Feature Unavailable
    featureUnavailable: "அம்சம் கிடைக்கவில்லை",
    voiceCommandsDisabled: "இந்த சூழலில் குரல் கட்டளைகள் தற்காலிகமாக முடக்கப்பட்டுள்ளன.",
    
    // Months
    jan: "ஜன",
    feb: "பிப்",
    mar: "மார்",
    apr: "ஏப்",
    may: "மே",
    jun: "ஜூன்",
    jul: "ஜூலை",
    aug: "ஆக",
    sep: "செப்",
    oct: "அக்",
    nov: "நவ",
    dec: "டிச",
    
    // Account Details
    accountDetails: "கணக்கு விவரங்கள்",
    totalBalance: "மொத்த இருப்பு",
    transactions: "பரிவர்த்தனைகள்",
    hideFullHistory: "முழு வரலாறு மற்றும் நிர்வாகத்தை மறை",
    viewFullHistory: "முழு வரலாறு மற்றும் நிர்வாகத்தைக் காண்க",
    accountManagement: "கணக்கு நிர்வாகம்",
    accountOpeningDate: "கணக்கு திறக்கப்பட்ட தேதி",
    downloadStatements: "மின்னணு அறிக்கைகளைப் பதிவிறக்கு",
    changeNickname: "கணக்கு செல்லப்பெயரை மாற்று",
    salaryDeposit: "சம்பள வைப்பு",
    supermarketPurchase: "சூப்பர்மார்க்கெட் கொள்முதல்",
    
    // Transaction messages
    paymentRequestFrom: "{name} இலிருந்து கட்டண கோரிக்கை",
    paymentRequestAccepted: "கட்டண கோரிக்கை ஏற்றுக்கொள்ளப்பட்டது",
    transferFrom: "{name} இலிருந்து பரிமாற்றம்",
    transferTo: "{name} க்கு பரிமாற்றம்",
    
    // Transaction types
    transactionTransfer: "பரிமாற்றம்",
    transactionPayment: "கட்டணம்",
    transactionDebit: "பற்று",
    transactionCredit: "வரவு",
  },
  hi: {
    // Homepage
    welcome: "स्वागत है",
    switchAccount: "खाता बदलें",
    payNow: "अभी भुगतान करें",
    scan: "स्कैन करें",
    customise: "अनुकूलित करें",
    accounts: "खाते",
    cards: "कार्ड",
    investments: "निवेश",
    availableBalance: "उपलब्ध शेष",
    debitCardNo: "डेबिट कार्ड नंबर",
    creditCardNo: "क्रेडिट कार्ड नंबर",
    recentTransactions: "हाल के लेनदेन",
    upTo50Last7Days: "50 तक (केवल पिछले 7 दिन)",
    viewAll: "सभी देखें",
    past3Days: "पिछले 3 दिन",
    received: "प्राप्त",
    sent: "भेजा गया",
    noRecentTransactions: "कोई हालिया लेनदेन नहीं",
    transfer: "स्थानांतरण",
    payment: "भुगतान",
    from: "से",
    to: "को",
    selectAccount: "खाता चुनें",
    noTransactions: "इस अवधि के लिए कोई लेनदेन नहीं",
    noAccountsFound: "कोई खाता नहीं मिला। कृपया सहायता से संपर्क करें।",
    home: "होम",
    payAndTransfer: "भुगतान और स्थानांतरण",
    more: "अधिक",
    shoppingMallPurchase: "शॉपिंग मॉल खरीदारी",
    logout: "लॉगआउट",
    logoutConfirm: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
    cancel: "रद्द करें",
    error: "त्रुटि",
    success: "सफलता",
    failedLogout: "लॉगआउट विफल",
    unexpectedError: "अप्रत्याशित त्रुटि हुई",
    ok: "ठीक है",
    cobi: "Cobi",
    recordingError: "रिकॉर्डिंग त्रुटि",
    recordingInProgress: "रिकॉर्डिंग पहले से चल रही है। कृपया प्रतीक्षा करें।",
    tooShort: "बहुत छोटा—अधिक समय तक दबाई रखें।",
    noSpeechDetected: "(कोई बोली नहीं मिली)",
    
    // Camera/QR Scanner
    permission: "अनुमति",
    cameraPermissionRequired: "QR कोड स्कैन करने के लिए कैमरा अनुमति आवश्यक है।",
    invalidQR: "अमान्य QR",
    qrNotRecognized: "यह QR कोड पहचाना नहीं गया।",
    couldNotParseQR: "QR कोड पार्स नहीं कर सके।",
    
    // Payment Request
    paymentRequest: "भुगतान अनुरोध",
    paymentRequestMessage: "क्या आप {accountNo} को SGD {amount} भुगतान करना चाहते हैं?",
    paymentSuccessMessage: "प्रेषक को SGD {amount} का भुगतान किया गया।",
    pay: "भुगतान करें",
    
    // Link Account
    linkAccount: "खाता लिंक करें",
    linkAccountMessage: "खाता मिला: {accountNo}। क्या आप लिंक करना चाहते हैं?",
    link: "लिंक",
    
    // No Accounts
    noAccountsFoundTitle: "कोई खाता नहीं मिला",
    noAccountsFoundMessage: "इस ईमेल से कोई बैंक खाता लिंक नहीं है। कृपया सहायता से संपर्क करें या खाता बनाएं।",
    failedToLoadAccounts: "खाता डेटा लोड करने में विफल। कृपया पुनः प्रयास करें।",
    
    // Feature Unavailable
    featureUnavailable: "सुविधा अनुपलब्ध",
    voiceCommandsDisabled: "वॉइस कमांड वर्तमान में इस पर्यावरण में अक्षम हैं।",
    
    // Months
    jan: "जन",
    feb: "फर",
    mar: "मार्च",
    apr: "अप्रै",
    may: "मई",
    jun: "जून",
    jul: "जुला",
    aug: "अग",
    sep: "सित",
    oct: "अक्टू",
    nov: "नव",
    dec: "दिस",
    
    // Account Details
    accountDetails: "खाता विवरण",
    totalBalance: "कुल शेष",
    transactions: "लेनदेन",
    hideFullHistory: "पूरा इतिहास और प्रबंधन छिपाएं",
    viewFullHistory: "पूरा इतिहास और प्रबंधन देखें",
    accountManagement: "खाता प्रबंधन",
    accountOpeningDate: "खाता खोलने की तिथि",
    downloadStatements: "ई-स्टेटमेंट डाउनलोड करें",
    changeNickname: "खाता उपनाम बदलें",
    salaryDeposit: "वेतन जमा",
    supermarketPurchase: "सुपरमार्केट खरीदारी",
    
    // Transaction types
    transactionTransfer: "स्थानांतरण",
    transactionPayment: "भुगतान",
    transactionDebit: "डेबिट",
    transactionCredit: "क्रेडिट",
  },
  ja: {
    // Homepage
    welcome: "ようこそ",
    switchAccount: "アカウント切替",
    payNow: "今すぐ支払う",
    scan: "スキャン",
    customise: "カスタマイズ",
    accounts: "口座",
    cards: "カード",
    investments: "投資",
    availableBalance: "利用可能残高",
    debitCardNo: "デビットカード番号",
    creditCardNo: "クレジットカード番号",
    recentTransactions: "最近の取引",
    upTo50Last7Days: "最大50件（過去7日間のみ）",
    viewAll: "すべて見る",
    past3Days: "過去3日間",
    received: "受信",
    sent: "送信",
    noRecentTransactions: "最近の取引はありません",
    transfer: "送金",
    payment: "支払い",
    from: "から",
    to: "へ",
    selectAccount: "アカウントを選択",
    noTransactions: "この期間の取引はありません",
    noAccountsFound: "アカウントが見つかりません。サポートにお問い合わせください。",
    home: "ホーム",
    payAndTransfer: "支払いと送金",
    more: "もっと見る",
    shoppingMallPurchase: "ショッピングモール購入",
    logout: "ログアウト",
    logoutConfirm: "ログアウトしてもよろしいですか？",
    cancel: "キャンセル",
    error: "エラー",
    success: "成功",
    failedLogout: "ログアウトに失敗しました",
    unexpectedError: "予期しないエラーが発生しました",
    ok: "OK",
    cobi: "Cobi",
    recordingError: "Aufnahmefehler",
    tooShort: "Zu kurz—länger halten.",
    noSpeechDetected: "(Keine Sprache erkannt)",
    
    // Camera/QR Scanner
    permission: "権限",
    cameraPermissionRequired: "QRコードをスキャンするにはカメラの許可が必要です。",
    invalidQR: "無効なQR",
    qrNotRecognized: "このQRコードは認識されません。",
    couldNotParseQR: "QRコードを解析できませんでした。",
    
    // Payment Request
    paymentRequest: "支払いリクエスト",
    paymentRequestMessage: "{accountNo}にSGD {amount}を支払いますか？",
    paymentSuccessMessage: "送信者にSGD {amount}を支払いました。",
    pay: "支払う",
    
    // Link Account
    linkAccount: "アカウントをリンク",
    linkAccountMessage: "アカウントが見つかりました：{accountNo}。リンクしますか？",
    link: "リンク",
    
    // No Accounts
    noAccountsFoundTitle: "アカウントが見つかりません",
    noAccountsFoundMessage: "このメールにリンクされた銀行口座はありません。サポートにお問い合わせいただくか、アカウントを作成してください。",
    failedToLoadAccounts: "アカウントデータの読み込みに失敗しました。もう一度お試しください。",
    
    // Feature Unavailable
    featureUnavailable: "機能使用不可",
    voiceCommandsDisabled: "この環境では音声コマンドが無効になっています。",
    
    // Months
    jan: "1月",
    feb: "2月",
    mar: "3月",
    apr: "4月",
    may: "5月",
    jun: "6月",
    jul: "7月",
    aug: "8月",
    sep: "9月",
    oct: "10月",
    nov: "11月",
    dec: "12月",
    
    // Account Details
    accountDetails: "口座詳細",
    totalBalance: "総残高",
    transactions: "取引履歴",
    hideFullHistory: "全履歴と管理を非表示",
    viewFullHistory: "全履歴と管理を表示",
    accountManagement: "口座管理",
    accountOpeningDate: "口座開設日",
    downloadStatements: "電子明細書ダウンロード",
    changeNickname: "口座ニックネーム変更",
    salaryDeposit: "給与入金",
    supermarketPurchase: "スーパーマーケット購入",
    
    // Transaction messages
    paymentRequestFrom: "{name}からの支払いリクエスト",
    paymentRequestAccepted: "支払いリクエストが承認されました",
    transferFrom: "{name}からの送金",
    transferTo: "{name}への送金",
    
    // Transaction types
    transactionTransfer: "送金",
    transactionPayment: "支払い",
    transactionDebit: "引き落とし",
    transactionCredit: "入金",
  },
  ko: {
    // Homepage
    welcome: "환영합니다",
    switchAccount: "계정 전환",
    payNow: "지금 결제",
    scan: "스캔",
    customise: "사용자 지정",
    accounts: "계좌",
    cards: "카드",
    investments: "투자",
    availableBalance: "사용 가능 잔액",
    debitCardNo: "직불 카드 번호",
    creditCardNo: "신용 카드 번호",
    recentTransactions: "최근 거래",
    upTo50Last7Days: "최대 50건 (최근 7일만)",
    viewAll: "전체 보기",
    past3Days: "최근 3일",
    received: "받음",
    sent: "보냄",
    noRecentTransactions: "최근 거래 내역이 없습니다",
    transfer: "송금",
    payment: "결제",
    from: "보낸이",
    to: "받는이",
    selectAccount: "계정 선택",
    noTransactions: "이 기간 동안 거래가 없습니다",
    noAccountsFound: "계정을 찾을 수 없습니다. 고객지원에 문의하세요.",
    home: "홈",
    payAndTransfer: "결제 및 송금",
    more: "더보기",
    shoppingMallPurchase: "쇼핑몰 구매",
    logout: "로그아웃",
    logoutConfirm: "로그아웃하시겠습니까?",
    cancel: "취소",
    error: "오류",
    success: "성공",
    failedLogout: "로그아웃 실패",
    unexpectedError: "예기치 않은 오류가 발생했습니다",
    ok: "확인",
    cobi: "Cobi",
    recordingError: "녹음 오류",
    recordingInProgress: "녹음이 이미 진행 중입니다. 잠시 기다려 주세요.",
    tooShort: "너무 짧습니다—더 길게 누르세요.",
    noSpeechDetected: "(음성이 감지되지 않았습니다)",
    
    // Camera/QR Scanner
    permission: "권한",
    cameraPermissionRequired: "QR 코드를 스캔하려면 카메라 권한이 필요합니다.",
    invalidQR: "유효하지 않은 QR",
    qrNotRecognized: "이 QR 코드는 인식되지 않습니다.",
    couldNotParseQR: "QR 코드를 분석할 수 없습니다.",
    
    // Payment Request
    paymentRequest: "결제 요청",
    paymentRequestMessage: "{accountNo}에 SGD {amount}를 결제하시겠습니까?",
    paymentSuccessMessage: "보낸 사람에게 SGD {amount}를 결제했습니다.",
    pay: "결제",
    
    // Link Account
    linkAccount: "계정 연결",
    linkAccountMessage: "계정을 찾았습니다: {accountNo}. 연결하시겠습니까?",
    link: "연결",
    
    // No Accounts
    noAccountsFoundTitle: "계정을 찾을 수 없음",
    noAccountsFoundMessage: "이 이메일에 연결된 은행 계좌가 없습니다. 고객지원에 문의하거나 계정을 만드세요.",
    failedToLoadAccounts: "계정 데이터를 불러오는데 실패했습니다. 다시 시도하세요.",
    
    // Feature Unavailable
    featureUnavailable: "기능 사용 불가",
    voiceCommandsDisabled: "이 환경에서는 음성 명령이 현재 비활성화되어 있습니다.",
    
    // Months
    jan: "1월",
    feb: "2월",
    mar: "3월",
    apr: "4월",
    may: "5월",
    jun: "6월",
    jul: "7월",
    aug: "8월",
    sep: "9월",
    oct: "10월",
    nov: "11월",
    dec: "12월",
    
    // Account Details
    accountDetails: "계좌 세부정보",
    totalBalance: "총 잔액",
    transactions: "거래 내역",
    hideFullHistory: "전체 내역 및 관리 숨기기",
    viewFullHistory: "전체 내역 및 관리 보기",
    accountManagement: "계좌 관리",
    accountOpeningDate: "계좌 개설일",
    downloadStatements: "전자 명세서 다운로드",
    changeNickname: "계좌 별칭 변경",
    salaryDeposit: "급여 입금",
    supermarketPurchase: "슈퍼마켓 구매",
    
    // Transaction messages
    paymentRequestFrom: "{name}로부터 결제 요청",
    paymentRequestAccepted: "결제 요청 수락됨",
    transferFrom: "{name}로부터 송금",
    transferTo: "{name}에게 송금",
    
    // Transaction types
    transactionTransfer: "송금",
    transactionPayment: "결제",
    transactionDebit: "출금",
    transactionCredit: "입금",
  },
  es: {
    // Homepage
    welcome: "Bienvenido",
    switchAccount: "Cambiar cuenta",
    payNow: "Pagar ahora",
    scan: "Escanear",
    customise: "Personalizar",
    accounts: "Cuentas",
    cards: "Tarjetas",
    investments: "Inversiones",
    availableBalance: "Saldo disponible",
    debitCardNo: "Núm. de tarjeta de débito",
    creditCardNo: "Núm. de tarjeta de crédito",
    recentTransactions: "Transacciones recientes",
    upTo50Last7Days: "Hasta 50 (solo últimos 7 días)",
    viewAll: "Ver todo",
    past3Days: "Últimos 3 días",
    received: "RECIBIDO",
    sent: "ENVIADO",
    noRecentTransactions: "No hay transacciones recientes",
    transfer: "TRANSFERENCIA",
    payment: "PAGO",
    from: "De",
    to: "A",
    selectAccount: "Seleccionar cuenta",
    noTransactions: "No hay transacciones para este periodo",
    noAccountsFound: "No se encontraron cuentas. Contacte con soporte.",
    home: "Inicio",
    payAndTransfer: "Pagar y transferir",
    more: "Más",
    shoppingMallPurchase: "Compra en centro comercial",
    logout: "Cerrar sesión",
    logoutConfirm: "¿Está seguro de que desea cerrar sesión?",
    cancel: "Cancelar",
    error: "Error",
    success: "Éxito",
    failedLogout: "Error al cerrar sesión",
    unexpectedError: "Ocurrió un error inesperado",
    ok: "Aceptar",
    cobi: "Cobi",
    recordingError: "Error de grabación",
    recordingInProgress: "Ya hay una grabación en curso. Por favor, espera.",
    tooShort: "Demasiado corto—mantén presionado más tiempo.",
    noSpeechDetected: "(No se detectó voz)",
    
    // Camera/QR Scanner
    permission: "Permiso",
    cameraPermissionRequired: "Se requiere permiso de cámara para escanear códigos QR.",
    invalidQR: "QR no válido",
    qrNotRecognized: "Este código QR no se reconoce.",
    couldNotParseQR: "No se pudo analizar el código QR.",
    
    // Payment Request
    paymentRequest: "Solicitud de pago",
    paymentRequestMessage: "¿Desea pagar SGD {amount} a {accountNo}?",
    paymentSuccessMessage: "Se pagó SGD {amount} al remitente.",
    pay: "Pagar",
    
    // Link Account
    linkAccount: "Vincular cuenta",
    linkAccountMessage: "Cuenta encontrada: {accountNo}. ¿Desea vincular?",
    link: "Vincular",
    
    // No Accounts
    noAccountsFoundTitle: "No se encontraron cuentas",
    noAccountsFoundMessage: "No hay cuentas bancarias vinculadas a este correo. Contacte con soporte o cree una cuenta.",
    failedToLoadAccounts: "Error al cargar datos de cuenta. Inténtelo de nuevo.",
    
    // Feature Unavailable
    featureUnavailable: "Función no disponible",
    voiceCommandsDisabled: "Los comandos de voz están actualmente deshabilitados en este entorno.",
    
    // Months
    jan: "Ene",
    feb: "Feb",
    mar: "Mar",
    apr: "Abr",
    may: "May",
    jun: "Jun",
    jul: "Jul",
    aug: "Ago",
    sep: "Sep",
    oct: "Oct",
    nov: "Nov",
    dec: "Dic",
    
    // Account Details
    accountDetails: "Detalles de la cuenta",
    totalBalance: "Saldo total",
    transactions: "Transacciones",
    hideFullHistory: "Ocultar historial completo y gestión",
    viewFullHistory: "Ver historial completo y gestión",
    accountManagement: "Gestión de cuenta",
    accountOpeningDate: "Fecha de apertura de cuenta",
    downloadStatements: "Descargar extractos electrónicos",
    changeNickname: "Cambiar apodo de cuenta",
    salaryDeposit: "Depósito de salario",
    supermarketPurchase: "Compra en supermercado",
    
    // Transaction messages
    paymentRequestFrom: "Solicitud de pago de {name}",
    paymentRequestAccepted: "Solicitud de pago aceptada",
    transferFrom: "Transferencia de {name}",
    transferTo: "Transferencia a {name}",
    
    // Transaction types
    transactionTransfer: "TRANSFERENCIA",
    transactionPayment: "PAGO",
    transactionDebit: "DÉBITO",
    transactionCredit: "CRÉDITO",
  },
  fr: {
    // Homepage
    welcome: "Bienvenue",
    switchAccount: "Changer de compte",
    payNow: "Payer maintenant",
    scan: "Scanner",
    customise: "Personnaliser",
    accounts: "Comptes",
    cards: "Cartes",
    investments: "Investissements",
    availableBalance: "Solde disponible",
    debitCardNo: "N° de carte de débit",
    creditCardNo: "N° de carte de crédit",
    recentTransactions: "Transactions récentes",
    upTo50Last7Days: "Jusqu'à 50 (7 derniers jours seulement)",
    viewAll: "Tout voir",
    past3Days: "3 derniers jours",
    received: "REÇU",
    sent: "ENVOYÉ",
    noRecentTransactions: "Aucune transaction récente",
    transfer: "VIREMENT",
    payment: "PAIEMENT",
    from: "De",
    to: "À",
    selectAccount: "Sélectionner un compte",
    noTransactions: "Aucune transaction pour cette période",
    noAccountsFound: "Aucun compte trouvé. Veuillez contacter le support.",
    home: "Accueil",
    payAndTransfer: "Payer et transférer",
    more: "Plus",
    shoppingMallPurchase: "Achat dans un centre commercial",
    logout: "Déconnexion",
    logoutConfirm: "Êtes-vous sûr de vouloir vous déconnecter?",
    cancel: "Annuler",
    error: "Erreur",
    success: "Succès",
    failedLogout: "Échec de la déconnexion",
    unexpectedError: "Une erreur inattendue s'est produite",
    ok: "OK",
    cobi: "Cobi",
    recordingError: "Erreur d'enregistrement",
    recordingInProgress: "Un enregistrement est déjà en cours. Veuillez patienter.",
    tooShort: "Trop court—maintenez plus longtemps.",
    noSpeechDetected: "(Aucune parole détectée)",
    
    // Camera/QR Scanner
    permission: "Autorisation",
    cameraPermissionRequired: "L'autorisation de la caméra est requise pour scanner les codes QR.",
    invalidQR: "QR invalide",
    qrNotRecognized: "Ce code QR n'est pas reconnu.",
    couldNotParseQR: "Impossible d'analyser le code QR.",
    
    // Payment Request
    paymentRequest: "Demande de paiement",
    paymentRequestMessage: "Voulez-vous payer SGD {amount} à {accountNo}?",
    paymentSuccessMessage: "Paiement de SGD {amount} effectué à l'expéditeur.",
    pay: "Payer",
    
    // Link Account
    linkAccount: "Lier un compte",
    linkAccountMessage: "Compte trouvé: {accountNo}. Voulez-vous le lier?",
    link: "Lier",
    
    // No Accounts
    noAccountsFoundTitle: "Aucun compte trouvé",
    noAccountsFoundMessage: "Aucun compte bancaire n'est lié à cet e-mail. Veuillez contacter le support ou créer un compte.",
    failedToLoadAccounts: "Échec du chargement des données de compte. Veuillez réessayer.",
    
    // Feature Unavailable
    featureUnavailable: "Fonctionnalité indisponible",
    voiceCommandsDisabled: "Les commandes vocales sont actuellement désactivées dans cet environnement.",
    
    // Months
    jan: "Jan",
    feb: "Fév",
    mar: "Mars",
    apr: "Avr",
    may: "Mai",
    jun: "Juin",
    jul: "Juil",
    aug: "Août",
    sep: "Sep",
    oct: "Oct",
    nov: "Nov",
    dec: "Déc",
    
    // Account Details
    accountDetails: "Détails du compte",
    totalBalance: "Solde total",
    transactions: "Transactions",
    hideFullHistory: "Masquer l'historique complet et la gestion",
    viewFullHistory: "Voir l'historique complet et la gestion",
    accountManagement: "Gestion du compte",
    accountOpeningDate: "Date d'ouverture du compte",
    downloadStatements: "Télécharger les relevés électroniques",
    changeNickname: "Changer le surnom du compte",
    salaryDeposit: "Dépôt de salaire",
    supermarketPurchase: "Achat au supermarché",
    
    // Transaction messages
    paymentRequestFrom: "Demande de paiement de {name}",
    paymentRequestAccepted: "Demande de paiement acceptée",
    transferFrom: "Virement de {name}",
    transferTo: "Virement à {name}",
    
    // Transaction types
    transactionTransfer: "VIREMENT",
    transactionPayment: "PAIEMENT",
    transactionDebit: "DÉBIT",
    transactionCredit: "CRÉDIT",
  },
  de: {
    // Homepage
    welcome: "Willkommen",
    switchAccount: "Konto wechseln",
    payNow: "Jetzt bezahlen",
    scan: "Scannen",
    customise: "Anpassen",
    accounts: "Konten",
    cards: "Karten",
    investments: "Investitionen",
    availableBalance: "Verfügbarer Saldo",
    debitCardNo: "Debitkartennr.",
    creditCardNo: "Kreditkartennr.",
    recentTransactions: "Letzte Transaktionen",
    upTo50Last7Days: "Bis zu 50 (nur letzte 7 Tage)",
    viewAll: "Alle anzeigen",
    past3Days: "Letzte 3 Tage",
    received: "EMPFANGEN",
    sent: "GESENDET",
    noRecentTransactions: "Keine aktuellen Transaktionen",
    transfer: "ÜBERWEISUNG",
    payment: "ZAHLUNG",
    from: "Von",
    to: "An",
    selectAccount: "Konto auswählen",
    noTransactions: "Keine Transaktionen für diesen Zeitraum",
    noAccountsFound: "Keine Konten gefunden. Bitte kontaktieren Sie den Support.",
    home: "Startseite",
    payAndTransfer: "Bezahlen und überweisen",
    more: "Mehr",
    shoppingMallPurchase: "Einkaufszentrum Kauf",
    logout: "Abmelden",
    logoutConfirm: "Möchten Sie sich wirklich abmelden?",
    cancel: "Abbrechen",
    error: "Fehler",
    success: "Erfolg",
    failedLogout: "Abmeldung fehlgeschlagen",
    unexpectedError: "Ein unerwarteter Fehler ist aufgetreten",
    ok: "OK",
    cobi: "Cobi",
    recordingError: "Aufnahmefehler",
    tooShort: "Zu kurz—länger halten.",
    noSpeechDetected: "(Keine Sprache erkannt)",
    
    // Camera/QR Scanner
    permission: "Berechtigung",
    cameraPermissionRequired: "Kameraberechtigung ist erforderlich, um QR-Codes zu scannen.",
    invalidQR: "Ungültiger QR",
    qrNotRecognized: "Dieser QR-Code wird nicht erkannt.",
    couldNotParseQR: "QR-Code konnte nicht analysiert werden.",
    
    // Payment Request
    paymentRequest: "Zahlungsanfrage",
    paymentRequestMessage: "Möchten Sie SGD {amount} an {accountNo} zahlen?",
    paymentSuccessMessage: "SGD {amount} an Absender bezahlt.",
    pay: "Bezahlen",
    
    // Link Account
    linkAccount: "Konto verknüpfen",
    linkAccountMessage: "Konto gefunden: {accountNo}. Möchten Sie verknüpfen?",
    link: "Verknüpfen",
    
    // No Accounts
    noAccountsFoundTitle: "Keine Konten gefunden",
    noAccountsFoundMessage: "Keine Bankkonten sind mit dieser E-Mail verknüpft. Bitte kontaktieren Sie den Support oder erstellen Sie ein Konto.",
    failedToLoadAccounts: "Fehler beim Laden der Kontodaten. Bitte versuchen Sie es erneut.",
    
    // Feature Unavailable
    featureUnavailable: "Funktion nicht verfügbar",
    voiceCommandsDisabled: "Sprachbefehle sind in dieser Umgebung derzeit deaktiviert.",
    
    // Months
    jan: "Jan",
    feb: "Feb",
    mar: "Mär",
    apr: "Apr",
    may: "Mai",
    jun: "Jun",
    jul: "Jul",
    aug: "Aug",
    sep: "Sep",
    oct: "Okt",
    nov: "Nov",
    dec: "Dez",
    
    // Account Details
    accountDetails: "Kontodetails",
    totalBalance: "Gesamtsaldo",
    transactions: "Transaktionen",
    hideFullHistory: "Vollständige Historie und Verwaltung ausblenden",
    viewFullHistory: "Vollständige Historie und Verwaltung anzeigen",
    accountManagement: "Kontoverwaltung",
    accountOpeningDate: "Kontoeröffnungsdatum",
    downloadStatements: "E-Kontoauszüge herunterladen",
    changeNickname: "Kontonamen ändern",
    salaryDeposit: "Gehaltseinzahlung",
    supermarketPurchase: "Supermarktkauf",
    
    // Transaction messages
    paymentRequestFrom: "Zahlungsanfrage von {name}",
    paymentRequestAccepted: "Zahlungsanfrage akzeptiert",
    transferFrom: "Überweisung von {name}",
    transferTo: "Überweisung an {name}",
    
    // Transaction types
    transactionTransfer: "ÜBERWEISUNG",
    transactionPayment: "ZAHLUNG",
    transactionDebit: "LASTSCHRIFT",
    transactionCredit: "GUTSCHRIFT",
  },
};

export const getTranslation = (key: string, lang: string = "en"): string => {
  return translations[lang]?.[key] || translations.en[key] || key;
};

export const getTranslationWithParams = (
  key: string,
  lang: string = "en",
  params: Record<string, string> = {}
): string => {
  let text = getTranslation(key, lang);
  Object.keys(params).forEach((param) => {
    text = text.replace(`{${param}}`, params[param]);
  });
  return text;
};

// Helper function to translate transaction messages
export const translateTransactionMessage = (
  message: string,
  lang: string = "en"
): string => {
  if (!message) return "";

  // Pattern: "Request from [name]" (case-insensitive) - actual database format
  const requestMatch = message.match(/Request from (.+)/i);
  if (requestMatch) {
    return getTranslationWithParams("paymentRequestFrom", lang, {
      name: requestMatch[1],
    });
  }

  // Pattern: "Payment Request from [name]" (case-insensitive)
  const paymentRequestMatch = message.match(/Payment Request from (.+)/i);
  if (paymentRequestMatch) {
    return getTranslationWithParams("paymentRequestFrom", lang, {
      name: paymentRequestMatch[1],
    });
  }

  // Pattern: "Payment Request Accepted" (case-insensitive)
  if (message.match(/Payment Request Accepted/i)) {
    return getTranslation("paymentRequestAccepted", lang);
  }

  // Pattern: "Transfer from [name]" (case-insensitive)
  const transferFromMatch = message.match(/Transfer from (.+)/i);
  if (transferFromMatch) {
    return getTranslationWithParams("transferFrom", lang, {
      name: transferFromMatch[1],
    });
  }

  // Pattern: "Transfer to [name]" (case-insensitive)
  const transferToMatch = message.match(/Transfer to (.+)/i);
  if (transferToMatch) {
    return getTranslationWithParams("transferTo", lang, {
      name: transferToMatch[1],
    });
  }

  // Check if message matches any translation key (case-insensitive comparison)
  const knownKeys = [
    "shoppingMallPurchase",
    "salaryDeposit",
    "supermarketPurchase",
  ];
  
  for (const key of knownKeys) {
    const englishText = translations.en[key];
    if (message.toLowerCase() === englishText.toLowerCase()) {
      return getTranslation(key, lang);
    }
  }

  // Return original message if no pattern matches
  return message;
};
