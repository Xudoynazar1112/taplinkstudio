import React, { useState, useEffect, useMemo } from 'react';
import { THEMES_CATALOG } from '../data/themesCatalog';
import { GOOGLE_FONTS } from '../utils/constants';
import PhonePreview from '../components/PhonePreview';
import AssetPickerModal from '../components/modals/AssetPickerModal';
import { api } from '../utils/api';
import { getContrastTextColor } from '../utils/helpers';

export default function DesignView({ activePage, onUpdateTheme }) {
  const [themes, setThemes] = useState(THEMES_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(24);
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'custom'
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [assetPickerField, setAssetPickerField] = useState('backgroundImage');

  // Local copy of theme being edited
  const currentTheme = activePage?.theme || THEMES_CATALOG[0];

  useEffect(() => {
    async function load() {
      try {
        const data = await api.themes.list();
        if (data && data.length > 0) {
          setThemes(data);
        }
      } catch (err) {
        console.warn('Using local fallback themes catalog:', err);
      }
    }
    load();
  }, []);

  // Filter themes by search query and category
  const filteredThemes = useMemo(() => {
    let result = themes;

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [themes, selectedCategory, searchQuery]);

  // Paginated items
  const paginatedThemes = useMemo(() => {
    return filteredThemes.slice(0, visibleCount);
  }, [filteredThemes, visibleCount]);

  const hasMore = visibleCount < filteredThemes.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 24);
  };

  const handleApplyPresetTheme = (themePreset) => {
    onUpdateTheme({
      ...currentTheme,
      ...themePreset,
    });
  };

  const handleCustomChange = (field, value) => {
    onUpdateTheme({
      ...currentTheme,
      [field]: value,
    });
  };

  const categories = [
    { id: 'all', label: 'Barchasi', icon: '✨' },
    { id: 'basic', label: 'Minimal / Dark', icon: '⚪' },
    { id: 'gradient', label: 'Gradient', icon: '🌈' },
    { id: 'picture', label: 'Rasmli Fonlar', icon: '🖼️' },
    { id: 'animation', label: '3D & Dinamik Animatsiya', icon: '🔮' },
  ];

  const quickTagChips = [
    { label: '🔮 3D Fonlar', query: '3d' },
    { label: '❄️ Qish / Qor', query: 'qish' },
    { label: '🌴 Yoz / Plyaj', query: 'yoz' },
    { label: '🌸 Bahor / Sakura', query: 'bahor' },
    { label: '💼 Biznes', query: 'biznes' },
    { label: '⚡ Neon / Cyber', query: 'neon' },
    { label: '🏋️ Sport', query: 'sport' },
    { label: '☕ Qahva / Kafe', query: 'kafe' },
    { label: '👑 Luxury / Oltin', query: 'luxury' },
    { label: '🚀 Kosmos / Stars', query: 'kosmos' },
  ];

  const animationPresetsList = [
    { id: '3d-orbs', label: '🔮 3D Glass Orbs (Shisha nurlar)', icon: '🔮' },
    { id: '3d-cubes', label: '🧊 3D Floating Cubes (Suzuvchi kublar)', icon: '🧊' },
    { id: '3d-cyber-horizon', label: '⚡ 3D Cyber Grid (Futuristik to\'r)', icon: '⚡' },
    { id: '3d-galaxy-warp', label: '🚀 3D Galaxy Warp (Yulduzli koinot)', icon: '🚀' },
    { id: '3d-mesh', label: '🌊 3D Fluid Mesh (Suyuq to\'lqin)', icon: '🌊' },
    { id: 'golden-dust', label: '✨ Golden Dust (Oltin zarrachalar)', icon: '✨' },
    { id: 'fireflies', label: '💡 Fireflies (Tungi yonarqo\'ng\'izlar)', icon: '💡' },
    { id: 'sakura', label: '🌸 Sakura (Yapon gilos yaproqlari)', icon: '🌸' },
    { id: 'snow', label: '❄️ Snow (Sokin qor yog\'ishi)', icon: '❄️' },
    { id: 'fire-sparks', label: '🔥 Fire Sparks (Olovli uchqunlar)', icon: '🔥' },
    { id: 'particles', label: '💫 Particles (Yorug\'lik zarrachalari)', icon: '💫' },
    { id: 'matrix', label: '💻 Matrix (Raqamli kod oqimi)', icon: '💻' },
    { id: 'rain', label: '🌧️ Rain (Yomg\'ir tomchilari)', icon: '🌧️' },
  ];

  return (
    <div className="design-view-container">
      {/* Left Column: Theme Catalog & Customizer */}
      <div className="design-editor-column">
        <div className="view-page-header">
          <h2>Dizayn va Mavzular</h2>
          <p>Sahifangiz uchun zamonaviy tayyor mavzular, rasmli fonlar va maxsus ranglarni sozlang</p>
        </div>

        {/* Top Mode Tabs: Tayyor Mavzular | Maxsus Sozlash */}
        <div className="design-mode-tabs">
          <button
            type="button"
            className={`mode-tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            🎨 Tayyor Mavzular ({themes.length}+)
          </button>
          <button
            type="button"
            className={`mode-tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            🛠️ Maxsus Fon, Shrift & Stillar
          </button>
        </div>

        {/* Tab 1: Presets Themes with Search, Tags, Categories, and Pagination */}
        {activeTab === 'presets' && (
          <div className="presets-tab-content">
            {/* Tag Search Input */}
            <div className="theme-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Mavzu, soha yoki kalit so'z bo'yicha qidirish (masalan: 3d, qish, yoz, biznes, neon...)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(24);
                }}
                className="theme-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Search Tag Chips */}
            <div className="quick-tags-scroll">
              {quickTagChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`quick-tag-chip ${searchQuery === chip.query ? 'active' : ''}`}
                  onClick={() => {
                    if (searchQuery === chip.query) {
                      setSearchQuery('');
                    } else {
                      setSearchQuery(chip.query);
                      setVisibleCount(24);
                    }
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Category Filter Tabs */}
            <div className="category-filter-chips">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`filter-chip-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setVisibleCount(24);
                  }}
                >
                  <span className="cat-icon">{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>

            {/* Themes Grid */}
            {paginatedThemes.length === 0 ? (
              <div className="empty-search-state">
                <span className="empty-icon">🔎</span>
                <h4>"{searchQuery}" bo'yicha hech qanday mavzu topilmadi</h4>
                <p>Boshqa kalit so'z kiriting yoki filtrlarni tozalang.</p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Barcha mavzularni ko'rsatish
                </button>
              </div>
            ) : (
              <div>
                <div className="themes-grid-cards">
                  {paginatedThemes.map((thm) => {
                    const isActive = currentTheme.id === thm.id;
                    const contrastText = getContrastTextColor(thm.accent);

                    return (
                      <div
                        key={thm.id}
                        className={`theme-preset-card ${isActive ? 'active-theme' : ''}`}
                        onClick={() => handleApplyPresetTheme(thm)}
                      >
                        {/* Theme Visual Preview Box */}
                        <div
                          className={`theme-visual-thumb ${thm.category === 'gradient' ? 'thumb-gradient-mode' : ''}`}
                          style={{
                            background: thm.backgroundType === 'gradient'
                              ? thm.gradient
                              : (thm.backgroundType === 'image' && thm.backgroundImage
                                  ? `url(${thm.backgroundImage}) center/cover no-repeat`
                                  : (thm.background || '#0f172a')),
                          }}
                        >
                          {/* Dynamic mini background layers for animation themes */}
                          {thm.category === 'animation' && thm.animationPreset === '3d-orbs' && (
                            <div className="mini-anim-thumb-orbs">
                              <div className="mini-orb mini-orb-1" />
                              <div className="mini-orb mini-orb-2" />
                            </div>
                          )}
                          {thm.category === 'animation' && thm.animationPreset === '3d-cyber-horizon' && (
                            <div className="mini-cyber-horizon-glow" />
                          )}
                          {thm.category === 'animation' && thm.animationPreset === 'golden-dust' && (
                            <div className="mini-golden-dust-glow">
                              <div className="mini-gold-dot dot-1" />
                              <div className="mini-gold-dot dot-2" />
                              <div className="mini-gold-dot dot-3" />
                            </div>
                          )}
                          {thm.category === 'animation' && thm.animationPreset === 'fireflies' && (
                            <div className="mini-fireflies-glow">
                              <div className="mini-firefly-dot ff-1" />
                              <div className="mini-firefly-dot ff-2" />
                            </div>
                          )}
                          {thm.category === 'animation' && thm.animationPreset === 'gradient-wave' && (
                            <div className="mini-gradient-wave-bg" />
                          )}
                          {thm.category === 'animation' && thm.animationPreset === 'sakura' && (
                            <div className="mini-sakura-thumb">🌸</div>
                          )}
                          {thm.category === 'animation' && thm.animationPreset === 'snow' && (
                            <div className="mini-snow-thumb">❄</div>
                          )}
                          {thm.category === 'animation' && thm.animationPreset === 'fire-sparks' && (
                            <div className="mini-sparks-glow" />
                          )}

                          {/* Mini simulated blocks */}
                          <div className="mini-preview-content">
                            <div className="mini-avatar-dot" />
                            <div
                              className="mini-button-bar"
                              style={{
                                backgroundColor: thm.accent || '#6366f1',
                                color: contrastText,
                              }}
                            >
                              Link
                            </div>
                            <div className="mini-button-bar secondary" />
                          </div>

                          {thm.category === 'animation' && (
                            <span className="anim-badge-indicator">🔮 {thm.animationPreset?.includes('3d') ? '3D Jonli' : 'Animatsiya'}</span>
                          )}
                          {thm.category === 'picture' && (
                            <span className="anim-badge-indicator">🖼️ Fon Rasm</span>
                          )}
                          {thm.category === 'gradient' && (
                            <span className="anim-badge-indicator">🌈 Gradient</span>
                          )}
                          {isActive && (
                            <span className="active-badge-indicator">✓ Tanlangan</span>
                          )}
                        </div>

                        {/* Theme Card Footer */}
                        <div className="theme-card-meta">
                          <div className="theme-card-name-row">
                            <span className="theme-name">{thm.name}</span>
                            <span className="theme-cat-badge">{thm.category}</span>
                          </div>
                          {thm.tags && (
                            <div className="theme-card-tags">
                              {thm.tags.slice(0, 3).map((t, i) => (
                                <span key={i} className="card-tag-pill">#{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Pagination Button */}
                {hasMore && (
                  <div className="load-more-section">
                    <button
                      type="button"
                      className="btn-load-more"
                      onClick={handleLoadMore}
                    >
                      🔄 Ko'proq yuklash ({filteredThemes.length - visibleCount} ta qoldi)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Custom Colors, Typography & Background Builder */}
        {activeTab === 'custom' && (
          <div className="custom-design-panel">
            {/* 1. Background Type Picker */}
            <div className="custom-section-box">
              <h4 className="section-subtitle">1. Fon turi (Background Type)</h4>
              <div className="bg-type-selector-grid">
                <button
                  type="button"
                  className={`bg-type-btn ${currentTheme.backgroundType === 'solid' ? 'active' : ''}`}
                  onClick={() => handleCustomChange('backgroundType', 'solid')}
                >
                  🎨 Bir tekis rang
                </button>
                <button
                  type="button"
                  className={`bg-type-btn ${currentTheme.backgroundType === 'gradient' ? 'active' : ''}`}
                  onClick={() => handleCustomChange('backgroundType', 'gradient')}
                >
                  🌈 Gradient
                </button>
                <button
                  type="button"
                  className={`bg-type-btn ${currentTheme.backgroundType === 'animation' ? 'active' : ''}`}
                  onClick={() => handleCustomChange('backgroundType', 'animation')}
                >
                  🔮 3D Dinamik Fon
                </button>
                <button
                  type="button"
                  className={`bg-type-btn ${currentTheme.backgroundType === 'image' ? 'active' : ''}`}
                  onClick={() => handleCustomChange('backgroundType', 'image')}
                >
                  🖼️ Maxsus Rasm / Fon
                </button>
                <button
                  type="button"
                  className={`bg-type-btn ${currentTheme.backgroundType === 'video' ? 'active' : ''}`}
                  onClick={() => handleCustomChange('backgroundType', 'video')}
                >
                  📹 Fon Video (MP4)
                </button>
              </div>

              {/* Dynamic 3D Animation Picker */}
              {currentTheme.backgroundType === 'animation' && (
                <div className="form-group mt-3">
                  <label>3D / Dinamik Fon Effektini Tanlang</label>
                  <div className="animation-presets-picker-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
                    {animationPresetsList.map(anim => (
                      <button
                        key={anim.id}
                        type="button"
                        className={`btn-style-choice ${currentTheme.animationPreset === anim.id ? 'active' : ''}`}
                        onClick={() => handleCustomChange('animationPreset', anim.id)}
                        style={{ textAlign: 'left', fontSize: '12px', padding: '8px 12px' }}
                      >
                        {anim.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Background solid color picker */}
              {currentTheme.backgroundType === 'solid' && (
                <div className="form-group mt-3">
                  <label>Fon rangi</label>
                  <div className="color-picker-row">
                    <input
                      type="color"
                      value={currentTheme.background?.startsWith('#') ? currentTheme.background : '#090d16'}
                      onChange={(e) => handleCustomChange('background', e.target.value)}
                      className="color-input-square"
                    />
                    <input
                      type="text"
                      value={currentTheme.background || '#090d16'}
                      onChange={(e) => handleCustomChange('background', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              {/* Gradient customizer */}
              {currentTheme.backgroundType === 'gradient' && (
                <div className="form-group mt-3">
                  <label>Gradient CSS kodi</label>
                  <input
                    type="text"
                    value={currentTheme.gradient || 'linear-gradient(135deg, #090d16 0%, #111827 100%)'}
                    onChange={(e) => handleCustomChange('gradient', e.target.value)}
                    className="form-input"
                  />
                  <div className="preset-gradients-quick">
                    {[
                      'linear-gradient(135deg, #0f172a 0%, #312e81 50%, #4c1d95 100%)',
                      'linear-gradient(135deg, #431407 0%, #9a3412 50%, #ea580c 100%)',
                      'linear-gradient(135deg, #022c22 0%, #065f46 50%, #059669 100%)',
                      'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
                      'linear-gradient(135deg, #f43f5e 0%, #fb923c 50%, #facc15 100%)',
                    ].map((g, idx) => (
                      <div
                        key={idx}
                        className="grad-sample-dot"
                        style={{ background: g }}
                        onClick={() => handleCustomChange('gradient', g)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Image wallpaper picker */}
              {currentTheme.backgroundType === 'image' && (
                <div className="form-group mt-3">
                  <label>Fon rasmi havolasi (URL)</label>
                  <div className="media-picker-input-group">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={currentTheme.backgroundImage || ''}
                      onChange={(e) => handleCustomChange('backgroundImage', e.target.value)}
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setAssetPickerField('backgroundImage');
                        setAssetModalOpen(true);
                      }}
                    >
                      📁 Tanlash
                    </button>
                  </div>
                </div>
              )}

              {/* Video background picker */}
              {currentTheme.backgroundType === 'video' && (
                <div className="form-group mt-3">
                  <label>Fon videosi havolasi (MP4)</label>
                  <div className="media-picker-input-group">
                    <input
                      type="text"
                      placeholder="https://...mp4"
                      value={currentTheme.backgroundVideo || ''}
                      onChange={(e) => handleCustomChange('backgroundVideo', e.target.value)}
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setAssetPickerField('backgroundVideo');
                        setAssetModalOpen(true);
                      }}
                    >
                      📁 Tanlash
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Typography Studio (Google Fonts) */}
            <div className="custom-section-box">
              <h4 className="section-subtitle">2. Tipografiya & Shriftlar (Google Fonts)</h4>

              <div className="form-group">
                <label>Asosiy Shrift Oylasi (Font Family)</label>
                <div className="fonts-picker-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
                  {GOOGLE_FONTS.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      className={`btn-style-choice ${currentTheme.fontFamily === f.id ? 'active' : ''}`}
                      onClick={() => handleCustomChange('fontFamily', f.id)}
                      style={{ fontFamily: f.id, textAlign: 'left', fontSize: '13px' }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Colors & UI Elements */}
            <div className="custom-section-box">
              <h4 className="section-subtitle">3. Ranglar va Matn Kontrasti</h4>

              <div className="color-settings-grid">
                <div className="form-group">
                  <label>Asosiy Aktsent Rangi (Tugmalar)</label>
                  <div className="color-picker-row">
                    <input
                      type="color"
                      value={currentTheme.accent?.startsWith('#') ? currentTheme.accent : '#6366f1'}
                      onChange={(e) => handleCustomChange('accent', e.target.value)}
                      className="color-input-square"
                    />
                    <input
                      type="text"
                      value={currentTheme.accent || '#6366f1'}
                      onChange={(e) => handleCustomChange('accent', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Matn Rangi</label>
                  <div className="color-picker-row">
                    <input
                      type="color"
                      value={currentTheme.text?.startsWith('#') ? currentTheme.text : '#ffffff'}
                      onChange={(e) => handleCustomChange('text', e.target.value)}
                      className="color-input-square"
                    />
                    <input
                      type="text"
                      value={currentTheme.text || '#ffffff'}
                      onChange={(e) => handleCustomChange('text', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Blok Fon Rangi (Surface)</label>
                  <input
                    type="text"
                    value={currentTheme.surface || 'rgba(255, 255, 255, 0.08)'}
                    onChange={(e) => handleCustomChange('surface', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* 4. Button Styles & Corners */}
            <div className="custom-section-box">
              <h4 className="section-subtitle">4. Tugma Uslubi va Shakli</h4>

              <div className="button-styles-row">
                <button
                  type="button"
                  className={`btn-style-choice ${currentTheme.buttonStyle === 'glass' ? 'active' : ''}`}
                  onClick={() => handleCustomChange('buttonStyle', 'glass')}
                >
                  ✨ Glassmorphism (Shisha)
                </button>
                <button
                  type="button"
                  className={`btn-style-choice ${currentTheme.buttonStyle === 'solid' ? 'active' : ''}`}
                  onClick={() => handleCustomChange('buttonStyle', 'solid')}
                >
                  ⏹️ Solid (To'liq Rang)
                </button>
                <button
                  type="button"
                  className={`btn-style-choice ${currentTheme.buttonStyle === 'outline' ? 'active' : ''}`}
                  onClick={() => handleCustomChange('buttonStyle', 'outline')}
                >
                  🔲 Outline (Chiziqli)
                </button>
              </div>

              <div className="range-sliders-grid mt-3">
                <div className="form-group">
                  <label>Burchaklar yumaloqligi (Radius): {currentTheme.radius ?? 16}px</label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={currentTheme.radius ?? 16}
                    onChange={(e) => handleCustomChange('radius', parseInt(e.target.value, 10))}
                    className="range-slider"
                  />
                </div>

                <div className="form-group">
                  <label>Blok Shaffoflik Blur effekti: {currentTheme.blur ?? 16}px</label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={currentTheme.blur ?? 16}
                    onChange={(e) => handleCustomChange('blur', parseInt(e.target.value, 10))}
                    className="range-slider"
                  />
                </div>

                <div className="form-group">
                  <label>Fon qoraytirish darajasi: {Math.round((currentTheme.overlayOpacity ?? 0.15) * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={Math.round((currentTheme.overlayOpacity ?? 0.15) * 100)}
                    onChange={(e) => handleCustomChange('overlayOpacity', parseInt(e.target.value, 10) / 100)}
                    className="range-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Sticky Interactive Live Phone Preview */}
      <div className="design-phone-preview-column">
        <div className="sticky-phone-container">
          <div className="preview-column-header">
            <div className="preview-title-info">
              <h4>📱 Real Vaqt Ko'rinishi</h4>
              <span className="current-tpl-name">{activePage?.title || 'Sahifa'}</span>
            </div>
          </div>

          <div className="phone-wrapper-center">
            <PhonePreview
              page={activePage}
              themeOverride={currentTheme}
            />
          </div>
        </div>
      </div>

      {/* Asset Picker Modal */}
      {assetModalOpen && (
        <AssetPickerModal
          isOpen={assetModalOpen}
          onClose={() => setAssetModalOpen(false)}
          onSelect={(url) => {
            handleCustomChange(assetPickerField, url);
          }}
        />
      )}
    </div>
  );
}
