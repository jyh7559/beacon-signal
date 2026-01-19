// Dataset Configuration - Centralized definitions for all datasets
// Maps dataset IDs to their API methods, columns, and filter configurations

import type { LucideIcon } from 'lucide-react';
import { 
  GitMerge, 
  DollarSign, 
  TrendingDown, 
  Shield, 
  UserCog,
  Building,
} from 'lucide-react';

// Column configuration
export interface ColumnConfig {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'percent' | 'company' | 'badge' | 'array' | 'url';
  visible: boolean;
  sortable?: boolean;
  width?: string;
}

// Filter type definitions
export type FilterType = 
  | 'dateRange' 
  | 'industry' 
  | 'country' 
  | 'location'
  | 'company'
  | 'status' 
  | 'dealValue' 
  | 'roundType' 
  | 'amount' 
  | 'scale'
  | 'role'
  | 'breachType';

// Dataset info structure
export interface DatasetInfo {
  id: string;
  apiResource: string;  // The resource name used in API (e.g., 'dataset.mna')
  name: string;
  description: string;
  icon: LucideIcon;
  columns: ColumnConfig[];
  filters: FilterType[];
  defaultSort?: { key: string; order: 'asc' | 'desc' };
  // Subscription-related fields
  requiredPlan?: string;  // Plan required for full access (e.g., 'Pro', 'Business')
  premiumColumns?: string[];  // Columns that require higher plans
}

// M&A Dataset Configuration
const mnaDataset: DatasetInfo = {
  id: 'mna',
  apiResource: 'dataset.mna',
  name: 'Mergers & Acquisitions',
  description: 'Track M&A deals, acquisitions, and corporate restructuring events worldwide.',
  icon: GitMerge,
  columns: [
    { key: 'announcedDate', label: 'Announced Date', type: 'date', visible: true, sortable: true },
    { key: 'acquiringCompany.name', label: 'Acquirer', type: 'company', visible: true, sortable: true },
    { key: 'acquiringCompany.domain', label: 'Acquirer Website', type: 'url', visible: false },
    { key: 'acquiredCompany.name', label: 'Target', type: 'company', visible: true, sortable: true },
    { key: 'acquiredCompany.domain', label: 'Target Website', type: 'url', visible: false },
    { key: 'transactionValue', label: 'Deal Value', type: 'currency', visible: true, sortable: true },
    { key: 'transactionStatus', label: 'Status', type: 'badge', visible: true, sortable: true },
    { key: 'acquiringCompany.industries', label: 'Acquirer Industries', type: 'array', visible: false },
    { key: 'acquiredCompany.industries', label: 'Target Industries', type: 'array', visible: false },
    { key: 'acquiringCompany.location', label: 'Acquirer Location', type: 'string', visible: true },
    { key: 'acquiredCompany.location', label: 'Target Location', type: 'string', visible: false },
  ],
  filters: ['dateRange', 'status', 'industry', 'country', 'dealValue', 'company'],
  defaultSort: { key: 'announcedDate', order: 'desc' },
  requiredPlan: 'Pro',
  premiumColumns: ['transactionValue', 'acquiringCompany.industries', 'acquiredCompany.industries'],
};

// Fundraising Dataset Configuration  
const fundraisingDataset: DatasetInfo = {
  id: 'fundraising',
  apiResource: 'dataset.fundraising',
  name: 'Startup Funding',
  description: 'Comprehensive funding rounds data including venture capital and private equity deals.',
  icon: DollarSign,
  columns: [
    { key: 'fundingDate', label: 'Date', type: 'date', visible: true, sortable: true },
    { key: 'company.name', label: 'Company', type: 'company', visible: true, sortable: true },
    { key: 'company.domain', label: 'Website', type: 'url', visible: false },
    { key: 'roundType', label: 'Round Type', type: 'badge', visible: true, sortable: true },
    { key: 'amountRaised', label: 'Amount Raised', type: 'currency', visible: true, sortable: true },
    { key: 'valuation', label: 'Valuation', type: 'currency', visible: true, sortable: true },
    { key: 'investors', label: 'Investors', type: 'array', visible: true },
    { key: 'leadInvestors', label: 'Lead Investors', type: 'array', visible: false },
    { key: 'company.industries', label: 'Industries', type: 'array', visible: false },
    { key: 'company.location', label: 'Location', type: 'string', visible: true },
  ],
  filters: ['dateRange', 'roundType', 'amount', 'industry', 'country', 'company'],
  defaultSort: { key: 'fundingDate', order: 'desc' },
  requiredPlan: 'Pro',
  premiumColumns: ['valuation', 'leadInvestors'],
};

