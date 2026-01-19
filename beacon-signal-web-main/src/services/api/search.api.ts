// Saved Searches API endpoints
import { delay } from './client';
import { mockSavedSearches, setMockSavedSearches } from './mock-data';
import type { SavedSearch, SearchParams } from '@/types';

export const searchApi = {
  async getSavedSearches(): Promise<SavedSearch[]> {
    await delay(300);
    return mockSavedSearches;
  },

  async createSavedSearch(name: string, queryParams: SearchParams): Promise<SavedSearch> {
    await delay(300);
    const savedSearch: SavedSearch = {
      id: `ss_${Date.now()}`,
      name,
      queryParams,
      createdAt: new Date().toISOString(),
      lastRunAt: new Date().toISOString(),
    };
    mockSavedSearches.push(savedSearch);
    return savedSearch;
  },

  async deleteSavedSearch(id: string): Promise<void> {
    await delay(200);
    setMockSavedSearches(mockSavedSearches.filter(s => s.id !== id));
  },
};
