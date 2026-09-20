/**
 * Helper utility functions for LinkStudio Pro
 */

export function getContrastTextColor(hexColor) {
  if (!hexColor || typeof hexColor !== 'string') return '#ffffff';
  let cleanHex = hexColor.trim().replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) return '#ffffff';

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#ffffff';

  // Standard luminance formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#0f172a' : '#ffffff';
}

export function formatPrice(num) {
  if (num === null || num === undefined || isNaN(num)) return '0 so\'m';
  return Number(num).toLocaleString('uz-UZ') + ' so\'m';
}

export function generateId(prefix = 'block') {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}

export function getBgCss(theme) {
  if (!theme) return { background: '#0f172a' };
  if (theme.backgroundType === 'gradient' && theme.gradient) {
    return { background: theme.gradient };
  }
  if (theme.backgroundType === 'image' || theme.backgroundType === 'video' || theme.backgroundType === 'animation') {
    return { backgroundColor: '#090d16' };
  }
  return { background: theme.background || '#0f172a' };
}

export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) {
    const isDev = typeof window !== 'undefined' && window.location && window.location.port === '5173';
    return isDev ? `http://localhost:8000${trimmed}` : trimmed;
  }
  return trimmed;
}

