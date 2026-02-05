export interface TutorialStep {
  nativeID: string; // nativeID of the element to highlight
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right'; // Position of the tooltip relative to the target
  allowInteraction?: boolean; // If true, allows interaction with the highlighted element
}

export interface ScreenTutorial {
  [screenName: string]: TutorialStep[];
}

const homepageTutorials: Record<string, TutorialStep[]> = {
  en: [
    {
      nativeID: 'quick-actions',
      title: 'Quick Actions',
      content: 'Access PayNow for payments, GiveNow for donations, Scan QR codes, or customize your dashboard. These buttons let you quickly perform common banking tasks.',
      position: 'bottom',
      allowInteraction: true,
    },
    {
      nativeID: 'recent-transactions',
      title: 'Recent Transactions',
      content: 'View your transaction history from the past 3 days. Tap "View All" to see more transactions or manage your transaction records.',
      position: 'top',
      allowInteraction: true,
    },
    {
      nativeID: 'switch-account',
      title: 'Switch Account',
      content: 'You can have multiple accounts linked. Use this button to easily switch between different accounts and see their balances.',
      position: 'bottom',
      allowInteraction: true,
    },
    {
      nativeID: 'eye-icon',
      title: 'Hide/Show Balance',
      content: 'Click the eye icon to hide or show your account balance and card details for privacy.',
      position: 'bottom',
      allowInteraction: true,
    },
  ],
  zh: [
    {
      nativeID: 'quick-actions',
      title: '快速操作',
      content: '访问PayNow进行支付，GiveNow进行捐款，扫描二维码或自定义您的仪表板。这些按钮让您快速执行常见的银行任务。',
      position: 'bottom',
      allowInteraction: true,
    },
    {
      nativeID: 'recent-transactions',
      title: '最近交易',
      content: '查看过去3天的交易历史。点击"查看全部"查看更多交易或管理您的交易记录。',
      position: 'top',
      allowInteraction: true,
    },
    {
      nativeID: 'switch-account',
      title: '切换账户',
      content: '您可以关联多个账户。使用此按钮轻松在不同账户之间切换并查看它们的余额。',
      position: 'bottom',
      allowInteraction: true,
    },
    {
      nativeID: 'eye-icon',
      title: '隐藏/显示余额',
      content: '点击眼睛图标隐藏或显示您的账户余额和卡片详情以保护隐私。',
      position: 'bottom',
      allowInteraction: true,
    },
  ],
  ms: [
    {
      nativeID: 'quick-actions',
      title: 'Tindakan Cepat',
      content: 'Akses PayNow untuk pembayaran, GiveNow untuk sumbangan, Pindai kode QR, atau sesuaikan dasbor Anda. Tombol ini memungkinkan Anda melakukan tugas perbankan umum dengan cepat.',
      position: 'bottom',
      allowInteraction: true,
    },
    {
      nativeID: 'recent-transactions',
      title: 'Transaksi Terbaru',
      content: 'Lihat riwayat transaksi Anda dari 3 hari terakhir. Ketuk "Lihat Semua" untuk melihat lebih banyak transaksi atau kelola catatan transaksi Anda.',
      position: 'top',
      allowInteraction: true,
    },
    {
      nativeID: 'switch-account',
      title: 'Tukar Akun',
      content: 'Anda dapat memiliki beberapa akun tertaut. Gunakan tombol ini untuk beralih dengan mudah antar akun dan melihat saldonya.',
      position: 'bottom',
      allowInteraction: true,
    },
    {
      nativeID: 'eye-icon',
      title: 'Sembunyikan/Tampilkan Saldo',
      content: 'Klik ikon mata untuk menyembunyikan atau menampilkan saldo akun dan detail kartu Anda untuk privasi.',
      position: 'bottom',
      allowInteraction: true,
    },
  ],
};

const payNowTutorials: Record<string, TutorialStep[]> = {
  en: [
    {
      nativeID: 'search-bar',
      title: 'Search by Name or Mobile',
      content: 'Enter a recipient\'s name or mobile number to find them quickly. The search results will appear instantly as you type.',
      position: 'bottom',
      allowInteraction: true,
    },
    {
      nativeID: 'nric-search-button',
      title: 'Switch to NRIC Search',
      content: 'Tap this button to switch between searching by name/mobile and searching by NRIC. Choose the method that works best for you.',
      position: 'bottom',
      allowInteraction: true,
    },
    {
      nativeID: 'contact-item',
      title: 'Select Contact',
      content: 'Tap on any contact to proceed with the PayNow transfer. Your recent recipients will appear here for quick access.',
      position: 'bottom',
      allowInteraction: true,
    },
  ],
  zh: [
    {
      nativeID: 'search-bar',
      title: '按名称或手机号搜索',
      content: '输入收款人的名称或手机号快速找到他们。当您输入时，搜索结果会立即显示。',
      position: 'bottom',
      allowInteraction: true,
    },
    {
      nativeID: 'nric-search-button',
      title: '切换到身份证搜索',
      content: '点击此按钮在按名称/手机号搜索和按身份证号搜索之间切换。选择最适合您的方法。',
      position: 'bottom',
      allowInteraction: true,
    },
    {
      nativeID: 'contact-item',
      title: '选择联系人',
      content: '点击任何联系人以继续进行PayNow转账。您最近的收款人将在此显示以便快速访问。',
      position: 'bottom',
      allowInteraction: true,
    },
  ],
  ms: [
    {
      nativeID: 'search-bar',
      title: 'Cari Berdasarkan Nama atau Seluler',
      content: 'Masukkan nama penerima atau nomor seluler untuk menemukannya dengan cepat. Hasil pencarian akan muncul segera saat Anda mengetik.',
      position: 'bottom',
      allowInteraction: true,
    },
    {
      nativeID: 'nric-search-button',
      title: 'Beralih ke Pencarian NRIC',
      content: 'Ketuk tombol ini untuk beralih antara pencarian berdasarkan nama/seluler dan pencarian berdasarkan NRIC. Pilih metode yang paling cocok untuk Anda.',
      position: 'bottom',
      allowInteraction: true,
    },
    {
      nativeID: 'contact-item',
      title: 'Pilih Kontak',
      content: 'Ketuk kontak mana pun untuk melanjutkan transfer PayNow. Penerima terbaru Anda akan muncul di sini untuk akses cepat.',
      position: 'bottom',
      allowInteraction: true,
    },
  ],
};

export const getTutorials = (language: string = 'en'): ScreenTutorial => {
  return {
    homepage: homepageTutorials[language] || homepageTutorials.en,
    paynow: payNowTutorials[language] || payNowTutorials.en,
  };
};

// For backward compatibility, export default tutorials in English
export const tutorials: ScreenTutorial = getTutorials('en');