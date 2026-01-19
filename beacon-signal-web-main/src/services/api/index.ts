// Central API export hub
// All API modules are exported from here for easy importing

// Re-export individual API modules
export { authApi } from './auth.api';
export { signalsApi } from './signals.api';
export { datasetsApi } from './datasets.api';
export { bookmarksApi } from './bookmarks.api';
export { alertsApi } from './alerts.api';
export { dashboardApi } from './dashboard.api';
export { searchApi } from './search.api';
export { plansApi } from './plans.api';
export { metadataApi } from './metadata.api';

// Re-export configuration
export { API_CONFIG, ENDPOINTS, buildUrl } from './config';

// Re-export client utilities
export { apiClient, delay, setAuthToken, getAuthToken } from './client';

// Re-export types
export * from './types';

// Unified API object (for backward compatibility with existing code)
import { authApi } from './auth.api';
import { signalsApi } from './signals.api';
import { datasetsApi } from './datasets.api';
import { bookmarksApi } from './bookmarks.api';
import { alertsApi } from './alerts.api';
import { dashboardApi } from './dashboard.api';
import { searchApi } from './search.api';
import { plansApi } from './plans.api';
import { metadataApi } from './metadata.api';

export const api = {
  // Auth (OTP-based)
  requestCode: authApi.requestCode,
  validateCode: authApi.validateCode,
  register: authApi.register,
  logout: authApi.logout,
  isAuthenticated: authApi.isAuthenticated,
  
  // Signals
  getSignals: signalsApi.getSignals,
  getSignalById: signalsApi.getSignalById,
  exportSignals: signalsApi.exportSignals,
  
  // Dashboard
  getDashboardStats: dashboardApi.getDashboardStats,
  
  // Datasets
  getAllDatasets: datasetsApi.getAllDatasets,
  getDatasetInfo: datasetsApi.getDatasetInfo,
  getDatasetByType: datasetsApi.getDatasetByType,
  checkDatasetAccess: datasetsApi.checkAccess,
  getMnAData: datasetsApi.getMnAData,
  getFundraisingData: datasetsApi.getFundraisingData,
  getLayoffData: datasetsApi.getLayoffData,
  getSecurityBreachData: datasetsApi.getSecurityBreachData,
  getCxoChangesData: datasetsApi.getCxoChangesData,
  getBusinessExpansionData: datasetsApi.getBusinessExpansionData,
  
  // Plans
  getMySubscriptions: plansApi.getMySubscriptions,
  getAvailablePlans: plansApi.getAvailablePlans,
  subscribe: plansApi.subscribe,
  
  // Metadata / Search autocomplete
  searchCompanies: metadataApi.searchCompanies,
  getIndustries: metadataApi.getIndustries,
  searchCountries: metadataApi.searchCountries,
  searchLocations: metadataApi.searchLocations,
  
  // Saved Searches
  getSavedSearches: searchApi.getSavedSearches,
  createSavedSearch: searchApi.createSavedSearch,
  deleteSavedSearch: searchApi.deleteSavedSearch,
  
  // Bookmarks
  getBookmarks: bookmarksApi.getBookmarks,
  getBookmarkFolders: bookmarksApi.getBookmarkFolders,
  createBookmark: bookmarksApi.createBookmark,
  deleteBookmark: bookmarksApi.deleteBookmark,
  isBookmarked: bookmarksApi.isBookmarked,
  
  // Alerts
  getAlerts: alertsApi.getAlerts,
  createAlert: alertsApi.createAlert,
  updateAlert: alertsApi.updateAlert,
  deleteAlert: alertsApi.deleteAlert,
};

export default api;
