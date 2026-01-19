// API-specific types and response interfaces
// Re-export domain types for convenience
export type {
  Signal,
  Dataset,
  SavedSearch,
  Bookmark,
  AlertRule,
  User,
  SearchParams,
  PaginatedResponse,
  DashboardStats,
  SignalCategory,
  BookmarkFolder,
  DatasetField,
  AlertCondition,
  AlertDestination,
  DataSourceInfo,
  DatasetRecord,
} from '@/types';

// Re-export new API module types
export type {
  RequestCodeResponse,
  ValidateCodeResponse,
  RegisterResponse,
} from './auth.api';

export type {
  Subscription,
  PlanOption,
  SubscribeRequest,
  SubscribeResponse,
} from './plans.api';

export type {
  DatasetFilter,
  DatasetRecordResponse,
  AccessCheckResponse,
} from './datasets.api';

export type {
  CompanySearchResult,
  IndustryResult,
  LocationResult,
} from './metadata.api';

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Export-specific types
export interface ExportRequest {
  signalIds: string[];
  format: 'csv' | 'json';
}
