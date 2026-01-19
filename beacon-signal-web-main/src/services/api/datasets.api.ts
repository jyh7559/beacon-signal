// Datasets API endpoints
import { apiClient } from './client';
import { ENDPOINTS } from './config';
import { DATASET_CONFIG, getAllDatasets, type DatasetInfo } from '@/config/datasets.config';

// Dataset filter types
export interface DatasetFilter {
  // Pagination
  page?: number;
  pageSize?: number;
  
  // Date filters
  dateRange?: { start: string; end: string };
  
  // Search/autocomplete filters
  companies?: string[];
  industries?: string[];
  countries?: string[];
  locations?: string[];
  
  // Amount/value filters
  minAmount?: number;
  maxAmount?: number;
  
  // Dataset-specific filters
  status?: string[];
  roundType?: string[];
  dealType?: string[];
  role?: string[];
  scale?: string[];
  breachType?: string[];
  
  // Full-text search
  query?: string;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Dataset record response
export interface DatasetRecordResponse<T = Record<string, unknown>> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Raw dataset response from the backend (current API uses `dataset` + `count`)
interface RawDatasetRecordResponse<T = Record<string, unknown>> {
  // Newer backend shape
  code?: number;
  count?: number;
  dataset?: T[];

  // Legacy/expected shape
  data?: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

function normalizeDatasetRecordResponse<T = Record<string, unknown>>(
  raw: RawDatasetRecordResponse<T>,
  filters?: DatasetFilter
): DatasetRecordResponse<T> {
  const data = (Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.dataset)
      ? raw.dataset
      : []) as T[];

  const page = filters?.page ?? raw.page ?? 1;
  const pageSize =
    filters?.pageSize ?? raw.pageSize ?? (data.length || 25);

  const total =
    typeof raw.total === 'number'
      ? raw.total
      : typeof raw.count === 'number'
        ? raw.count
        : data.length;

  const hasMore =
    typeof raw.hasMore === 'boolean' ? raw.hasMore : page * pageSize < total;

  return { data, total, page, pageSize, hasMore };
}

// Access check response
export interface AccessCheckResponse {
  hasAccess: boolean;
  planType?: string;
  message?: string;
}

// API method type
type DatasetApiMethod = (planType: string, filters?: DatasetFilter) => Promise<DatasetRecordResponse>;

export const datasetsApi = {
  // Check access to a plan type
  async checkAccess(planType: string): Promise<AccessCheckResponse> {
    return apiClient.post<AccessCheckResponse>(ENDPOINTS.datasets.access(planType));
  },

  // Fetch M&A data
  async getMnAData(planType: string, filters?: DatasetFilter): Promise<DatasetRecordResponse> {
    const raw = await apiClient.post<RawDatasetRecordResponse>(
      ENDPOINTS.datasets.mna(planType),
      filters
    );
    return normalizeDatasetRecordResponse(raw, filters);
  },

  // Fetch Fundraising data
  async getFundraisingData(planType: string, filters?: DatasetFilter): Promise<DatasetRecordResponse> {
    const raw = await apiClient.post<RawDatasetRecordResponse>(
      ENDPOINTS.datasets.fundraising(planType),
      filters
    );
    return normalizeDatasetRecordResponse(raw, filters);
  },

  // Fetch Layoff data
  async getLayoffData(planType: string, filters?: DatasetFilter): Promise<DatasetRecordResponse> {
    const raw = await apiClient.post<RawDatasetRecordResponse>(
      ENDPOINTS.datasets.layoff(planType),
      filters
    );
    return normalizeDatasetRecordResponse(raw, filters);
  },

  // Fetch Security Breach data
  async getSecurityBreachData(planType: string, filters?: DatasetFilter): Promise<DatasetRecordResponse> {
    const raw = await apiClient.post<RawDatasetRecordResponse>(
      ENDPOINTS.datasets.securityBreach(planType),
      filters
    );
    return normalizeDatasetRecordResponse(raw, filters);
  },

  // Fetch CXO Changes data
  async getCxoChangesData(planType: string, filters?: DatasetFilter): Promise<DatasetRecordResponse> {
    const raw = await apiClient.post<RawDatasetRecordResponse>(
      ENDPOINTS.datasets.cxoChanges(planType),
      filters
    );
    return normalizeDatasetRecordResponse(raw, filters);
  },
  
  // Fetch Business Expansion data
  async getBusinessExpansionData(planType: string, filters?: DatasetFilter): Promise<DatasetRecordResponse> {
    const raw = await apiClient.post<RawDatasetRecordResponse>(
      ENDPOINTS.datasets.businessExpansion(planType),
      filters
    );
    return normalizeDatasetRecordResponse(raw, filters);
  },
  
  // Unified method to fetch any dataset by type
  async getDatasetByType(
    datasetType: string,
    planType: string,
    filters?: DatasetFilter
  ): Promise<DatasetRecordResponse> {
    const methodMap: Record<string, DatasetApiMethod> = {
      mna: this.getMnAData.bind(this),
      fundraising: this.getFundraisingData.bind(this),
      layoff: this.getLayoffData.bind(this),
      security_breach: this.getSecurityBreachData.bind(this),
      cxo_changes: this.getCxoChangesData.bind(this),
      business_expansion: this.getBusinessExpansionData.bind(this),
    };
    
    const method = methodMap[datasetType];
    if (!method) {
      throw new Error(`Unknown dataset type: ${datasetType}`);
    }
    
    return method(planType, filters);
  },
  
  // Get dataset info from config
  getDatasetInfo(datasetType: string): DatasetInfo | null {
    return DATASET_CONFIG[datasetType] || null;
  },
  
  // Get all available datasets for catalog
  getAllDatasets(): DatasetInfo[] {
    return getAllDatasets();
  },
};
