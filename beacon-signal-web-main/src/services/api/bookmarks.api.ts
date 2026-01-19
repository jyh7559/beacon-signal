// Bookmarks API endpoints
import { delay } from './client';
import { mockBookmarks, mockBookmarkFolders, mockSignals, setMockBookmarks } from './mock-data';
import type { Bookmark, BookmarkFolder } from '@/types';

export const bookmarksApi = {
  async getBookmarks(): Promise<Bookmark[]> {
    await delay(300);
    return mockBookmarks.map(b => ({
      ...b,
      signal: mockSignals.find(s => s.id === b.signalId),
    }));
  },

  async getBookmarkFolders(): Promise<BookmarkFolder[]> {
    await delay(200);
    return mockBookmarkFolders;
  },

  async createBookmark(signalId: string, notes?: string, folderId?: string): Promise<Bookmark> {
    await delay(300);
    const bookmark: Bookmark = {
      id: `bm_${Date.now()}`,
      signalId,
      notes,
      tags: [],
      folderId,
      createdAt: new Date().toISOString(),
    };
    mockBookmarks.push(bookmark);
    return bookmark;
  },

  async deleteBookmark(id: string): Promise<void> {
    await delay(200);
    setMockBookmarks(mockBookmarks.filter(b => b.id !== id));
  },

  async isBookmarked(signalId: string): Promise<boolean> {
    return mockBookmarks.some(b => b.signalId === signalId);
  },
};
