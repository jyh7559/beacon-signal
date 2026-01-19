// Alerts API endpoints
import { delay } from './client';
import { mockAlerts, setMockAlerts } from './mock-data';
import type { AlertRule } from '@/types';

export const alertsApi = {
  async getAlerts(): Promise<AlertRule[]> {
    await delay(300);
    return mockAlerts;
  },

  async createAlert(alert: Omit<AlertRule, 'id' | 'createdAt' | 'triggerCount'>): Promise<AlertRule> {
    await delay(300);
    const newAlert: AlertRule = {
      ...alert,
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString(),
      triggerCount: 0,
    };
    mockAlerts.push(newAlert);
    return newAlert;
  },

  async updateAlert(id: string, updates: Partial<AlertRule>): Promise<AlertRule | null> {
    await delay(300);
    const index = mockAlerts.findIndex(a => a.id === id);
    if (index === -1) return null;
    mockAlerts[index] = { ...mockAlerts[index], ...updates };
    return mockAlerts[index];
  },

  async deleteAlert(id: string): Promise<void> {
    await delay(200);
    setMockAlerts(mockAlerts.filter(a => a.id !== id));
  },
};
