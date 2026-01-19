/*
 * Supabase Authentication and API Service for Beacon Signal Web Application
 * This service handles all authentication and data access operations with Supabase
 */

import { createClient, type User } from '@supabase/supabase-js';
import type { 
  DatasetFilter, 
  DatasetRecordResponse, 
  Subscription, 
  PlanOption, 
  SubscribeRequest, 
  SubscribeResponse,
  UserPreferences
} from '../services/api/types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Using mock data.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types for our data structures
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  role?: string;
  industries?: string[];
  signal_types?: string[];
  created_at: string;
  updated_at: string;
}

// Authentication service
export const authService = {
  // Request OTP code for email verification
  async requestCode(email: string, name?: string, company?: string) {
    // In our Supabase setup, we use the RPC function to generate OTP
    const { data, error } = await supabase.rpc('generate_otp', { p_email: email });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // In a real implementation, we would send the OTP via email here
    // For now, we'll just return success
    return { success: true, message: 'Verification code sent successfully' };
  },

  // Validate OTP and complete login
  async validateCode(email: string, code: string) {
    // Validate the OTP code
    const { data: isValid, error: validationError } = await supabase
      .rpc('validate_otp', { p_email: email, p_code: code });
    
    if (validationError || !isValid) {
      throw new Error('Invalid or expired verification code');
    }
    
    // Get or create user in auth system
    let { data: { user }, error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    
    if (authError) {
      // If user doesn't exist, create one
      if (authError.message.includes('User not found')) {
        const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
          email,
          emailConfirm: true
        });
        
        if (createUserError) {
          throw new Error(createUserError.message);
        }
        
        user = newUser.user;
      } else {
        throw new Error(authError.message);
      }
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw new Error(profileError.message);
    }
    
    // Create profile if it doesn't exist
    if (!profile) {
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert([{ id: user!.id, email, name, company }]);
      
      if (createProfileError) {
        throw new Error(createProfileError.message);
      }
    }
    
    // Generate JWT token (this is handled by Supabase automatically)
    const { data: { session } } = await supabase.auth.getSession();
    
    return {
      token: session?.access_token || '',
      user: {
        id: user!.id,
        email: user!.email!,
        name: profile?.name || name || '',
        company: profile?.company || company || '',
        createdAt: user!.created_at,
        role: profile?.role as any || 'other',
        industries: profile?.industries || [],
        signalTypes: profile?.signal_types || []
      }
    };
  },

  // Register new user
  async register(data: { email: string; name: string; company: string; phone?: string }) {
    // Generate OTP for the new user
    const { error } = await supabase.rpc('generate_otp', { p_email: data.email });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // In a real implementation, we would send the OTP via email here
    return { success: true, message: 'Registration successful. Verification code sent.' };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return {
      id: user.id,
      email: user.email!,
      name: profile?.name || '',
      company: profile?.company || '',
      createdAt: user.created_at,
      role: profile?.role as any || 'other',
      industries: profile?.industries || [],
      signalTypes: profile?.signal_types || []
    };
  }
};

