// Core data types for Intellizence API

export interface Signal {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  category: SignalCategory;
  summary: string;
  amount?: number;
  currency?: string;
  geo: string;
  tags: string[];
  confidence: number;
  sourceCount: number;
  publishedAt: string;
  urls: string[];
}

export type SignalCategory = 
  | 'funding'
  | 'ma'
  | 'executive'
  | 'expansion'
  | 'hiring'
  | 'layoffs'
  | 'product'
  | 'partnership'
  | 'breach'
  | 'competitor';

export interface Dataset {
  id: string;
  name: string;
  description: string;
  updateFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  recordCount: number;
  fields: DatasetField[];
  sampleRecord: Record<string, unknown>;
  icon: string;
}

export interface DatasetField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  description: string;
  example: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  queryParams: SearchParams;
  createdAt: string;
  lastRunAt: string;
  resultCount?: number;
}

export interface SearchParams {
  query?: string;
  categories?: SignalCategory[];
  industries?: string[];
  geos?: string[];
  companies?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  confidenceMin?: number;
  sortBy?: 'latest' | 'confidence' | 'sources';
}

export interface Bookmark {
  id: string;
  signalId: string;
  signal?: Signal;
  notes?: string;
  tags: string[];
  folderId?: string;
  createdAt: string;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  color: string;
  bookmarkCount: number;
}

export interface AlertRule {
  id: string;
  name: string;
  conditions: AlertCondition[];
  destinations: AlertDestination[];
  enabled: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
}

export interface AlertCondition {
  field: 'category' | 'company' | 'keyword' | 'confidence' | 'amount';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: string | number | string[];
}

export interface AlertDestination {
  type: 'email' | 'webhook' | 'slack';
  target: string;
  enabled: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  company?: string;
  industries: string[];
  signalTypes: SignalCategory[];
  createdAt: string;
}

export type UserRole = 'consulting' | 'vc_pe' | 'research' | 'corporate' | 'other';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface DashboardStats {
  signalsToday: number;
  signalsThisWeek: number;
  watchlistCount: number;
  alertsTriggered: number;
  coverageScore: number;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number | null;
  billingPeriod: 'month' | 'year' | 'custom';
  features: string[];
  limits: {
    signals: number | 'unlimited';
    savedSearches: number | 'unlimited';
    alerts: number | 'unlimited';
    apiCalls: number | 'unlimited';
    users: number | 'unlimited';
  };
  cta: string;
  highlighted?: boolean;
}

// Data source authenticity info
export interface DataSourceInfo {
  sources: { name: string; url: string; lastVerified: string }[];
  confidenceScore: number;
  dataQuality: 'verified' | 'unverified' | 'disputed';
  lastUpdated: string;
  methodology?: string;
  interpretation?: string;
}

// Dataset record type for table display
export type DatasetRecord = Record<string, unknown> & {
  _sourceInfo?: DataSourceInfo;
};

// Custom column definition
export interface CustomColumn {
  id: string;
  name: string;
  type: 'computed' | 'requested' | 'linked';
  formula?: string;
  sourceDataset?: string;
  status: 'pending' | 'approved' | 'active';
  createdAt: string;
}

// User plan and credits
export interface UserPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: "month" | "year";
  renewalDate: string;
  features: string[];
}

export interface CreditUsage {
  type: string;
  used: number;
  total: number;
  label: string;
}
