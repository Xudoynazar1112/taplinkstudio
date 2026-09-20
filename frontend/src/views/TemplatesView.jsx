import React, { useState, useEffect, useMemo } from 'react';
import { TEMPLATES_CATALOG } from '../data/templatesCatalog';
import PhonePreview from '../components/PhonePreview';
import { api } from '../utils/api';

export default function TemplatesView({ activePage, onApplyTemplate }) {
  const [templates, setTemplates] = useState(TEMPLATES_CATALOG);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(TEMPLATES_CATALOG[0]);
  const [applying, setApplying] = useState(false);
  const [confirmModalTpl, setConfirmModalTpl] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.templates.list();
        if (data && data.length > 0) {
          setTemplates(data);
          setPreviewTemplate(data[0]);
        }
      } catch (err) {
        console.warn('Using local fallback templates catalog:', err);
      }
    }
    load();
  }, []);

  const categories = [
    { id: 'all', label: 'Barchasi', icon: '✨' },
    { id: 'business', label: 'Xizmatlar & Biznes', icon: '💼' },
    { id: 'creator', label: 'Bloger & Creator', icon: '📸' },
    { id: 'store', label: 'Mini Do\'kon / Savdo', icon: '🛍️' },
    { id: 'wedding', label: 'To\'y & Taklifnomalar', icon: '💌' },
    { id: 'beauty', label: 'Go\'zallik & Spa', icon: '💄' },
    { id: 'food', label: 'Restoran & Kafe', icon: '☕' },
    { id: 'fitness', label: 'Sport & Trener', icon: '🏋️' },
  ];

  const filteredTemplates = useMemo(() => {
    let result = templates;
    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.desc?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [templates, selectedCategory, searchQuery]);

  const handleApply = async (template) => {
    setConfirmModalTpl(null);
    setApplying(true);
    try {
      await onApplyTemplate(template);
      alert(`"${template.name}" shabloni sahifangizga muvaffaqiyatli qo'llandi!`);
    } catch (err) {
      alert('Shablonni qo\'llashda xatolik: ' + err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="templates-view-container">
      {/* Left Column: Template Cards Catalog */}
      <div className="templates-catalog-column">
        <div className="view-page-header">
          <div className="header-title-actions">
            <div>
              <h2>Tayyor Shablonlar Kutubxonasi</h2>
              <p>O'z sohangizga mos yuqori konversiyali shablonni tanlang va 1-bosishda sahifangizga o'rnating</p>
            </div>
          </div>
        </div>

        {/* Search & Category Filters */}
        <div className="form-group mb-3">
          <input
            type="text"
            placeholder="Shablon nomi, soha yoki kalit so'z bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ padding: '8px 14px', fontSize: '13px' }}
          />
        </div>

        <div className="category-filter-chips mb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-chip-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Templates Cards Grid */}
        <div className="templates-cards-grid">
          {filteredTemplates.map((tpl) => {
            const isSelected = previewTemplate?.id === tpl.id;
            return (
              <div
                key={tpl.id}
                className={`template-card-box ${isSelected ? 'selected' : ''}`}
                onClick={() => setPreviewTemplate(tpl)}
              >
                <div className="template-card-top">
                  <div className="template-card-title-group">
                    <h3 className="template-card-name">{tpl.name}</h3>
                    {tpl.badge && <span className="template-badge">{tpl.badge}</span>}
                  </div>
                  <span className="template-blocks-count">
                    {tpl.blocks?.length || 0} ta blok
                  </span>
                </div>

                <p className="template-card-desc">{tpl.desc}</p>

                <div className="template-card-features">
                  {tpl.blocks?.slice(0, 4).map((b, i) => (
                    <span key={i} className="tpl-feature-tag">
                      {b.type === 'avatar' && '👤 Profil'}
                      {b.type === 'pricing' && '💳 Tariflar'}
                      {b.type === 'products' && '🛍️ Do\'kon'}
                      {b.type === 'reviews' && '⭐ Fikrlar'}
                      {b.type === 'form' && '📋 Forma'}
                      {b.type === 'stories' && '⭕ Stories'}
                      {b.type === 'timer' && '⏳ Taymer'}
                      {b.type === 'messengers' && '💬 Messenjer'}
                      {b.type === 'link' && '🔗 Havolalar'}
                      {b.type === 'faq' && '❓ FAQ'}
                      {b.type === 'divider' && '〰️ Divider'}
                    </span>
                  ))}
                </div>

                <div className="template-card-actions">
                  <button
                    type="button"
                    className={`btn-preview-tpl ${isSelected ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(tpl);
                    }}
                  >
                    {isSelected ? '👁️ Ko\'rilmoqda' : '👁️ Ko\'rish'}
                  </button>

                  <button
                    type="button"
                    disabled={applying}
                    className="btn-apply-tpl"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmModalTpl(tpl);
                    }}
                  >
                    ⚡ Shablonni qo'llash
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Interactive Phone Preview Frame */}
      <div className="templates-phone-preview-column">
        <div className="sticky-phone-container">
          <div className="preview-column-header">
            <div className="preview-title-info">
              <h4>📱 Shablon Ko'rinishi:</h4>
              <span className="current-tpl-name">{previewTemplate?.name || 'Shablon'}</span>
            </div>
            <button
              type="button"
              disabled={applying}
              className="btn-apply-primary-sm"
              onClick={() => setConfirmModalTpl(previewTemplate)}
            >
              Ushbu shablonni qo'llash
            </button>
          </div>

          <div className="phone-wrapper-center">
            <PhonePreview
              page={{
                slug: 'template-preview',
                theme: previewTemplate?.theme,
                blocks: previewTemplate?.blocks || [],
              }}
              themeOverride={previewTemplate?.theme}
              blocksOverride={previewTemplate?.blocks}
              previewMode="live"
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalTpl && (
        <div className="modal-backdrop" onClick={() => setConfirmModalTpl(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', textAlign: 'center' }}>
            <button className="modal-close-btn" onClick={() => setConfirmModalTpl(null)}>✕</button>

            <div className="modal-header">
              <h3>⚡ "{confirmModalTpl.name}" shablonini qo'llash</h3>
              <p>Mavjud sahifangiz bloklari va dizayni ushbu yangi shablon bilan almashtiriladi. Davom etasizmi?</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmModalTpl(null)}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleApply(confirmModalTpl)}
              >
                Ha, shablonni qo'llash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

