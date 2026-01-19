// Search & Metadata API endpoints (autocomplete)
import { apiClient } from './client';
import { ENDPOINTS } from './config';

// Response types
export interface CompanySearchResult {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
}

export interface IndustryResult {
  id: string;
  name: string;
  count?: number;
}

export interface LocationResult {
  id: string;
  name: string;
  type: 'country' | 'state' | 'city';
  country?: string;
}

export const metadataApi = {
  // Search companies (autocomplete)
  async searchCompanies(query: string): Promise<CompanySearchResult[]> {
    return apiClient.get<CompanySearchResult[]>(ENDPOINTS.search.companies, { q: query });
  },

  // Get industries (supports optional search)
  async getIndustries(query?: string): Promise<IndustryResult[]> {
    return apiClient.get<IndustryResult[]>(ENDPOINTS.search.industries, query ? { q: query } : {});
  },

  // Search countries
  async searchCountries(query: string): Promise<LocationResult[]> {
    return apiClient.get<LocationResult[]>(ENDPOINTS.search.countries, { q: query });
  },

  // Search locations (cities, states)
  async searchLocations(query: string): Promise<LocationResult[]> {
    return apiClient.get<LocationResult[]>(ENDPOINTS.search.locations, { q: query });
  },
};
