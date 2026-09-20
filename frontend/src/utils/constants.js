/**
 * Constants & Block definitions for LinkStudio Pro
 */

export const BLOCK_CATEGORIES = [
  { id: 'all', label: 'Barcha Bloklar', icon: '✨' },
  { id: 'essential', label: 'Asosiy & Profil', icon: '👤' },
  { id: 'commerce', label: 'Savdo & E-Commerce', icon: '🛍️' },
  { id: 'media', label: 'Media & Galereya', icon: '🎬' },
  { id: 'conversion', label: 'Konversiya & FOMO', icon: '⚡' },
  { id: 'interactive', label: 'Interaktiv & Aloqa', icon: '💬' },
];

export const BLOCK_TYPES = [
  {
    type: 'avatar',
    category: 'essential',
    badge: 'Mashhur',
    label: 'Profil & Bio',
    icon: '👤',
    desc: 'Avatar, ism, faoliyat va tasdiqlangan (verified) nishon',
  },
  {
    type: 'link',
    category: 'essential',
    badge: 'Asosiy',
    label: 'Tugma Havola',
    icon: '🔗',
    desc: 'Sayt, kanal yoki xizmatga yo\'naltiruvchi maxsus dizayndagi tugma',
  },
  {
    type: 'messengers',
    category: 'interactive',
    badge: 'Tezkor Aloqa',
    label: 'Messenjerlar & Ijtimoiy Tarmoq',
    icon: '💬',
    desc: 'Telegram, WhatsApp, Instagram, Qo\'ng\'iroq va boshqa kanallar',
  },
  {
    type: 'text',
    category: 'essential',
    label: 'Matn & Sarlavha',
    icon: '📝',
    desc: 'Boy matnli sarlavha, bio, xizmat tavsifi va paragraflar',
  },
  {
    type: 'stories',
    category: 'media',
    badge: 'Instagram Uslub',
    label: 'Instagram Stories (Highlights)',
    icon: '⭕',
    desc: 'Doiraviy hikoyalar, avtomatik progress barli to\'liq ekran viewer',
  },
  {
    type: 'media',
    category: 'media',
    label: 'Rasm, Karusel & Video Banner',
    icon: '🖼️',
    desc: 'Slayder karusellar, rasmlar va YouTube/MP4 video pleyer',
  },
  {
    type: 'products',
    category: 'commerce',
    badge: 'Savdo',
    label: 'Mini Do\'kon / Mahsulotlar',
    icon: '🛍️',
    desc: 'Rasm, chegirma narxi va to\'g\'ridan-to\'g\'ri xarid checkout modali',
  },
  {
    type: 'pricing',
    category: 'commerce',
    badge: 'Xizmatlar',
    label: 'Tariflar & Paketlar',
    icon: '💳',
    desc: 'Xizmat paketlari, narxlar jadvali va VIP tanlov nishonlari',
  },
  {
    type: 'form',
    category: 'conversion',
    badge: 'Lidlar',
    label: 'Buyurtma & Ariza Formasi',
    icon: '📋',
    desc: 'Mijoz ism/telefonini olish, CRM ga yuborish va Telegram xabarnoma',
  },
  {
    type: 'timer',
    category: 'conversion',
    badge: 'FOMO',
    label: 'Ortga Sanash Taymeri',
    icon: '⏳',
    desc: 'Aksiya va chegirma tugashini ko\'rsatuvchi jonli soniyalar',
  },
  {
    type: 'reviews',
    category: 'conversion',
    badge: 'Ishonch',
    label: 'Mijozlar Sharhlari & Reyting',
    icon: '⭐',
    desc: '5 yulduzli reyting, mijoz fotosurati, ism va ijobiy fikrlar',
  },
  {
    type: 'location',
    category: 'interactive',
    badge: 'Xarita',
    label: 'Xarita & Manzil (Lokatsiya)',
    icon: '📍',
    desc: 'Yandex/Google xarita, manzil nusxalash va marshrut tugmasi',
  },
  {
    type: 'qrcode',
    category: 'interactive',
    badge: 'Ulashing',
    label: 'QR Kod Generatori',
    icon: '📱',
    desc: 'Sahifaga tezkor kirish, Wi-Fi yoki maxsus QR kod yasash',
  },
  {
    type: 'faq',
    category: 'interactive',
    label: 'Ko\'p So\'raladigan Savollar (FAQ)',
    icon: '❓',
    desc: 'Akkordeon ko\'rinishidagi silliq ochiluvchi savol-javoblar',
  },
  {
    type: 'divider',
    category: 'essential',
    label: 'Shaklli Bo\'luvchi (SVG Divider)',
    icon: '〰️',
    desc: 'To\'lqin, qiya chiziq, zigzag va nurli ajratgichlar',
  },
  {
    type: 'canvas',
    category: 'essential',
    badge: 'Pro Dizayn',
    label: 'Erkin Dizayn (Canvas Qatlamlar)',
    icon: '🎨',
    desc: 'Erkin joylashtiriladigan qatlamlar, shakllar va matnlar',
  },
];

