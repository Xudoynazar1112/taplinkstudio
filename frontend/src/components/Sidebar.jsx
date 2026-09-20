import React, { useState } from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  userPages,
  activePage,
  onSelectPage,
  onOpenNewPageModal,
  onOpenAuthModal,
  onLogout,
}) {
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);

  const publicUrl = `/p/${activePage?.slug || 'demo'}`;

  const navItems = [
    { id: 'builder', label: 'Konstruktor', icon: '🛠️' },
    { id: 'templates', label: 'Shablonlar', icon: '📱' },
    { id: 'design', label: 'Dizayn & Mavzular', icon: '🎨' },
    { id: 'media', label: 'Media Kutubxona', icon: '🖼️' },
    { id: 'crm', label: 'CRM & Lidlar', icon: '📋' },
    { id: 'analytics', label: 'Analitika', icon: '📊' },
    { id: 'settings', label: 'Sozlamalar', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand-wrap">
        <div className="brand-logo-sidebar" onClick={() => setActiveTab('builder')}>
          <span className="logo-badge">⚡</span>
          <span className="brand">LinkStudio</span>
          <span className="brand-badge">PRO</span>
        </div>
      </div>

      {/* Page Switcher */}
      <div className="sidebar-page-switcher">
        <button
          type="button"
          className="sidebar-page-btn"
          onClick={() => setPageDropdownOpen(!pageDropdownOpen)}
        >
          <div className="sidebar-page-info">
            <span className="sp-title">{activePage?.title || 'Sahifa'}</span>
            <span className="sp-slug">/{activePage?.slug || 'demo'}</span>
          </div>
          <span className="sp-caret">{pageDropdownOpen ? '▲' : '▼'}</span>
        </button>

        {pageDropdownOpen && (
          <div className="sidebar-page-dropdown" onClick={() => setPageDropdownOpen(false)}>
            <div className="sp-dropdown-header">Mening Sahifalarim ({userPages.length})</div>
            <div className="sp-dropdown-list">
              {userPages.map((pg) => (
                <div
                  key={pg.slug}
                  className={`sp-dropdown-item ${activePage?.slug === pg.slug ? 'active' : ''}`}
                  onClick={() => onSelectPage(pg.slug)}
                >
                  <span className="sp-item-title">{pg.title}</span>
                  <span className="sp-item-slug">/{pg.slug}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="sp-btn-create-new"
              onClick={(e) => {
                e.stopPropagation();
                setPageDropdownOpen(false);
                onOpenNewPageModal();
              }}
            >
              ➕ Yangi sahifa qo'shish
            </button>
          </div>
        )}
      </div>

      {/* Navigation Group */}
      <nav className="nav-group">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="side-link-live"
        >
          <span>↗ Sahifani ochish</span>
        </a>

        {user ? (
          <div className="user-profile-box">
            <div className="user-avatar-mini">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-text">
              <strong>{user.name || 'Foydalanuvchi'}</strong>
              <small>{user.email}</small>
            </div>
            <button
              type="button"
              className="icon-btn-ghost"
              onClick={onLogout}
              title="Chiqish"
            >
              🚪
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="auth-btn-sidebar"
            onClick={onOpenAuthModal}
          >
            🔑 Tizimga Kirish
          </button>
        )}
      </div>
    </aside>
  );
}
