import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function AssetPickerModal({ isOpen, onClose, onSelect, allowedTypes = ['image'] }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [tab, setTab] = useState('library'); // 'library' | 'upload' | 'url'

  useEffect(() => {
    if (!isOpen) return;
    async function load() {
      try {
        setLoading(true);
        const data = await api.assets.list();
        setAssets(data || []);
      } catch (err) {
        console.error('Failed to load assets', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const asset = await api.assets.upload(file);
      setAssets((prev) => [asset, ...prev]);
      onSelect(asset.url);
      onClose();
    } catch (err) {
      alert('Yuklashda xatolik: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelect(customUrl.trim());
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog asset-picker-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h3>Media Tanlash / Yuklash</h3>
          <div className="asset-picker-tabs">
            <button
              type="button"
              className={`asset-tab ${tab === 'library' ? 'active' : ''}`}
              onClick={() => setTab('library')}
            >
              Kutubxona ({assets.length})
            </button>
            <button
              type="button"
              className={`asset-tab ${tab === 'upload' ? 'active' : ''}`}
              onClick={() => setTab('upload')}
            >
              Kompyuterdan yuklash
            </button>
            <button
              type="button"
              className={`asset-tab ${tab === 'url' ? 'active' : ''}`}
              onClick={() => setTab('url')}
            >
              URL havola
            </button>
          </div>
        </div>

        <div className="asset-picker-content">
          {tab === 'library' && (
            <div>
              {loading ? (
                <div className="loading-state">Kutubxona yuklanmoqda...</div>
              ) : assets.length === 0 ? (
                <div className="empty-assets-box">
                  <p>Hozircha hech qanday fayl yuklanmagan.</p>
                  <button type="button" onClick={() => setTab('upload')} className="btn-primary-sm">
                    Fayl yuklash
                  </button>
                </div>
              ) : (
                <div className="assets-grid-scroll">
                  {assets.map((ast) => (
                    <div
                      key={ast.id}
                      className="asset-grid-item"
                      onClick={() => {
                        onSelect(ast.url);
                        onClose();
                      }}
                    >
                      {ast.mime_type?.includes('video') ? (
                        <video src={ast.url} className="asset-thumb" />
                      ) : (
                        <img src={ast.url} alt={ast.original_name} className="asset-thumb" />
                      )}
                      <span className="asset-name-label">{ast.original_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'upload' && (
            <div className="upload-dropzone-box">
              <input
                type="file"
                id="modal-file-input"
                onChange={handleFileUpload}
                accept="image/*,video/*"
                style={{ display: 'none' }}
              />
              <label htmlFor="modal-file-input" className="dropzone-label">
                <span className="upload-big-icon">📁</span>
                <strong>Faylni tanlang yoki shu yerga tashlang</strong>
                <span>JPG, PNG, WebP, GIF, MP4 (max 25MB)</span>
                <span className="btn-primary upload-trigger-btn">
                  {uploading ? 'Yuklanmoqda...' : 'Fayl tanlash'}
                </span>
              </label>
            </div>
          )}

          {tab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="url-input-form">
              <div className="form-group">
                <label>Rasm yoki Video to'g'ridan-to'g'ri havolasi</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-primary">
                Qo'llash
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
