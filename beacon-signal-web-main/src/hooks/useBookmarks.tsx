import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import type { Bookmark } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load bookmarks on mount
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const data = await api.getBookmarks();
        setBookmarks(data);
        setBookmarkedIds(new Set(data.map(b => b.signalId)));
      } catch (error) {
        console.error("Failed to load bookmarks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBookmarks();
  }, []);

  const isBookmarked = useCallback((signalId: string) => {
    return bookmarkedIds.has(signalId);
  }, [bookmarkedIds]);

  const addBookmark = useCallback(async (signalId: string, notes?: string) => {
    try {
      const bookmark = await api.createBookmark(signalId, notes);
      setBookmarks(prev => [...prev, bookmark]);
      setBookmarkedIds(prev => new Set(prev).add(signalId));
      toast({ title: "Signal bookmarked" });
      return bookmark;
    } catch (error) {
      toast({ title: "Failed to bookmark", variant: "destructive" });
      throw error;
    }
  }, [toast]);

  const removeBookmark = useCallback(async (signalId: string) => {
    const bookmark = bookmarks.find(b => b.signalId === signalId);
    if (!bookmark) return;

    try {
      await api.deleteBookmark(bookmark.id);
      setBookmarks(prev => prev.filter(b => b.signalId !== signalId));
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        next.delete(signalId);
        return next;
      });
      toast({ title: "Bookmark removed" });
    } catch (error) {
      toast({ title: "Failed to remove bookmark", variant: "destructive" });
      throw error;
    }
  }, [bookmarks, toast]);

  const toggleBookmark = useCallback(async (signalId: string) => {
    if (isBookmarked(signalId)) {
      await removeBookmark(signalId);
    } else {
      await addBookmark(signalId);
    }
  }, [isBookmarked, addBookmark, removeBookmark]);

  return {
    bookmarks,
    bookmarkedIds,
    isLoading,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
  };
}
