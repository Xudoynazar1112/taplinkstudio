import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BLOCK_TYPES, BLOCK_CATEGORIES, SOCIAL_PRESETS, ANIMATION_PRESETS } from '../utils/constants';
import { generateId, resolveMediaUrl, copyToClipboard } from '../utils/helpers';
import { api } from '../utils/api';
import PhonePreview from '../components/PhonePreview';
import AssetPickerModal from '../components/modals/AssetPickerModal';

export default function BuilderView({
  activePage,
  onUpdateBlocks,
  onOpenStoryViewer,
  onOpenCheckout,
}) {
  const [editingBlock, setEditingBlock] = useState(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [addBlockCategory, setAddBlockCategory] = useState('all');
  const [addBlockSearch, setAddBlockSearch] = useState('');
  const [insertTargetIndex, setInsertTargetIndex] = useState(null);
  const [assetPickerTarget, setAssetPickerTarget] = useState(null); // { callback }
  const [blockSearchQuery, setBlockSearchQuery] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Multi-Device & Canvas Controls
  const [deviceType, setDeviceType] = useState('iphone'); // 'iphone' | 'ipad' | 'macbook' | 'frameless'
  const [previewMode, setPreviewMode] = useState('edit'); // 'edit' | 'live'
  const [zoomScale, setZoomScale] = useState(1);

  const blocks = activePage?.blocks || [];

  // Undo / Redo History Stack
  const [history, setHistory] = useState([blocks]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((newBlocks) => {
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      return [...next, newBlocks];
    });
    setHistoryIndex((prev) => prev + 1);
    onUpdateBlocks(newBlocks);
  }, [historyIndex, onUpdateBlocks]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      const prevBlocks = history[nextIndex];
      onUpdateBlocks(prevBlocks);
      if (editingBlock && !prevBlocks.some((b) => b.id === editingBlock.id)) {
        setEditingBlock(null);
      }
    }
  }, [historyIndex, history, onUpdateBlocks, editingBlock]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextBlocks = history[nextIndex];
      onUpdateBlocks(nextBlocks);
    }
  }, [historyIndex, history, onUpdateBlocks]);

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Escape') {
        setIsAddDrawerOpen(false);
        setQrModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleAddBlock = (type, targetIndex = null) => {
    let newBlock = { id: generateId(type), type };

    switch (type) {
      case 'avatar':
        newBlock = {
          ...newBlock,
          title: activePage?.title || 'Mening Ismim',
          subtitle: 'Bio va faoliyatim haqida qisqacha',
          avatarUrl: '',
          verified: true,
          avatarSize: 88,
          avatarShape: 'circle',
        };
        break;
      case 'link':
        newBlock = {
          ...newBlock,
          label: 'Mening Yangi Havolam',
          url: 'https://',
          icon: '🔗',
          badge: '',
          animation: 'none',
        };
        break;
      case 'messengers':
        newBlock = {
          ...newBlock,
          title: 'Biz bilan bog\'laning',
          items: [
            { label: 'Telegram', url: 'https://t.me/', icon: '✈️' },
            { label: 'WhatsApp', url: 'https://wa.me/', icon: '💬' },
            { label: 'Instagram', url: 'https://instagram.com/', icon: '📸' },
            { label: 'Telefon', url: 'tel:+998', icon: '📞' },
          ],
        };
        break;
      case 'text':
        newBlock = {
          ...newBlock,
          title: 'Sarlavha',
          content: 'Bu yerga o\'zingiz yoki loyihangiz haqida batafsil ma\'lumot yozishingiz mumkin.',
          align: 'center',
        };
        break;
      case 'media':
        newBlock = {
          ...newBlock,
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
          caption: '',
        };
        break;
      case 'pricing':
        newBlock = {
          ...newBlock,
          title: 'Tariflar va Paketlar',
          plans: [
            { name: 'Standard', price: 290000, features: ['Asosiy xizmat', '1 oy qo\'llab-quvvatlash'], button: 'Tanlash' },
            { name: 'VIP Pro', price: 690000, isFeatured: true, features: ['VIP xizmat', '24/7 shaxsiy menejer', 'Tezkor natija'], button: 'Buyurtma' },
          ],
        };
        break;
      case 'products':
        newBlock = {
          ...newBlock,
          title: 'Mahsulotlar Katalogi',
          items: [
            { id: generateId('prod'), title: 'Maxsus Mahsulot 1', price: 150000, oldPrice: 200000, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
          ],
        };
        break;
      case 'form':
        newBlock = {
          ...newBlock,
          title: 'Ariza qoldiring',
          submitLabel: 'Yuborish',
          fields: [
            { name: 'name', label: 'Ismingiz', type: 'text', required: true },
            { name: 'phone', label: 'Telefon raqamingiz', type: 'tel', required: true },
          ],
        };
        break;
      case 'reviews':
        newBlock = {
          ...newBlock,
          title: 'Mijozlarimiz fikrlari',
          items: [
            { id: generateId('rev'), name: 'Akmal Karimov', role: 'Mijoz', verified: true, rating: 5, comment: 'Juda tez va sifatli xizmat ko\'rsatildi, tavsiya qilaman!' },
          ],
        };
        break;
      case 'location':
        newBlock = {
          ...newBlock,
          title: 'Bizning Manzilimiz',
          subtitle: 'Har kuni 09:00 dan 20:00 gacha ochiqmiz',
          address: 'Toshkent shahri, Amir Temur shoh ko\'chasi, 15-uy',
          mapProvider: 'yandex',
          mapUrl: 'https://yandex.uz/maps/-/CDu~UPkC',
          latitude: '41.311081',
          longitude: '69.240562',
          showMapPreview: true,
          mapHeight: 200,
          buttonText: '📍 Xaritada ko\'rish (Marshrut)',
          showCopyAddress: true,
          phone: '+998 90 123 45 67',
          showCallBtn: true,
        };
        break;
      case 'qrcode':
        newBlock = {
          ...newBlock,
          title: 'QR Kod orqali o\'tish',
          description: 'Kamerani yo\'naltirib sahifaga o\'ting yoki do\'stlaringizga ulashing',
          qrType: 'current_page',
          qrValue: '',
          size: 180,
          qrColor: '#000000',
          qrBg: '#ffffff',
          showDownloadBtn: true,
          showCopyLinkBtn: true,
          buttonText: '📥 QR Kodni yuklab olish',
          wifiSsid: 'My_WiFi',
          wifiPass: '12345678',
          wifiType: 'WPA',
        };
        break;
      case 'timer':
        newBlock = {
          ...newBlock,
          title: 'Chegirma tugashiga qoldi:',
          targetDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        };
        break;
      case 'faq':
        newBlock = {
          ...newBlock,
          title: 'Ko\'p So\'raladigan Savollar',
          items: [
            { q: 'Xizmat qanday ishlaydi?', a: 'Siz ariza qoldirasiz va mutaxassisimiz 15 daqiqada siz bilan bog\'lanadi.' },
          ],
        };
        break;
      case 'divider':
        newBlock = {
          ...newBlock,
          style: 'wave',
          height: 28,
          borderWidth: 1,
        };
        break;
      case 'stories':
        newBlock = {
          ...newBlock,
          title: 'Eng so\'nggi yangiliklar',
          items: [
            { id: generateId('story'), title: 'Yangi to\'plam', preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', content: 'Bizning yangi to\'plamimiz sotuvga chiqdi!' },
          ],
        };
        break;
      default:
        break;
    }

    const updated = [...blocks];
    const insertIdx = targetIndex !== null ? targetIndex : (insertTargetIndex !== null ? insertTargetIndex : blocks.length);
    updated.splice(insertIdx, 0, newBlock);

    pushHistory(updated);
    setIsAddDrawerOpen(false);
    setInsertTargetIndex(null);
    setEditingBlock(newBlock);
  };

  const handleSaveBlock = (savedBlock) => {
    const updated = blocks.map(b => b.id === savedBlock.id ? savedBlock : b);
    pushHistory(updated);
    setEditingBlock(null);
  };

  const handleDeleteBlock = (blockId) => {
    if (window.confirm('Haqiqatan ham bu blokni o\'chirmoqchimisiz?')) {
      const updated = blocks.filter(b => b.id !== blockId);
      pushHistory(updated);
      if (editingBlock?.id === blockId) setEditingBlock(null);
    }
  };

  const handleDuplicateBlock = (block) => {
    const duplicated = {
      ...JSON.parse(JSON.stringify(block)),
      id: generateId(block.type),
    };
    const index = blocks.findIndex(b => b.id === block.id);
    const updated = [...blocks];
    updated.splice(index + 1, 0, duplicated);
    pushHistory(updated);
    setEditingBlock(duplicated);
  };

  const handleToggleHideBlock = (blockId) => {
    const updated = blocks.map(b => b.id === blockId ? { ...b, hidden: !b.hidden } : b);
    pushHistory(updated);
    if (editingBlock?.id === blockId) {
      setEditingBlock(prev => ({ ...prev, hidden: !prev.hidden }));
    }
  };

  const handleMoveBlock = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    pushHistory(updated);
  };

  // Filter left column blocks
  const filteredBlocks = blocks.filter(b => {
    if (!blockSearchQuery.trim()) return true;
    const q = blockSearchQuery.toLowerCase();
    const typeLabel = BLOCK_TYPES.find(t => t.type === b.type)?.label || '';
    return (
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.label && b.label.toLowerCase().includes(q)) ||
      b.type.toLowerCase().includes(q) ||
      typeLabel.toLowerCase().includes(q)
    );
  });

  // Filter Add Block Catalog
  const filteredAddBlockTypes = BLOCK_TYPES.filter(bt => {
    if (addBlockCategory !== 'all' && bt.category !== addBlockCategory) return false;
    if (addBlockSearch.trim()) {
      const q = addBlockSearch.toLowerCase();
      return bt.label.toLowerCase().includes(q) || bt.desc.toLowerCase().includes(q) || bt.type.toLowerCase().includes(q);
    }
    return true;
  });

  const publicUrl = `${window.location.origin}/p/${activePage?.slug || 'demo'}`;

  const handleCopyPublicLink = async () => {
    await copyToClipboard(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="builder-view-container">
      {/* Left Column: Blocks Manager & Editors */}
      <div className="builder-blocks-column">
        <div className="view-page-header">
          <div className="header-title-actions">
            <div>
              <h2>Sahifa Bloklari ({blocks.length})</h2>
              <p>Bloklarni qo'shing, tahrirlang, dizayn va animatsiyalarini sozlang</p>
            </div>
            <button
              type="button"
              className="btn-primary btn-add-block-main"
              onClick={() => {
                setInsertTargetIndex(null);
                setIsAddDrawerOpen(true);
              }}
            >
              ➕ Yangi Blok Qo'shish
            </button>
          </div>
        </div>

        {/* Blocks Search & Filter Bar */}
        <div className="blocks-search-filter-bar">
          <div className="blocks-search-input-wrap">
            <span className="blocks-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Bloklarni qidirish..."
              value={blockSearchQuery}
              onChange={(e) => setBlockSearchQuery(e.target.value)}
              className="blocks-search-input"
            />
          </div>
          {editingBlock && (
            <button
              type="button"
              className="btn-secondary-sm"
              onClick={() => setEditingBlock(null)}
              title="Tahrirni yopish"
            >
              Yopish
            </button>
          )}
        </div>

        {/* Blocks List */}
        {blocks.length === 0 ? (
          <div className="empty-blocks-state">
            <span className="empty-icon">📦</span>
            <h4>Hozircha hech qanday blok yo'q</h4>
            <p>Sahifangizni to'ldirish uchun "Yangi Blok Qo'shish" tugmasini bosing yoki Shablonlar bo'limidan tayyor shablon tanlang.</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setInsertTargetIndex(null);
                setIsAddDrawerOpen(true);
              }}
            >
              ➕ Blok Qo'shish
            </button>
          </div>
        ) : (
          <div className="blocks-list-scroll">
            {filteredBlocks.map((block) => {
              const originalIndex = blocks.findIndex(b => b.id === block.id);
              const blockDef = BLOCK_TYPES.find(b => b.type === block.type);
              const isBeingEdited = editingBlock?.id === block.id;
              const isHidden = block.hidden;

              return (
                <div
                  key={block.id}
                  className={`block-item-card ${isBeingEdited ? 'editing' : ''} ${isHidden ? 'is-hidden' : ''}`}
                >
                  <div className="block-card-header">
                    <div
                      className="block-card-info"
                      onClick={() => setEditingBlock(isBeingEdited ? null : block)}
                    >
                      <span className="block-index-pill">#{originalIndex + 1}</span>
                      <span className="block-type-icon">{blockDef?.icon || '📦'}</span>
                      <div className="block-names">
                        <div className="block-title-row">
                          <span className="block-type-name">{blockDef?.label || block.type}</span>
                          {isHidden && <span className="hidden-status-badge">👁️‍🗨️ Yashirilgan</span>}
                        </div>
                        <span className="block-custom-title">
                          {block.title || block.label || block.name || '(Nomsiz)'}
                        </span>
                      </div>
                    </div>

                    <div className="block-card-controls">
                      <button
                        type="button"
                        className="control-btn"
                        title="Tepaga siljitish"
                        disabled={originalIndex === 0}
                        onClick={() => handleMoveBlock(originalIndex, -1)}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="control-btn"
                        title="Pastga siljitish"
                        disabled={originalIndex === blocks.length - 1}
                        onClick={() => handleMoveBlock(originalIndex, 1)}
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        className="control-btn"
                        title={isHidden ? "Ko'rsatish" : "Vaqtincha yashirish"}
                        onClick={() => handleToggleHideBlock(block.id)}
                      >
                        {isHidden ? "👁️" : "👁️‍🗨️"}
                      </button>
                      <button
                        type="button"
                        className="control-btn"
                        title="Nusxalash (Dublikat)"
                        onClick={() => handleDuplicateBlock(block)}
                      >
                        📋
                      </button>
                      <button
                        type="button"
                        className={`control-btn edit-btn ${isBeingEdited ? 'active' : ''}`}
                        title="Tahrirlash va Dizayn"
                        onClick={() => setEditingBlock(isBeingEdited ? null : block)}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="control-btn delete-btn"
                        title="O'chirish"
                        onClick={() => handleDeleteBlock(block.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Inline Editor Drawer if active */}
                  {isBeingEdited && (
                    <div className="block-inline-editor">
                      <div className="editor-inner-box">
                        <BlockEditorForm
                          block={editingBlock}
                          onChange={(updated) => {
                            setEditingBlock(updated);
                            // Real-time update into page blocks
                            const updatedList = blocks.map(b => b.id === updated.id ? updated : b);
                            onUpdateBlocks(updatedList);
                          }}
                          onOpenAssetPicker={(callback) => {
                            setAssetPickerTarget({ callback });
                          }}
                        />

                        <div className="editor-bottom-actions">
                          <button
                            type="button"
                            className="btn-secondary-sm"
                            onClick={() => setEditingBlock(null)}
                          >
                            Yopish
                          </button>
                          <button
                            type="button"
                            className="btn-primary-sm"
                            onClick={() => handleSaveBlock(editingBlock)}
                          >
                            Saqlash
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Sticky Live Phone Preview with Canvas Toolbar */}
      <div className="builder-phone-preview-column">
        <div className="sticky-phone-container">
          {/* Top Canvas Controls Bar */}
          <div className="preview-top-toolbar">
            {/* Device Switcher */}
            <div className="device-switcher-group">
              <button
                type="button"
                className={`device-btn ${deviceType === 'iphone' ? 'active' : ''}`}
                onClick={() => setDeviceType('iphone')}
                title="iPhone 16 Pro ko'rinishi"
              >
                📱 iPhone
              </button>
              <button
                type="button"
                className={`device-btn ${deviceType === 'ipad' ? 'active' : ''}`}
                onClick={() => setDeviceType('ipad')}
                title="iPad / Planshet ko'rinishi"
              >
                📱 iPad
              </button>
              <button
                type="button"
                className={`device-btn ${deviceType === 'macbook' ? 'active' : ''}`}
                onClick={() => setDeviceType('macbook')}
                title="MacBook / Kompyuter ko'rinishi"
              >
                💻 MacBook
              </button>
              <button
                type="button"
                className={`device-btn ${deviceType === 'frameless' ? 'active' : ''}`}
                onClick={() => setDeviceType('frameless')}
                title="Ramkasiz toza ko'rinish"
              >
                🔲 Clean
              </button>
            </div>

            {/* Preview Mode Switch */}
            <div className="preview-mode-switch">
              <button
                type="button"
                className={`mode-btn ${previewMode === 'edit' ? 'active' : ''}`}
                onClick={() => setPreviewMode('edit')}
                title="Tahrirlash rejimi: Bloklarni bosib tanlang va tezkor boshqaring"
              >
                🎨 Tahrirlash
              </button>
              <button
                type="button"
                className={`mode-btn ${previewMode === 'live' ? 'active' : ''}`}
                onClick={() => setPreviewMode('live')}
                title="Jonli sinov rejimi: Tugmalar, shakllar va to'lovlar haqiqiy ishlaydi"
              >
                ⚡ Jonli Sinov
              </button>
            </div>

            {/* Zoom & QR */}
            <div className="canvas-zoom-controls">
              <button
                type="button"
                className={`zoom-btn ${zoomScale === 0.9 ? 'active' : ''}`}
                onClick={() => setZoomScale(0.9)}
                title="90% masshtab"
              >
                90%
              </button>
              <button
                type="button"
                className={`zoom-btn ${zoomScale === 1 ? 'active' : ''}`}
                onClick={() => setZoomScale(1)}
                title="100% standart masshtab"
              >
                100%
              </button>
              <button
                type="button"
                className="zoom-btn"
                onClick={() => setQrModalOpen(true)}
                title="Smartfonda ochish uchun QR Kod"
              >
                📱 QR
              </button>
            </div>
          </div>

          <div className="phone-wrapper-center">
            <PhonePreview
              page={activePage}
              deviceType={deviceType}
              previewMode={previewMode}
              scale={zoomScale}
              selectedBlockId={editingBlock?.id}
              onSelectBlock={(block) => setEditingBlock(block)}
              onMoveBlock={handleMoveBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onToggleHideBlock={handleToggleHideBlock}
              onDeleteBlock={handleDeleteBlock}
              onInsertBlockAt={(index) => {
                setInsertTargetIndex(index);
                setIsAddDrawerOpen(true);
              }}
              onStoryClick={onOpenStoryViewer}
              onProductClick={onOpenCheckout}
              onPricingClick={onOpenCheckout}
            />
          </div>
        </div>
      </div>

      {/* Categorized Add Block Modal */}
      {isAddDrawerOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddDrawerOpen(false)}>
          <div className="modal-dialog add-block-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAddDrawerOpen(false)}>✕</button>

            <div className="modal-header">
              <h3>Yangi Blok Qo'shish {insertTargetIndex !== null ? `(#${insertTargetIndex + 1} oraliqqa)` : ''}</h3>
              <p>Sahifangizga qo'shmoqchi bo'lgan zamonaviy blok turini tanlang</p>
            </div>

            {/* Search and Category Filter Chips */}
            <div className="form-group mb-2">
              <input
                type="text"
                placeholder="Blok turi yoki xususiyati bo'yicha qidirish..."
                value={addBlockSearch}
                onChange={(e) => setAddBlockSearch(e.target.value)}
                className="form-input"
                autoFocus
              />
            </div>

            <div className="add-block-categories-bar">
              {BLOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`add-block-category-chip ${addBlockCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setAddBlockCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="add-blocks-types-grid">
              {filteredAddBlockTypes.map((bt) => (
                <div
                  key={bt.type}
                  className="add-block-type-card"
                  onClick={() => handleAddBlock(bt.type, insertTargetIndex)}
                >
                  {bt.badge && <span className="add-block-card-badge">{bt.badge}</span>}
                  <span className="add-bt-icon">{bt.icon}</span>
                  <div className="add-bt-info">
                    <span className="add-bt-label">{bt.label}</span>
                    <span className="add-bt-desc">{bt.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Quick Scan Modal */}
      {qrModalOpen && (
        <div className="modal-backdrop" onClick={() => setQrModalOpen(false)}>
          <div className="modal-dialog qr-test-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
            <button className="modal-close-btn" onClick={() => setQrModalOpen(false)}>✕</button>

            <div className="modal-header">
              <h3>📱 Smartfonda Jonli Sinash</h3>
              <p>Kamerangizni ushbu QR-kodga yo'naltiring va sahifangizni telefoningizda darhol oching</p>
            </div>

            <div style={{ padding: '20px', background: '#ffffff', borderRadius: '16px', display: 'inline-block', margin: '12px auto' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicUrl)}&margin=10`}
                alt="QR Code"
                style={{ width: '220px', height: '220px', display: 'block' }}
              />
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <code>{publicUrl}</code>
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCopyPublicLink}
              >
                {copiedLink ? '✅ Nusxalandi!' : '🔗 Havolani nusxalash'}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                ↗ Brauzerda ochish
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Asset Picker Modal */}
      {assetPickerTarget && (
        <AssetPickerModal
          isOpen={!!assetPickerTarget}
          onClose={() => setAssetPickerTarget(null)}
          onSelect={(url) => {
            if (assetPickerTarget.callback) assetPickerTarget.callback(url);
            setAssetPickerTarget(null);
          }}
        />
      )}
    </div>
  );
}


// Sub-component: Complete Dual-Tab Block Editor (Content + Deep Style/Design Customization)
function BlockEditorForm({ block, onChange, onOpenAssetPicker }) {
  const [editorTab, setEditorTab] = useState('content'); // 'content' | 'design'
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarFileInputRef = useRef(null);

  if (!block) return null;

  const handleChange = (field, value) => {
    onChange({ ...block, [field]: value });
  };

  const handleAvatarDirectUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const asset = await api.assets.upload(file);
      if (asset && asset.url) {
        onChange({
          ...block,
          avatarUrl: asset.url,
          avatar: asset.url,
        });
      }
    } catch (err) {
      alert('Rasm yuklashda xatolik: ' + err.message);
    } finally {
      setUploadingAvatar(false);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
    }
  };

  const presetAvatars = [
    { name: 'Ayol 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
    { name: 'Erkak 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
    { name: 'Ayol 2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
    { name: 'Erkak 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
    { name: 'Biznes', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
    { name: 'Kreativ', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
  ];

  const currentAvatarUrl = block.avatarUrl || block.avatar || block.imageUrl || block.image || '';

  return (
    <div className="block-editor-wrapper">
      {/* Editor Sub-Tabs: Content vs Design */}
      <div className="block-editor-subtabs">
        <button
          type="button"
          className={`editor-subtab-btn ${editorTab === 'content' ? 'active' : ''}`}
          onClick={() => setEditorTab('content')}
        >
          📝 Mazmun & Sozlamalar
        </button>
        <button
          type="button"
          className={`editor-subtab-btn ${editorTab === 'design' ? 'active' : ''}`}
          onClick={() => setEditorTab('design')}
        >
          🎨 Blok Dizayni (Rang, Border, Soya)
        </button>
      </div>

      {/* TAB 1: CONTENT FIELDS */}
      {editorTab === 'content' && (
        <div className="editor-content-tab-body">
          {/* AVATAR */}
          {block.type === 'avatar' && (
            <div className="editor-form-fields">
              {/* Avatar Live Preview & Quick Actions */}
              <div className="avatar-editor-hero-box">
                <div className="avatar-preview-circle">
                  {currentAvatarUrl ? (
                    <img
                      src={resolveMediaUrl(currentAvatarUrl)}
                      alt="Avatar Preview"
                      className="avatar-editor-thumb"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.avatar-editor-initial');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="avatar-editor-initial"
                    style={{ display: currentAvatarUrl ? 'none' : 'flex' }}
                  >
                    {(block.title || 'U').charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="avatar-actions-column">
                  <div className="avatar-btns-row">
                    <input
                      type="file"
                      ref={avatarFileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarDirectUpload}
                    />
                    <button
                      type="button"
                      className="btn-primary-sm"
                      disabled={uploadingAvatar}
                      onClick={() => avatarFileInputRef.current?.click()}
                    >
                      {uploadingAvatar ? '⏳ Yuklanmoqda...' : '📤 Rasm yuklash'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary-sm"
                      onClick={() => onOpenAssetPicker((url) => {
                        onChange({ ...block, avatarUrl: url, avatar: url });
                      })}
                    >
                      📁 Kutubxona
                    </button>
                    {currentAvatarUrl && (
                      <button
                        type="button"
                        className="btn-danger-sm"
                        onClick={() => onChange({ ...block, avatarUrl: '', avatar: '', imageUrl: '', image: '' })}
                      >
                        ✕ O'chirish
                      </button>
                    )}
                  </div>
                  <span className="helper-hint">JPG, PNG, WebP yoki GIF (Maks. 15MB)</span>
                </div>
              </div>

              {/* Preset Avatars Quick Select */}
              <div className="form-group mt-2">
                <label className="sub-label">💡 Yoki tayyor portretlardan tanlang:</label>
                <div className="preset-avatars-row">
                  {presetAvatars.map((p, idx) => (
                    <img
                      key={idx}
                      src={p.url}
                      alt={p.name}
                      title={p.name}
                      className={`preset-avatar-chip ${currentAvatarUrl === p.url ? 'active' : ''}`}
                      onClick={() => onChange({ ...block, avatarUrl: p.url, avatar: p.url })}
                    />
                  ))}
                </div>
              </div>

              {/* Manual URL Input */}
              <div className="form-group mt-2">
                <label>Yoki rasm havolasini kiriting (URL)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={currentAvatarUrl}
                  onChange={(e) => onChange({ ...block, avatarUrl: e.target.value, avatar: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Avatar Shape and Size */}
              <div className="form-row-two mt-2">
                <div className="form-group">
                  <label>Avatar Shakli</label>
                  <select
                    value={block.avatarShape || 'circle'}
                    onChange={(e) => handleChange('avatarShape', e.target.value)}
                    className="form-select"
                  >
                    <option value="circle">⚪ Dumaloq (Circle)</option>
                    <option value="rounded">🔲 Yumaloq burchak (Rounded)</option>
                    <option value="square">⬛ To'rtburchak (Square)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Avatar Hajmi (px)</label>
                  <select
                    value={block.avatarSize || 88}
                    onChange={(e) => handleChange('avatarSize', parseInt(e.target.value, 10))}
                    className="form-select"
                  >
                    <option value={72}>Kichik (72px)</option>
                    <option value={88}>O'rtacha (88px)</option>
                    <option value={108}>Katta (108px)</option>
                    <option value={128}>Juda katta (128px)</option>
                  </select>
                </div>
              </div>

              {/* Name & Title */}
              <div className="form-group mt-2">
                <label>Ism / Brend nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Alisher Qodirov yoki Nova Studio"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Bio & Subtitle */}
              <div className="form-group">
                <label>Bio / Qisqa tavsif</label>
                <textarea
                  rows={2}
                  placeholder="Masalan: Raqamli marketolog & IT Bloger"
                  value={block.subtitle || ''}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  className="form-input form-textarea"
                />
              </div>

              {/* Verified Badge */}
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!block.verified}
                  onChange={(e) => handleChange('verified', e.target.checked)}
                />
                <span>Tasdiqlanganlik nishoni (Verified Badge ✓)</span>
              </label>
            </div>
          )}

          {/* LINK */}
          {block.type === 'link' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Tugma matni</label>
                <input
                  type="text"
                  value={block.label || ''}
                  onChange={(e) => handleChange('label', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Havola manzili (URL)</label>
                <input
                  type="url"
                  value={block.url || ''}
                  onChange={(e) => handleChange('url', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Belgi / Emoji (Icon)</label>
                <input
                  type="text"
                  value={block.icon || ''}
                  onChange={(e) => handleChange('icon', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Maxsus Nishon (Badge - masalan: Yangi, -20%)</label>
                <input
                  type="text"
                  value={block.badge || ''}
                  onChange={(e) => handleChange('badge', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* MESSENGERS */}
          {block.type === 'messengers' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Sarlavha (ixtiyoriy)</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="dynamic-list-container">
                <label className="section-small-label">Messenjerlar & Ijtimoiy tarmoqlar</label>
                {(block.items || []).map((m, idx) => (
                  <div key={idx} className="dynamic-item-row">
                    <input
                      type="text"
                      placeholder="Icon"
                      value={m.icon || ''}
                      onChange={(e) => {
                        const newItems = [...(block.items || [])];
                        newItems[idx] = { ...newItems[idx], icon: e.target.value };
                        handleChange('items', newItems);
                      }}
                      className="form-input small-input icon-input"
                    />
                    <input
                      type="text"
                      placeholder="Nomi (Telegram)"
                      value={m.label || ''}
                      onChange={(e) => {
                        const newItems = [...(block.items || [])];
                        newItems[idx] = { ...newItems[idx], label: e.target.value };
                        handleChange('items', newItems);
                      }}
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="Havola (https://t.me/...)"
                      value={m.url || ''}
                      onChange={(e) => {
                        const newItems = [...(block.items || [])];
                        newItems[idx] = { ...newItems[idx], url: e.target.value };
                        handleChange('items', newItems);
                      }}
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="control-btn delete-btn"
                      onClick={() => {
                        const newItems = block.items.filter((_, i) => i !== idx);
                        handleChange('items', newItems);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-secondary-sm mt-2"
                  onClick={() => {
                    const newItems = [...(block.items || []), { label: 'Telegram', url: 'https://t.me/', icon: '✈️' }];
                    handleChange('items', newItems);
                  }}
                >
                  ➕ Messenjer qo'shish
                </button>
              </div>
            </div>
          )}

          {/* TEXT */}
          {block.type === 'text' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Sarlavha (ixtiyoriy)</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Matn mazmuni</label>
                <textarea
                  rows={4}
                  value={block.content || ''}
                  onChange={(e) => handleChange('content', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* MEDIA */}
          {block.type === 'media' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Media turi</label>
                <select
                  value={block.mediaType || 'image'}
                  onChange={(e) => handleChange('mediaType', e.target.value)}
                  className="form-input"
                >
                  <option value="image">Rasm (Image / GIF)</option>
                  <option value="video">Video (MP4)</option>
                  <option value="youtube">YouTube Video</option>
                </select>
              </div>
              {block.mediaType === 'youtube' ? (
                <div className="form-group">
                  <label>YouTube Video ID (masalan: dQw4w9WgXcQ)</label>
                  <input
                    type="text"
                    value={block.youtubeId || ''}
                    onChange={(e) => handleChange('youtubeId', e.target.value)}
                    className="form-input"
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Media havolasi</label>
                  <div className="media-picker-input-group">
                    <input
                      type="text"
                      value={block.url || ''}
                      onChange={(e) => handleChange('url', e.target.value)}
                      className="form-input"
                    />
                    <button type="button" className="btn-secondary" onClick={() => onOpenAssetPicker((url) => handleChange('url', url))}>
                      📁 Tanlash
                    </button>
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Izoh / Sarlavha</label>
                <input
                  type="text"
                  value={block.caption || ''}
                  onChange={(e) => handleChange('caption', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* PRICING */}
          {block.type === 'pricing' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Bo'lim Sarlavhasi</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="dynamic-list-container">
                <label className="section-small-label">Tarif Paketlari</label>
                {(block.plans || []).map((plan, idx) => (
                  <div key={idx} className="dynamic-box-card">
                    <div className="box-card-header">
                      <span className="box-card-num">#{idx + 1} Tarif</span>
                      <button
                        type="button"
                        className="control-btn delete-btn"
                        onClick={() => {
                          const newPlans = block.plans.filter((_, i) => i !== idx);
                          handleChange('plans', newPlans);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="form-group mt-2">
                      <label>Tarif nomi</label>
                      <input
                        type="text"
                        value={plan.name || ''}
                        onChange={(e) => {
                          const newPlans = [...(block.plans || [])];
                          newPlans[idx] = { ...newPlans[idx], name: e.target.value };
                          handleChange('plans', newPlans);
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Narxi (so'mda)</label>
                      <input
                        type="number"
                        value={plan.price || 0}
                        onChange={(e) => {
                          const newPlans = [...(block.plans || [])];
                          newPlans[idx] = { ...newPlans[idx], price: Number(e.target.value) };
                          handleChange('plans', newPlans);
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tugma matni</label>
                      <input
                        type="text"
                        value={plan.button || 'Tanlash'}
                        onChange={(e) => {
                          const newPlans = [...(block.plans || [])];
                          newPlans[idx] = { ...newPlans[idx], button: e.target.value };
                          handleChange('plans', newPlans);
                        }}
                        className="form-input"
                      />
                    </div>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={!!plan.isFeatured}
                        onChange={(e) => {
                          const newPlans = [...(block.plans || [])];
                          newPlans[idx] = { ...newPlans[idx], isFeatured: e.target.checked };
                          handleChange('plans', newPlans);
                        }}
                      />
                      <span>Ommabop tarif (Featured Badge)</span>
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-secondary-sm mt-2"
                  onClick={() => {
                    const newPlans = [...(block.plans || []), { name: 'Yangi Tarif', price: 100000, features: ['Xizmat 1', 'Xizmat 2'], button: 'Tanlash' }];
                    handleChange('plans', newPlans);
                  }}
                >
                  ➕ Yangi Tarif Qo'shish
                </button>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {block.type === 'products' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Bo'lim Sarlavhasi</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="dynamic-list-container">
                <label className="section-small-label">Mahsulotlar</label>
                {(block.items || []).map((prod, idx) => (
                  <div key={prod.id || idx} className="dynamic-box-card">
                    <div className="box-card-header">
                      <span className="box-card-num">#{idx + 1} Mahsulot</span>
                      <button
                        type="button"
                        className="control-btn delete-btn"
                        onClick={() => {
                          const newItems = block.items.filter((_, i) => i !== idx);
                          handleChange('items', newItems);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="form-group mt-2">
                      <label>Mahsulot nomi</label>
                      <input
                        type="text"
                        value={prod.title || ''}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[idx] = { ...newItems[idx], title: e.target.value };
                          handleChange('items', newItems);
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Narxi (so'm)</label>
                      <input
                        type="number"
                        value={prod.price || 0}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[idx] = { ...newItems[idx], price: Number(e.target.value) };
                          handleChange('items', newItems);
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Eski Narxi (chegirma uchun)</label>
                      <input
                        type="number"
                        value={prod.oldPrice || 0}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[idx] = { ...newItems[idx], oldPrice: Number(e.target.value) };
                          handleChange('items', newItems);
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Rasm havolasi</label>
                      <div className="media-picker-input-group">
                        <input
                          type="text"
                          value={prod.image || ''}
                          onChange={(e) => {
                            const newItems = [...(block.items || [])];
                            newItems[idx] = { ...newItems[idx], image: e.target.value };
                            handleChange('items', newItems);
                          }}
                          className="form-input"
                        />
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => onOpenAssetPicker((url) => {
                            const newItems = [...(block.items || [])];
                            newItems[idx] = { ...newItems[idx], image: url };
                            handleChange('items', newItems);
                          })}
                        >
                          📁
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-secondary-sm mt-2"
                  onClick={() => {
                    const newItems = [...(block.items || []), { id: generateId('prod'), title: 'Yangi Mahsulot', price: 99000, oldPrice: 120000, image: '' }];
                    handleChange('items', newItems);
                  }}
                >
                  ➕ Yangi Mahsulot Qo'shish
                </button>
              </div>
            </div>
          )}

          {/* FORM */}
          {block.type === 'form' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Forma Sarlavhasi</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Tugma matni (Submit Button)</label>
                <input
                  type="text"
                  value={block.submitLabel || 'Yuborish'}
                  onChange={(e) => handleChange('submitLabel', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="dynamic-list-container">
                <label className="section-small-label">Forma Maydonlari</label>
                {(block.fields || []).map((field, idx) => (
                  <div key={idx} className="dynamic-item-row">
                    <input
                      type="text"
                      placeholder="Maydon nomi (Ismingiz)"
                      value={field.label || ''}
                      onChange={(e) => {
                        const newFields = [...(block.fields || [])];
                        newFields[idx] = { ...newFields[idx], label: e.target.value };
                        handleChange('fields', newFields);
                      }}
                      className="form-input"
                    />
                    <select
                      value={field.type || 'text'}
                      onChange={(e) => {
                        const newFields = [...(block.fields || [])];
                        newFields[idx] = { ...newFields[idx], type: e.target.value };
                        handleChange('fields', newFields);
                      }}
                      className="form-input small-input"
                    >
                      <option value="text">Matn</option>
                      <option value="tel">Telefon</option>
                      <option value="email">Email</option>
                      <option value="textarea">Katta matn</option>
                    </select>
                    <label className="checkbox-label-sm">
                      <input
                        type="checkbox"
                        checked={!!field.required}
                        onChange={(e) => {
                          const newFields = [...(block.fields || [])];
                          newFields[idx] = { ...newFields[idx], required: e.target.checked };
                          handleChange('fields', newFields);
                        }}
                      />
                      <span>Shart</span>
                    </label>
                    <button
                      type="button"
                      className="control-btn delete-btn"
                      onClick={() => {
                        const newFields = block.fields.filter((_, i) => i !== idx);
                        handleChange('fields', newFields);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-secondary-sm mt-2"
                  onClick={() => {
                    const newFields = [...(block.fields || []), { name: `f_${Date.now()}`, label: 'Qo\'shimcha ma\'lumot', type: 'text', required: false }];
                    handleChange('fields', newFields);
                  }}
                >
                  ➕ Maydon qo'shish
                </button>
              </div>
            </div>
          )}

          {/* REVIEWS */}
          {block.type === 'reviews' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Bo'lim Sarlavhasi</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="dynamic-list-container">
                <label className="section-small-label">Mijozlar Fikrlari</label>
                {(block.items || []).map((rev, idx) => (
                  <div key={rev.id || idx} className="dynamic-box-card">
                    <div className="box-card-header">
                      <span className="box-card-num">#{idx + 1} Fikr</span>
                      <button
                        type="button"
                        className="control-btn delete-btn"
                        onClick={() => {
                          const newItems = block.items.filter((_, i) => i !== idx);
                          handleChange('items', newItems);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="form-group mt-2">
                      <label>Mijoz ismi</label>
                      <input
                        type="text"
                        value={rev.name || ''}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[idx] = { ...newItems[idx], name: e.target.value };
                          handleChange('items', newItems);
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Kasbi / Unvoni</label>
                      <input
                        type="text"
                        value={rev.role || ''}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[idx] = { ...newItems[idx], role: e.target.value };
                          handleChange('items', newItems);
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Izoh matni</label>
                      <textarea
                        rows={2}
                        value={rev.comment || ''}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[idx] = { ...newItems[idx], comment: e.target.value };
                          handleChange('items', newItems);
                        }}
                        className="form-input"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-secondary-sm mt-2"
                  onClick={() => {
                    const newItems = [...(block.items || []), { id: generateId('rev'), name: 'Yangi Mijoz', role: 'Tadbirkor', comment: 'Ajoyib xizmat!', rating: 5, verified: true }];
                    handleChange('items', newItems);
                  }}
                >
                  ➕ Yangi Fikr Qo'shish
                </button>
              </div>
            </div>
          )}

          {/* TIMER */}
          {block.type === 'timer' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Taymer Sarlavhasi</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Maqsadli Sana va Vaqt (Target Date)</label>
                <input
                  type="datetime-local"
                  value={block.targetDate ? block.targetDate.substring(0, 16) : ''}
                  onChange={(e) => handleChange('targetDate', new Date(e.target.value).toISOString())}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* FAQ */}
          {block.type === 'faq' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>FAQ Sarlavhasi</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="dynamic-list-container">
                <label className="section-small-label">Savol va Javoblar</label>
                {(block.items || []).map((item, idx) => (
                  <div key={idx} className="dynamic-box-card">
                    <div className="box-card-header">
                      <span className="box-card-num">#{idx + 1} Savol</span>
                      <button
                        type="button"
                        className="control-btn delete-btn"
                        onClick={() => {
                          const newItems = block.items.filter((_, i) => i !== idx);
                          handleChange('items', newItems);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="form-group mt-2">
                      <label>Savol</label>
                      <input
                        type="text"
                        value={item.q || ''}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[idx] = { ...newItems[idx], q: e.target.value };
                          handleChange('items', newItems);
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Javob</label>
                      <textarea
                        rows={2}
                        value={item.a || ''}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[idx] = { ...newItems[idx], a: e.target.value };
                          handleChange('items', newItems);
                        }}
                        className="form-input"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-secondary-sm mt-2"
                  onClick={() => {
                    const newItems = [...(block.items || []), { q: 'Yangi savol?', a: 'Batafsil javob...' }];
                    handleChange('items', newItems);
                  }}
                >
                  ➕ Yangi Savol Qo'shish
                </button>
              </div>
            </div>
          )}

          {/* STORIES */}
          {block.type === 'stories' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Bo'lim Sarlavhasi</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="dynamic-list-container">
                <label className="section-small-label">Stories Hikoyalar</label>
                {(block.items || []).map((story, idx) => (
                  <div key={story.id || idx} className="dynamic-box-card">
                    <div className="box-card-header">
                      <span className="box-card-num">#{idx + 1} Story</span>
                      <button
                        type="button"
                        className="control-btn delete-btn"
                        onClick={() => {
                          const newItems = block.items.filter((_, i) => i !== idx);
                          handleChange('items', newItems);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="form-group mt-2">
                      <label>Hikoya Sarlavhasi</label>
                      <input
                        type="text"
                        value={story.title || ''}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[idx] = { ...newItems[idx], title: e.target.value };
                          handleChange('items', newItems);
                        }}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Rasm / Fon havolasi</label>
                      <div className="media-picker-input-group">
                        <input
                          type="text"
                          value={story.preview || ''}
                          onChange={(e) => {
                            const newItems = [...(block.items || [])];
                            newItems[idx] = { ...newItems[idx], preview: e.target.value };
                            handleChange('items', newItems);
                          }}
                          className="form-input"
                        />
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => onOpenAssetPicker((url) => {
                            const newItems = [...(block.items || [])];
                            newItems[idx] = { ...newItems[idx], preview: url };
                            handleChange('items', newItems);
                          })}
                        >
                          📁
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Ichki matn / Xabar</label>
                      <textarea
                        rows={2}
                        value={story.content || ''}
                        onChange={(e) => {
                          const newItems = [...(block.items || [])];
                          newItems[idx] = { ...newItems[idx], content: e.target.value };
                          handleChange('items', newItems);
                        }}
                        className="form-input"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-secondary-sm mt-2"
                  onClick={() => {
                    const newItems = [...(block.items || []), { id: generateId('story'), title: 'Yangi Story', preview: '', content: 'Batafsil ma\'lumot...' }];
                    handleChange('items', newItems);
                  }}
                >
                  ➕ Yangi Story Qo'shish
                </button>
              </div>
            </div>
          )}

          {/* LOCATION & MAPS */}
          {block.type === 'location' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Blok Sarlavhasi</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                  placeholder="Bizning Manzilimiz"
                />
              </div>

              <div className="form-group">
                <label>Qo'shimcha izoh / Ish vaqti</label>
                <input
                  type="text"
                  value={block.subtitle || ''}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  className="form-input"
                  placeholder="Har kuni 09:00 - 20:00"
                />
              </div>

              <div className="form-group">
                <label>To'liq Manzil Matni</label>
                <textarea
                  rows={2}
                  value={block.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="form-input"
                  placeholder="Toshkent shahri, Amir Temur shoh ko'chasi, 15-uy"
                />
              </div>

              <div className="two-col-inputs">
                <div className="form-group">
                  <label>Xarita Provayderi</label>
                  <select
                    value={block.mapProvider || 'yandex'}
                    onChange={(e) => handleChange('mapProvider', e.target.value)}
                    className="form-input"
                  >
                    <option value="yandex">Yandex Xarita (Yandex Maps)</option>
                    <option value="google">Google Xarita (Google Maps)</option>
                    <option value="osm">OpenStreetMap</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Xarita Havolasi (URL)</label>
                  <input
                    type="text"
                    value={block.mapUrl || ''}
                    onChange={(e) => handleChange('mapUrl', e.target.value)}
                    className="form-input"
                    placeholder="https://yandex.uz/maps/..."
                  />
                </div>
              </div>

              <div className="two-col-inputs">
                <div className="form-group">
                  <label>Kenglik (Latitude)</label>
                  <input
                    type="text"
                    value={block.latitude || '41.311081'}
                    onChange={(e) => handleChange('latitude', e.target.value)}
                    className="form-input"
                    placeholder="41.311081"
                  />
                </div>
                <div className="form-group">
                  <label>Uzunlik (Longitude)</label>
                  <input
                    type="text"
                    value={block.longitude || '69.240562'}
                    onChange={(e) => handleChange('longitude', e.target.value)}
                    className="form-input"
                    placeholder="69.240562"
                  />
                </div>
              </div>

              <div className="form-group checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={block.showMapPreview !== false}
                    onChange={(e) => handleChange('showMapPreview', e.target.checked)}
                  />
                  <span>Interaktiv xaritani sahifada ko'rsatish</span>
                </label>
              </div>

              {block.showMapPreview !== false && (
                <div className="form-group">
                  <label>Xarita balandligi: {block.mapHeight || 200}px</label>
                  <input
                    type="range"
                    min="140"
                    max="360"
                    value={block.mapHeight || 200}
                    onChange={(e) => handleChange('mapHeight', Number(e.target.value))}
                    className="range-slider"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Marshrut tugmasi matni</label>
                <input
                  type="text"
                  value={block.buttonText || ''}
                  onChange={(e) => handleChange('buttonText', e.target.value)}
                  className="form-input"
                  placeholder="📍 Xaritada ko'rish (Marshrut)"
                />
              </div>

              <div className="form-group checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={block.showCopyAddress !== false}
                    onChange={(e) => handleChange('showCopyAddress', e.target.checked)}
                  />
                  <span>"Manzilni nusxalash" tugmasini ko'rsatish</span>
                </label>
              </div>

              <div className="two-col-inputs mt-2">
                <div className="form-group">
                  <label>Telefon raqam (Ixtiyoriy)</label>
                  <input
                    type="text"
                    value={block.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="form-input"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div className="form-group checkbox-row" style={{ marginTop: '24px' }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={!!block.showCallBtn}
                      onChange={(e) => handleChange('showCallBtn', e.target.checked)}
                    />
                    <span>Qo'ng'iroq tugmasi</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* QR CODE */}
          {block.type === 'qrcode' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Blok Sarlavhasi</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                  placeholder="QR Kod orqali o'tish"
                />
              </div>

              <div className="form-group">
                <label>Tavsif / Ko'rsatma</label>
                <input
                  type="text"
                  value={block.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="form-input"
                  placeholder="Kamerani yo'naltirib sahifaga o'ting"
                />
              </div>

              <div className="form-group">
                <label>QR Kod Turi</label>
                <select
                  value={block.qrType || 'current_page'}
                  onChange={(e) => handleChange('qrType', e.target.value)}
                  className="form-input"
                >
                  <option value="current_page">Joriy Sahifa Havolasi (Avtomatik)</option>
                  <option value="custom_url">Maxsus Havola / Sayt (URL)</option>
                  <option value="wifi">Wi-Fi Tarmoqqa Ulanish</option>
                  <option value="phone">Telefon Raqami (tel:)</option>
                  <option value="text">Erkin Matn / Promo Kod</option>
                </select>
              </div>

              {block.qrType === 'custom_url' && (
                <div className="form-group">
                  <label>Havola (URL)</label>
                  <input
                    type="text"
                    value={block.qrValue || ''}
                    onChange={(e) => handleChange('qrValue', e.target.value)}
                    className="form-input"
                    placeholder="https://t.me/..."
                  />
                </div>
              )}

              {block.qrType === 'phone' && (
                <div className="form-group">
                  <label>Telefon raqam</label>
                  <input
                    type="text"
                    value={block.qrValue || ''}
                    onChange={(e) => handleChange('qrValue', e.target.value)}
                    className="form-input"
                    placeholder="+998901234567"
                  />
                </div>
              )}

              {block.qrType === 'text' && (
                <div className="form-group">
                  <label>Matn yoki Promo Kod</label>
                  <textarea
                    rows={2}
                    value={block.qrValue || ''}
                    onChange={(e) => handleChange('qrValue', e.target.value)}
                    className="form-input"
                    placeholder="PROMO2026"
                  />
                </div>
              )}

              {block.qrType === 'wifi' && (
                <div className="wifi-settings-box">
                  <div className="form-group">
                    <label>Wi-Fi Nomi (SSID)</label>
                    <input
                      type="text"
                      value={block.wifiSsid || ''}
                      onChange={(e) => handleChange('wifiSsid', e.target.value)}
                      className="form-input"
                      placeholder="Ofis_WiFi"
                    />
                  </div>
                  <div className="two-col-inputs">
                    <div className="form-group">
                      <label>Wi-Fi Paroli</label>
                      <input
                        type="text"
                        value={block.wifiPass || ''}
                        onChange={(e) => handleChange('wifiPass', e.target.value)}
                        className="form-input"
                        placeholder="Parol..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Xavfsizlik turi</label>
                      <select
                        value={block.wifiType || 'WPA'}
                        onChange={(e) => handleChange('wifiType', e.target.value)}
                        className="form-input"
                      >
                        <option value="WPA">WPA / WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Parolsiz (Open)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>QR Kod O'lchami: {block.size || 180}px</label>
                <input
                  type="range"
                  min="120"
                  max="280"
                  value={block.size || 180}
                  onChange={(e) => handleChange('size', Number(e.target.value))}
                  className="range-slider"
                />
              </div>

              <div className="two-col-inputs">
                <div className="form-group">
                  <label>QR Kod Rangi</label>
                  <div className="color-picker-row">
                    <input
                      type="color"
                      value={block.qrColor || '#000000'}
                      onChange={(e) => handleChange('qrColor', e.target.value)}
                      className="color-input-square"
                    />
                    <input
                      type="text"
                      value={block.qrColor || '#000000'}
                      onChange={(e) => handleChange('qrColor', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Fon Rangi</label>
                  <div className="color-picker-row">
                    <input
                      type="color"
                      value={block.qrBg || '#ffffff'}
                      onChange={(e) => handleChange('qrBg', e.target.value)}
                      className="color-input-square"
                    />
                    <input
                      type="text"
                      value={block.qrBg || '#ffffff'}
                      onChange={(e) => handleChange('qrBg', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="two-col-inputs mt-2">
                <div className="form-group checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={block.showDownloadBtn !== false}
                      onChange={(e) => handleChange('showDownloadBtn', e.target.checked)}
                    />
                    <span>Yuklab olish tugmasi</span>
                  </label>
                </div>
                <div className="form-group checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={block.showCopyLinkBtn !== false}
                      onChange={(e) => handleChange('showCopyLinkBtn', e.target.checked)}
                    />
                    <span>Havolani nusxalash</span>
                  </label>
                </div>
              </div>

              {block.showDownloadBtn !== false && (
                <div className="form-group mt-2">
                  <label>Yuklab olish tugmasi matni</label>
                  <input
                    type="text"
                    value={block.buttonText || ''}
                    onChange={(e) => handleChange('buttonText', e.target.value)}
                    className="form-input"
                    placeholder="📥 QR Kodni yuklab olish"
                  />
                </div>
              )}
            </div>
          )}

          {/* DIVIDER */}
          {block.type === 'divider' && (
            <div className="editor-form-fields">
              <div className="form-group">
                <label>Bo'luvchi turi</label>
                <select
                  value={block.style || 'line'}
                  onChange={(e) => handleChange('style', e.target.value)}
                  className="form-input"
                >
                  <option value="line">Chiziq (Line)</option>
                  <option value="spacer">Bo'sh joy (Spacer)</option>
                  <option value="dots">Nuqtalar (Dots)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Balandlik / Bo'shliq: {block.height || 24}px</label>
                <input
                  type="range"
                  min="4"
                  max="80"
                  value={block.height || 24}
                  onChange={(e) => handleChange('height', Number(e.target.value))}
                  className="range-slider"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DEEP STYLE & DESIGN CUSTOMIZATION (RANG, BORDER, SOYA, RADIUS, PADDING) */}
      {editorTab === 'design' && (
        <div className="editor-design-tab-body">
          {/* Colors */}
          <div className="custom-section-box">
            <h5 className="design-group-title">🎨 Ranglar (Colors)</h5>
            <div className="color-settings-grid">
              <div className="form-group">
                <label>Blok Foni (Background)</label>
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={block.customBg?.startsWith('#') ? block.customBg : '#1e293b'}
                    onChange={(e) => handleChange('customBg', e.target.value)}
                    className="color-input-square"
                  />
                  <input
                    type="text"
                    placeholder="Masalan: #1e293b yoki rgba(...)"
                    value={block.customBg || ''}
                    onChange={(e) => handleChange('customBg', e.target.value)}
                    className="form-input"
                  />
                  {block.customBg && (
                    <button
                      type="button"
                      className="control-btn"
                      title="Asliga qaytarish"
                      onClick={() => handleChange('customBg', '')}
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Matn Rangi (Text Color)</label>
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={block.textColor?.startsWith('#') ? block.textColor : '#ffffff'}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="color-input-square"
                  />
                  <input
                    type="text"
                    placeholder="Standart"
                    value={block.textColor || ''}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="form-input"
                  />
                  {block.textColor && (
                    <button
                      type="button"
                      className="control-btn"
                      title="Asliga qaytarish"
                      onClick={() => handleChange('textColor', '')}
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Tugma / Aktsent Rangi (Button Color)</label>
                <div className="color-picker-row">
                  <input
                    type="color"
                    value={block.accentColor?.startsWith('#') ? block.accentColor : '#6366f1'}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="color-input-square"
                  />
                  <input
                    type="text"
                    placeholder="Standart"
                    value={block.accentColor || ''}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="form-input"
                  />
                  {block.accentColor && (
                    <button
                      type="button"
                      className="control-btn"
                      title="Asliga qaytarish"
                      onClick={() => handleChange('accentColor', '')}
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Borders & Corners */}
          <div className="custom-section-box mt-3">
            <h5 className="design-group-title">🔲 Chegaralar & Burchaklar (Borders & Radius)</h5>

            <div className="form-group">
              <label>Burchaklar yumaloqligi (Radius): {block.borderRadius ?? 16}px</label>
              <input
                type="range"
                min="0"
                max="36"
                value={block.borderRadius ?? 16}
                onChange={(e) => handleChange('borderRadius', Number(e.target.value))}
                className="range-slider"
              />
            </div>

            <div className="form-group">
              <label>Chegara qalinligi (Border Width): {block.borderWidth ?? 0}px</label>
              <input
                type="range"
                min="0"
                max="8"
                value={block.borderWidth ?? 0}
                onChange={(e) => handleChange('borderWidth', Number(e.target.value))}
                className="range-slider"
              />
            </div>

            {Number(block.borderWidth) > 0 && (
              <div className="color-settings-grid mt-2">
                <div className="form-group">
                  <label>Chegara turi (Border Style)</label>
                  <select
                    value={block.borderStyle || 'solid'}
                    onChange={(e) => handleChange('borderStyle', e.target.value)}
                    className="form-input"
                  >
                    <option value="solid">Tekis chiziq (Solid)</option>
                    <option value="dashed">Uziq chiziq (Dashed)</option>
                    <option value="dotted">Nuqtali (Dotted)</option>
                    <option value="double">Qo'shaloq (Double)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Chegara rangi (Border Color)</label>
                  <div className="color-picker-row">
                    <input
                      type="color"
                      value={block.borderColor?.startsWith('#') ? block.borderColor : '#6366f1'}
                      onChange={(e) => handleChange('borderColor', e.target.value)}
                      className="color-input-square"
                    />
                    <input
                      type="text"
                      value={block.borderColor || '#6366f1'}
                      onChange={(e) => handleChange('borderColor', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shadows & Spacing */}
          <div className="custom-section-box mt-3">
            <h5 className="design-group-title">✨ Soya, Nurlanish va Masofalar (Shadow & Spacing)</h5>

            <div className="form-group">
              <label>Soya effekti (Shadow & Glow)</label>
              <select
                value={block.shadow || 'none'}
                onChange={(e) => handleChange('shadow', e.target.value)}
                className="form-input"
              >
                <option value="none">Soyasiz (None)</option>
                <option value="sm">Yengil soya (Small Shadow)</option>
                <option value="md">O'rtacha soya (Medium Shadow)</option>
                <option value="lg">Kuchli soya (Large Shadow)</option>
                <option value="neon">⚡ Neon Nurlanish (Neon Glow)</option>
              </select>
            </div>

            <div className="range-sliders-grid mt-2">
              <div className="form-group">
                <label>Ichki masofa (Padding): {block.padding ?? 16}px</label>
                <input
                  type="range"
                  min="6"
                  max="36"
                  value={block.padding ?? 16}
                  onChange={(e) => handleChange('padding', Number(e.target.value))}
                  className="range-slider"
                />
              </div>

              <div className="form-group">
                <label>Pastki oraliq (Margin Bottom): {block.marginBottom ?? 14}px</label>
                <input
                  type="range"
                  min="0"
                  max="36"
                  value={block.marginBottom ?? 14}
                  onChange={(e) => handleChange('marginBottom', Number(e.target.value))}
                  className="range-slider"
                />
              </div>
            </div>
          </div>

          {/* Animations & Effects */}
          <div className="custom-section-box mt-3">
            <h5 className="design-group-title">⚡ Animatsiya va Hover Effektlari</h5>

            <div className="color-settings-grid">
              <div className="form-group">
                <label>Doimiy Animatsiya</label>
                <select
                  value={block.animation || 'none'}
                  onChange={(e) => handleChange('animation', e.target.value)}
                  className="form-input"
                >
                  <option value="none">Animatsiyasiz</option>
                  <option value="pulse">Pulse (Nafas olish)</option>
                  <option value="shake">Shake (Tebranish)</option>
                  <option value="glow">Glow (Nurlanish)</option>
                  <option value="bounce">Bounce (Sakrash)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Sichqoncha olib kelganda (Hover Effect)</label>
                <select
                  value={block.hoverEffect || 'none'}
                  onChange={(e) => handleChange('hoverEffect', e.target.value)}
                  className="form-input"
                >
                  <option value="none">Effektsiz</option>
                  <option value="lift">Lift (Tepaga ko'tarilish)</option>
                  <option value="scale">Scale (Kattalashish)</option>
                  <option value="glow">Glow (Yorug'lik taratish)</option>
                </select>
              </div>
            </div>

            <div className="form-group mt-2">
              <label>Matnni tekislash (Alignment)</label>
              <div className="button-styles-row">
                <button
                  type="button"
                  className={`btn-style-choice ${block.align === 'left' ? 'active' : ''}`}
                  onClick={() => handleChange('align', 'left')}
                >
                  ◀ Chapga
                </button>
                <button
                  type="button"
                  className={`btn-style-choice ${(!block.align || block.align === 'center') ? 'active' : ''}`}
                  onClick={() => handleChange('align', 'center')}
                >
                  ⏺ Markazga
                </button>
                <button
                  type="button"
                  className={`btn-style-choice ${block.align === 'right' ? 'active' : ''}`}
                  onClick={() => handleChange('align', 'right')}
                >
                  ▶ O'ngga
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
