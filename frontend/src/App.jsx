import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import PublicPage from './components/PublicPage';
import BuilderView from './views/BuilderView';
import TemplatesView from './views/TemplatesView';
import DesignView from './views/DesignView';
import MediaView from './views/MediaView';
import CRMView from './views/CRMView';
import AnalyticsView from './views/AnalyticsView';
import SettingsView from './views/SettingsView';
import AuthModal from './components/modals/AuthModal';
import NewPageModal from './components/modals/NewPageModal';
import StoryViewerModal from './components/modals/StoryViewerModal';
import CheckoutModal from './components/modals/CheckoutModal';
import { api } from './utils/api';
import { TEMPLATES_CATALOG } from './data/templatesCatalog';

export default function App() {
  // Check if public page route (/p/slug)
  const pathname = window.location.pathname;
  const isPublicRoute = pathname.startsWith('/p/');
  const publicSlug = isPublicRoute ? pathname.replace('/p/', '').split('/')[0] : null;

  // If public route, render standalone public viewer directly
  if (isPublicRoute && publicSlug) {
    return <PublicPage slug={publicSlug} />;
  }

  // Color mode: 'dark' | 'light'
  const [colorMode, setColorMode] = useState(() => {
    return localStorage.getItem('linkstudio_color_mode') || 'dark';
  });

  const toggleColorMode = () => {
    const nextMode = colorMode === 'dark' ? 'light' : 'dark';
    setColorMode(nextMode);
    localStorage.setItem('linkstudio_color_mode', nextMode);
  };

  // Dashboard / Builder State
  const [activeTab, setActiveTab] = useState('builder');
  const [user, setUser] = useState(null);
  const [userPages, setUserPages] = useState([]);
  const [activePage, setActivePage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newPageModalOpen, setNewPageModalOpen] = useState(false);
  const [storyViewer, setStoryViewer] = useState(null); // { items, index }
  const [checkoutModal, setCheckoutModal] = useState(null); // { item }

  // Initial Data Load
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        // Try to fetch current user
        try {
          const u = await api.auth.me();
          if (u && u.id) setUser(u);
        } catch (_) {}

        // Fetch pages
        const pages = await api.pages.list();
        setUserPages(pages || []);

        if (pages && pages.length > 0) {
          const fullPage = await api.pages.get(pages[0].slug);
          setActivePage(fullPage);
        } else {
          // Default fallback page
          const defaultTpl = TEMPLATES_CATALOG[0];
          const demoPage = {
            slug: 'demo',
            title: 'Mening Havolalarim',
            theme: defaultTpl.theme,
            blocks: defaultTpl.blocks,
          };
          setActivePage(demoPage);
        }
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSelectPage = async (slug) => {
    try {
      setLoading(true);
      const data = await api.pages.get(slug);
      setActivePage(data);
    } catch (err) {
      alert('Sahifani yuklashda xatolik: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePage = async () => {
    if (!activePage) return;
    setIsSaving(true);
    try {
      const updated = await api.pages.save(activePage.slug, activePage);
      setActivePage(updated);
      // Update pages summary list
      setUserPages(prev => prev.map(p => p.slug === updated.slug ? { ...p, title: updated.title } : p));
      alert('✅ Sahifa muvaffaqiyatli saqlandi!');
    } catch (err) {
      alert('Saqlashda xatolik: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBlocks = (newBlocks) => {
    setActivePage(prev => ({
      ...prev,
      blocks: newBlocks,
    }));
  };

  const handleUpdateTheme = (newTheme) => {
    setActivePage(prev => ({
      ...prev,
      theme: newTheme,
    }));
  };

  const handleApplyTemplate = async (template) => {
    const updated = {
      ...activePage,
      theme: template.theme,
      blocks: template.blocks,
    };
    setActivePage(updated);
    // Automatically save applied template
    try {
      await api.pages.save(activePage.slug, updated);
    } catch (_) {}
  };

  const handleUpdateSettings = async (settings) => {
    const updated = {
      ...activePage,
      ...settings,
    };
    setActivePage(updated);
    try {
      await api.pages.save(activePage.slug, updated);
      if (settings.slug && settings.slug !== activePage.slug) {
        // Redirect or re-fetch if slug changed
        handleSelectPage(settings.slug);
      }
    } catch (err) {
      alert('Sozlamalarni saqlashda xatolik: ' + err.message);
    }
  };

  const handleDeletePage = async (slug) => {
    try {
      await api.pages.delete(slug);
      const remaining = userPages.filter(p => p.slug !== slug);
      setUserPages(remaining);
      if (remaining.length > 0) {
        handleSelectPage(remaining[0].slug);
      } else {
        window.location.reload();
      }
    } catch (err) {
      alert('O\'chirishda xatolik: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('linkstudio_token');
    setUser(null);
    alert('Tizimdan chiqildi');
  };

  if (loading && !activePage) {
    return (
      <div className="app-loading-screen">
        <div className="spinner-large" />
        <p>LinkStudio Pro yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className={`app theme-${colorMode}`} data-theme={colorMode}>
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        userPages={userPages}
        activePage={activePage}
        onSelectPage={handleSelectPage}
        onOpenNewPageModal={() => setNewPageModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area with Topbar */}
      <div className="main-wrapper">
        <Topbar
          activePage={activePage}
          onSavePage={handleSavePage}
          isSaving={isSaving}
          colorMode={colorMode}
          onToggleColorMode={toggleColorMode}
        />

        <main className="content-body">
          {activeTab === 'builder' && (
            <BuilderView
              activePage={activePage}
              onUpdateBlocks={handleUpdateBlocks}
              onOpenStoryViewer={(items, index) => setStoryViewer({ items, index })}
              onOpenCheckout={(item) => setCheckoutModal({ item })}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesView
              activePage={activePage}
              onApplyTemplate={handleApplyTemplate}
            />
          )}

          {activeTab === 'design' && (
            <DesignView
              activePage={activePage}
              onUpdateTheme={handleUpdateTheme}
            />
          )}

          {activeTab === 'media' && (
            <MediaView />
          )}

          {activeTab === 'crm' && (
            <CRMView
              activePage={activePage}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              activePage={activePage}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              activePage={activePage}
              onUpdateSettings={handleUpdateSettings}
              onDeletePage={handleDeletePage}
            />
          )}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />

      {/* New Page Modal */}
      <NewPageModal
        isOpen={newPageModalOpen}
        onClose={() => setNewPageModalOpen(false)}
        onCreated={(newPage) => {
          setUserPages(prev => [newPage, ...prev]);
          setActivePage(newPage);
        }}
      />

      {/* Story Viewer Modal */}
      {storyViewer && (
        <StoryViewerModal
          stories={storyViewer.items}
          initialIndex={storyViewer.index}
          onClose={() => setStoryViewer(null)}
        />
      )}

      {/* Checkout Modal */}
      {checkoutModal && (
        <CheckoutModal
          item={checkoutModal.item}
          pageSlug={activePage?.slug}
          onClose={() => setCheckoutModal(null)}
        />
      )}
    </div>
  );
}
