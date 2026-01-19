// Mock data generators and initial state
// This file can be removed when switching to real APIs

import type {
  Signal,
  Dataset,
  SavedSearch,
  Bookmark,
  AlertRule,
  User,
  SignalCategory,
  BookmarkFolder,
  DataSourceInfo,
} from '@/types';

// Mock data generators
export const generateSignals = (count: number): Signal[] => {
  const categories: SignalCategory[] = ['funding', 'ma', 'executive', 'expansion', 'hiring', 'layoffs', 'product', 'partnership'];
  const companies = ['Stripe', 'OpenAI', 'Notion', 'Figma', 'Vercel', 'Linear', 'Retool', 'Airtable', 'Canva', 'Miro'];
  const geos = ['United States', 'United Kingdom', 'Germany', 'France', 'India', 'Singapore', 'Japan', 'Brazil'];
  
  const categoryTitles: Record<SignalCategory, string[]> = {
    funding: ['raises Series', 'secures funding', 'closes round', 'announces investment'],
    ma: ['acquires', 'merges with', 'to be acquired by', 'in talks to acquire'],
    executive: ['appoints new CEO', 'hires CTO from', 'CFO departs', 'names new VP'],
    expansion: ['expands to', 'opens office in', 'launches in', 'enters market'],
    hiring: ['plans to hire', 'opens positions', 'recruiting spree', 'talent expansion'],
    layoffs: ['lays off', 'reduces workforce', 'restructures team', 'cuts jobs'],
    product: ['launches', 'announces', 'releases', 'unveils'],
    partnership: ['partners with', 'announces collaboration', 'teams up with', 'strategic alliance'],
    breach: ['data breach', 'security incident', 'vulnerability disclosed'],
    competitor: ['competitive move', 'market challenge', 'rival action'],
  };

  return Array.from({ length: count }, (_, i) => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const titleAction = categoryTitles[category][Math.floor(Math.random() * categoryTitles[category].length)];
    
    return {
      id: `sig_${Date.now()}_${i}`,
      title: `${company} ${titleAction}${category === 'funding' ? ' B at $200M valuation' : ''}`,
      company,
      category,
      summary: `${company} has ${titleAction.toLowerCase()} in a strategic move that signals growth in the ${category} space. Multiple sources confirm this development.`,
      amount: category === 'funding' ? Math.floor(Math.random() * 500 + 10) * 1000000 : undefined,
      currency: category === 'funding' ? 'USD' : undefined,
      geo: geos[Math.floor(Math.random() * geos.length)],
      tags: [category, company.toLowerCase(), 'tech'],
      confidence: Math.floor(Math.random() * 30 + 70),
      sourceCount: Math.floor(Math.random() * 10 + 2),
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      urls: ['https://source1.com', 'https://source2.com'],
    };
  });
};

// Generate source info for dataset records
export const generateSourceInfo = (primarySource: string, additionalSources: string[] = []): { _sourceInfo: DataSourceInfo } => ({
  _sourceInfo: {
    sources: [
      { name: primarySource, url: `https://${primarySource.toLowerCase().replace(/\s+/g, '')}.com`, lastVerified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() },
      ...additionalSources.map(s => ({ name: s, url: `https://${s.toLowerCase().replace(/\s+/g, '')}.com`, lastVerified: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() }))
    ],
    confidenceScore: Math.floor(Math.random() * 25 + 75),
    dataQuality: ['verified', 'verified', 'verified', 'unverified'][Math.floor(Math.random() * 4)] as 'verified' | 'unverified' | 'disputed',
    lastUpdated: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
    methodology: "Data aggregated from public filings, press releases, and verified news sources.",
    interpretation: undefined,
  }
});

