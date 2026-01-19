import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Eye,
  Copy,
  Check,
  Lock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { datasetsApi } from "@/services/api/datasets.api";

export default function DatasetsCatalogPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscriptions } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Get all datasets from config (synchronous)
  const datasets = useMemo(() => datasetsApi.getAllDatasets(), []);

  // Check if user has access to a dataset
  const hasDatasetAccess = (datasetId: string, apiResource: string) => {
    return subscriptions.some(sub => sub.resource === apiResource);
  };

  const filteredDatasets = useMemo(() => 
    datasets.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [datasets, searchQuery]
  );

  const handleCopyEndpoint = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const dataset = datasets.find(d => d.id === id);
    if (dataset) {
      navigator.clipboard.writeText(`https://api.intellizence.io/v1/${dataset.apiResource}`);
      setCopiedId(id);
      toast({ title: "Endpoint copied" });
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleViewData = (datasetId: string) => {
    navigate(`/app/datasets/${datasetId}`);
  };

  const handleUpgrade = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/app/settings?tab=plan");
  };

  // Count subscribed datasets
  const subscribedCount = datasets.filter(d => hasDatasetAccess(d.id, d.apiResource)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Datasets</h1>
          <p className="text-muted-foreground mt-1">
            Explore available data feeds and API endpoints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            {subscribedCount} of {datasets.length} subscribed
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search datasets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {/* Dataset Grid */}
      <motion.div
        className="grid gap-4 md:grid-cols-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {filteredDatasets.map((dataset, index) => {
          const IconComponent = dataset.icon;
          const columnCount = dataset.columns.length;
          const visibleColumnCount = dataset.columns.filter(c => c.visible).length;
          const isSubscribed = hasDatasetAccess(dataset.id, dataset.apiResource);
          const requiredPlan = dataset.requiredPlan || 'Pro';
          const premiumColumnCount = dataset.premiumColumns?.length || 0;
          
          return (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <GlassCard 
                hover 
                className={`h-full cursor-pointer relative ${!isSubscribed ? 'opacity-90' : ''}`} 
                onClick={() => handleViewData(dataset.id)}
              >
                {/* Subscription Status Indicator */}
                {isSubscribed ? (
                  <div className="absolute top-3 right-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-medium text-primary">Subscribed</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>You have full access to this dataset</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <div className="absolute top-3 right-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted border border-border">
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">{requiredPlan}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Requires {requiredPlan} plan to access</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

                <GlassCardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg border ${isSubscribed ? 'bg-primary/10 border-primary/20' : 'bg-muted/50 border-border/50'}`}>
                        <IconComponent className={`w-5 h-5 ${isSubscribed ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <GlassCardTitle className="text-base">
                          {dataset.name}
                        </GlassCardTitle>
                        <Badge
                          variant="realtime"
                          size="sm"
                          className="mt-1.5"
                        >
                          Real-time
                        </Badge>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground mt-8">
                      {columnCount} fields
                    </span>
                  </div>
                </GlassCardHeader>
                <GlassCardContent className="pt-0 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {dataset.description}
                  </p>

                  {/* Fields Preview */}
                  <div className="flex flex-wrap gap-1.5">
                    {dataset.columns.filter(c => c.visible).slice(0, 4).map((column) => {
                      const isPremium = dataset.premiumColumns?.includes(column.key);
                      return (
                        <TooltipProvider key={column.key}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="outline" 
                                size="sm" 
                                className={`font-mono text-xs ${isPremium && !isSubscribed ? 'opacity-60' : ''}`}
                              >
                                {isPremium && !isSubscribed && <Lock className="w-2.5 h-2.5 mr-1" />}
                                {column.label}
                              </Badge>
                            </TooltipTrigger>
                            {isPremium && !isSubscribed && (
                              <TooltipContent>
                                <p>Premium column - requires {requiredPlan} plan</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                    {visibleColumnCount > 4 && (
                      <Badge variant="outline" size="sm" className="text-xs">
                        +{visibleColumnCount - 4} more
                      </Badge>
                    )}
                    {premiumColumnCount > 0 && !isSubscribed && (
                      <Badge variant="secondary" size="sm" className="text-xs gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        {premiumColumnCount} premium
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {isSubscribed ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewData(dataset.id);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          View Data
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleCopyEndpoint(e, dataset.id)}
                          className="w-10"
                        >
                          {copiedId === dataset.id ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewData(dataset.id);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Preview
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleUpgrade}
                          className="gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Upgrade
                        </Button>
                      </>
                    )}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* No Results */}
      {filteredDatasets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No datasets found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
