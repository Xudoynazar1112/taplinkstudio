/**
 * Unified API Client for LinkStudio Pro
 */

const API_BASE = window.location.port === '5173' ? 'http://localhost:8000' : '';

function getAuthHeader() {
  const token = localStorage.getItem('linkstudio_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body !== 'string' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  // If FormData, let browser set Content-Type with boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_BASE}${url}`, config);
  
  if (!res.ok) {
    let errorMsg = `Server xatoligi: ${res.status}`;
    try {
      const data = await res.json();
      if (data && data.detail) {
        errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  return await res.text();
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/api/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/api/auth/register', { method: 'POST', body: userData }),
    me: () => request('/api/auth/me'),
  },

  // Pages
  pages: {
    list: () => request('/api/user/pages'),
    get: (slug) => request(`/api/pages/${slug}`),
    getPublic: (slug) => request(`/api/public/${slug}`),
    save: (slug, pageData) => request(`/api/pages/${slug}`, { method: 'PUT', body: pageData }),
    create: (pageData) => request('/api/pages', { method: 'POST', body: pageData }),
    delete: (slug) => request(`/api/pages/${slug}`, { method: 'DELETE' }),
    duplicate: (slug) => request(`/api/pages/${slug}/duplicate`, { method: 'POST' }),
    track: (data) => request('/api/track', { method: 'POST', body: data }),
  },

  // Themes & Templates
  themes: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      if (params.q) query.append('q', params.q);
      if (params.category && params.category !== 'all') query.append('category', params.category);
      if (params.limit) query.append('limit', params.limit);
      if (params.offset) query.append('offset', params.offset);
      const qs = query.toString();
      return request(`/api/themes${qs ? `?${qs}` : ''}`);
    },
  },

  templates: {
    list: () => request('/api/templates'),
  },

  // CRM & Leads
  crm: {
    getLeads: (slug) => request(`/api/leads${slug ? `?slug=${slug}` : ''}`),
    createLead: (leadData) => request('/api/leads', { method: 'POST', body: leadData }),
    updateLeadStatus: (leadId, status) => request(`/api/leads/${leadId}`, { method: 'PATCH', body: { status } }),
    createCheckout: (checkoutData) => request('/api/checkout', { method: 'POST', body: checkoutData }),
    payOrder: (orderId, paymentData) => request(`/api/orders/${orderId}/pay`, { method: 'POST', body: paymentData }),
    testTelegram: (data) => request('/api/notifications/telegram/test', { method: 'POST', body: data }),
  },

  // Media Assets
  assets: {
    list: () => request('/api/assets'),
    upload: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return request('/api/upload', { method: 'POST', body: formData });
    },
    delete: (assetId) => request(`/api/assets/${assetId}`, { method: 'DELETE' }),
  },

  // Custom Domains
  domains: {
    list: () => request('/api/domains'),
    add: (domainData) => request('/api/domains', { method: 'POST', body: domainData }),
    verify: (domain) => request(`/api/domains/verify/${domain}`, { method: 'POST' }),
  },
};
