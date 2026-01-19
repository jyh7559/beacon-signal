import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, UserPreferences } from '@/services/api/auth.api';
import { plansApi, Subscription } from '@/services/api/plans.api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  subscriptions: Subscription[];
  resourceLabels: Record<string, string>;
  planType: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  login: (email: string, code: string) => Promise<void>;
  logout: () => void;
  refreshSubscriptions: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  getResourceLabel: (resource: string) => string;
}

export interface OnboardingData {
  role: string;
  industries: string[];
  signals: string[];
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = 'intellizence_user';
const PLAN_TYPE_KEY = 'intellizence_plan_type';
const ONBOARDING_KEY = 'intellizence_onboarding';
const RESOURCE_LABELS_KEY = 'intellizence_resource_labels';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [resourceLabels, setResourceLabels] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem(RESOURCE_LABELS_KEY);
    return stored ? JSON.parse(stored) : {};
  });
  const [planType, setPlanType] = useState<string>(() => {
    return localStorage.getItem(PLAN_TYPE_KEY) || 'Trial';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.completed === true;
      } catch {
        return false;
      }
    }
    return false;
  });
  const navigate = useNavigate();

  const isAuthenticated = authApi.isAuthenticated();

  // Fetch subscriptions and preferences on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshSubscriptions();
      // Also fetch preferences from backend to sync onboarding status
      fetchPreferencesFromBackend();
    }
  }, [isAuthenticated]);

  const fetchPreferencesFromBackend = async () => {
    try {
      const preferences = await authApi.getPreferences();
      if (preferences?.completed) {
        setHasCompletedOnboarding(true);
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify(preferences));
      }
    } catch (error) {
      console.log('[useAuth] Could not fetch preferences from backend:', error);
      // Fall back to localStorage value
    }
  };

  const refreshSubscriptions = async () => {
    try {
      const [subs, plansResponse] = await Promise.all([
        plansApi.getMySubscriptions(),
        plansApi.getAvailablePlans(),
      ]);
      setSubscriptions(subs);
      
      // Store resource labels from plans response
      if (plansResponse.resourceLabels) {
        setResourceLabels(plansResponse.resourceLabels);
        localStorage.setItem(RESOURCE_LABELS_KEY, JSON.stringify(plansResponse.resourceLabels));
      }
      
      // Set plan type from subscriptions
      const newPlanType = plansApi.getPlanTypeFromSubscriptions(subs);
      setPlanType(newPlanType);
      localStorage.setItem(PLAN_TYPE_KEY, newPlanType);
    } catch (error: unknown) {
      console.error('Failed to fetch subscriptions:', error);
      // If it's a session expired error, the client.ts will handle redirect
      // For other errors, set default plan type
      if (error instanceof Error && !error.message.includes('Session expired')) {
        setPlanType('Trial');
        localStorage.setItem(PLAN_TYPE_KEY, 'Trial');
      }
    }
  };

  // Helper to get friendly resource label
  const getResourceLabel = (resource: string): string => {
    if (resourceLabels[resource]) {
      return resourceLabels[resource];
    }
    // Fallback: format the resource key nicely
    const name = resource.replace('dataset.', '').replace(/_/g, ' ');
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const login = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.validateCode(email, code);
      setUser(response.user);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      await refreshSubscriptions();
      
      // Fetch preferences from backend to check onboarding status
      const preferences = await authApi.getPreferences();
      if (preferences?.completed) {
        setHasCompletedOnboarding(true);
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify(preferences));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setSubscriptions([]);
    setResourceLabels({});
    setPlanType('Trial');
    setHasCompletedOnboarding(false);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PLAN_TYPE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(RESOURCE_LABELS_KEY);
    navigate('/login');
  };

  const completeOnboarding = async (data: OnboardingData) => {
    const onboardingData: UserPreferences = {
      completed: true,
      completedAt: new Date().toISOString(),
      ...data,
    };
    
    // Save to backend first
    await authApi.savePreferences(onboardingData);
    
    // Then save locally as fallback
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(onboardingData));
    setHasCompletedOnboarding(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscriptions,
        resourceLabels,
        planType,
        isAuthenticated,
        isLoading,
        hasCompletedOnboarding,
        login,
        logout,
        refreshSubscriptions,
        completeOnboarding,
        getResourceLabel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
