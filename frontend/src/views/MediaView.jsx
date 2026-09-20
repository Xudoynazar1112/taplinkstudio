import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { copyToClipboard } from '../utils/helpers';

export default function MediaView() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    setLoading(true);
    try {
      const data = await api.assets.list();
      setAssets(data || []);
    } catch (err) {
      console.error('Failed to load assets', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const created = await api.assets.upload(file);
      setAssets(prev => [created, ...prev]);
    } catch (err) {
      alert('Yuklashda xatolik: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (assetId) => {
    if (!window.confirm('Haqiqatan ham bu faylni o\'chirmoqchimisiz?')) return;
    try {
      await api.assets.delete(assetId);
      setAssets(prev => prev.filter(a => a.id !== assetId));
    } catch (err) {
      alert('O\'chirishda xatolik: ' + err.message);
    }
  };

  const handleCopyUrl = async (ast) => {
    const fullUrl = ast.url.startsWith('http') ? ast.url : `${window.location.origin}${ast.url}`;
    await copyToClipboard(fullUrl);
    setCopiedId(ast.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="media-view-container">
      <div className="view-page-header">
        <div className="header-title-actions">
          <div>
            <h2>Media Kutubxona</h2>
            <p>Sahifangizda ishlatiladigan rasmlar, videolar, audio va banner fayllarni yuklang va boshqaring</p>
          </div>

          <div>
            <input
              type="file"
              id="media-view-file-input"
              onChange={handleUpload}
              accept="image/*,video/*,audio/*"
              style={{ display: 'none' }}
            />
            <label htmlFor="media-view-file-input" className="btn-primary cursor-pointer">
              {uploading ? 'Yuklanmoqda...' : '📁 Yangi Fayl Yuklash'}
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Fayllar yuklanmoqda...</div>
      ) : assets.length === 0 ? (
        <div className="empty-blocks-state">
          <span className="empty-icon">🖼️</span>
          <h4>Hozircha hech qanday media fayl yuklanmagan</h4>
          <p>Rasmlar, videolar va bannerlarni shu yerga yuklab, istalgan blokda foydalanishingiz mumkin.</p>
          <label htmlFor="media-view-file-input" className="btn-primary cursor-pointer mt-3">
            Fayl yuklash
          </label>
        </div>
      ) : (
        <div className="media-gallery-grid">
          {assets.map((ast) => (
            <div key={ast.id} className="media-asset-card">
              <div className="media-preview-box">
                {ast.mime_type?.includes('video') ? (
                  <video src={ast.url} className="media-asset-img" />
                ) : (
                  <img src={ast.url} alt={ast.original_name} className="media-asset-img" />
                )}
              </div>
              <div className="media-card-info">
                <span className="asset-card-title">{ast.original_name}</span>
                <span className="asset-card-meta">
                  {Math.round((ast.size_bytes || 0) / 1024)} KB • {ast.mime_type?.split('/')[1]?.toUpperCase()}
                </span>
                <div className="media-card-actions-row">
                  <button
                    type="button"
                    className="btn-secondary-sm"
                    onClick={() => handleCopyUrl(ast)}
                  >
                    {copiedId === ast.id ? '✅ Nusxalandi' : '🔗 URL nusxalash'}
                  </button>
                  <button
                    type="button"
                    className="control-btn delete-btn"
                    onClick={() => handleDelete(ast.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
