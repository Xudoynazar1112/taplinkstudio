import React, { useState, useEffect, useMemo } from 'react';
import { formatPrice, getContrastTextColor, resolveMediaUrl } from '../../utils/helpers';

export default function BlockRenderer({
  block,
  theme,
  isPublic = false,
  onStoryClick,
  onProductClick,
  onPricingClick,
  onFormSubmit,
  onTrack,
  pageSlug = 'demo',
}) {
  const [formData, setFormData] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [faqOpen, setFaqOpen] = useState({});
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  // Timer countdown hook
  useEffect(() => {
    if (block.type !== 'timer' || !block.targetDate) return;
    const updateCountdown = () => {
      const diff = Math.max(0, new Date(block.targetDate).getTime() - Date.now());
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [block.type, block.targetDate]);

  const handleFormChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleFormSubmitInternal = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (onFormSubmit) {
        await onFormSubmit(block, formData);
      }
      setFormSuccess(true);
      setFormData({});
    } catch (err) {
      alert('Xatolik: ' + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Custom block styling calculations
  const customBlockStyle = useMemo(() => {
    const s = {};
    if (block.customBg) s.backgroundColor = block.customBg;
    if (block.textColor) s.color = block.textColor;
    if (block.borderRadius !== undefined && block.borderRadius !== '') {
      s.borderRadius = `${block.borderRadius}px`;
    }
    if (block.borderWidth !== undefined && Number(block.borderWidth) > 0) {
      s.borderWidth = `${block.borderWidth}px`;
      s.borderStyle = block.borderStyle || 'solid';
      s.borderColor = block.borderColor || theme?.accent || '#6366f1';
    }
    if (block.padding !== undefined && block.padding !== '') {
      s.padding = `${block.padding}px`;
    }
    if (block.marginBottom !== undefined && block.marginBottom !== '') {
      s.marginBottom = `${block.marginBottom}px`;
    }
    if (block.shadow === 'sm') s.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
    if (block.shadow === 'md') s.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
    if (block.shadow === 'lg') s.boxShadow = '0 12px 28px rgba(0,0,0,0.4)';
    if (block.shadow === 'neon') {
      const glowColor = block.accentColor || theme?.accent || '#6366f1';
      s.boxShadow = `0 0 16px ${glowColor}`;
    }
    if (block.align) s.textAlign = block.align;
    return s;
  }, [block, theme]);

  // Button custom style
  const customButtonStyle = useMemo(() => {
    const s = {};
    const effectiveAccent = block.accentColor || theme?.accent || '#6366f1';
    s.backgroundColor = effectiveAccent;
    s.color = getContrastTextColor(effectiveAccent);
    if (block.borderRadius !== undefined && block.borderRadius !== '') {
      s.borderRadius = `${block.borderRadius}px`;
    }
    return s;
  }, [block.accentColor, block.borderRadius, theme?.accent]);

  // Class names for animations and hover effects
  const animClass = block.animation && block.animation !== 'none' ? `anim-${block.animation}` : '';
  const hoverClass = block.hoverEffect && block.hoverEffect !== 'none' ? `hover-${block.hoverEffect}` : '';

  // Render individual block types
  switch (block.type) {
    case 'avatar': {
      const rawAvatar = block.avatarUrl || block.avatar || block.imageUrl || block.image || block.url;
      const avatarSrc = rawAvatar ? resolveMediaUrl(rawAvatar) : '';
      const avatarSize = Number(block.avatarSize) || 88;
      const avatarBorderRadius = block.avatarShape === 'square' ? '12px' : (block.avatarShape === 'rounded' ? '22px' : '50%');

      return (
        <div
          className={`public-block block-avatar ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          <div
            className="avatar-wrapper"
            style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={block.title || 'Avatar'}
                className="avatar-img"
                style={{ borderRadius: avatarBorderRadius }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const sibling = e.currentTarget.parentElement?.querySelector('.avatar-placeholder');
                  if (sibling) sibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="avatar-placeholder"
              style={{
                display: avatarSrc ? 'none' : 'flex',
                borderRadius: avatarBorderRadius,
                fontSize: `${Math.round(avatarSize * 0.38)}px`,
                ...(block.accentColor ? { background: block.accentColor } : {}),
              }}
            >
              {(block.title || 'U').charAt(0).toUpperCase()}
            </div>
            {block.verified && <span className="verified-badge" title="Tasdiqlangan">✓</span>}
          </div>
          {block.title && <h2 className="avatar-title" style={block.textColor ? { color: block.textColor } : {}}>{block.title}</h2>}
          {block.subtitle && <p className="avatar-subtitle" style={block.textColor ? { color: block.textColor, opacity: 0.85 } : {}}>{block.subtitle}</p>}
        </div>
      );
    }

    case 'stories':
      return (
        <div
          className={`public-block block-stories ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          {block.title && <div className="stories-section-title">{block.title}</div>}
          <div className="stories-scroll">
            {(block.items || []).map((story, idx) => (
              <div
                key={story.id || idx}
                className="story-item"
                onClick={() => onStoryClick && onStoryClick(block.items, idx)}
              >
                <div className="story-ring" style={block.accentColor ? { background: block.accentColor } : {}}>
                  {story.preview ? (
                    <img src={resolveMediaUrl(story.preview)} alt={story.title} className="story-avatar" />
                  ) : (
                    <div className="story-avatar-empty">{story.title?.charAt(0) || '✨'}</div>
                  )}
                </div>
                <span className="story-label">{story.title || `Hikoya ${idx + 1}`}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'link': {
      return (
        <div
          className={`public-block block-link ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          <a
            href={block.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="theme-button link-btn"
            style={customButtonStyle}
            onClick={() => {
              if (onTrack) onTrack('click', block.id, { url: block.url, title: block.label });
            }}
          >
            {block.icon && <span className="link-icon">{block.icon}</span>}
            <span className="link-label">{block.label || 'Tugma Havola'}</span>
            {block.badge && <span className="link-badge">{block.badge}</span>}
          </a>
        </div>
      );
    }

    case 'messengers':
      return (
        <div
          className={`public-block block-messengers ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          {block.title && <div className="messengers-title">{block.title}</div>}
          <div className="messengers-grid">
            {(block.items || []).map((m, idx) => (
              <a
                key={idx}
                href={m.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="messenger-btn"
                style={block.borderRadius !== undefined ? { borderRadius: `${block.borderRadius}px` } : {}}
                onClick={() => {
                  if (onTrack) onTrack('click', block.id, { messenger: m.label, url: m.url });
                }}
              >
                <span className="messenger-icon">{m.icon || '💬'}</span>
                <span className="messenger-label">{m.label || 'Aloqa'}</span>
              </a>
            ))}
          </div>
        </div>
      );

    case 'text':
      return (
        <div
          className={`public-block block-text align-${block.align || 'center'} ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          {block.title && <h3 className="text-heading" style={block.textColor ? { color: block.textColor } : {}}>{block.title}</h3>}
          {block.content && (
            <div
              className="text-body"
              style={block.textColor ? { color: block.textColor } : {}}
              dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, '<br/>') }}
            />
          )}
        </div>
      );

    case 'media':
      return (
        <div
          className={`public-block block-media ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          {block.mediaType === 'video' ? (
            <video
              src={resolveMediaUrl(block.url)}
              controls
              className="media-element"
              playsInline
              style={block.borderRadius !== undefined ? { borderRadius: `${block.borderRadius}px` } : {}}
            />
          ) : block.mediaType === 'youtube' ? (
            <div className="video-responsive-wrapper" style={block.borderRadius !== undefined ? { borderRadius: `${block.borderRadius}px` } : {}}>
              <iframe
                src={`https://www.youtube.com/embed/${block.youtubeId || ''}`}
                title="YouTube player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <img
              src={resolveMediaUrl(block.url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80')}
              alt={block.title || 'Media banner'}
              className="media-element"
              style={block.borderRadius !== undefined ? { borderRadius: `${block.borderRadius}px` } : {}}
            />
          )}
          {block.caption && <p className="media-caption">{block.caption}</p>}
        </div>
      );

    case 'pricing':
      return (
        <div
          className={`public-block block-pricing ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          {block.title && <h3 className="pricing-title">{block.title}</h3>}
          <div className="pricing-cards-container">
            {(block.plans || []).map((plan, idx) => (
              <div
                key={idx}
                className={`pricing-card ${plan.isFeatured ? 'featured-plan' : ''}`}
                style={plan.isFeatured && block.accentColor ? { borderColor: block.accentColor } : {}}
              >
                {plan.isFeatured && (
                  <div className="featured-ribbon" style={customButtonStyle}>⭐ Ommabop</div>
                )}
                <div className="plan-header">
                  <h4 className="plan-name">{plan.name}</h4>
                  <div className="plan-price" style={block.accentColor ? { color: block.accentColor } : {}}>
                    {formatPrice(plan.price)}
                  </div>
                </div>
                <ul className="plan-features">
                  {(plan.features || []).map((f, fIdx) => (
                    <li key={fIdx} className="feature-item">
                      <span className="check-icon">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="theme-button plan-buy-btn"
                  style={customButtonStyle}
                  onClick={() => onPricingClick && onPricingClick(plan, block)}
                >
                  {plan.button || 'Tanlash'}
                </button>
              </div>
            ))}
          </div>
        </div>
      );

    case 'products':
      return (
        <div
          className={`public-block block-products ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          {block.title && <h3 className="products-section-title">{block.title}</h3>}
          <div className="products-grid">
            {(block.items || []).map((prod, idx) => (
              <div key={prod.id || idx} className="product-card" onClick={() => onProductClick && onProductClick(prod, block)}>
                {prod.image && (
                  <div className="product-image-container">
                    <img src={resolveMediaUrl(prod.image)} alt={prod.title} className="product-img" />
                    {prod.oldPrice && prod.oldPrice > prod.price && (
                      <span className="discount-tag">
                        -{Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100)}%
                      </span>
                    )}
                  </div>
                )}
                <div className="product-info">
                  <h4 className="product-title">{prod.title}</h4>
                  <div className="product-prices">
                    <span className="product-current-price" style={block.accentColor ? { color: block.accentColor } : {}}>
                      {formatPrice(prod.price)}
                    </span>
                    {prod.oldPrice && <span className="product-old-price">{formatPrice(prod.oldPrice)}</span>}
                  </div>
                  <button
                    type="button"
                    className="theme-button product-buy-btn"
                    style={customButtonStyle}
                  >
                    Xarid qilish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'form':
      return (
        <div
          className={`public-block block-form ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          {block.title && <h3 className="form-title">{block.title}</h3>}
          {formSuccess ? (
            <div className="form-success-banner">
              <span className="success-icon">🎉</span>
              <h4>Arizangiz muvaffaqiyatli qabul qilindi!</h4>
              <p>Tez orada siz bilan bog'lanamiz.</p>
              <button
                type="button"
                className="btn-secondary-sm"
                onClick={() => setFormSuccess(false)}
              >
                Yana ariza yuborish
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmitInternal} className="interactive-form">
              {(block.fields || []).map((field, idx) => (
                <div key={idx} className="form-group">
                  <label className="form-label">
                    {field.label} {field.required && <span className="req-star">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      placeholder={field.placeholder || ''}
                      value={formData[field.name || `field_${idx}`] || ''}
                      onChange={(e) => handleFormChange(field.name || `field_${idx}`, e.target.value)}
                      className="form-input form-textarea"
                      rows={3}
                      style={block.borderRadius !== undefined ? { borderRadius: `${block.borderRadius}px` } : {}}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      required={field.required}
                      placeholder={field.placeholder || ''}
                      value={formData[field.name || `field_${idx}`] || ''}
                      onChange={(e) => handleFormChange(field.name || `field_${idx}`, e.target.value)}
                      className="form-input"
                      style={block.borderRadius !== undefined ? { borderRadius: `${block.borderRadius}px` } : {}}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                disabled={formSubmitting}
                className="theme-button form-submit-btn"
                style={customButtonStyle}
              >
                {formSubmitting ? 'Yuborilmoqda...' : (block.submitLabel || 'Yuborish')}
              </button>
            </form>
          )}
        </div>
      );

    case 'reviews':
      return (
        <div
          className={`public-block block-reviews ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          {block.title && <h3 className="reviews-title">{block.title}</h3>}
          <div className="reviews-slider">
            {(block.items || []).map((rev, idx) => (
              <div key={rev.id || idx} className="review-card">
                <div className="review-header">
                  {rev.avatar ? (
                    <img src={resolveMediaUrl(rev.avatar)} alt={rev.name} className="review-avatar" />
                  ) : (
                    <div className="review-avatar-char">{rev.name?.charAt(0) || '👤'}</div>
                  )}
                  <div className="review-author-info">
                    <h5 className="review-author-name">
                      {rev.name}
                      {rev.verified && <span className="verified-badge-sm">✓</span>}
                    </h5>
                    {rev.role && <span className="review-author-role">{rev.role}</span>}
                  </div>
                  <div className="review-stars">
                    {'⭐'.repeat(rev.rating || 5)}
                  </div>
                </div>
                <p className="review-comment">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'timer':
      return (
        <div
          className={`public-block block-timer ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          {block.title && <div className="timer-title">{block.title}</div>}
          <div className="timer-grid">
            <div className="timer-unit">
              <span className="unit-value" style={block.accentColor ? { color: block.accentColor } : {}}>
                {String(timeLeft.d).padStart(2, '0')}
              </span>
              <span className="unit-label">Kun</span>
            </div>
            <div className="timer-colon">:</div>
            <div className="timer-unit">
              <span className="unit-value" style={block.accentColor ? { color: block.accentColor } : {}}>
                {String(timeLeft.h).padStart(2, '0')}
              </span>
              <span className="unit-label">Soat</span>
            </div>
            <div className="timer-colon">:</div>
            <div className="timer-unit">
              <span className="unit-value" style={block.accentColor ? { color: block.accentColor } : {}}>
                {String(timeLeft.m).padStart(2, '0')}
              </span>
              <span className="unit-label">Daqiqa</span>
            </div>
            <div className="timer-colon">:</div>
            <div className="timer-unit">
              <span className="unit-value" style={block.accentColor ? { color: block.accentColor } : {}}>
                {String(timeLeft.s).padStart(2, '0')}
              </span>
              <span className="unit-label">Soniya</span>
            </div>
          </div>
        </div>
      );

    case 'faq':
      return (
        <div
          className={`public-block block-faq ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          {block.title && <h3 className="faq-title">{block.title}</h3>}
          <div className="faq-accordion">
            {(block.items || []).map((item, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  >
                    <span>{item.q}</span>
                    <span className="faq-arrow">{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && <div className="faq-answer">{item.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'location': {
      const lat = block.latitude || '41.311081';
      const lng = block.longitude || '69.240562';
      const address = block.address || 'Toshkent shahri, Amir Temur shoh ko\'chasi, 15-uy';
      const mapProvider = block.mapProvider || 'yandex';
      const mapUrl = block.mapUrl || (mapProvider === 'google' 
        ? `https://maps.google.com/?q=${encodeURIComponent(address || `${lat},${lng}`)}`
        : `https://yandex.uz/maps/?text=${encodeURIComponent(address || `${lat},${lng}`)}`);

      let embedSrc = '';
      if (mapProvider === 'google') {
        embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address || `${lat},${lng}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      } else if (mapProvider === 'osm') {
        embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.01}%2C${Number(lat) - 0.007}%2C${Number(lng) + 0.01}%2C${Number(lat) + 0.007}&layer=mapnik&marker=${lat}%2C${lng}`;
      } else {
        // Yandex default
        embedSrc = `https://yandex.ru/map-widget/v1/?ll=${lng}%2C${lat}&z=15&pt=${lng}%2C${lat},pm2rdm`;
      }

      return (
        <div
          className={`public-block block-location ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          {block.title && <h3 className="location-title">📍 {block.title}</h3>}
          {block.subtitle && <p className="location-subtitle">{block.subtitle}</p>}

          <div className="location-address-box">
            <div className="address-text-wrap">
              <span className="address-icon">🏢</span>
              <span className="address-text">{address}</span>
            </div>
            {block.showCopyAddress !== false && (
              <button
                type="button"
                className="btn-copy-address"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard?.writeText(address);
                  alert('Manzil nusxalandi: ' + address);
                }}
                title="Manzilni nusxalash"
              >
                📋 Nusxalash
              </button>
            )}
          </div>

          {block.showMapPreview !== false && (
            <div className="location-map-frame-wrapper" style={{ height: `${block.mapHeight || 200}px` }}>
              <iframe
                title="Location Map"
                src={embedSrc}
                className="location-map-iframe"
                loading="lazy"
              />
            </div>
          )}

          <div className="location-actions-grid">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-button location-cta-btn"
              style={customButtonStyle}
              onClick={() => onTrack && onTrack('click_location', { address, blockId: block.id })}
            >
              {block.buttonText || '📍 Xaritada ko\'rish (Marshrut)'}
            </a>

            {block.showCallBtn && block.phone && (
              <a
                href={`tel:${block.phone.replace(/\s+/g, '')}`}
                className="location-phone-btn"
                onClick={() => onTrack && onTrack('click_call', { phone: block.phone, blockId: block.id })}
              >
                📞 {block.phone}
              </a>
            )}
          </div>
        </div>
      );
    }

    case 'qrcode': {
      let qrData = '';
      if (block.qrType === 'custom_url') {
        qrData = block.qrValue || (typeof window !== 'undefined' ? window.location.href : 'https://taplink.uz');
      } else if (block.qrType === 'wifi') {
        qrData = `WIFI:T:${block.wifiType || 'WPA'};S:${block.wifiSsid || 'WiFi'};P:${block.wifiPass || ''};;`;
      } else if (block.qrType === 'phone') {
        qrData = `tel:${block.qrValue || '+998901234567'}`;
      } else if (block.qrType === 'text') {
        qrData = block.qrValue || 'LinkStudio Pro';
      } else {
        // current_page default
        qrData = typeof window !== 'undefined' ? `${window.location.origin}/${pageSlug}` : `https://taplink.uz/${pageSlug}`;
      }

      const qrSize = Number(block.size || block.qrSize) || 180;
      const fgColor = (block.qrColor || '#000000').replace('#', '');
      const bgColor = (block.qrBg || '#ffffff').replace('#', '');
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize * 2}x${qrSize * 2}&color=${fgColor}&bgcolor=${bgColor}&data=${encodeURIComponent(qrData)}`;

      const handleDownloadQr = () => {
        const link = document.createElement('a');
        link.href = qrApiUrl;
        link.download = `qrcode_${pageSlug || 'link'}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      const handleCopyLink = () => {
        navigator.clipboard?.writeText(qrData);
        alert('Havola nusxalandi: ' + qrData);
      };

      return (
        <div
          className={`public-block block-qrcode ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          {block.title && <h3 className="qrcode-title">{block.title}</h3>}
          {block.description && <p className="qrcode-description">{block.description}</p>}

          <div className="qrcode-image-container" style={{ background: block.qrBg || '#ffffff' }}>
            <img
              src={qrApiUrl}
              alt="QR Code"
              className="qrcode-rendered-img"
              style={{ width: `${qrSize}px`, height: `${qrSize}px` }}
              loading="lazy"
            />
          </div>

          <div className="qrcode-actions-row">
            {block.showDownloadBtn !== false && (
              <button
                type="button"
                className="theme-button qrcode-btn-download"
                style={customButtonStyle}
                onClick={handleDownloadQr}
              >
                {block.buttonText || '📥 QR Kodni yuklab olish'}
              </button>
            )}

            {block.showCopyLinkBtn !== false && (
              <button
                type="button"
                className="qrcode-btn-copy"
                onClick={handleCopyLink}
              >
                🔗 Havolani nusxalash
              </button>
            )}
          </div>
        </div>
      );
    }

    case 'divider':
      return (
        <div
          className={`public-block block-divider style-${block.style || 'line'}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          <div
            className="divider-line"
            style={{
              height: block.style === 'spacer' ? `${block.height || 24}px` : `${block.borderWidth || 1}px`,
              backgroundColor: block.borderColor || 'rgba(255, 255, 255, 0.15)',
            }}
          />
        </div>
      );

    case 'canvas':
      return (
        <div
          className={`public-block block-canvas-container ${animClass} ${hoverClass}`}
          id={`block-${block.id}`}
          style={customBlockStyle}
        >
          <div
            className="custom-canvas"
            style={{
              height: `${block.height || 260}px`,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: `${block.borderRadius ?? theme?.radius ?? 16}px`,
            }}
          >
            {(block.elements || []).map((el, idx) => (
              <div
                key={el.id || idx}
                className="canvas-element"
                style={{
                  position: 'absolute',
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: el.zIndex || 1,
                }}
              >
                {el.type === 'text' && (
                  <span style={{ fontSize: `${el.fontSize || 16}px`, color: el.color || theme?.text, fontWeight: el.bold ? 'bold' : 'normal' }}>
                    {el.content}
                  </span>
                )}
                {el.type === 'image' && (
                  <img src={el.url} alt="Canvas element" style={{ width: `${el.width || 80}px`, height: 'auto', borderRadius: '8px' }} />
                )}
                {el.type === 'badge' && (
                  <span className="canvas-badge" style={{ backgroundColor: block.accentColor || theme?.accent }}>
                    {el.content}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
