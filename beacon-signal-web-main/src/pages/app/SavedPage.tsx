import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterablePageLayout } from "@/components/layout/FilterablePageLayout";
import { UnifiedFilterSidebar, FilterGroupConfig, FilterValues } from "@/components/search/UnifiedFilterSidebar";
import {
  Bookmark,
  Search,
  Play,
  Trash2,
  Edit3,
  Clock,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { api } from "@/services/api";
import type { Bookmark as BookmarkType, SavedSearch } from "@/types";

const categoryLabels: Record<string, string> = {
  funding: "Funding",
  ma: "M&A",
  executive: "Executive",
  expansion: "Expansion",
  hiring: "Hiring",
  layoffs: "Layoffs",
  product: "Product",
  partnership: "Partnership",
};

const filterGroups: FilterGroupConfig[] = [
  {
    id: "categories",
    label: "Signal Type",
    type: "checkbox",
    options: [
      { value: "funding", label: "Funding" },
      { value: "ma", label: "M&A" },
      { value: "executive", label: "Executive" },
      { value: "expansion", label: "Expansion" },
      { value: "hiring", label: "Hiring" },
      { value: "layoffs", label: "Layoffs" },
      { value: "product", label: "Product" },
      { value: "partnership", label: "Partnership" },
    ],
    searchable: true,
    defaultOpen: true,
  },
  {
    id: "dateRange",
    label: "Date Saved",
    type: "date",
    defaultOpen: false,
  },
];

export default function SavedPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [bookmarksData, searchesData] = await Promise.all([
          api.getBookmarks(),
          api.getSavedSearches(),
        ]);
        setBookmarks(bookmarksData);
        setSavedSearches(searchesData);
      } catch (error) {
        toast({ title: "Failed to load saved items", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [toast]);

  const filteredBookmarks = useMemo(() => {
    let results = [...bookmarks];
    
    const categories = filterValues.categories as string[] | undefined;
    if (categories?.length) {
      results = results.filter((b) => b.signal && categories.includes(b.signal.category));
    }
    
    const dateRange = filterValues.dateRange as { from?: Date; to?: Date } | undefined;
    if (dateRange?.from || dateRange?.to) {
      results = results.filter((b) => {
        const bookmarkDate = new Date(b.createdAt);
        if (dateRange.from && bookmarkDate < dateRange.from) return false;
        if (dateRange.to && bookmarkDate > dateRange.to) return false;
        return true;
      });
    }
    
    return results;
  }, [bookmarks, filterValues]);

  const filteredSearches = useMemo(() => {
    let results = [...savedSearches];
    
    const categories = filterValues.categories as string[] | undefined;
    if (categories?.length) {
      results = results.filter((s) => 
        s.queryParams.categories?.some((c) => categories.includes(c))
      );
    }
    
    return results;
  }, [savedSearches, filterValues]);

  const handleClearFilters = () => {
    setFilterValues({});
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      await api.deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Bookmark removed" });
    } catch (error) {
      toast({ title: "Failed to remove bookmark", variant: "destructive" });
    }
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      await api.deleteSavedSearch(id);
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Saved search deleted" });
    } catch (error) {
      toast({ title: "Failed to delete search", variant: "destructive" });
    }
  };

  const handleRunSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.queryParams.query) params.set("q", search.queryParams.query);
    if (search.queryParams.categories?.length) {
      params.set("categories", search.queryParams.categories.join(","));
    }
    toast({ title: "Running search...", description: search.name });
    navigate(`/app/search?${params.toString()}`);
  };

  const activeFilterCount =
    ((filterValues.categories as string[])?.length ?? 0) +
    ((filterValues.dateRange as { from?: Date; to?: Date })?.from || (filterValues.dateRange as { from?: Date; to?: Date })?.to ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Saved</h1>
        <p className="text-muted-foreground mt-1">
          Access your bookmarked signals and saved searches
        </p>
      </div>

      {/* Main Content with Filter Sidebar */}
      <FilterablePageLayout
        activeFilterCount={activeFilterCount}
        sidebar={
          <UnifiedFilterSidebar
            filterGroups={filterGroups}
            values={filterValues}
            onChange={setFilterValues}
            onClearAll={handleClearFilters}
          />
        }
      >
        {/* Tabs */}
        <Tabs defaultValue="bookmarks" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="bookmarks" className="gap-2 data-[state=active]:bg-background">
              <Bookmark className="w-4 h-4" />
              Bookmarks
              <Badge variant="secondary" size="sm" className="ml-1">
                {filteredBookmarks.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="searches" className="gap-2 data-[state=active]:bg-background">
              <Search className="w-4 h-4" />
              Saved Searches
              <Badge variant="secondary" size="sm" className="ml-1">
                {filteredSearches.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookmarks" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <EmptyState
                variant="inbox"
                title="No bookmarks yet"
                description="Bookmark signals from the search page to save them here"
                action={{ label: "Go to Search", onClick: () => navigate("/app/search") }}
              />
            ) : (
              <motion.div className="grid gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {filteredBookmarks.map((bookmark, index) => (
                  <motion.div key={bookmark.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                    <GlassCard hover>
                      <GlassCardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {bookmark.signal && (
                                <Badge variant={bookmark.signal.category as any}>
                                  {categoryLabels[bookmark.signal.category] || bookmark.signal.category}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(bookmark.createdAt), "MMM d, yyyy")}
                              </span>
                            </div>
                            <h3 className="font-semibold text-foreground mb-1 leading-snug">
                              {bookmark.signal?.title || "Unknown Signal"}
                            </h3>
                            <p className="text-sm text-primary font-medium mb-2">
                              {bookmark.signal?.company || "Unknown Company"}
                            </p>
                            {bookmark.tags.length > 0 && (
                              <div className="flex gap-1.5">
                                {bookmark.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Edit3 className="w-4 h-4 mr-2" />Edit Notes</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteBookmark(bookmark.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </GlassCardContent>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="searches" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-32 w-full" />))}
              </div>
            ) : filteredSearches.length === 0 ? (
              <EmptyState
                variant="search"
                title="No saved searches"
                description="Save your search filters to quickly access them later"
                action={{ label: "Go to Search", onClick: () => navigate("/app/search") }}
              />
            ) : (
              <motion.div className="grid gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {filteredSearches.map((search, index) => (
                  <motion.div key={search.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                    <GlassCard hover>
                      <GlassCardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-2">{search.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Last run {format(new Date(search.lastRunAt), "MMM d, h:mm a")}
                              </span>
                              {search.resultCount !== undefined && (
                                <span className="font-medium text-foreground">{search.resultCount} results</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {search.queryParams.categories?.map((cat, i) => (
                                <Badge key={i} variant="secondary" size="sm">
                                  <Filter className="w-3 h-3 mr-1" />{categoryLabels[cat] || cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="default" size="sm" onClick={() => handleRunSearch(search)}>
                              <Play className="w-3.5 h-3.5 mr-1.5" />Run
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem><Edit3 className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteSearch(search.id)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </GlassCardContent>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </FilterablePageLayout>
    </div>
  );
}
