import React, { useState, useEffect, useMemo } from 'react';
import BlockRenderer from './blocks/BlockRenderer';
import { api } from '../utils/api';
import { getContrastTextColor, resolveMediaUrl } from '../utils/helpers';
import StoryViewerModal from './modals/StoryViewerModal';
import CheckoutModal from './modals/CheckoutModal';

export default function PublicPage({ slug, initialData }) {
  const [page, setPage] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  // Modals state
  const [activeStories, setActiveStories] = useState(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [checkoutItem, setCheckoutItem] = useState(null);

  useEffect(() => {
    if (initialData) return;
    async function load() {
      try {
        setLoading(true);
        const data = await api.pages.getPublic(slug);
        setPage(data);
        // Track page view
        api.pages.track({
          pageSlug: slug,
          eventType: 'view',
          referrer: document.referrer || '',
        }).catch(() => {});
      } catch (err) {
        setError(err.message || 'Sahifa topilmadi');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, initialData]);

  // Contrast text color calculation for accent buttons
  const contrastAccentTextColor = useMemo(() => {
    return getContrastTextColor(page?.theme?.accent || '#6366f1');
  }, [page?.theme?.accent]);

  if (loading) {
    return (
      <div className="public-loading-screen">
        <div className="spinner-large" />
        <p>Sahifa yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="public-error-screen">
        <div className="error-card">
          <h2>404 - Sahifa topilmadi</h2>
          <p>{error || 'Ushbu manzil bo\'yicha bio-sahifa mavjud emas.'}</p>
          <a href="/" className="btn-primary">LinkStudio Asosiy Sahifa</a>
        </div>
      </div>
    );
  }

  const theme = page.theme || {};
  const isGlass = theme.buttonStyle === 'glass';
  const isOutline = theme.buttonStyle === 'outline';
  const isSolid = theme.buttonStyle === 'solid';

  const themeStyles = {
    '--page-bg': theme.backgroundType === 'gradient'
      ? (theme.gradient || 'linear-gradient(135deg, #090d16 0%, #111827 100%)')
      : (theme.background || '#090d16'),
    '--surface-bg': theme.surface || 'rgba(255, 255, 255, 0.08)',
    '--text-color': theme.text || '#f8fafc',
    '--accent-color': theme.accent || '#6366f1',
    '--accent-text': contrastAccentTextColor,
    '--radius': `${theme.radius ?? 16}px`,
    '--blur': `${theme.blur ?? 16}px`,
    '--overlay-color': theme.overlayColor || '#000000',
    '--overlay-opacity': theme.overlayOpacity ?? 0.15,
  };

  const handleTrack = (eventType, blockId, data) => {
    api.pages.track({
      pageSlug: page.slug,
      eventType,
      blockId,
      metadata: data,
    }).catch(() => {});
  };

  const handleFormSubmit = async (block, fields) => {
    await api.crm.createLead({
      pageSlug: page.slug,
      blockId: block.id,
      fields,
      source: 'public_page',
    });
    handleTrack('lead_form', block.id, { fields });
  };

  const handleStoryClick = (items, index) => {
    setActiveStories(items);
    setStoryIndex(index);
    handleTrack('story_open', 'stories', { index });
  };

  const handleProductClick = (product, block) => {
    setCheckoutItem({
      type: 'product',
      title: product.title,
      price: product.price,
      blockId: block.id,
    });
    handleTrack('product_click', block.id, { product: product.title, price: product.price });
  };

  const handlePricingClick = (plan, block) => {
    setCheckoutItem({
      type: 'plan',
      title: `${plan.name} Tarifi`,
      price: plan.price,
      blockId: block.id,
    });
    handleTrack('pricing_click', block.id, { plan: plan.name, price: plan.price });
  };

  return (
    <div
      className={`public-page-viewport ${isGlass ? 'theme-glass' : ''} ${isOutline ? 'theme-outline' : ''} ${isSolid ? 'theme-solid' : ''}`}
      style={themeStyles}
    >
      {/* Background Media */}
      {theme.backgroundType === 'image' && theme.backgroundImage && (
        <div className="page-bg-media-container">
          <img src={resolveMediaUrl(theme.backgroundImage)} alt="Background" className="page-bg-image" />
          <div className="page-bg-overlay" />
        </div>
      )}

      {theme.backgroundType === 'video' && theme.backgroundVideo && (
        <div className="page-bg-media-container">
          <video src={resolveMediaUrl(theme.backgroundVideo)} autoPlay loop muted playsInline className="page-bg-video" />
          <div className="page-bg-overlay" />
        </div>
      )}

      {/* Dynamic & 3D Live Animation Presets */}
      {theme.backgroundType === 'animation' && (
        <div className="page-bg-animation-container">
          {/* 3D Glass Orbs */}
          {theme.animationPreset === '3d-orbs' && (
            <div className="anim-3d-orbs-layer">
              <div className="orb-3d orb-1" />
              <div className="orb-3d orb-2" />
              <div className="orb-3d orb-3" />
            </div>
          )}

          {/* 3D Floating Cubes */}
          {theme.animationPreset === '3d-cubes' && (
            <div className="anim-3d-cubes-layer">
              <div className="cube-3d cube-1">
                <div className="cube-face front" />
                <div className="cube-face back" />
                <div className="cube-face right" />
                <div className="cube-face left" />
                <div className="cube-face top" />
                <div className="cube-face bottom" />
              </div>
              <div className="cube-3d cube-2">
                <div className="cube-face front" />
                <div className="cube-face back" />
                <div className="cube-face right" />
                <div className="cube-face left" />
                <div className="cube-face top" />
                <div className="cube-face bottom" />
              </div>
            </div>
          )}

          {/* 3D Cyber Horizon */}
          {theme.animationPreset === '3d-cyber-horizon' && (
            <div className="anim-3d-cyber-horizon-layer">
              <div className="cyber-sun" />
              <div className="cyber-grid-plane" />
            </div>
          )}

          {/* 3D Galaxy Warp */}
          {theme.animationPreset === '3d-galaxy-warp' && (
            <div className="anim-3d-galaxy-warp-layer">
              {Array.from({ length: 45 }).map((_, i) => (
                <span
                  key={i}
                  className="warp-star"
                  style={{
                    left: `${(i * 2.3) % 100}%`,
                    top: `${(i * 4.1) % 100}%`,
                    animationDelay: `${(i * 0.08) % 2}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* 3D Mesh Wave */}
          {theme.animationPreset === '3d-mesh' && (
            <div className="anim-3d-mesh-layer" />
          )}

          {/* Golden Dust (Oltin Zarralar) */}
          {theme.animationPreset === 'golden-dust' && (
            <div className="anim-golden-dust-layer">
              {Array.from({ length: 40 }).map((_, i) => (
                <span
                  key={i}
                  className="golden-particle"
                  style={{
                    left: `${(i * 2.6) % 100}%`,
                    top: `${(i * 4.3) % 100}%`,
                    width: `${3 + (i % 4) * 2}px`,
                    height: `${3 + (i % 4) * 2}px`,
                    animationDelay: `${(i * 0.15) % 4}s`,
                    animationDuration: `${2.5 + (i % 3)}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Fireflies (Tungi Yonarqo'ng'izlar) */}
          {theme.animationPreset === 'fireflies' && (
            <div className="anim-fireflies-layer">
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="firefly"
                  style={{
                    left: `${(i * 3.7) % 100}%`,
                    top: `${(i * 5.2) % 100}%`,
                    animationDelay: `${(i * 0.3) % 5}s`,
                    animationDuration: `${4 + (i % 4)}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Gradient Wave (Tirik Gradient To'lqini) */}
          {theme.animationPreset === 'gradient-wave' && (
            <div className="anim-gradient-wave-layer" />
          )}

          {/* Sakura Falling Petals */}
          {theme.animationPreset === 'sakura' && (
            <div className="anim-sakura-layer">
              {Array.from({ length: 30 }).map((_, i) => (
                <span
                  key={i}
                  className="sakura-petal"
                  style={{
                    left: `${(i * 3.4) % 100}%`,
                    animationDelay: `${(i * 0.3) % 6}s`,
                    animationDuration: `${4.5 + (i % 3)}s`,
                  }}
                >
                  🌸
                </span>
              ))}
            </div>
          )}

          {/* Fire Sparks (Olovli Uchqunlar) */}
          {theme.animationPreset === 'fire-sparks' && (
            <div className="anim-fire-sparks-layer">
              {Array.from({ length: 32 }).map((_, i) => (
                <span
                  key={i}
                  className="fire-spark"
                  style={{
                    left: `${(i * 3.2) % 100}%`,
                    bottom: '0',
                    width: `${3 + (i % 4) * 2}px`,
                    height: `${4 + (i % 4) * 3}px`,
                    animationDelay: `${(i * 0.15) % 3}s`,
                    animationDuration: `${2 + (i % 3) * 0.5}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Snow */}
          {theme.animationPreset === 'snow' && (
            <div className="anim-snow-layer">
              {Array.from({ length: 30 }).map((_, i) => (
                <span
                  key={i}
                  className="snowflake"
                  style={{
                    left: `${(i * 3.4) % 100}%`,
                    animationDelay: `${(i * 0.3) % 6}s`,
                    animationDuration: `${4 + (i % 4)}s`,
                    opacity: 0.4 + ((i % 5) * 0.12),
                  }}
                >
                  ❄
                </span>
              ))}
            </div>
          )}

          {/* Particles */}
          {theme.animationPreset === 'particles' && (
            <div className="anim-particles-layer">
              {Array.from({ length: 25 }).map((_, i) => (
                <span
                  key={i}
                  className="particle"
                  style={{
                    left: `${(i * 4.1) % 100}%`,
                    top: `${(i * 6.2) % 100}%`,
                    animationDelay: `${(i * 0.25) % 4}s`,
                    animationDuration: `${3 + (i % 3)}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Bubbles */}
          {theme.animationPreset === 'bubbles' && (
            <div className="anim-bubbles-layer">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="bubble"
                  style={{
                    left: `${(i * 5.8) % 100}%`,
                    width: `${20 + (i % 4) * 12}px`,
                    height: `${20 + (i % 4) * 12}px`,
                    animationDelay: `${(i * 0.5) % 5}s`,
                    animationDuration: `${5 + (i % 3)}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Matrix */}
          {theme.animationPreset === 'matrix' && (
            <div className="anim-matrix-layer">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="matrix-column"
                  style={{
                    left: `${i * 6.5}%`,
                    animationDelay: `${(i * 0.25) % 3}s`,
                    animationDuration: `${2.5 + (i % 2)}s`,
                  }}
                >
                  0101101001010110
                </div>
              ))}
            </div>
          )}

          {/* Rain */}
          {theme.animationPreset === 'rain' && (
            <div className="anim-rain-layer">
              {Array.from({ length: 35 }).map((_, i) => (
                <span
                  key={i}
                  className="rain-drop"
                  style={{
                    left: `${(i * 2.9) % 100}%`,
                    animationDelay: `${(i * 0.1) % 2}s`,
                    animationDuration: `${0.7 + (i % 4) * 0.2}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Public Container */}
      <div className="public-content-container" style={{ fontFamily: theme.fontFamily || 'inherit' }}>
        <div className="public-blocks-list">
          {(page.blocks || []).filter(b => !b.hidden).map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              theme={theme}
              isPublic={true}
              pageSlug={page.slug}
              onStoryClick={handleStoryClick}
              onProductClick={handleProductClick}
              onPricingClick={handlePricingClick}
              onFormSubmit={handleFormSubmit}
              onTrack={handleTrack}
            />
          ))}
        </div>

        {/* Branding Footer */}
        <footer className="public-page-footer">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="branding-link"
          >
            ⚡ <strong>LinkStudio Pro</strong> orqali yaratilgan
          </a>
        </footer>
      </div>

      {/* Floating Speed-Dial FAB Widget */}
      <FloatingContactWidget blocks={page.blocks} />

      {/* Story Viewer Modal */}
      {activeStories && (
        <StoryViewerModal
          stories={activeStories}
          initialIndex={storyIndex}
          onClose={() => setActiveStories(null)}
        />
      )}

      {/* Checkout & Payment Modal */}
      {checkoutItem && (
        <CheckoutModal
          item={checkoutItem}
          pageSlug={page.slug}
          onClose={() => setCheckoutItem(null)}
        />
      )}
    </div>
  );
}

// Sub-component: Floating Contact Widget (Speed-Dial FAB)
function FloatingContactWidget({ blocks = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract contact links from messengers block or fallback
  const messengersBlock = blocks.find(b => b.type === 'messengers');
  const items = messengersBlock?.items || [
    { label: 'Telegram', url: 'https://t.me/', icon: '✈️', color: '#229ED9' },
    { label: 'WhatsApp', url: 'https://wa.me/', icon: '💬', color: '#25D366' },
    { label: 'Instagram', url: 'https://instagram.com/', icon: '📸', color: '#E1306C' },
  ];

  if (!items || items.length === 0) return null;

  return (
    <div className="floating-contact-fab-wrap">
      {isOpen && (
        <div className="fab-speed-dial-menu">
          {items.map((item, idx) => (
            <a
              key={idx}
              href={item.url || '#'}
              target="_blank"
              rel="noreferrer"
              className="fab-dial-item"
              style={{ backgroundColor: item.color || '#6366f1' }}
            >
              <span>{item.icon || '💬'}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        className="fab-main-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Tezkor aloqa"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}

