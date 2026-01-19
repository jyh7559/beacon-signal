// Authentication API endpoints (OTP-based)
import { apiClient, setAuthToken } from './client';
import { ENDPOINTS } from './config';
import type { User } from '@/types';

// Auth response types
export interface RequestCodeResponse {
  success: boolean;
  message?: string;
}

export interface ValidateCodeResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

// User preferences (onboarding data)
export interface UserPreferences {
  role: string;
  industries: string[];
  signals: string[];
  completed: boolean;
  completedAt?: string;
}

export const authApi = {
  // Step 1: Request OTP code for login
  async requestCode(email: string, name?: string, company?: string): Promise<RequestCodeResponse> {
    return apiClient.post<RequestCodeResponse>(ENDPOINTS.auth.requestCode, { 
      email, 
      ...(name && { name }), 
      ...(company && { company }) 
    });
  },

  // Step 2: Validate OTP and get auth token
  async validateCode(email: string, code: string): Promise<ValidateCodeResponse> {
    const response = await apiClient.post<ValidateCodeResponse>(ENDPOINTS.auth.validateCode, { 
      email, 
      code 
    });
    // Store the auth token
    setAuthToken(response.token);
    return response;
  },

  // Register new user
  async register(data: { 
    email: string; 
    name: string; 
    company: string; 
    phone?: string; 
  }): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>(ENDPOINTS.auth.register, data);
  },

  // Get user preferences from backend
  async getPreferences(): Promise<UserPreferences | null> {
    try {
      return await apiClient.get<UserPreferences>(ENDPOINTS.preferences.get);
    } catch (error) {
      // If preferences don't exist yet or API fails, return null
      console.log('[authApi] Could not fetch preferences:', error);
      return null;
    }
  },

  // Save user preferences to backend
  async savePreferences(data: UserPreferences): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.preferences.save, data);
    } catch (error) {
      console.error('[authApi] Failed to save preferences:', error);
      // Don't throw - allow local storage fallback
    }
  },

  // Logout - clear token
  async logout(): Promise<void> {
    setAuthToken(null);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('intellizence_auth_token');
  },
};
