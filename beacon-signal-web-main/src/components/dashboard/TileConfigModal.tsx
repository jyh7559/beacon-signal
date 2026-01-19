import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  TrendingUp,
  Eye,
  Bell,
  Database,
  Settings2,
  Sparkles,
  ArrowUpRight,
  Calendar,
  Filter,
  RefreshCw,
  LucideIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type TileType = 
  | "signalsToday"
  | "signalsThisWeek"
  | "watchlist"
  | "alertsTriggered"
  | "subscribedDatasets";

interface TileConfig {
  showPercentageChange: boolean;
  autoRefresh: boolean;
  refreshInterval: string;
  filterCategory?: string;
  alertThreshold?: number;
}

interface TileConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tileType: TileType;
  currentPlan?: string;
  onUpgrade?: () => void;
  onSaveConfig?: (config: TileConfig) => void;
}

const tileInfo: Record<TileType, { 
  title: string; 
  icon: LucideIcon; 
  description: string;
  upgradeFeatures?: string[];
}> = {
  signalsToday: {
    title: "Signals Today",
    icon: Zap,
    description: "Track new signals discovered today across all categories",
    upgradeFeatures: ["Real-time signal notifications", "Custom category filters", "API access"],
  },
  signalsThisWeek: {
    title: "This Week",
    icon: TrendingUp,
    description: "Weekly signal trends and comparison with previous periods",
    upgradeFeatures: ["Historical trend analysis", "Export weekly reports", "Custom date ranges"],
  },
  watchlist: {
    title: "Watchlist",
    icon: Eye,
    description: "Companies and signals you're actively monitoring",
    upgradeFeatures: ["Unlimited bookmarks", "Team sharing", "Folder organization"],
  },
  alertsTriggered: {
    title: "Alerts Triggered",
    icon: Bell,
    description: "Notifications based on your custom alert rules",
    upgradeFeatures: ["Unlimited alerts", "Webhook integrations", "Slack notifications"],
  },
  subscribedDatasets: {
    title: "Subscribed Datasets",
    icon: Database,
    description: "Datasets included in your current subscription",
    upgradeFeatures: ["Access all datasets", "Full data download", "API integration"],
  },
};

export function TileConfigModal({
  open,
  onOpenChange,
  tileType,
  currentPlan = "Trial",
  onUpgrade,
  onSaveConfig,
}: TileConfigModalProps) {
  const { toast } = useToast();
  const info = tileInfo[tileType];
  const Icon = info.icon;

  const [config, setConfig] = useState<TileConfig>({
    showPercentageChange: true,
    autoRefresh: false,
    refreshInterval: "5",
    filterCategory: "all",
    alertThreshold: 10,
  });

  const isPaidPlan = currentPlan !== "Trial";

  const handleSave = () => {
    onSaveConfig?.(config);
    toast({ title: "Configuration saved" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            Configure {info.title}
          </DialogTitle>
          <DialogDescription>{info.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Display Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Display Options
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-change" className="text-sm text-muted-foreground">
                  Show percentage change
                </Label>
                <Switch
                  id="show-change"
                  checked={config.showPercentageChange}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, showPercentageChange: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh" className="text-sm text-muted-foreground">
                  Auto-refresh data
                </Label>
                <Switch
                  id="auto-refresh"
                  checked={config.autoRefresh}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, autoRefresh: checked }))
                  }
                />
              </div>

              {config.autoRefresh && (
                <div className="flex items-center justify-between pl-4">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh interval
                  </Label>
                  <Select 
                    value={config.refreshInterval}
                    onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, refreshInterval: value }))
                    }
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 min</SelectItem>
                      <SelectItem value="5">5 min</SelectItem>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Tile-Specific Options */}
          {(tileType === "signalsToday" || tileType === "signalsThisWeek") && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Options
              </h4>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Default category</Label>
                <Select 
                  value={config.filterCategory}
                  onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, filterCategory: value }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="funding">Funding</SelectItem>
                    <SelectItem value="ma">M&A</SelectItem>
                    <SelectItem value="executive">CXO</SelectItem>
                    <SelectItem value="expansion">Expansion</SelectItem>
                    <SelectItem value="hiring">Hiring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {tileType === "alertsTriggered" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Alert Settings
              </h4>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">
                  Alert threshold (highlight if &gt;)
                </Label>
                <Select 
                  value={String(config.alertThreshold)}
                  onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, alertThreshold: parseInt(value) }))
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {tileType === "subscribedDatasets" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Subscription Info
              </h4>
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current plan</span>
                  <Badge variant="outline">{currentPlan}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click "Upgrade" below to access more datasets and features.
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Upgrade Prompt */}
          {!isPaidPlan && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Unlock more with a paid plan
                </span>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {info.upgradeFeatures?.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <ArrowUpRight className="h-3 w-3 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                size="sm" 
                className="w-full mt-2"
                onClick={() => {
                  onUpgrade?.();
                  onOpenChange(false);
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
