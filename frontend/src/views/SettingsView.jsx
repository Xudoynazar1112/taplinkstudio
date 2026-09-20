import React, { useState } from 'react';
import { api } from '../utils/api';

export default function SettingsView({ activePage, onUpdateSettings, onDeletePage }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'telegram' | 'payments' | 'domains' | 'pixels' | 'danger'
  const [slug, setSlug] = useState(activePage?.slug || '');
  const [title, setTitle] = useState(activePage?.title || '');
  const [seoDescription, setSeoDescription] = useState(activePage?.seo_description || '');
  const [telegramToken, setTelegramToken] = useState(activePage?.telegram_bot_token || '');
  const [telegramChatId, setTelegramChatId] = useState(activePage?.telegram_chat_id || '');
  const [facebookPixel, setFacebookPixel] = useState(activePage?.facebook_pixel_id || '');
  const [googleAnalytics, setGoogleAnalytics] = useState(activePage?.ga_tracking_id || '');
  const [customDomain, setCustomDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState(null);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Payments / Card settings
  const [cardNumber, setCardNumber] = useState(activePage?.card_number || '');
  const [cardHolder, setCardHolder] = useState(activePage?.card_holder || '');

  const publicUrl = `${window.location.origin}/p/${slug || 'demo'}`;

  const handleSaveGeneral = () => {
    onUpdateSettings({
      slug,
      title,
      seo_description: seoDescription,
      telegram_bot_token: telegramToken,
      telegram_chat_id: telegramChatId,
      facebook_pixel_id: facebookPixel,
      ga_tracking_id: googleAnalytics,
      card_number: cardNumber,
      card_holder: cardHolder,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestTelegram = async () => {
    if (!telegramToken || !telegramChatId) {
      alert('Iltimos, avval Telegram Bot Token va Chat ID ni kiriting!');
      return;
    }

    setTestingTelegram(true);
    try {
      await api.crm.testTelegram({
        bot_token: telegramToken,
        chat_id: telegramChatId,
      });
      alert('✅ Telegram botingizga sinov xabari yuborildi!');
    } catch (err) {
      alert('Xatolik: ' + err.message);
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!customDomain.trim()) return;

    try {
      const record = await api.domains.add({
        domain: customDomain.trim(),
        pageSlug: activePage.slug,
      });
      setDomainStatus(record);
      alert(`"${customDomain}" domeni muvaffaqiyatli ulandi! DNS yozuvlarini sozlang.`);
    } catch (err) {
      alert('Domen qo\'shishda xatolik: ' + err.message);
    }
  };

  const settingsTabs = [
    { id: 'general', label: '⚙️ Asosiy & SEO' },
    { id: 'telegram', label: '✈️ Telegram Alertlar' },
    { id: 'payments', label: '💳 To\'lov & Karta' },
    { id: 'domains', label: '🌐 Shaxsiy Domen' },
    { id: 'pixels', label: '🎯 Piksellar' },
    { id: 'danger', label: '⚠️ Xavfli Hudud' },
  ];

  return (
    <div className="settings-view-container">
      <div className="view-page-header">
        <div className="header-title-actions">
          <div>
            <h2>Sahifa Sozlamalari & Integratsiyalar</h2>
            <p>SEO, ijtimoiy tarmoqlar kartalari, bildirishnomalar, to'lovlar va shaxsiy domen</p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveGeneral}
          >
            {saveSuccess ? '✅ Saqlandi!' : '💾 Sozlamalarni Saqlash'}
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="category-filter-chips mb-4">
        {settingsTabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`filter-chip-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-cards-stack">
        {/* TAB 1: General & SEO with Live Previews */}
        {activeTab === 'general' && (
          <div className="settings-card-box">
            <h4 className="card-box-title">⚙️ Asosiy Parametrlar & SEO</h4>

            <div className="form-group mb-3">
              <label>Sahifa nomi (Sarlavha)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="Masalan: Jasur Karimov | Shaxsiy Portfolio"
              />
            </div>

            <div className="form-group mb-3">
              <label>Sayt havolasi (Slug / URL)</label>
              <div className="slug-input-wrapper">
                <span className="slug-prefix">linkstudio.uz/p/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                  className="form-input slug-input"
                  placeholder="jasur"
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label>SEO Meta Tavsif (Google va ijtimoiy tarmoqlar uchun)</label>
              <textarea
                rows={3}
                placeholder="Sahifangiz haqida 1-2 jumlali qisqacha jozibador tavsif..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="form-input"
              />
            </div>

            {/* LIVE SEO PREVIEWS */}
            <h4 style={{ fontSize: '14px', marginTop: '24px', marginBottom: '12px' }}>
              👁️ Jonli Ko'rinish Simulyatsiyasi (Live Previews)
            </h4>

            <div className="seo-live-preview-grid">
              {/* Google Search Result Preview */}
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Google Qidiruv Natijasi:
                </span>
                <div className="google-snippet-card">
                  <div className="google-snippet-site-row">
                    <div className="google-favicon">⚡</div>
                    <span className="google-url-text">https://linkstudio.uz/p/{slug || 'username'}</span>
                  </div>
                  <a href="#" onClick={(e) => e.preventDefault()} className="google-title-link">
                    {title || 'Sahifa Nomi'}
                  </a>
                  <p className="google-desc-text">
                    {seoDescription || 'Sahifangiz haqidagi tavsif matni Google qidiruv natijalarida aynan shu tarzda chiroyli ko\'rinadi.'}
                  </p>
                </div>
              </div>

              {/* Telegram / Social Card Preview */}
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Telegram & WhatsApp Havola Kartasi:
                </span>
                <div className="telegram-card-preview">
                  <div className="telegram-preview-img-box">
                    <span style={{ fontSize: '28px' }}>⚡ LinkStudio</span>
                  </div>
                  <div className="telegram-preview-body">
                    <div className="telegram-site-domain">LINKSTUDIO.UZ</div>
                    <div className="telegram-preview-title">{title || 'Sahifa Nomi'}</div>
                    <div className="telegram-preview-desc">
                      {seoDescription || 'Ushbu havolaga o\'tib, barcha ma\'lumotlar va havolalar bilan tanishing.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Telegram Alerts */}
        {activeTab === 'telegram' && (
          <div className="settings-card-box">
            <h4 className="card-box-title">✈️ Telegram Xabarnomalar (Lidlar va Buyurtmalar)</h4>
            <p className="card-box-desc">
              Yangi buyurtma yoki ariza tushganda o'z shaxsiy Telegram botingiz orqali 1 soniyada xabar oling.
            </p>

            <div className="form-group mb-3">
              <label>Telegram Bot Token (@BotFather dan olingan)</label>
              <input
                type="text"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group mb-3">
              <label>Telegram Chat ID (@userinfobot orqali bilish mumkin)</label>
              <input
                type="text"
                placeholder="987654321"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '14px' }}>
              <button
                type="button"
                disabled={testingTelegram}
                onClick={handleTestTelegram}
                className="btn-secondary"
              >
                {testingTelegram ? 'Yuborilmoqda...' : '🔔 Test xabarini yuborish'}
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Botga <code>/start</code> bosganingizga ishonch hosil qiling.
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: Payment & Cards */}
        {activeTab === 'payments' && (
          <div className="settings-card-box">
            <h4 className="card-box-title">💳 To'lov Ma'lumotlari & Bank Kartasi</h4>
            <p className="card-box-desc">
              Mahsulotlar yoki xizmatlar uchun mijozlar to'lov qilishi uchun karta raqamingizni kiriting.
            </p>

            <div className="form-group mb-3">
              <label>Bank Karta Raqami (Humo / Uzcard / Visa)</label>
              <input
                type="text"
                placeholder="8600 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group mb-3">
              <label>Karta Egasi Ismi (Karta yuzidagi ism)</label>
              <input
                type="text"
                placeholder="JASUR KARIMOV"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                className="form-input"
              />
            </div>
          </div>
        )}

        {/* TAB 4: Custom Domain */}
        {activeTab === 'domains' && (
          <div className="settings-card-box">
            <h4 className="card-box-title">🌐 Shaxsiy Domen (Custom Domain)</h4>
            <p className="card-box-desc">
              Sahifangizni o'z domeningizga ulang (masalan: <code>brand.uz</code> yoki <code>links.mybrand.com</code>).
            </p>

            <form onSubmit={handleAddDomain} className="custom-domain-form">
              <input
                type="text"
                placeholder="mybrand.uz"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="form-input"
              />
              <button type="submit" className="btn-primary">
                Domen qo'shish
              </button>
            </form>

            {domainStatus && (
              <div className="domain-status-box mt-3">
                <div className="domain-status-title">
                  <span>Domen: <strong>{domainStatus.domain}</strong></span>
                  <span className="status-badge-verified">Status: {domainStatus.status}</span>
                </div>
                <p className="dns-instruction">
                  Domen provayderingizda (Reg.uz, Namecheap, Cloudflare) quyidagi <strong>CNAME</strong> yozuvini qo'shing:
                </p>
                <div className="dns-record-row">
                  <code>Host: @ yoki www | CNAME target: cname.linkstudio.uz</code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Tracking Pixels */}
        {activeTab === 'pixels' && (
          <div className="settings-card-box">
            <h4 className="card-box-title">🎯 Marketing & Reklama Piksellari</h4>

            <div className="form-group mb-3">
              <label>Facebook / Meta Pixel ID</label>
              <input
                type="text"
                placeholder="Masalan: 123456789012345"
                value={facebookPixel}
                onChange={(e) => setFacebookPixel(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group mb-3">
              <label>Google Analytics Tag (G-XXXXXXX)</label>
              <input
                type="text"
                placeholder="Masalan: G-ABC123XYZ"
                value={googleAnalytics}
                onChange={(e) => setGoogleAnalytics(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        )}

        {/* TAB 6: Danger Zone */}
        {activeTab === 'danger' && (
          <div className="settings-card-box danger-zone">
            <h4 className="card-box-title text-danger">⚠️ Xavfli Hudud (Danger Zone)</h4>
            <p>Ushbu sahifani butunlay o'chirish. Bu amal barcha bloklar va lidlarni o'chiradi va ortga qaytarib bo'lmaydi.</p>
            <button
              type="button"
              className="btn-danger mt-2"
              onClick={() => {
                if (window.confirm(`Haqiqatan ham "${activePage.title}" sahifasini o'chirib tashlamoqchimisiz?`)) {
                  onDeletePage(activePage.slug);
                }
              }}
            >
              🗑️ Sahifani butunlay o'chirish
            </button>
          </div>
        )}

        {/* Bottom Save Action */}
        <div className="settings-action-row mt-4">
          <button
            type="button"
            className="btn-primary-lg"
            onClick={handleSaveGeneral}
          >
            {saveSuccess ? '✅ Muvaffaqiyatli saqlandi!' : '💾 Barcha Sozlamalarni Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}