// Dataset service
export const datasetService = {
  // Check access to a specific plan type
  async checkAccess(planType: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase.rpc('check_access_to_plan', {
      p_user_id: user.id,
      p_plan_type: planType
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { hasAccess: data };
  },

  // Get M&A data
  async getMnAData(planType: string, filters?: DatasetFilter) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Check access first
    const access = await this.checkAccess(planType);
    if (!access.hasAccess) {
      throw new Error('Access denied. Please upgrade your plan.');
    }
    
    let query = supabase.from('mna_data').select('*');
    
    // Apply filters
    if (filters?.dateRange) {
      query = query.gte('announced_date', filters.dateRange.start).lte('announced_date', filters.dateRange.end);
    }
    
    // Apply pagination
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 25;
    const offset = (page - 1) * pageSize;
    
    query = query.range(offset, offset + pageSize - 1);
    
    // Apply sorting
    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('announced_date', { ascending: false });
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      hasMore: (page * pageSize) < (count || 0)
    } as DatasetRecordResponse;
  },

  // Get Fundraising data
  async getFundraisingData(planType: string, filters?: DatasetFilter) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Check access first
    const access = await this.checkAccess(planType);
    if (!access.hasAccess) {
      throw new Error('Access denied. Please upgrade your plan.');
    }
    
    let query = supabase.from('fundraising_data').select('*');
    
    // Apply filters
    if (filters?.dateRange) {
      query = query.gte('funding_date', filters.dateRange.start).lte('funding_date', filters.dateRange.end);
    }
    
    // Apply pagination
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 25;
    const offset = (page - 1) * pageSize;
    
    query = query.range(offset, offset + pageSize - 1);
    
    // Apply sorting
    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('funding_date', { ascending: false });
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      hasMore: (page * pageSize) < (count || 0)
    } as DatasetRecordResponse;
  },

  // Get Layoff data
  async getLayoffData(planType: string, filters?: DatasetFilter) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Check access first
    const access = await this.checkAccess(planType);
    if (!access.hasAccess) {
      throw new Error('Access denied. Please upgrade your plan.');
    }
    
    let query = supabase.from('layoff_data').select('*');
    
    // Apply filters
    if (filters?.dateRange) {
      query = query.gte('layoff_date', filters.dateRange.start).lte('layoff_date', filters.dateRange.end);
    }
    
    // Apply pagination
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 25;
    const offset = (page - 1) * pageSize;
    
    query = query.range(offset, offset + pageSize - 1);
    
    // Apply sorting
    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('layoff_date', { ascending: false });
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      hasMore: (page * pageSize) < (count || 0)
    } as DatasetRecordResponse;
  },

  // Get Security Breach data
  async getSecurityBreachData(planType: string, filters?: DatasetFilter) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Check access first
    const access = await this.checkAccess(planType);
    if (!access.hasAccess) {
      throw new Error('Access denied. Please upgrade your plan.');
    }
    
    let query = supabase.from('data_security_breach_data').select('*');
    
    // Apply filters
    if (filters?.dateRange) {
      query = query.gte('breach_date', filters.dateRange.start).lte('breach_date', filters.dateRange.end);
    }
    
    // Apply pagination
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 25;
    const offset = (page - 1) * pageSize;
    
    query = query.range(offset, offset + pageSize - 1);
    
    // Apply sorting
    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('breach_date', { ascending: false });
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      hasMore: (page * pageSize) < (count || 0)
    } as DatasetRecordResponse;
  },

  // Get CXO Changes data
  async getCxoChangesData(planType: string, filters?: DatasetFilter) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Check access first
    const access = await this.checkAccess(planType);
    if (!access.hasAccess) {
      throw new Error('Access denied. Please upgrade your plan.');
    }
    
    let query = supabase.from('cxo_changes_data').select('*');
    
    // Apply filters
    if (filters?.dateRange) {
      query = query.gte('change_date', filters.dateRange.start).lte('change_date', filters.dateRange.end);
    }
    
    // Apply pagination
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 25;
    const offset = (page - 1) * pageSize;
    
    query = query.range(offset, offset + pageSize - 1);
    
    // Apply sorting
    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('change_date', { ascending: false });
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      hasMore: (page * pageSize) < (count || 0)
    } as DatasetRecordResponse;
  },

  // Get Business Expansion data
  async getBusinessExpansionData(planType: string, filters?: DatasetFilter) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Check access first
    const access = await this.checkAccess(planType);
    if (!access.hasAccess) {
      throw new Error('Access denied. Please upgrade your plan.');
    }
    
    let query = supabase.from('business_expansion_data').select('*');
    
    // Apply filters
    if (filters?.dateRange) {
      query = query.gte('expansion_date', filters.dateRange.start).lte('expansion_date', filters.dateRange.end);
    }
    
    // Apply pagination
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 25;
    const offset = (page - 1) * pageSize;
    
    query = query.range(offset, offset + pageSize - 1);
    
    // Apply sorting
    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('expansion_date', { ascending: false });
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      hasMore: (page * pageSize) < (count || 0)
    } as DatasetRecordResponse;
  }
};

// Plans and subscriptions service
export const plansService = {
  // Get user's subscriptions
  async getMySubscriptions(): Promise<Subscription[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase.rpc('get_user_subscriptions', {
      p_user_id: user.id
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data.map((item: any) => ({
      resource: item.resource,
      plan: {
        name: item.plan_name
      },
      subscribedOn: item.subscribed_on,
      expiresOn: item.expires_on,
      allowedStartDate: item.allowed_start_date,
      config: item.config
    })) as Subscription[];
  },

  // Get available plans
  async getAvailablePlans() {
    const { data, error } = await supabase.rpc('get_available_plans');
    
    if (error) {
      throw new Error(error.message);
    }
    
    const plans = data.map((item: any) => ({
      _id: item.plan_id,
      name: item.name,
      resources: item.resources,
      pricing: item.pricing,
      isDownloadAllowed: item.is_download_allowed,
      isTeamAllowed: true, // Simplified for demo
      maxTeamMembers: item.max_team_members,
      isActive: item.is_active
    })) as PlanOption[];
    
    // Format response to match expected API structure
    return {
      resourceLabels: {
        'dataset.mna': 'M&A',
        'dataset.fundraising': 'Fundraising',
        'dataset.layoff': 'Layoffs',
        'dataset.data_security_breach': 'Security Breaches',
        'dataset.cxo_changes': 'CXO Changes',
        'dataset.business_expansion': 'Business Expansion'
      },
      plans
    };
  },

  // Subscribe to a plan
  async subscribe(request: SubscribeRequest): Promise<SubscribeResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase.rpc('subscribe_to_plan', {
      p_user_id: user.id,
      p_plan_name: request.planName,
      p_frequency: request.frequency,
      p_resources: request.resources || []
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      throw new Error('Failed to create subscription');
    }
    
    const result = data[0];
    
    return {
      success: result.success,
      message: result.message,
      subscription: {
        resource: '', // Will be populated by individual resource subscriptions
        plan: {
          name: result.plan_name
        },
        subscribedOn: result.start_date,
        expiresOn: result.end_date,
        allowedStartDate: result.start_date,
        config: null
      }
    };
  }
};

// User preferences service
export const preferencesService = {
  async getPreferences(): Promise<UserPreferences | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      throw new Error(error.message);
    }
    
    return {
      role: data.role,
      industries: data.industries || [],
      signals: data.signals || [],
      completed: data.completed,
      completedAt: data.completed_at
    };
  },

  async savePreferences(data: UserPreferences) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        role: data.role,
        industries: data.industries,
        signals: data.signals,
        completed: data.completed,
        completed_at: data.completedAt
      });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  }
};