export const SOCIAL_PRESETS = [
  { id: 'telegram', label: 'Telegram', prefix: 'https://t.me/', icon: '✈️', color: '#229ED9' },
  { id: 'whatsapp', label: 'WhatsApp', prefix: 'https://wa.me/', icon: '💬', color: '#25D366' },
  { id: 'instagram', label: 'Instagram', prefix: 'https://instagram.com/', icon: '📸', color: '#E1306C' },
  { id: 'phone', label: 'Telefon', prefix: 'tel:', icon: '📞', color: '#10B981' },
  { id: 'youtube', label: 'YouTube', prefix: 'https://youtube.com/@', icon: '▶️', color: '#FF0000' },
  { id: 'tiktok', label: 'TikTok', prefix: 'https://tiktok.com/@', icon: '🎵', color: '#000000' },
  { id: 'facebook', label: 'Facebook', prefix: 'https://facebook.com/', icon: '👥', color: '#1877F2' },
  { id: 'linkedin', label: 'LinkedIn', prefix: 'https://linkedin.com/in/', icon: '💼', color: '#0A66C2' },
];

export const ANIMATION_PRESETS = [
  { id: 'none', label: 'Animatsiyasiz' },
  { id: 'shimmer', label: '✨ Nur Sweep (Shimmer)' },
  { id: 'pulse', label: '💓 Yurak Urishi (Heartbeat Pulse)' },
  { id: 'bounce', label: '🎈 Sakrash (Jelly Bounce)' },
  { id: 'float', label: '🛸 3D Suzish (Float Hover)' },
  { id: 'wiggle', label: '🔔 Qimirlash (Wiggle Shake)' },
  { id: 'glow', label: '🌈 Neon Aura Nur (Neon Glow)' },
  { id: 'gradient', label: '🌊 Gradient To\'lqini' },
  { id: 'fadeIn', label: '💫 Yumshoq Paydo Bo\'lish' },
];

export const GOOGLE_FONTS = [
  { id: 'Inter', name: 'Inter (Standart Zamonaviy)', category: 'sans-serif' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (Premium Tech)', category: 'sans-serif' },
  { id: 'Outfit', name: 'Outfit (Trend Geometrik)', category: 'sans-serif' },
  { id: 'Space Grotesk', name: 'Space Grotesk (Futuristik / Cyber)', category: 'sans-serif' },
  { id: 'Syne', name: 'Syne (Art & Kreativ)', category: 'display' },
  { id: 'Playfair Display', name: 'Playfair Display (Klassik & Luxury Serif)', category: 'serif' },
  { id: 'Montserrat', name: 'Montserrat (Kuchli Sarlavhalar)', category: 'sans-serif' },
  { id: 'Raleway', name: 'Raleway (Nozik & Elegant)', category: 'sans-serif' },
];

export const DEFAULT_THEME = {
  backgroundType: 'gradient',
  background: '#090d16',
  gradient: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)',
  surface: 'rgba(255, 255, 255, 0.08)',
  text: '#f8fafc',
  accent: '#6366f1',
  radius: 16,
  blur: 16,
  overlayOpacity: 0.15,
  overlayColor: '#000000',
  buttonStyle: 'glass',
  fontFamily: 'Plus Jakarta Sans',
};