// Layoff Dataset Configuration
const layoffDataset: DatasetInfo = {
  id: 'layoff',
  apiResource: 'dataset.layoff',
  name: 'Global Layoffs',
  description: 'Track workforce reductions and restructuring across industries.',
  icon: TrendingDown,
  columns: [
    { key: 'layoffDate', label: 'Date', type: 'date', visible: true, sortable: true },
    { key: 'company.name', label: 'Company', type: 'company', visible: true, sortable: true },
    { key: 'company.domain', label: 'Website', type: 'url', visible: false },
    { key: 'layoffCount', label: 'Employees Affected', type: 'number', visible: true, sortable: true },
    { key: 'layoffPercentage', label: '% of Workforce', type: 'percent', visible: true, sortable: true },
    { key: 'layoffReason', label: 'Reason', type: 'string', visible: true },
    { key: 'company.industries', label: 'Industries', type: 'array', visible: false },
    { key: 'company.location', label: 'Location', type: 'string', visible: true },
    { key: 'sourceType', label: 'Source Type', type: 'badge', visible: false },
  ],
  filters: ['dateRange', 'scale', 'industry', 'country', 'company'],
  defaultSort: { key: 'layoffDate', order: 'desc' },
  requiredPlan: 'Business',
  premiumColumns: ['layoffPercentage', 'layoffReason'],
};

// Security Breach Dataset Configuration
const securityBreachDataset: DatasetInfo = {
  id: 'security_breach',
  apiResource: 'dataset.data_security_breach',
  name: 'Cyber Incidents',
  description: 'Security breaches, data leaks, and cyber attack intelligence.',
  icon: Shield,
  columns: [
    { key: 'breachDate', label: 'Breach Date', type: 'date', visible: true, sortable: true },
    { key: 'noticeDate', label: 'Notice Date', type: 'date', visible: false, sortable: true },
    { key: 'company.name', label: 'Company', type: 'company', visible: true, sortable: true },
    { key: 'company.domain', label: 'Website', type: 'url', visible: false },
    { key: 'breachType', label: 'Breach Type', type: 'badge', visible: true },
    { key: 'recordsAffected', label: 'Records Affected', type: 'number', visible: true, sortable: true },
    { key: 'dataTypes', label: 'Data Types', type: 'array', visible: true },
    { key: 'company.industries', label: 'Industries', type: 'array', visible: false },
    { key: 'company.location', label: 'Location', type: 'string', visible: true },
    { key: 'thirdPartyCompany.name', label: 'Third Party', type: 'string', visible: false },
    { key: 'sourceType', label: 'Source Type', type: 'badge', visible: false },
  ],
  filters: ['dateRange', 'breachType', 'industry', 'country', 'company'],
  defaultSort: { key: 'breachDate', order: 'desc' },
  requiredPlan: 'Business',
  premiumColumns: ['recordsAffected', 'dataTypes', 'thirdPartyCompany.name'],
};

// CXO Changes Dataset Configuration
const cxoChangesDataset: DatasetInfo = {
  id: 'cxo_changes',
  apiResource: 'dataset.cxo_changes',
  name: 'C-Suite Changes',
  description: 'Executive appointments, departures, and leadership transitions.',
  icon: UserCog,
  columns: [
    { key: 'changeDate', label: 'Effective Date', type: 'date', visible: true, sortable: true },
    { key: 'executiveName', label: 'Executive', type: 'string', visible: true, sortable: true },
    { key: 'company.name', label: 'Company', type: 'company', visible: true, sortable: true },
    { key: 'company.domain', label: 'Website', type: 'url', visible: false },
    { key: 'newTitle', label: 'New Role', type: 'string', visible: true },
    { key: 'previousTitle', label: 'Previous Role', type: 'string', visible: false },
    { key: 'executiveTitleCategory', label: 'Role Category', type: 'badge', visible: true },
    { key: 'changeType', label: 'Change Type', type: 'badge', visible: true },
    { key: 'company.industries', label: 'Industries', type: 'array', visible: false },
    { key: 'company.location', label: 'Location', type: 'string', visible: true },
  ],
  filters: ['dateRange', 'role', 'industry', 'country', 'company'],
  defaultSort: { key: 'changeDate', order: 'desc' },
  requiredPlan: 'Pro',
  premiumColumns: ['previousTitle', 'executiveTitleCategory'],
};

