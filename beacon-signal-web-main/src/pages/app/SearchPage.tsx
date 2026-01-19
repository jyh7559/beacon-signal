import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Save, ArrowUpDown, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterablePageLayout } from "@/components/layout/FilterablePageLayout";
import { UnifiedFilterSidebar, FilterGroupConfig, FilterValues } from "@/components/search/UnifiedFilterSidebar";
import { SaveSearchModal } from "@/components/search/SaveSearchModal";
import { SignalCard } from "@/components/signals/SignalCard";
import { EmptyState } from "@/components/ui/empty-state";
import { SignalCardSkeleton } from "@/components/ui/skeleton";
import { SearchParams, Signal, SignalCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useBookmarks } from "@/hooks/useBookmarks";
import { api } from "@/services/api";

const signalCategoryOptions = [
  { value: "funding", label: "Funding" },
  { value: "ma", label: "M&A" },
  { value: "executive", label: "Executive Moves" },
  { value: "expansion", label: "Expansion" },
  { value: "hiring", label: "Hiring" },
  { value: "layoffs", label: "Layoffs" },
  { value: "product", label: "Product Launches" },
  { value: "partnership", label: "Partnerships" },
];

const geographyOptions = [
  { value: "USA", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "EU", label: "Europe" },
  { value: "APAC", label: "Asia Pacific" },
  { value: "LATAM", label: "Latin America" },
];

const filterGroups: FilterGroupConfig[] = [
  {
    id: "categories",
    label: "Signal Type",
    type: "checkbox",
    options: signalCategoryOptions,
    searchable: true,
    defaultOpen: true,
  },
  {
    id: "geos",
    label: "Geography",
    type: "checkbox",
    options: geographyOptions,
    searchable: true,
    defaultOpen: true,
  },
  {
    id: "confidenceMin",
    label: "Minimum Confidence",
    type: "range",
    min: 0,
    max: 100,
    step: 5,
    defaultOpen: true,
  },
];

export default function SearchPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [sortBy, setSortBy] = useState<"latest" | "confidence" | "sources">("latest");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  // Load signals from API
  useEffect(() => {
    const loadSignals = async () => {
      setIsLoading(true);
      try {
        const response = await api.getSignals({});
        setSignals(response.data);
      } catch (error) {
        toast({
          title: "Error loading signals",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadSignals();
  }, []);

  // Convert filter values to SearchParams
  const filters: SearchParams = useMemo(() => ({
    categories: filterValues.categories as SignalCategory[] | undefined,
    geos: filterValues.geos as string[] | undefined,
    confidenceMin: filterValues.confidenceMin as number | undefined,
  }), [filterValues]);

  // Filter and sort signals
  const filteredSignals = useMemo(() => {
    let results = [...signals];

    // Apply text query
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.company.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q)
      );
    }

    // Apply category filter
    if (filters.categories?.length) {
      results = results.filter((s) => filters.categories!.includes(s.category));
    }

    // Apply geo filter
    if (filters.geos?.length) {
      results = results.filter((s) => filters.geos!.includes(s.geo));
    }

    // Apply confidence filter
    if (filters.confidenceMin) {
      results = results.filter((s) => s.confidence >= filters.confidenceMin!);
    }

    // Sort
    switch (sortBy) {
      case "confidence":
        results.sort((a, b) => b.confidence - a.confidence);
        break;
      case "sources":
        results.sort((a, b) => b.sourceCount - a.sourceCount);
        break;
      case "latest":
      default:
        results.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
    }

    return results;
  }, [signals, query, filters, sortBy]);

  const handleClearFilters = () => {
    setFilterValues({});
    setQuery("");
  };

  const handleSaveSearch = (name: string) => {
    toast({
      title: "Search saved",
      description: `"${name}" has been saved to your searches.`,
    });
  };

  const handleCreateAlert = () => {
    // Navigate to alerts page with current filters as query params
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (filterValues.categories) {
      params.set('categories', (filterValues.categories as string[]).join(','));
    }
    if (filterValues.geos) {
      params.set('geos', (filterValues.geos as string[]).join(','));
    }
    if (filterValues.confidenceMin) {
      params.set('confidenceMin', String(filterValues.confidenceMin));
    }
    navigate(`/app/alerts?create=true&${params.toString()}`);
  };

  const handleBookmark = async (signal: Signal) => {
    await toggleBookmark(signal.id);
  };

  const activeFilterCount =
    ((filterValues.categories as string[])?.length ?? 0) +
    ((filterValues.geos as string[])?.length ?? 0) +
    ((filterValues.confidenceMin as number) ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Search Signals</h1>
          <p className="text-muted-foreground mt-1">
            Discover market intelligence across all categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateAlert} variant="default" className="bg-accent hover:bg-accent/90">
            <Bell className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
          <Button onClick={() => setSaveModalOpen(true)} variant="secondary">
            <Save className="w-4 h-4 mr-2" />
            Save Search
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search companies, keywords, signals..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-11"
        />
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
        {/* Results Header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredSignals.length}</span>{" "}
            signals found
          </p>
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as typeof sortBy)}
          >
            <SelectTrigger className="w-36 h-9">
              <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
              <SelectItem value="sources">Sources</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SignalCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredSignals.length === 0 ? (
          <EmptyState
            variant="search"
            title="No signals found"
            description="Try adjusting your filters or search query"
            action={{
              label: "Clear filters",
              onClick: handleClearFilters,
            }}
          />
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredSignals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <SignalCard
                  signal={signal}
                  onBookmark={handleBookmark}
                  isBookmarked={isBookmarked(signal.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </FilterablePageLayout>

      {/* Save Search Modal */}
      <SaveSearchModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        filters={{ ...filters, query }}
        onSave={handleSaveSearch}
      />
    </div>
  );
}
