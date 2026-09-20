# LinkStudio Project Status

_Sana: 2026-09-05_

## Maqsad

Taplink.ru ga funksional jihatdan maksimal yaqin bo'lgan, lekin mustaqil kod bazasiga ega link-in-bio builder yaratish.

Asosiy maqsadlar:

1. Taplink'dagi ochiq ko'rinadigan imkoniyatlarga teng builder qilish.
2. Builder UX'ini qulay va tez ishlaydigan holatga olib kelish.
3. Public sahifa, CRM, analytics, payments, templates va store oqimlarini bir platformada jamlash.
4. Keyinchalik production darajaga chiqarish uchun backend va frontend arxitekturasini to'g'ri qurish.

## Shu Yergacha Qilingan Ishlar

### 1. Dastlabki prototip

1. Oddiy Python HTTP server bilan birinchi demo variant yaratildi.
2. Lokal JSON storage qo'yildi.
3. Admin panel va public sahifa oqimi sinab ko'rildi.
4. Lead yaratish, event tracking va payment simulation ishga tushirildi.

### 2. Taplink'ga yaqin funksional yo'nalish aniqlangani

1. Taplink'ning ochiq hujjatlaridan imkoniyatlar tekshirildi.
2. Basic, Pro va Business planlarga o'xshash feature matrix shakllantirildi.
3. Yopiq kod yoki private endpoint'larni ko'chirmasdan, funksional ekvivalent qurish yo'li tanlandi.

### 3. Texnik stack yangilanishi

1. Backend FastAPI ga ko'chirildi.
2. Frontend React + Vite ga ko'chirildi.
3. Lokal build va API servis bitta ishlab turgan tizimga ulanildi.
4. `backend/` va `frontend/` alohida qatlamlarga ajratildi.

### 4. Builder funksiyalari

1. Sahifa builder tayyorlandi.
2. Templates kutubxonasi qo'shildi.
3. Themes/design library qo'shildi.
4. Block catalog kengaytirildi:
   - avatar
   - text
   - link
   - links
   - messengers
   - socials
   - image
   - video
   - carousel
   - map
   - FAQ
   - form
   - timer
   - products
   - digital goods
   - pricing plans
   - custom block
   - HTML
5. JSON textarea asosidagi editordan block-specific settings formalariga o'tildi.
6. Block reorder uchun drag-and-drop qo'shildi.
7. Block hide va schedule visibility qo'shildi.

### 5. Business funksiyalar

1. CRM/leads panel yaratildi.
2. Orders va payments simulation yo'lga qo'yildi.
3. Analytics endpoint va dashboard qo'shildi.
4. Custom domain, SEO, pixels va branding settings maydonlari qo'shildi.
5. Internal pages data modeli qo'shildi.

### 6. Taplink-Grade Visual & Background Engine Upgrades (Yangi)

1. **Multi-Layer Background Engine**:
   - `solid`, `gradient`, `image`, `gif`, `video` (MP4/WebM loop), `mesh` (4 rangli oqimli gradient), `particles` (kosmik nurli zarrachalar)
   - Frosted Glassmorphism blur (0–40px) va moslashtirilgan overlay qorong'ulik/rang qatlami.
2. **Ultra Notice-Me Animations**:
   - `shimmer-glow` (nur sweep), `heartbeat-pulse` (aura to'lqini), `jelly-bounce` (elastik rezinaviy), `bounce`, `float-hover` (3D), `wiggle-shake`, `neon-glow` (rang o'zgaruvchi), `gradient-flow`.
3. **Instagram Stories / Highlights Bloki**:
   - Dumaloq coverlar, aylanuvchi faol halqa va avtomatik 5s progress barga ega to'liq ekranli Story Viewer modali.
4. **Mijozlar Sharhlari & Reyting Bloki (Reviews)**:
   - 5 yulduzli reyting, mijoz fotosurati, ism/kasbi, tasdiqlangan xaridor (Verified ✓) nishoni.
5. **SVG Shaklli Ajratgichlar (Shape Dividers)**:
   - Wave, Curve, Slant, Zigzag, Glow Separator.
6. **Qalqib Turuvchi Tezkor Aloqa Vidjeti (Floating Speed-Dial FAB)**:
   - Pastki burchakdagi radar pulsatsiyali FAB tugma, bosilganda ochiluvchi Telegram, WhatsApp, Instagram, Qo'ng'iroq menyusi.
7. **Sticky CTA / FOMO Banner**:
   - Ekran tepasida yoki pastida doimiy ko'rinib turuvchi teskari hisob taymeri va xarid tugmasi.
8. **8 ta 1-Click Wow Presets**:
   - Cyberpunk Neon, Frosted Crystal Glass, Space Particles, Emerald Luxury, Sunset Flame, Dynamic Video Showcase, Elegant Rose Gold, Midnight Carbon.

### 7. Ishlayotgan fayllar

