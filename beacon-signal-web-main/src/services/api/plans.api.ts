// Plans & Subscriptions API endpoints
import { apiClient } from './client';
import { ENDPOINTS } from './config';

// Subscription type matching actual API response
export interface Subscription {
  resource: string;
  plan: {
    name: string;
  };
  subscribedOn: string;
  expiresOn: string;
  allowedStartDate: string;
  config: Record<string, unknown> | null;
}

// Plan pricing structure
export interface PlanPricing {
  monthly?: number;
  quarterly?: number;
  halfYearly?: number;
  annual?: number;
}

// Plan option from API
export interface PlanOption {
  _id: string;
  name: string;
  resources: string[];
  pricing?: Record<string, PlanPricing>;
  excludeFields?: Record<string, string[]>;
  isDownloadAllowed: boolean;
  isTeamAllowed: boolean;
  maxTeamMembers?: number;
  maxDaysPreviousData?: number;
  isActive: boolean;
  trialValidityDays?: number;
  postTrialMaxLatestRecordsTobeShown?: number;
  config?: Record<string, unknown>;
}

// Plans API response
export interface PlansResponse {
  resourceLabels: Record<string, string>;
  plans: PlanOption[];
}

export interface SubscribeRequest {
  planName: string;
  frequency: 'month' | 'year';
  resources?: string[];
}

export interface SubscribeResponse {
  success: boolean;
  subscription: Subscription;
  message?: string;
}

export const plansApi = {
  // Get current user's subscriptions
  async getMySubscriptions(): Promise<Subscription[]> {
    return apiClient.get<Subscription[]>(ENDPOINTS.plans.mySubscriptions);
  },

  // Get all available plans (returns full response with labels)
  async getAvailablePlans(): Promise<PlansResponse> {
    return apiClient.get<PlansResponse>(ENDPOINTS.plans.list);
  },

  // Subscribe to a plan
  async subscribe(request: SubscribeRequest): Promise<SubscribeResponse> {
    return apiClient.post<SubscribeResponse>(ENDPOINTS.plans.subscribe, request);
  },
  
  // Helper to get plan type from subscriptions
  getPlanTypeFromSubscriptions(subscriptions: Subscription[]): string {
    if (subscriptions.length === 0) return 'Trial';
    // All subscriptions share the same plan, get it from the first one
    return subscriptions[0]?.plan?.name || 'Trial';
  },
  
  // Check if a subscription is active (not expired)
  isSubscriptionActive(subscription: Subscription): boolean {
    const now = new Date();
    const expiresOn = new Date(subscription.expiresOn);
    return expiresOn > now;
  },
};
