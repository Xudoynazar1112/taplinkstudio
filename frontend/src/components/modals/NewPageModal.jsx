import React, { useState } from 'react';
import { TEMPLATES_CATALOG } from '../../data/templatesCatalog';
import { api } from '../../utils/api';

export default function NewPageModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('business-services');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSlugChange = (val) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    setSlug(formatted);
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9-_]/g, '-')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9-_]/g, '-'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slug.trim()) {
      setError('Havola (slug) kiritilishi shart');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const template = TEMPLATES_CATALOG.find(t => t.id === selectedTemplateId) || TEMPLATES_CATALOG[0];
      const pageData = {
        slug: slug.trim(),
        title: title.trim() || 'Mening yangi sahifam',
        theme: template.theme,
        blocks: template.blocks,
      };

      const created = await api.pages.create(pageData);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Sahifa yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog new-page-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h3>Yangi Bio Sahifa Yaratish</h3>
          <p>Sahifangiz nomini va havolasini belgilang</p>
        </div>

        {error && <div className="auth-error-badge">{error}</div>}

        <form onSubmit={handleSubmit} className="new-page-form">
          <div className="form-group">
            <label>Sahifa nomi / Brend</label>
            <input
              type="text"
              required
              placeholder="Masalan: Nova Studio"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Sayt havolasi (slug)</label>
            <div className="slug-input-wrapper">
              <span className="slug-prefix">linkstudio.uz/p/</span>
              <input
                type="text"
                required
                placeholder="nova-studio"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="form-input slug-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Boshlang'ich Shablon</label>
            <div className="template-picker-grid">
              {TEMPLATES_CATALOG.map((tpl) => (
                <div
                  key={tpl.id}
                  className={`tpl-picker-card ${selectedTemplateId === tpl.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                >
                  <div className="tpl-picker-header">
                    <span className="tpl-picker-name">{tpl.name}</span>
                    {tpl.badge && <span className="tpl-picker-badge">{tpl.badge}</span>}
                  </div>
                  <p className="tpl-picker-desc">{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Bekor qilish
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Yaratilmoqda...' : 'Sahifani Yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
