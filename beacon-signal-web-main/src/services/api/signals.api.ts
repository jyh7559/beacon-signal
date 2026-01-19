// Signals API endpoints
import { delay } from './client';
import { mockSignals } from './mock-data';
import type { Signal, SearchParams, PaginatedResponse } from '@/types';

export const signalsApi = {
  async getSignals(params: SearchParams & { page?: number; pageSize?: number }): Promise<PaginatedResponse<Signal>> {
    await delay(300);
    let filtered = [...mockSignals];

    if (params.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.company.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
      );
    }

    if (params.categories?.length) {
      filtered = filtered.filter(s => params.categories!.includes(s.category));
    }

    if (params.geos?.length) {
      filtered = filtered.filter(s => params.geos!.includes(s.geo));
    }

    if (params.confidenceMin) {
      filtered = filtered.filter(s => s.confidence >= params.confidenceMin!);
    }

    // Sorting
    if (params.sortBy === 'confidence') {
      filtered.sort((a, b) => b.confidence - a.confidence);
    } else if (params.sortBy === 'sources') {
      filtered.sort((a, b) => b.sourceCount - a.sourceCount);
    } else {
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return {
      data,
      total: filtered.length,
      page,
      pageSize,
      hasMore: start + pageSize < filtered.length,
    };
  },

  async getSignalById(id: string): Promise<Signal | null> {
    await delay(200);
    return mockSignals.find(s => s.id === id) || null;
  },

  async exportSignals(signalIds: string[], format: 'csv' | 'json'): Promise<Blob> {
    await delay(500);
    const signals = mockSignals.filter(s => signalIds.includes(s.id));
    
    if (format === 'json') {
      return new Blob([JSON.stringify(signals, null, 2)], { type: 'application/json' });
    }
    
    const headers = ['id', 'title', 'company', 'category', 'confidence', 'publishedAt'] as const;
    const csv = [
      headers.join(','),
      ...signals.map(s => headers.map(h => JSON.stringify(s[h as keyof Signal])).join(',')),
    ].join('\n');
    
    return new Blob([csv], { type: 'text/csv' });
  },
};
