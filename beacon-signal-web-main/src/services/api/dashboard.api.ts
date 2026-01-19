// Dashboard API endpoints
import { delay } from './client';
import { mockSignals, mockBookmarks } from './mock-data';
import type { DashboardStats } from '@/types';

export const dashboardApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    await delay(300);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const signalsToday = mockSignals.filter(s => new Date(s.publishedAt) >= today).length;
    const signalsThisWeek = mockSignals.filter(s => new Date(s.publishedAt) >= weekAgo).length;

    return {
      signalsToday: signalsToday || 47,
      signalsThisWeek: signalsThisWeek || 328,
      watchlistCount: mockBookmarks.length + 12,
      alertsTriggered: 8,
      coverageScore: 94,
    };
  },
};
