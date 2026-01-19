// HTTP Client wrapper with interceptors
import { API_CONFIG } from './config';

// Simulated network delay for mock APIs (can be removed in production)
export const delay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Token management with localStorage persistence
const TOKEN_KEY = 'intellizence_auth_token';

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Generic request handler with error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    ...API_CONFIG.headers,
    ...(options.headers || {}),
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle auth errors
  if (response.status === 401) {
    setAuthToken(null);
    window.location.href = '/app/login';
    throw new Error('Session expired. Please login again.');
  }
  
  if (response.status === 403) {
    // Parse response to distinguish between token issues and access issues
    const errorData = await response.json().catch(() => ({ error: '' }));
    const errorMessage = errorData.error || errorData.message || '';
    
    // Check if it's a token/auth issue (should re-authenticate)
    if (errorMessage.toLowerCase().includes('invalid token') || 
        errorMessage.toLowerCase().includes('token expired') ||
        errorMessage.toLowerCase().includes('jwt')) {
      setAuthToken(null);
      window.location.href = '/app/login';
      throw new Error('Session expired. Please login again.');
    }
    
    // Otherwise it's a subscription/access issue
    const accessError = new Error('Access denied. Please upgrade your plan.');
    (accessError as Error & { code: string }).code = 'ACCESS_DENIED';
    throw accessError;
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Convenience methods
export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, unknown>) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString() : '';
    return apiRequest<T>(`${endpoint}${queryString}`, { method: 'GET' });
  },
  
  post: <T>(endpoint: string, body?: unknown) => 
    apiRequest<T>(endpoint, { 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined 
    }),
  
  put: <T>(endpoint: string, body?: unknown) => 
    apiRequest<T>(endpoint, { 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined 
    }),
  
  patch: <T>(endpoint: string, body?: unknown) => 
    apiRequest<T>(endpoint, { 
      method: 'PATCH', 
      body: body ? JSON.stringify(body) : undefined 
    }),
  
  delete: <T>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};
