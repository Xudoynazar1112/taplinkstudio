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
          title={colorMode === 'dark' ? 'Kunduzgi rejimga o\'tish (Light Mode)' : 'Tungi rejimga o\'tish (Dark Mode)'}
        >
          {colorMode === 'dark' ? '☀️ Kunduzgi' : '🌙 Tungi'}
        </button>

        <button
          type="button"
          className="topbar-btn secondary"
          onClick={handleCopy}
        >
          {copied ? '✅ Nusxalandi!' : '🔗 Havolani nusxalash'}
        </button>

        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="topbar-btn secondary"
        >
          ↗ Saytni ochish
        </a>

        <button
          type="button"
          disabled={isSaving}
          className="topbar-btn primary"
          onClick={onSavePage}
          title="O'zgarishlarni saqlash (Ctrl+S)"
        >
          {isSaving ? 'Saqlanmoqda...' : '💾 Saqlash'}
        </button>
      </div>
    </header>
  );
}