// Business Expansion Dataset Configuration
const businessExpansionDataset: DatasetInfo = {
  id: 'business_expansion',
  apiResource: 'dataset.business_expansion',
  name: 'Business Expansion',
  description: 'Track company expansions, new market entries, and facility openings.',
  icon: Building,
  columns: [
    { key: 'expansionDate', label: 'Date', type: 'date', visible: true, sortable: true },
    { key: 'company.name', label: 'Company', type: 'company', visible: true, sortable: true },
    { key: 'company.domain', label: 'Website', type: 'url', visible: false },
    { key: 'expansionType', label: 'Expansion Type', type: 'badge', visible: true },
    { key: 'location', label: 'New Location', type: 'string', visible: true },
    { key: 'investment', label: 'Investment', type: 'currency', visible: true, sortable: true },
    { key: 'jobsCreated', label: 'Jobs Created', type: 'number', visible: true },
    { key: 'company.industries', label: 'Industries', type: 'array', visible: false },
    { key: 'company.location', label: 'HQ Location', type: 'string', visible: false },
  ],
  filters: ['dateRange', 'industry', 'country', 'location', 'company'],
  defaultSort: { key: 'expansionDate', order: 'desc' },
  requiredPlan: 'Pro',
  premiumColumns: ['investment', 'jobsCreated'],
};

// Main dataset configuration map
export const DATASET_CONFIG: Record<string, DatasetInfo> = {
  mna: mnaDataset,
  fundraising: fundraisingDataset,
  layoff: layoffDataset,
  security_breach: securityBreachDataset,
  cxo_changes: cxoChangesDataset,
  business_expansion: businessExpansionDataset,
};

// Helper to get dataset info by ID
export function getDatasetInfo(datasetId: string): DatasetInfo | null {
  return DATASET_CONFIG[datasetId] || null;
}

// Helper to get all available datasets for catalog
export function getAllDatasets(): DatasetInfo[] {
  return Object.values(DATASET_CONFIG);
}

// Map URL-friendly IDs to dataset IDs (for backward compatibility)
export const URL_TO_DATASET_MAP: Record<string, string> = {
  'mna': 'mna',
  'ds_ma': 'mna',
  'fundraising': 'fundraising',
  'ds_funding': 'fundraising',
  'layoff': 'layoff',
  'ds_layoffs': 'layoff',
  'security_breach': 'security_breach',
  'ds_security_breach': 'security_breach',
  'cxo_changes': 'cxo_changes',
  'ds_executive': 'cxo_changes',
  'business_expansion': 'business_expansion',
  'ds_expansion': 'business_expansion',
};

// Get the normalized dataset ID from a URL parameter
export function normalizeDatasetId(urlId: string): string {
  return URL_TO_DATASET_MAP[urlId] || urlId;
}

// Filter option configs for static filters
export const FILTER_OPTIONS = {
  status: [
    { value: 'announced', label: 'Announced' },
    { value: 'completed', label: 'Completed' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'pending', label: 'Pending' },
  ],
  roundType: [
    { value: 'seed', label: 'Seed' },
    { value: 'series_a', label: 'Series A' },
    { value: 'series_b', label: 'Series B' },
    { value: 'series_c', label: 'Series C' },
    { value: 'series_d', label: 'Series D+' },
    { value: 'pre_seed', label: 'Pre-Seed' },
    { value: 'angel', label: 'Angel' },
    { value: 'ipo', label: 'IPO' },
  ],
  scale: [
    { value: 'large', label: 'Large (>1000)' },
    { value: 'medium', label: 'Medium (100-1000)' },
    { value: 'small', label: 'Small (<100)' },
  ],
  role: [
    { value: 'ceo', label: 'CEO' },
    { value: 'cfo', label: 'CFO' },
    { value: 'cto', label: 'CTO' },
    { value: 'coo', label: 'COO' },
    { value: 'cmo', label: 'CMO' },
    { value: 'cio', label: 'CIO' },
    { value: 'board', label: 'Board Member' },
  ],
  breachType: [
    { value: 'data_breach', label: 'Data Breach' },
    { value: 'ransomware', label: 'Ransomware' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'insider_threat', label: 'Insider Threat' },
    { value: 'ddos', label: 'DDoS Attack' },
  ],
};