1. Backend asosiy logikasi: [backend/main.py](/mnt/hdd/Xudoynazar_hdd/taplink/backend/main.py)
2. Bildirishnomalar: [backend/notifications.py](/mnt/hdd/Xudoynazar_hdd/taplink/backend/notifications.py)
3. Frontend asosiy logikasi: [frontend/src/main.jsx](/mnt/hdd/Xudoynazar_hdd/taplink/frontend/src/main.jsx)
4. Frontend stil & animatsiyalar: [frontend/src/styles.css](/mnt/hdd/Xudoynazar_hdd/taplink/frontend/src/styles.css)
5. SQLite Database: `data/linkstudio.db`
6. Qisqa texnik qo'llanma: [README.md](/mnt/hdd/Xudoynazar_hdd/taplink/README.md)
4. Media upload va file library.
5. Real drag-and-drop visual builder.
6. Block-level responsive controls va advanced layout editor.
7. Real payment integratsiyalari.
8. Webhook, notification va email pipeline.
9. Custom domain verification va SSL provisioning.
10. QR generator va publish flow.
11. Role-based access va shared editing.
12. Digital product delivery va order management.

## Keyingi Ishlar

### Bosqich 1 (Bajarildi ✅)

1. Real auth qo'shish (PBKDF2 HMAC-SHA256 parollar, Bearer session tokens, login, register, me, logout).
2. User/workspace model yaratish (har bir foydalanuvchining o'z workspace'i va ko'p sahifalari).
3. Page ownership va multi-page switcher (foydalanuvchi sahifalar ro'yxati, yangi sahifa yaratish modali, sahifalar o'rtasida almashish, o'chirish).
4. Alohida portlar arxitekturasi: Backend 8000 portda, Frontend 5173 portda to'liq mustaqil ishlaydi.

### Bosqich 2 (Bajarildi ✅)

1. JSON file storage o'rniga to'liq SQLite (`data/linkstudio.db`) relyatsion ma'lumotlar bazasi o'rnatildi (WAL mode, avtomatik migratsiya).
2. Haqiqiy Media upload va Asset management qo'shildi (`POST /api/upload`, `GET /api/assets`, `DELETE /api/assets/{id}`, `/uploads` statik xizmati).
3. Frontendda ImageUploader, Asset Library tanlash modali va "Media & Fayllar" boshqaruv bo'limi joriy etildi.

### Bosqich 3 (Bajarildi ✅)

1. Visual Drag & Drop Builder: Mobil ekrandagi bloklar to'g'ridan-to'g'ri tanlanadi va floating tezkor tugmalar (Move Up/Down, Duplicate, Delete) bilan boshqariladi.
2. Insert-Between-Blocks (`+` divider): Istalgan ikkita blok o'rtasiga 1 ta bosishda yangi blok kiritish popover menyusi qo'shildi.
3. Block-Level Styles & Animations: Har bir blok uchun shaxsiy fon/matn ranglari, padding, shadow effektlari (soft, strong, glow) va animatsiyalar (pulse, bounce, float, fadeIn, shimmer) joriy etildi.
4. Advanced Custom Canvas / Layer Editor: Grid koordinatalari (X, Y, W, H) bo'yicha matn, tugma, badge va fon qutilarini boshqaruvchi qatlamlar tahrirlagichi yaratildi.

### Bosqich 4 (Bajarildi ✅)

1. **Telegram Bot Alerts Integratsiyasi**: [backend/notifications.py](file:///mnt/hdd/Xudoynazar_hdd/taplink/backend/notifications.py) va `POST /api/notifications/test-telegram` orqali yangi tushgan har bir ariza, xarid va to'lov haqida do'kon egasining Telegram botiga tezkor chiroyli xabar borishi ta'minlandi.
2. **To'lov Shlyuzlari & Checkout Oqimi**:
   - `POST /api/payments/checkout`, `POST /api/webhooks/payme`, `POST /api/webhooks/click` backend shlyuzlari.
   - Frontendda interaktiv `PaymentCheckoutModal`: Karta raqami (Humo/Uzcard) nusxalash va to'lov ko'rsatmasi, Payme va Click orqali avtomatlashtirilgan to'lov, muvaffaqiyatli buyurtma tasdiq ekrani.
3. **Kengaytirilgan CRM Pipeline & Buyurtmalar**:
   - Statuslar bo'yicha filterlar (`Barchasi`, `Yangi`, `Jarayonda`, `Muvaffaqiyatli`, `Bekor qilingan`) va real-time qidiruv.
   - Inline status dropdown orqali holatni 1 ta bosishda o'zgartirish (`PATCH /api/leads/{id}`).
   - Mijoz bilan tezkor bog'lanish (Telefon orqali qo'ng'iroq `tel:` va `t.me/` Telegram orqali yozish).
   - Mijoz ma'lumotlari uchun maxsus `LeadDetailModal`.
   - **Excel uchun UTF-8 BOM CSV Eksport**: `GET /api/leads/export?slug=...` orqali barcha arizalarni jadval qilib yuklab olish.
4. **Sozlamalar Markazi (SettingsPanel)**: Telegram botni ulash bo'yicha qadamma-qadam qo'llanma, real vaqtda test xabar yuborish, to'lov tizimlari va karta ma'lumotlarini kiritish.

### Bosqich 5

1. Custom domain verification va DNS sozlamalari.
2. SEO, Meta OpenGraph teglar va dinamik QR-kod generatori.
3. Publish & production deployment tayyorgarligi.

## Qisqa Xulosa

Bu loyiha hozir Taplink'ga o'xshash MVP emas, balki Taplink darajasiga olib borish uchun yo'naltirilgan asosiy platforma skeletoniga aylandi.

Keyingi ishlar endi UX, auth, storage va production infra tomoniga o'tishi kerak.