// Static mock datasets
export const mockDatasets: Dataset[] = [
  {
    id: 'ds_funding',
    name: 'Funding Events',
    description: 'Real-time funding rounds, investments, and valuations across 50,000+ companies globally.',
    updateFrequency: 'realtime',
    recordCount: 2847293,
    icon: 'DollarSign',
    fields: [
      { name: 'company_name', type: 'string', description: 'Name of the funded company', example: 'Stripe' },
      { name: 'round_type', type: 'string', description: 'Type of funding round', example: 'Series C' },
      { name: 'amount', type: 'number', description: 'Funding amount in USD', example: '250000000' },
      { name: 'valuation', type: 'number', description: 'Post-money valuation', example: '950000000' },
      { name: 'investors', type: 'array', description: 'List of investors', example: '["Sequoia", "a16z"]' },
      { name: 'date', type: 'date', description: 'Announcement date', example: '2024-01-15' },
    ],
    sampleRecord: { company_name: 'Stripe', round_type: 'Series I', amount: 6500000000, valuation: 50000000000, investors: ['Sequoia', 'Andreessen Horowitz'], date: '2024-01-15' },
  },
  {
    id: 'ds_ma',
    name: 'M&A Transactions',
    description: 'Mergers, acquisitions, and divestitures with deal terms and strategic rationale.',
    updateFrequency: 'daily',
    recordCount: 584721,
    icon: 'GitMerge',
    fields: [
      { name: 'acquirer', type: 'string', description: 'Acquiring company', example: 'Microsoft' },
      { name: 'target', type: 'string', description: 'Target company', example: 'Activision' },
      { name: 'deal_value', type: 'number', description: 'Transaction value in USD', example: '68700000000' },
      { name: 'status', type: 'string', description: 'Deal status', example: 'Completed' },
      { name: 'announced_date', type: 'date', description: 'Announcement date', example: '2024-01-18' },
    ],
    sampleRecord: { acquirer: 'Microsoft', target: 'Activision Blizzard', deal_value: 68700000000, status: 'Completed', announced_date: '2024-01-18' },
  },
  {
    id: 'ds_executive',
    name: 'Executive Moves',
    description: 'C-suite appointments, departures, and board changes at tracked companies.',
    updateFrequency: 'daily',
    recordCount: 1293847,
    icon: 'UserCog',
    fields: [
      { name: 'person_name', type: 'string', description: 'Executive name', example: 'Satya Nadella' },
      { name: 'company', type: 'string', description: 'Company name', example: 'Microsoft' },
      { name: 'new_role', type: 'string', description: 'New position', example: 'CEO' },
      { name: 'previous_role', type: 'string', description: 'Previous position', example: 'EVP Cloud' },
      { name: 'effective_date', type: 'date', description: 'Effective date', example: '2024-02-01' },
    ],
    sampleRecord: { person_name: 'John Smith', company: 'TechCorp', new_role: 'CEO', previous_role: 'COO', effective_date: '2024-02-01' },
  },
  {
    id: 'ds_expansion',
    name: 'Expansion Signals',
    description: 'Geographic expansion, new market entry, and office openings worldwide.',
    updateFrequency: 'daily',
    recordCount: 847291,
    icon: 'Globe',
    fields: [
      { name: 'company', type: 'string', description: 'Company name', example: 'Notion' },
      { name: 'expansion_type', type: 'string', description: 'Type of expansion', example: 'New Office' },
      { name: 'location', type: 'string', description: 'Expansion location', example: 'London, UK' },
      { name: 'investment', type: 'number', description: 'Investment amount', example: '50000000' },
    ],
    sampleRecord: { company: 'Notion', expansion_type: 'New Office', location: 'London, UK', investment: 50000000 },
  },
  {
    id: 'ds_hiring',
    name: 'Hiring Trends',
    description: 'Job postings, hiring volume, and talent acquisition trends by company and role.',
    updateFrequency: 'weekly',
    recordCount: 12847291,
    icon: 'Users',
    fields: [
      { name: 'company', type: 'string', description: 'Company name', example: 'OpenAI' },
      { name: 'department', type: 'string', description: 'Department', example: 'Engineering' },
      { name: 'open_roles', type: 'number', description: 'Number of open positions', example: '150' },
      { name: 'growth_rate', type: 'number', description: 'YoY growth %', example: '45' },
    ],
    sampleRecord: { company: 'OpenAI', department: 'Engineering', open_roles: 150, growth_rate: 45 },
  },
  {
    id: 'ds_layoffs',
    name: 'Layoffs & Restructuring',
    description: 'Workforce reductions, restructuring announcements, and severance details.',
    updateFrequency: 'daily',
    recordCount: 234891,
    icon: 'TrendingDown',
    fields: [
      { name: 'company', type: 'string', description: 'Company name', example: 'Meta' },
      { name: 'affected_employees', type: 'number', description: 'Number affected', example: '11000' },
      { name: 'percentage', type: 'number', description: 'Percentage of workforce', example: '13' },
      { name: 'departments', type: 'array', description: 'Affected departments', example: '["Recruiting", "Business"]' },
    ],
    sampleRecord: { company: 'Meta', affected_employees: 11000, percentage: 13, departments: ['Recruiting', 'Business'] },
  },
  {
    id: 'ds_product',
    name: 'Product Launches',
    description: 'New product announcements, feature releases, and product pivots.',
    updateFrequency: 'realtime',
    recordCount: 3847291,
    icon: 'Rocket',
    fields: [
      { name: 'company', type: 'string', description: 'Company name', example: 'Apple' },
      { name: 'product_name', type: 'string', description: 'Product name', example: 'Vision Pro' },
      { name: 'category', type: 'string', description: 'Product category', example: 'Hardware' },
      { name: 'launch_date', type: 'date', description: 'Launch date', example: '2024-02-02' },
    ],
    sampleRecord: { company: 'Apple', product_name: 'Vision Pro', category: 'Hardware', launch_date: '2024-02-02' },
  },
  {
    id: 'ds_partnership',
    name: 'Partnerships',
    description: 'Strategic partnerships, joint ventures, and collaboration announcements.',
    updateFrequency: 'daily',
    recordCount: 928471,
    icon: 'Handshake',
    fields: [
      { name: 'partner_1', type: 'string', description: 'First partner', example: 'Microsoft' },
      { name: 'partner_2', type: 'string', description: 'Second partner', example: 'OpenAI' },
      { name: 'partnership_type', type: 'string', description: 'Type of partnership', example: 'Strategic Investment' },
      { name: 'value', type: 'number', description: 'Deal value if disclosed', example: '10000000000' },
    ],
    sampleRecord: { partner_1: 'Microsoft', partner_2: 'OpenAI', partnership_type: 'Strategic Investment', value: 10000000000 },
  },
];

