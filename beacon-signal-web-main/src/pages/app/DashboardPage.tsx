import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { SignalCardSkeleton, StatCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterablePageLayout } from "@/components/layout/FilterablePageLayout";
import { UnifiedFilterSidebar, FilterGroupConfig, FilterValues } from "@/components/search/UnifiedFilterSidebar";
import { TileConfigModal, TileType } from "@/components/dashboard/TileConfigModal";
import { ContactSalesModal } from "@/components/settings/ContactSalesModal";
import {
  Zap,
  Bookmark,
  BookmarkCheck,
  Share2,
  Download,
  ExternalLink,
  Bell,
  Eye,
  TrendingUp,
  Building2,
  Database,
} from "lucide-react";
import { api } from "@/services/api";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAuth } from "@/hooks/useAuth";
import type { Signal, SignalCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";

const categoryColors: Record<SignalCategory, string> = {
  funding: "funding",
  ma: "ma",
  executive: "executive",
  expansion: "expansion",
  hiring: "hiring",
  layoffs: "layoffs",
  product: "product",
  partnership: "partnership",
  breach: "destructive",
  competitor: "secondary",
};

const filterGroups: FilterGroupConfig[] = [
  {
    id: "categories",
    label: "Signal Type",
    type: "checkbox",
    options: [
      { value: "funding", label: "Funding" },
      { value: "ma", label: "M&A" },
      { value: "executive", label: "CXO" },
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
    id: "geos",
    label: "Geography",
    type: "checkbox",
    options: [
      { value: "USA", label: "United States" },
      { value: "UK", label: "United Kingdom" },
      { value: "EU", label: "Europe" },
      { value: "APAC", label: "Asia Pacific" },
      { value: "LATAM", label: "Latin America" },
    ],
    searchable: true,
    defaultOpen: false,
  },
  {
    id: "confidenceMin",
    label: "Minimum Confidence",
    type: "range",
    min: 0,
    max: 100,
    step: 5,
    defaultOpen: false,
  },
];

function formatAmount(amount?: number, currency?: string): string {
  if (!amount) return "";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
  return formatted;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// Tile visibility storage key
const TILE_VISIBILITY_KEY = "dashboard_tile_visibility";

interface TileVisibility {
  signalsToday: boolean;
  signalsThisWeek: boolean;
  watchlist: boolean;
  alertsTriggered: boolean;
  subscribedDatasets: boolean;
}

const defaultTileVisibility: TileVisibility = {
  signalsToday: true,
  signalsThisWeek: true,
  watchlist: true,
  alertsTriggered: true,
  subscribedDatasets: true,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const { isBookmarked, toggleBookmark, bookmarks } = useBookmarks();
  const { subscriptions, planType, user } = useAuth();
  const { toast } = useToast();

  // Tile configuration modal state
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [activeTileType, setActiveTileType] = useState<TileType>("signalsToday");
  const [contactSalesOpen, setContactSalesOpen] = useState(false);

  // Tile visibility state (persisted to localStorage)
  const [tileVisibility, setTileVisibility] = useState<TileVisibility>(() => {
    try {
      const stored = localStorage.getItem(TILE_VISIBILITY_KEY);
      return stored ? { ...defaultTileVisibility, ...JSON.parse(stored) } : defaultTileVisibility;
    } catch {
      return defaultTileVisibility;
    }
  });

  // Derive stats from subscription data instead of mock API
  const stats = useMemo(() => {
    // Count signals from today and this week
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const signalsToday = signals.filter(s => new Date(s.publishedAt) >= today).length;
    const signalsThisWeek = signals.filter(s => new Date(s.publishedAt) >= weekAgo).length;

    // Watchlist from bookmarks
    const watchlistCount = bookmarks.length;

    // Subscribed datasets count
    const subscribedDatasets = subscriptions.filter(s => s.resource.startsWith('dataset.')).length;

    // Alerts triggered - derive from subscription (placeholder - would come from alerts API)
    const alertsTriggered = Math.min(subscribedDatasets * 2, 10);

    return {
      signalsToday: signalsToday || 0,
      signalsThisWeek: signalsThisWeek || signals.length,
      watchlistCount,
      alertsTriggered,
      subscribedDatasets,
    };
  }, [signals, bookmarks, subscriptions]);

  useEffect(() => {
    loadData();
  }, []);

  // Save tile visibility to localStorage
  useEffect(() => {
    localStorage.setItem(TILE_VISIBILITY_KEY, JSON.stringify(tileVisibility));
  }, [tileVisibility]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const signalsRes = await api.getSignals({ pageSize: 50 });
      setSignals(signalsRes.data);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter signals based on filter values
  const filteredSignals = useMemo(() => {
    let results = [...signals];
    
    const categories = filterValues.categories as string[] | undefined;
    const geos = filterValues.geos as string[] | undefined;
    const confidenceMin = filterValues.confidenceMin as number | undefined;

    if (categories?.length) {
      results = results.filter((s) => categories.includes(s.category));
    }

    if (geos?.length) {
      results = results.filter((s) => geos.includes(s.geo));
    }

    if (confidenceMin && confidenceMin > 0) {
      results = results.filter((s) => s.confidence >= confidenceMin);
    }

    return results.slice(0, 20);
  }, [signals, filterValues]);

  const handleClearFilters = () => {
    setFilterValues({});
  };

  const handleBookmark = async (signalId: string) => {
    await toggleBookmark(signalId);
  };

  const handleShare = (signal: Signal) => {
    const url = `${window.location.origin}/app/signal/${signal.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  };

  const handleHideTile = useCallback((tileKey: keyof TileVisibility) => {
    setTileVisibility(prev => ({ ...prev, [tileKey]: false }));
    toast({ title: "Tile hidden", description: "You can restore it from settings." });
  }, [toast]);

  const handleConfigureTile = useCallback((tileType: TileType) => {
    setActiveTileType(tileType);
    setConfigModalOpen(true);
  }, []);

  const handleUpgrade = useCallback(() => {
    setContactSalesOpen(true);
  }, []);

  const handleRefreshData = useCallback(() => {
    loadData();
    toast({ title: "Refreshing data..." });
  }, [toast]);

  const activeFilterCount =
    ((filterValues.categories as string[])?.length ?? 0) +
    ((filterValues.geos as string[])?.length ?? 0) +
    ((filterValues.confidenceMin as number) ? 1 : 0);

  // Count visible tiles for grid layout
  const visibleTileCount = Object.values(tileVisibility).filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Your daily intelligence briefing
            {planType && <Badge variant="outline" className="ml-2">{planType} Plan</Badge>}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats - Subscription Aware with Configurable Tiles */}
      <div className={`grid gap-4 ${visibleTileCount <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'}`}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            {tileVisibility.signalsToday && (
              <StatCard
                label="Signals today"
                value={stats.signalsToday}
                change={stats.signalsToday > 0 ? { value: 12, type: "increase" } : undefined}
                icon={Zap}
                href="/app/search?period=today"
                configurable
                onHide={() => handleHideTile('signalsToday')}
                onRefresh={handleRefreshData}
                onConfigure={() => handleConfigureTile('signalsToday')}
              />
            )}
            {tileVisibility.signalsThisWeek && (
              <StatCard
                label="This week"
                value={stats.signalsThisWeek}
                change={stats.signalsThisWeek > 0 ? { value: 8, type: "increase" } : undefined}
                icon={TrendingUp}
                href="/app/search?period=week"
                configurable
                onHide={() => handleHideTile('signalsThisWeek')}
                onRefresh={handleRefreshData}
                onConfigure={() => handleConfigureTile('signalsThisWeek')}
              />
            )}
            {tileVisibility.watchlist && (
              <StatCard
                label="Watchlist"
                value={stats.watchlistCount}
                icon={Eye}
                href="/app/saved"
                configurable
                onHide={() => handleHideTile('watchlist')}
                onConfigure={() => handleConfigureTile('watchlist')}
              />
            )}
            {tileVisibility.alertsTriggered && (
              <StatCard
                label="Alerts triggered"
                value={stats.alertsTriggered}
                change={{ value: 3, type: "neutral" }}
                icon={Bell}
                href="/app/alerts"
                configurable
                onHide={() => handleHideTile('alertsTriggered')}
                onConfigure={() => handleConfigureTile('alertsTriggered')}
              />
            )}
            {tileVisibility.subscribedDatasets && (
              <StatCard
                label="Subscribed datasets"
                value={stats.subscribedDatasets}
                icon={Database}
                href="/app/datasets"
                configurable
                onHide={() => handleHideTile('subscribedDatasets')}
                onConfigure={() => handleConfigureTile('subscribedDatasets')}
              />
            )}
          </>
        )}
      </div>

      {/* Restore Hidden Tiles */}
      {Object.values(tileVisibility).some(v => !v) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Some tiles are hidden.</span>
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0"
            onClick={() => setTileVisibility(defaultTileVisibility)}
          >
            Restore all
          </Button>
        </div>
      )}

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
        {/* Signal Feed */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SignalCardSkeleton key={i} />)
          ) : filteredSignals.length === 0 ? (
            <EmptyState
              variant="search"
              title="No signals found"
              description="Try adjusting your filters or check back later."
              action={{
                label: "Clear filters",
                onClick: handleClearFilters,
              }}
            />
          ) : (
            filteredSignals.map((signal, i) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <GlassCard hover className="group">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Company Avatar */}
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground leading-snug mb-1">
                              {signal.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="text-primary font-medium">{signal.company}</span>
                              <span>·</span>
                              <span>{signal.geo}</span>
                              <span>·</span>
                              <span>{formatTimeAgo(signal.publishedAt)}</span>
                            </div>
                          </div>
                          <Badge
                            variant={categoryColors[signal.category] as any}
                            className="shrink-0"
                          >
                            {signal.category}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                          {signal.summary}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <div className="flex items-center gap-4">
                            {signal.amount && (
                              <Badge variant="high-confidence">
                                {formatAmount(signal.amount, signal.currency)}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{signal.confidence}%</span> confidence · {signal.sourceCount} sources
                            </span>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleBookmark(signal.id)}
                            >
                              {isBookmarked(signal.id) ? (
                                <BookmarkCheck className="w-4 h-4 text-primary" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleShare(signal)}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </div>
      </FilterablePageLayout>

      {/* Tile Configuration Modal */}
      <TileConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        tileType={activeTileType}
        currentPlan={planType}
        onUpgrade={handleUpgrade}
      />

      {/* Contact Sales Modal for Upgrades */}
      <ContactSalesModal
        open={contactSalesOpen}
        onOpenChange={setContactSalesOpen}
        userName={user?.name}
        userEmail={user?.email}
        userCompany={user?.company}
        currentPlan={planType}
        subscriptions={subscriptions}
      />
    </div>
  );
}
