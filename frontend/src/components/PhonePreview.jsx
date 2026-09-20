import React, { useMemo } from 'react';
import BlockRenderer from './blocks/BlockRenderer';
import { getContrastTextColor, resolveMediaUrl } from '../utils/helpers';

export default function PhonePreview({
  page,
  themeOverride,
  blocksOverride,
  scale = 1,
  deviceType = 'iphone', // 'iphone' | 'ipad' | 'macbook' | 'frameless'
  previewMode = 'edit', // 'edit' | 'live'
  selectedBlockId = null,
  onSelectBlock,
  onMoveBlock,
  onDuplicateBlock,
  onToggleHideBlock,
  onDeleteBlock,
  onInsertBlockAt,
  onStoryClick,
  onProductClick,
  onPricingClick,
  onFormSubmit,
  onTrack,
}) {
  const currentTheme = themeOverride || page?.theme || {};
  const currentBlocks = blocksOverride || page?.blocks || [];

  const contrastAccentTextColor = useMemo(() => {
    return getContrastTextColor(currentTheme.accent || '#6366f1');
  }, [currentTheme.accent]);

  // CSS variables for live styling
  const themeStyles = {
    '--page-bg': currentTheme.backgroundType === 'gradient'
      ? (currentTheme.gradient || 'linear-gradient(135deg, #090d16 0%, #111827 100%)')
      : (currentTheme.background || '#090d16'),
    '--surface-bg': currentTheme.surface || 'rgba(255, 255, 255, 0.08)',
    '--text-color': currentTheme.text || '#f8fafc',
    '--accent-color': currentTheme.accent || '#6366f1',
    '--accent-text': contrastAccentTextColor,
    '--radius': `${currentTheme.radius ?? 16}px`,
    '--blur': `${currentTheme.blur ?? 16}px`,
    '--overlay-color': currentTheme.overlayColor || '#000000',
    '--overlay-opacity': currentTheme.overlayOpacity ?? 0.15,
    fontFamily: currentTheme.fontFamily || 'inherit',
  };

  const isGlass = currentTheme.buttonStyle === 'glass';
  const isOutline = currentTheme.buttonStyle === 'outline';
  const isSolid = currentTheme.buttonStyle === 'solid';

  return (
    <div className="phone-preview-wrapper" style={{ transform: `scale(${scale})` }}>
      <div className={`phone-mockup device-${deviceType}`}>
        {/* Hardware details by device type */}
        {deviceType === 'iphone' && (
          <>
            <div className="dynamic-island">
              <div className="dynamic-island-sensor" />
              <div className="dynamic-island-camera" />
            </div>
            <div className="phone-button-volume-up" />
            <div className="phone-button-volume-down" />
            <div className="phone-button-power" />
          </>
        )}

        {deviceType === 'ipad' && (
          <div className="ipad-camera-dot" />
        )}

        {deviceType === 'macbook' && (
          <div className="macbook-window-header">
            <div className="mac-traffic-lights">
              <span className="traffic-light red" />
              <span className="traffic-light yellow" />
              <span className="traffic-light green" />
            </div>
            <div className="mac-url-bar">
              🔒 linkstudio.uz/p/{page?.slug || 'demo'}
            </div>
          </div>
        )}

        {/* Screen container */}
        <div
          className={`phone-screen ${previewMode === 'edit' ? 'preview-mode-edit' : 'preview-mode-live'} ${isGlass ? 'theme-glass' : ''} ${isOutline ? 'theme-outline' : ''} ${isSolid ? 'theme-solid' : ''}`}
          style={themeStyles}
        >
          {/* Background Wallpapers / Videos */}
          {currentTheme.backgroundType === 'image' && currentTheme.backgroundImage && (
            <div className="page-bg-media-container">
              <img
                src={resolveMediaUrl(currentTheme.backgroundImage)}
                alt="Background"
                className="page-bg-image"
              />
              <div className="page-bg-overlay" />
            </div>
          )}

          {currentTheme.backgroundType === 'video' && currentTheme.backgroundVideo && (
            <div className="page-bg-media-container">
              <video
                src={resolveMediaUrl(currentTheme.backgroundVideo)}
                autoPlay
                loop
                muted
                playsInline
                className="page-bg-video"
              />
              <div className="page-bg-overlay" />
            </div>
          )}

          {/* Dynamic & 3D Live Animation Presets */}
          {currentTheme.backgroundType === 'animation' && (
            <div className="page-bg-animation-container">
              {/* 3D Glass Orbs */}
              {currentTheme.animationPreset === '3d-orbs' && (
                <div className="anim-3d-orbs-layer">
                  <div className="orb-3d orb-1" />
                  <div className="orb-3d orb-2" />
                  <div className="orb-3d orb-3" />
                </div>
              )}

              {/* 3D Floating Cubes */}
              {currentTheme.animationPreset === '3d-cubes' && (
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

              {/* 3D Cyber Horizon Grid */}
              {currentTheme.animationPreset === '3d-cyber-horizon' && (
                <div className="anim-3d-cyber-horizon-layer">
                  <div className="cyber-sun" />
                  <div className="cyber-grid-plane" />
                </div>
              )}

              {/* 3D Galaxy Starfield Warp */}
              {currentTheme.animationPreset === '3d-galaxy-warp' && (
                <div className="anim-3d-galaxy-warp-layer">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <span
                      key={i}
                      className="warp-star"
                      style={{
                        left: `${(i * 3.3) % 100}%`,
                        top: `${(i * 5.7) % 100}%`,
                        animationDelay: `${(i * 0.1) % 2}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* 3D Fluid Mesh Wave */}
              {currentTheme.animationPreset === '3d-mesh' && (
                <div className="anim-3d-mesh-layer" />
              )}

              {/* Golden Dust (Oltin Zarralar) */}
              {currentTheme.animationPreset === 'golden-dust' && (
                <div className="anim-golden-dust-layer">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span
                      key={i}
                      className="golden-particle"
                      style={{
                        left: `${(i * 3.7) % 100}%`,
                        top: `${(i * 5.3) % 100}%`,
                        width: `${3 + (i % 4) * 2}px`,
                        height: `${3 + (i % 4) * 2}px`,
                        animationDelay: `${(i * 0.2) % 4}s`,
                        animationDuration: `${2.5 + (i % 3)}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Fireflies (Tungi Yonarqo'ng'izlar) */}
              {currentTheme.animationPreset === 'fireflies' && (
                <div className="anim-fireflies-layer">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span
                      key={i}
                      className="firefly"
                      style={{
                        left: `${(i * 5.1) % 100}%`,
                        top: `${(i * 6.3) % 100}%`,
                        animationDelay: `${(i * 0.35) % 5}s`,
                        animationDuration: `${4 + (i % 4)}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Gradient Wave (Tirik Gradient To'lqini) */}
              {currentTheme.animationPreset === 'gradient-wave' && (
                <div className="anim-gradient-wave-layer" />
              )}

              {/* Sakura Falling Petals (Sakura yaproqlari) */}
              {currentTheme.animationPreset === 'sakura' && (
                <div className="anim-sakura-layer">
                  {Array.from({ length: 22 }).map((_, i) => (
                    <span
                      key={i}
                      className="sakura-petal"
                      style={{
                        left: `${(i * 4.6) % 100}%`,
                        animationDelay: `${(i * 0.35) % 6}s`,
                        animationDuration: `${4.5 + (i % 3)}s`,
                      }}
                    >
                      🌸
                    </span>
                  ))}
                </div>
              )}

              {/* Fire Sparks & Embers (Olovli Uchqunlar) */}
              {currentTheme.animationPreset === 'fire-sparks' && (
                <div className="anim-fire-sparks-layer">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span
                      key={i}
                      className="fire-spark"
                      style={{
                        left: `${(i * 4.2) % 100}%`,
                        bottom: '0',
                        width: `${3 + (i % 4) * 2}px`,
                        height: `${4 + (i % 4) * 3}px`,
                        animationDelay: `${(i * 0.2) % 3}s`,
                        animationDuration: `${2 + (i % 3) * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Snow */}
              {currentTheme.animationPreset === 'snow' && (
                <div className="anim-snow-layer">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span
                      key={i}
                      className="snowflake"
                      style={{
                        left: `${(i * 4.3) % 100}%`,
                        animationDelay: `${(i * 0.4) % 6}s`,
                        animationDuration: `${4 + (i % 4)}s`,
                        opacity: 0.4 + ((i % 5) * 0.12),
                        transform: `scale(${0.6 + (i % 5) * 0.15})`,
                      }}
                    >
                      ❄
                    </span>
                  ))}
                </div>
              )}

              {/* Particles */}
              {currentTheme.animationPreset === 'particles' && (
                <div className="anim-particles-layer">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span
                      key={i}
                      className="particle"
                      style={{
                        left: `${(i * 5.2) % 100}%`,
                        top: `${(i * 7.1) % 100}%`,
                        animationDelay: `${(i * 0.3) % 4}s`,
                        animationDuration: `${3 + (i % 3)}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Bubbles */}
              {currentTheme.animationPreset === 'bubbles' && (
                <div className="anim-bubbles-layer">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <span
                      key={i}
                      className="bubble"
                      style={{
                        left: `${(i * 7.5) % 100}%`,
                        width: `${16 + (i % 4) * 10}px`,
                        height: `${16 + (i % 4) * 10}px`,
                        animationDelay: `${(i * 0.6) % 5}s`,
                        animationDuration: `${5 + (i % 3)}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Matrix */}
              {currentTheme.animationPreset === 'matrix' && (
                <div className="anim-matrix-layer">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="matrix-column"
                      style={{
                        left: `${i * 8.5}%`,
                        animationDelay: `${(i * 0.3) % 3}s`,
                        animationDuration: `${2.5 + (i % 2)}s`,
                      }}
                    >
                      0101101001010110
                    </div>
                  ))}
                </div>
              )}

              {/* Rain */}
              {currentTheme.animationPreset === 'rain' && (
                <div className="anim-rain-layer">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span
                      key={i}
                      className="rain-drop"
                      style={{
                        left: `${(i * 3.7) % 100}%`,
                        animationDelay: `${(i * 0.15) % 2}s`,
                        animationDuration: `${0.8 + (i % 4) * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Interactive Public Page Content */}
          <div className="phone-content-scroll">
            {/* Top Insert Divider (Index 0) */}
            {previewMode === 'edit' && onInsertBlockAt && (
              <div className="between-blocks-divider">
                <div className="between-blocks-line" />
                <button
                  type="button"
                  className="btn-insert-between"
                  onClick={() => onInsertBlockAt(0)}
                  title="Tepaga blok qo'shish"
                >
                  ➕ Blok qo'shish
                </button>
              </div>
            )}

            <div className="public-blocks-list">
              {currentBlocks.map((block, idx) => {
                const isSelected = previewMode === 'edit' && selectedBlockId === block.id;
                const isHidden = block.hidden;

                // If in live preview and hidden, do not render
                if (previewMode === 'live' && isHidden) return null;

                return (
                  <React.Fragment key={block.id || idx}>
                    <div
                      className={`canvas-block-wrapper ${isSelected ? 'selected-block' : ''} ${isHidden ? 'is-hidden' : ''}`}
                      onClick={() => {
                        if (previewMode === 'edit' && onSelectBlock) {
                          onSelectBlock(block);
                        }
                      }}
                    >
                      {/* Floating Mini Action Bar above selected block */}
                      {isSelected && (
                        <div className="phone-block-floating-bar" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="floating-action-btn"
                            title="Tahrirlash"
                            onClick={() => onSelectBlock && onSelectBlock(block)}
                          >
                            ✏️ Tahrir
                          </button>
                          {onMoveBlock && (
                            <>
                              <button
                                type="button"
                                className="floating-action-btn"
                                disabled={idx === 0}
                                title="Tepaga"
                                onClick={() => onMoveBlock(idx, -1)}
                              >
                                ⬆️
                              </button>
                              <button
                                type="button"
                                className="floating-action-btn"
                                disabled={idx === currentBlocks.length - 1}
                                title="Pastga"
                                onClick={() => onMoveBlock(idx, 1)}
                              >
                                ⬇️
                              </button>
                            </>
                          )}
                          {onDuplicateBlock && (
                            <button
                              type="button"
                              className="floating-action-btn"
                              title="Nusxalash"
                              onClick={() => onDuplicateBlock(block)}
                            >
                              📋
                            </button>
                          )}
                          {onToggleHideBlock && (
                            <button
                              type="button"
                              className="floating-action-btn"
                              title={block.hidden ? "Ko'rsatish" : "Yashirish"}
                              onClick={() => onToggleHideBlock(block.id)}
                            >
                              {block.hidden ? "👁️" : "👁️‍🗨️"}
                            </button>
                          )}
                          {onDeleteBlock && (
                            <button
                              type="button"
                              className="floating-action-btn delete"
                              title="O'chirish"
                              onClick={() => onDeleteBlock(block.id)}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      )}

                      <BlockRenderer
                        block={block}
                        theme={currentTheme}
                        pageSlug={page?.slug || 'preview'}
                        isPublic={previewMode === 'live'}
                        onStoryClick={onStoryClick}
                        onProductClick={onProductClick}
                        onPricingClick={onPricingClick}
                        onFormSubmit={onFormSubmit}
                        onTrack={onTrack}
                      />
                    </div>

                    {/* Between-blocks Insert Button */}
                    {previewMode === 'edit' && onInsertBlockAt && (
                      <div className="between-blocks-divider">
                        <div className="between-blocks-line" />
                        <button
                          type="button"
                          className="btn-insert-between"
                          onClick={() => onInsertBlockAt(idx + 1)}
                          title="Ushbu oraliqqa blok qo'shish"
                        >
                          ➕ Blok qo'shish
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Taplink / LinkStudio Branding Badge */}
            <div className="preview-branding-footer">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="branding-link"
              >
                ⚡ <strong>LinkStudio Pro</strong> orqali yaratilgan
              </a>
            </div>
          </div>
        </div>

        {/* Bottom indicator bar */}
        <div className="phone-bottom-bar" />
      </div>
    </div>
  );
}

