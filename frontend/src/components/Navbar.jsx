import React, { useState } from 'react';
import { copyToClipboard } from '../utils/helpers';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  userPages,
  activePage,
  onSelectPage,
  onOpenNewPageModal,
  onOpenAuthModal,
  onSavePage,
  isSaving,
  onLogout,
}) {
  const [copied, setCopied] = useState(false);
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const publicUrl = `${window.location.origin}/p/${activePage?.slug || 'demo'}`;

  const handleCopyLink = async () => {
    const success = await copyToClipboard(publicUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs = [
    { id: 'builder', label: 'Konstruktor', icon: '🛠️' },
    { id: 'templates', label: 'Shablonlar', icon: '📱' },
    { id: 'design', label: 'Dizayn & Mavzular', icon: '🎨' },
    { id: 'media', label: 'Media', icon: '🖼️' },
    { id: 'crm', label: 'CRM & Lidlar', icon: '📋' },
    { id: 'analytics', label: 'Analitika', icon: '📊' },
    { id: 'settings', label: 'Sozlamalar', icon: '⚙️' },
  ];

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <div className="brand-logo" onClick={() => setActiveTab('builder')}>
          <span className="logo-badge">⚡</span>
          <span className="logo-text">LinkStudio</span>
          <span className="logo-version">Pro</span>
        </div>

        {/* Page Switcher */}
        <div className="page-switcher-wrapper">
          <button
            type="button"
            className="page-selector-btn"
            onClick={() => setPageDropdownOpen(!pageDropdownOpen)}
          >
            <span className="page-icon">📄</span>
            <span className="page-current-title">{activePage?.title || 'Sahifa'}</span>
            <span className="page-slug-badge">/{activePage?.slug || 'demo'}</span>
            <span className="dropdown-caret">▼</span>
          </button>

          {pageDropdownOpen && (
            <div className="page-dropdown-menu" onClick={() => setPageDropdownOpen(false)}>
              <div className="dropdown-header">Mening Sahifalarim ({userPages.length})</div>
              <div className="dropdown-pages-scroll">
                {userPages.map((pg) => (
                  <div
                    key={pg.slug}
                    className={`dropdown-page-item ${activePage?.slug === pg.slug ? 'active' : ''}`}
                    onClick={() => onSelectPage(pg.slug)}
                  >
                    <div className="dp-title">{pg.title}</div>
                    <div className="dp-meta">/p/{pg.slug} • {pg.views_count || 0} ko'rish</div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <button
                  type="button"
                  className="btn-create-new-page"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPageDropdownOpen(false);
                    onOpenNewPageModal();
                  }}
                >
                  ➕ Yangi sahifa qo'shish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center navigation tabs */}
      <nav className="navbar-center-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`nav-tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="nav-tab-icon">{t.icon}</span>
            <span className="nav-tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Right actions */}
      <div className="navbar-right">
        {/* Live Link buttons */}
        <button
          type="button"
          className="btn-action-copy"
          onClick={handleCopyLink}
          title="Havolani nusxalash"
        >
          {copied ? '✅ Nusxalandi!' : '🔗 Havola'}
        </button>

        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-action-preview"
          title="Yangi oynada ochish"
        >
          ↗ Ko'rish
        </a>

        {/* Save button */}
        <button
          type="button"
          className="btn-save-page"
          onClick={onSavePage}
          disabled={isSaving}
        >
          {isSaving ? 'Saqlanmoqda...' : '💾 Saqlash'}
        </button>

        {/* User profile / login */}
        {user ? (
          <div className="user-profile-wrapper">
            <button
              type="button"
              className="user-avatar-btn"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <span className="user-avatar-circle">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </span>
            </button>

            {profileDropdownOpen && (
              <div className="user-profile-dropdown" onClick={() => setProfileDropdownOpen(false)}>
                <div className="user-info-row">
                  <div className="user-name-text">{user.name || 'Foydalanuvchi'}</div>
                  <div className="user-email-text">{user.email}</div>
                </div>
                <div className="user-menu-divider" />
                <button
                  type="button"
                  className="user-logout-btn"
                  onClick={onLogout}
                >
                  🚪 Chiqish
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="btn-login-trigger"
            onClick={onOpenAuthModal}
          >
            Kirish
          </button>
        )}
      </div>
    </header>
  );
}
