import React, { useState } from 'react';
import { copyToClipboard } from '../utils/helpers';

export default function Topbar({
  activePage,
  onSavePage,
  isSaving,
  colorMode,
  onToggleColorMode,
  onOpenMobileDrawer = () => {},
}) {
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/p/${activePage?.slug || 'demo'}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(publicUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Mobile Drawer Hamburger Button */}
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={onOpenMobileDrawer}
          title="Menyuni ochish"
          aria-label="Menyu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <div className="topbar-breadcrumb">
          <span className="live-status-dot" title="Sahifa faol va ochiq" />
          <span className="tb-page-title">{activePage?.title || 'Sahifa'}</span>
          <span className="tb-separator">•</span>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tb-page-link"
          >
            linkstudio.uz/p/{activePage?.slug || 'demo'}
          </a>
        </div>
      </div>

      <div className="topbar-right">
        {/* Day / Dark Mode Toggle Button */}
        <button
          type="button"
          className="topbar-btn theme-mode-toggle-btn"
          onClick={onToggleColorMode}
          title={colorMode === 'dark' ? 'Kunduzgi rejim (Light Mode)' : 'Tungi rejim (Dark Mode)'}
        >
          <span className="theme-icon-text">{colorMode === 'dark' ? '☀️' : '🌙'}</span>
          <span className="desktop-only-btn-label">{colorMode === 'dark' ? ' Kunduzgi' : ' Tungi'}</span>
        </button>

        <button
          type="button"
          className="topbar-btn secondary desktop-only-btn"
          onClick={handleCopy}
        >
          {copied ? '✅ Nusxalandi!' : '🔗 Havola'}
        </button>

        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="topbar-btn secondary topbar-preview-link"
          title="Sahifani ochish"
        >
          <span>↗</span>
          <span className="desktop-only-btn-label"> Ko'rish</span>
        </a>

        <button
          type="button"
          disabled={isSaving}
          className="topbar-btn primary topbar-save-btn"
          onClick={onSavePage}
          title="O'zgarishlarni saqlash (Ctrl+S)"
        >
          <span>💾</span>
          <span>{isSaving ? '...' : 'Saqlash'}</span>
        </button>
      </div>
    </header>
  );
}

