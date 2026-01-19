// API Configuration - Centralized endpoint management
// Base URL for all Intellizence APIs

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://account-api.intellizence.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Centralized endpoint definitions - easy to maintain and replace
export const ENDPOINTS = {
  // Authentication (OTP-based)
  auth: {
    requestCode: '/auth/request-code',      // POST { email, name?, company? }
    validateCode: '/auth/validate-code',    // POST { email, code }
    register: '/auth/register',             // POST { email, name, company, phone? }
  },
  
  // User Preferences (onboarding data)
  preferences: {
    get: '/my/preferences',                 // GET
    save: '/my/preferences',                // POST { role, industries, signals, completed }
  },
  
  // Dataset Access (planType: Trial, Business, etc.)
  datasets: {
    access: (planType: string) => `/datasets/user/${planType}/access`,
    mna: (planType: string) => `/datasets/user/${planType}/dataset.mna`,
    fundraising: (planType: string) => `/datasets/user/${planType}/dataset.fundraising`,
    layoff: (planType: string) => `/datasets/user/${planType}/dataset.layoff`,
    securityBreach: (planType: string) => `/datasets/user/${planType}/dataset.data_security_breach`,
    cxoChanges: (planType: string) => `/datasets/user/${planType}/dataset.cxo_changes`,
    businessExpansion: (planType: string) => `/datasets/user/${planType}/dataset.business_expansion`,
  },
  
  // Plans & Subscriptions
  plans: {
    mySubscriptions: '/my/subscriptions',   // GET
    list: '/plans',                          // GET
    subscribe: '/plans/subscribe',           // POST { planName, frequency, resources? }
  },
  
  // Search & Metadata (autocomplete)
  search: {
    companies: '/search/companies',          // GET ?q=
    industries: '/search/industries',        // GET ?q=
    countries: '/search/countries',          // GET ?q=
    locations: '/search/locations',          // GET ?q=
  },
  
  // Legacy endpoints (kept for backward compatibility)
  signals: {
    list: '/signals',
    detail: (id: string) => `/signals/${id}`,
    export: '/signals/export',
  },
  savedSearches: {
    list: '/saved-searches',
    create: '/saved-searches',
    delete: (id: string) => `/saved-searches/${id}`,
  },
  bookmarks: {
    list: '/bookmarks',
    folders: '/bookmarks/folders',
    create: '/bookmarks',
    delete: (id: string) => `/bookmarks/${id}`,
    check: (signalId: string) => `/bookmarks/check/${signalId}`,
  },
  alerts: {
    list: '/alerts',
    create: '/alerts',
    update: (id: string) => `/alerts/${id}`,
    delete: (id: string) => `/alerts/${id}`,
  },
  dashboard: {
    stats: '/dashboard/stats',
  },
};

// Helper to construct full URL
export const buildUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};
