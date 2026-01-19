// Dynamic filter builder hook for datasets
// Builds filter groups based on dataset configuration and fetches options from API

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { DATASET_CONFIG, FILTER_OPTIONS, type FilterType } from '@/config/datasets.config';
import { metadataApi } from '@/services/api/metadata.api';
import type { FilterGroupConfig, FilterOption } from '@/components/search/UnifiedFilterSidebar';

interface UseDatasetFiltersResult {
  filterGroups: FilterGroupConfig[];
  isLoading: boolean;
}

interface DateConstraints {
  minDate?: Date;
  maxDate?: Date;
}

export function useDatasetFilters(
  datasetType: string,
  dateConstraints?: DateConstraints
): UseDatasetFiltersResult {
  const [industries, setIndustries] = useState<FilterOption[]>([]);
  const [countries, setCountries] = useState<FilterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dynamic filter options from API
  useEffect(() => {
    const loadFilterOptions = async () => {
      setIsLoading(true);
      try {
        const [industriesData, countriesData] = await Promise.all([
          metadataApi.getIndustries().catch(() => []),
          metadataApi.searchCountries('').catch(() => []),
        ]);
        
        // Use i.name as value when id is missing to prevent select-all behavior
        setIndustries(
          industriesData.map((i: { id?: string; name: string; count?: number }) => ({
            value: i.id || i.name, // Fallback to name if id is missing
            label: i.name,
            count: i.count,
          }))
        );
        
        setCountries(
          countriesData.map((c) => ({
            value: c.id || c.name, // Fallback to name if id is missing
            label: c.name,
          }))
        );
      } catch (error) {
        console.error('Failed to load filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Build filter groups based on dataset config
  const filterGroups = useMemo(() => {
    const config = DATASET_CONFIG[datasetType];
    if (!config) return [];

    return config.filters.map((filterId: FilterType): FilterGroupConfig | null => {
      switch (filterId) {
        case 'dateRange':
          return {
            id: 'dateRange',
            label: 'Date Range',
            type: 'date',
            defaultOpen: true,
            minDate: dateConstraints?.minDate,
            maxDate: dateConstraints?.maxDate,
          };

        case 'industry':
          return {
            id: 'industry',
            label: 'Industry',
            type: 'checkbox',
            options: industries.length > 0 ? industries : [
              { value: 'technology', label: 'Technology' },
              { value: 'healthcare', label: 'Healthcare' },
              { value: 'finance', label: 'Finance' },
              { value: 'retail', label: 'Retail' },
              { value: 'manufacturing', label: 'Manufacturing' },
              { value: 'energy', label: 'Energy' },
            ],
            searchable: true,
            defaultOpen: false,
          };

        case 'country':
          return {
            id: 'country',
            label: 'Country',
            type: 'checkbox',
            options: countries.length > 0 ? countries : [
              { value: 'US', label: 'United States' },
              { value: 'GB', label: 'United Kingdom' },
              { value: 'DE', label: 'Germany' },
              { value: 'FR', label: 'France' },
              { value: 'IN', label: 'India' },
              { value: 'CN', label: 'China' },
              { value: 'JP', label: 'Japan' },
            ],
            searchable: true,
            defaultOpen: false,
          };

        case 'location':
          return {
            id: 'location',
            label: 'Location',
            type: 'checkbox',
            options: countries.length > 0 ? countries : [
              { value: 'US', label: 'United States' },
              { value: 'GB', label: 'United Kingdom' },
              { value: 'DE', label: 'Germany' },
            ],
            searchable: true,
            defaultOpen: false,
          };

        case 'company':
          // Company filter will be handled with autocomplete, not static options
          return null;

        case 'status':
          // Use Title Case values for M&A status to match API
          return {
            id: 'status',
            label: 'Status',
            type: 'checkbox',
            options: datasetType === 'mna' ? [
              { value: 'Announced', label: 'Announced' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Terminated', label: 'Terminated' },
              { value: 'Pending', label: 'Pending' },
            ] : FILTER_OPTIONS.status,
            defaultOpen: true,
          };

        case 'dealValue':
          return {
            id: 'dealValue',
            label: 'Deal Value',
            type: 'amount',
            defaultOpen: false,
          };

        case 'amount':
          return {
            id: 'amount',
            label: 'Amount Raised',
            type: 'amount',
            defaultOpen: false,
          };

        case 'roundType':
          return {
            id: 'roundType',
            label: 'Round Type',
            type: 'checkbox',
            options: FILTER_OPTIONS.roundType,
            searchable: true,
            defaultOpen: true,
          };

        case 'scale':
          return {
            id: 'scale',
            label: 'Scale',
            type: 'checkbox',
            options: FILTER_OPTIONS.scale,
            defaultOpen: true,
          };

        case 'role':
          return {
            id: 'role',
            label: 'Role Category',
            type: 'checkbox',
            options: FILTER_OPTIONS.role,
            searchable: true,
            defaultOpen: true,
          };

        case 'breachType':
          return {
            id: 'breachType',
            label: 'Breach Type',
            type: 'checkbox',
            options: FILTER_OPTIONS.breachType,
            defaultOpen: true,
          };

        default:
          return null;
      }
    }).filter((group): group is FilterGroupConfig => group !== null);
  }, [datasetType, industries, countries, dateConstraints]);

  return { filterGroups, isLoading };
}

// Dataset-specific API field mappings
const DATASET_API_FIELD_MAPPINGS: Record<string, Record<string, string>> = {
  mna: {
    status: 'mnaStatus', // Fixed: was 'transactionStatus'
    industry: 'industries',
    country: 'countries',
    dealValue: 'transactionValue',
  },
  fundraising: {
    industry: 'industries',
    country: 'countries',
    amount: 'amountRaised',
  },
  layoff: {
    industry: 'industries',
    country: 'countries',
    scale: 'layoffScale',
  },
  security_breach: {
    industry: 'industries',
    country: 'countries',
    breachType: 'breachType',
  },
  cxo_changes: {
    industry: 'industries',
    country: 'countries',
    role: 'executiveTitleCategory',
  },
  business_expansion: {
    industry: 'industries',
    country: 'countries',
    location: 'expansionLocation',
  },
};

// Helper to convert UI filter values to API filter format
export function convertFiltersToApiFormat(
  filterValues: Record<string, unknown>,
  searchQuery?: string,
  datasetType?: string
): Record<string, unknown> {
  const apiFilters: Record<string, unknown> = {};
  const fieldMappings = datasetType ? DATASET_API_FIELD_MAPPINGS[datasetType] || {} : {};

  // Helper to get the correct API field name
  const getApiFieldName = (uiFieldName: string): string => {
    return fieldMappings[uiFieldName] || uiFieldName;
  };

  // Handle date range - use date-fns format to prevent timezone shift
  const dateRange = filterValues.dateRange as { from?: Date; to?: Date } | undefined;
  if (dateRange?.from || dateRange?.to) {
    apiFilters.dateRange = {
      start: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      end: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    };
  }

  // Handle industry filter
  const industries = filterValues.industry as string[] | undefined;
  if (industries?.length) {
    apiFilters[getApiFieldName('industry')] = industries;
  }

  // Handle country filter
  const countries = filterValues.country as string[] | undefined;
  if (countries?.length) {
    apiFilters[getApiFieldName('country')] = countries;
  }

  // Handle location filter
  const locations = filterValues.location as string[] | undefined;
  if (locations?.length) {
    apiFilters[getApiFieldName('location')] = locations;
  }

  // Handle status filter
  const status = filterValues.status as string[] | undefined;
  if (status?.length) {
    apiFilters[getApiFieldName('status')] = status;
  }

  // Handle amount/dealValue filters
  const dealValue = filterValues.dealValue as { min?: number; max?: number } | undefined;
  if (dealValue?.min !== undefined || dealValue?.max !== undefined) {
    const fieldName = getApiFieldName('dealValue');
    if (fieldName !== 'dealValue') {
      // Use dataset-specific field with min/max suffix
      if (dealValue.min !== undefined) apiFilters[`${fieldName}Min`] = dealValue.min;
      if (dealValue.max !== undefined) apiFilters[`${fieldName}Max`] = dealValue.max;
    } else {
      apiFilters.minAmount = dealValue.min;
      apiFilters.maxAmount = dealValue.max;
    }
  }

  const amount = filterValues.amount as { min?: number; max?: number } | undefined;
  if (amount?.min !== undefined || amount?.max !== undefined) {
    const fieldName = getApiFieldName('amount');
    if (fieldName !== 'amount') {
      if (amount.min !== undefined) apiFilters[`${fieldName}Min`] = amount.min;
      if (amount.max !== undefined) apiFilters[`${fieldName}Max`] = amount.max;
    } else {
      apiFilters.minAmount = amount.min;
      apiFilters.maxAmount = amount.max;
    }
  }

  // Handle round type
  const roundType = filterValues.roundType as string[] | undefined;
  if (roundType?.length) {
    apiFilters.roundType = roundType;
  }

  // Handle scale
  const scale = filterValues.scale as string[] | undefined;
  if (scale?.length) {
    apiFilters[getApiFieldName('scale')] = scale;
  }

  // Handle role
  const role = filterValues.role as string[] | undefined;
  if (role?.length) {
    apiFilters[getApiFieldName('role')] = role;
  }

  // Handle breach type
  const breachType = filterValues.breachType as string[] | undefined;
  if (breachType?.length) {
    apiFilters.breachType = breachType;
  }

  // Handle search query
  if (searchQuery) {
    apiFilters.query = searchQuery;
  }

  // Debug logging
  console.log('[Dataset Filters] UI Values:', filterValues);
  console.log('[Dataset Filters] Dataset Type:', datasetType);
  console.log('[Dataset Filters] API Filters:', apiFilters);

  return apiFilters;
}