// Mutable state for mock persistence
export let mockSignals = generateSignals(100);
export let mockSavedSearches: SavedSearch[] = [
  {
    id: 'ss_1',
    name: 'AI Funding Rounds',
    queryParams: { categories: ['funding'], query: 'AI' },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastRunAt: new Date().toISOString(),
    resultCount: 47,
  },
  {
    id: 'ss_2',
    name: 'Fintech M&A',
    queryParams: { categories: ['ma'], industries: ['fintech'] },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastRunAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resultCount: 23,
  },
];

export let mockBookmarks: Bookmark[] = [];
export let mockBookmarkFolders: BookmarkFolder[] = [
  { id: 'folder_1', name: 'Important', color: '#2BA7B1', bookmarkCount: 0 },
  { id: 'folder_2', name: 'Research', color: '#C4D500', bookmarkCount: 0 },
];

export let mockAlerts: AlertRule[] = [
  {
    id: 'alert_1',
    name: 'Competitor Funding',
    conditions: [
      { field: 'category', operator: 'equals', value: 'funding' },
      { field: 'company', operator: 'in', value: ['Stripe', 'Square', 'Adyen'] },
    ],
    destinations: [{ type: 'email', target: 'user@company.com', enabled: true }],
    enabled: true,
    createdAt: new Date().toISOString(),
    triggerCount: 12,
  },
];

export let currentUser: User | null = null;

// State setters for mock data manipulation
export const setMockSavedSearches = (searches: SavedSearch[]) => {
  mockSavedSearches = searches;
};

export const setMockBookmarks = (bookmarks: Bookmark[]) => {
  mockBookmarks = bookmarks;
};

export const setMockAlerts = (alerts: AlertRule[]) => {
  mockAlerts = alerts;
};

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};
