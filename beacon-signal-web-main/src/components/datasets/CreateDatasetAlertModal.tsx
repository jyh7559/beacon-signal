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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Webhook, MessageSquare, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FilterValues } from "@/components/search/UnifiedFilterSidebar";

interface CreateDatasetAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetType: string;
  datasetName: string;
  filterValues: FilterValues;
  searchQuery?: string;
  onSave: (alert: {
    name: string;
    destinations: { type: "email" | "webhook" | "slack"; target: string; enabled: boolean }[];
  }) => void;
}

export function CreateDatasetAlertModal({
  open,
  onOpenChange,
  datasetType,
  datasetName,
  filterValues,
  searchQuery,
  onSave,
}: CreateDatasetAlertModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailTarget, setEmailTarget] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookTarget, setWebhookTarget] = useState("");
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackTarget, setSlackTarget] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Count active filters
  const activeFilterCount = Object.entries(filterValues).filter(([_, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null) {
      const v = value as Record<string, unknown>;
      return Object.values(v).some((val) => val !== undefined && val !== null && val !== "");
    }
    return false;
  }).length;

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Please enter an alert name", variant: "destructive" });
      return;
    }

    const destinations: { type: "email" | "webhook" | "slack"; target: string; enabled: boolean }[] = [];
    if (emailEnabled && emailTarget) {
      destinations.push({ type: "email", target: emailTarget, enabled: true });
    }
    if (webhookEnabled && webhookTarget) {
      destinations.push({ type: "webhook", target: webhookTarget, enabled: true });
    }
    if (slackEnabled && slackTarget) {
      destinations.push({ type: "slack", target: slackTarget, enabled: true });
    }

    if (destinations.length === 0) {
      toast({ title: "Please add at least one notification destination", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      onSave({ name: name.trim(), destinations });
      toast({ title: "Alert created successfully" });
      handleClose();
    } catch (error) {
      toast({ title: "Failed to create alert", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setName("");
    setEmailEnabled(true);
    setEmailTarget("");
    setWebhookEnabled(false);
    setWebhookTarget("");
    setSlackEnabled(false);
    setSlackTarget("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Create Dataset Alert
          </DialogTitle>
          <DialogDescription>
            Get notified when new records match your current filters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Current Filters Summary */}
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Dataset</span>
              <Badge variant="secondary">{datasetName}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Filter Conditions</span>
              <Badge variant="outline" className="gap-1">
                <Filter className="w-3 h-3" />
                {activeFilterCount} active
              </Badge>
            </div>
            {searchQuery && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Search</span>
                <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                  "{searchQuery}"
                </span>
              </div>
            )}
          </div>

          {/* Alert Name */}
          <div className="space-y-2">
            <Label htmlFor="alert-name">Alert Name *</Label>
            <Input
              id="alert-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Tech Layoffs Alert"
              autoFocus
            />
          </div>

          {/* Notification Destinations */}
          <div className="space-y-4">
            <Label>Notification Destinations</Label>

            {/* Email */}
            <div className="rounded-lg border border-border/50 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Email</span>
                </div>
                <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
              </div>
              {emailEnabled && (
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={emailTarget}
                  onChange={(e) => setEmailTarget(e.target.value)}
                />
              )}
            </div>

            {/* Webhook */}
            <div className="rounded-lg border border-border/50 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Webhook</span>
                </div>
                <Switch checked={webhookEnabled} onCheckedChange={setWebhookEnabled} />
              </div>
              {webhookEnabled && (
                <Input
                  placeholder="https://your-webhook-url.com"
                  value={webhookTarget}
                  onChange={(e) => setWebhookTarget(e.target.value)}
                />
              )}
            </div>

            {/* Slack */}
            <div className="rounded-lg border border-border/50 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Slack</span>
                </div>
                <Switch checked={slackEnabled} onCheckedChange={setSlackEnabled} />
              </div>
              {slackEnabled && (
                <Input
                  placeholder="#channel or webhook URL"
                  value={slackTarget}
                  onChange={(e) => setSlackTarget(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            <Bell className="h-4 w-4 mr-2" />
            {isSaving ? "Creating..." : "Create Alert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
