import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Plus,
  Trash2,
  Edit3,
  MoreHorizontal,
  Mail,
  Webhook,
  MessageSquare,
  Zap,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { api } from "@/services/api";
import type { AlertRule, AlertCondition as TypedAlertCondition, AlertDestination } from "@/types";

// Form condition type (more flexible for form state)
interface FormCondition {
  field: string;
  operator: string;
  value: string;
}

const fieldOptions = [
  { value: "category", label: "Category" },
  { value: "company", label: "Company" },
  { value: "keyword", label: "Keyword" },
  { value: "confidence", label: "Confidence" },
  { value: "amount", label: "Amount" },
];

const operatorOptions = [
  { value: "equals", label: "equals" },
  { value: "contains", label: "contains" },
  { value: "greater_than", label: "greater than" },
  { value: "less_than", label: "less than" },
  { value: "in", label: "in" },
];

export default function AlertsPage() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertRule | null>(null);

  // Form state
  const [alertName, setAlertName] = useState("");
  const [conditions, setConditions] = useState<FormCondition[]>([
    { field: "category", operator: "equals", value: "" },
  ]);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailTarget, setEmailTarget] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookTarget, setWebhookTarget] = useState("");
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackTarget, setSlackTarget] = useState("");

  // Load alerts from API
  useEffect(() => {
    const loadAlerts = async () => {
      setIsLoading(true);
      try {
        const data = await api.getAlerts();
        setAlerts(data);
      } catch (error) {
        toast({
          title: "Error loading alerts",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadAlerts();
  }, []);

  const resetForm = () => {
    setAlertName("");
    setConditions([{ field: "category", operator: "equals", value: "" }]);
    setEmailEnabled(true);
    setEmailTarget("");
    setWebhookEnabled(false);
    setWebhookTarget("");
    setSlackEnabled(false);
    setSlackTarget("");
    setEditingAlert(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (alert: AlertRule) => {
    setEditingAlert(alert);
    setAlertName(alert.name);
    // Convert typed conditions to form conditions
    setConditions(alert.conditions.map(c => ({
      field: c.field,
      operator: c.operator,
      value: String(c.value),
    })));
    const emailDest = alert.destinations.find((d) => d.type === "email");
    const webhookDest = alert.destinations.find((d) => d.type === "webhook");
    const slackDest = alert.destinations.find((d) => d.type === "slack");
    setEmailEnabled(!!emailDest?.enabled);
    setEmailTarget(emailDest?.target || "");
    setWebhookEnabled(!!webhookDest?.enabled);
    setWebhookTarget(webhookDest?.target || "");
    setSlackEnabled(!!slackDest?.enabled);
    setSlackTarget(slackDest?.target || "");
    setModalOpen(true);
  };

  const handleToggleAlert = async (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;
    
    // Optimistic update
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
    
    try {
      await api.updateAlert(id, { enabled: !alert.enabled });
    } catch (error) {
      // Revert on error
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, enabled: alert.enabled } : a))
      );
      toast({ title: "Failed to update alert", variant: "destructive" });
    }
  };

  const handleDeleteAlert = async (id: string) => {
    const alertToDelete = alerts.find(a => a.id === id);
    
    // Optimistic update
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    
    try {
      await api.deleteAlert(id);
      toast({ title: "Alert deleted" });
    } catch (error) {
      // Revert on error
      if (alertToDelete) {
        setAlerts((prev) => [...prev, alertToDelete]);
      }
      toast({ title: "Failed to delete alert", variant: "destructive" });
    }
  };

  const addCondition = () => {
    setConditions([...conditions, { field: "category", operator: "equals", value: "" }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<FormCondition>) => {
    setConditions(
      conditions.map((c, i) => (i === index ? { ...c, ...updates } : c))
    );
  };

  const handleSaveAlert = async () => {
    if (!alertName.trim()) {
      toast({ title: "Please enter an alert name", variant: "destructive" });
      return;
    }

    const destinations: AlertDestination[] = [];
    if (emailEnabled && emailTarget) {
      destinations.push({ type: "email", target: emailTarget, enabled: true });
    }
    if (webhookEnabled && webhookTarget) {
      destinations.push({ type: "webhook", target: webhookTarget, enabled: true });
    }
    if (slackEnabled && slackTarget) {
      destinations.push({ type: "slack", target: slackTarget, enabled: true });
    }

    // Convert form conditions to typed conditions
    const typedConditions: TypedAlertCondition[] = conditions.map(c => ({
      field: c.field as TypedAlertCondition['field'],
      operator: c.operator as TypedAlertCondition['operator'],
      value: c.value,
    }));

    setIsSaving(true);

    try {
      if (editingAlert) {
        const updated = await api.updateAlert(editingAlert.id, {
          name: alertName,
          conditions: typedConditions,
          destinations,
        });
        if (updated) {
          setAlerts((prev) =>
            prev.map((a) => (a.id === editingAlert.id ? updated : a))
          );
          toast({ title: "Alert updated" });
        }
      } else {
        const newAlert = await api.createAlert({
          name: alertName,
          conditions: typedConditions,
          destinations,
          enabled: true,
        });
        setAlerts((prev) => [newAlert, ...prev]);
        toast({ title: "Alert created" });
      }

      setModalOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "Failed to save alert", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const getDestinationIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-3.5 h-3.5" />;
      case "webhook":
        return <Webhook className="w-3.5 h-3.5" />;
      case "slack":
        return <MessageSquare className="w-3.5 h-3.5" />;
      default:
        return <Bell className="w-3.5 h-3.5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
            <p className="text-muted-foreground mt-1">
              Get notified when signals match your criteria
            </p>
          </div>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Get notified when signals match your criteria
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Alert List */}
      {alerts.length === 0 ? (
        <EmptyState
          variant="inbox"
          title="No alerts configured"
          description="Create an alert to get notified when new signals match your criteria"
          action={{
            label: "Create Alert",
            onClick: openCreateModal,
          }}
        />
      ) : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <GlassCard
                hover={alert.enabled}
                className={!alert.enabled ? "opacity-60" : ""}
              >
                <GlassCardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">
                        <Switch
                          checked={alert.enabled}
                          onCheckedChange={() => handleToggleAlert(alert.id)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Bell className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-foreground">
                            {alert.name}
                          </h3>
                        </div>

                        {/* Conditions */}
                        <div className="text-sm text-muted-foreground mb-3">
                          <span className="font-medium text-foreground">When: </span>
                          {alert.conditions.map((c, i) => (
                            <span key={i}>
                              {i > 0 && <span className="text-primary"> AND </span>}
                              {c.field} {c.operator} "{c.value}"
                            </span>
                          ))}
                        </div>

                        {/* Destinations */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {alert.destinations.map((dest, i) => (
                            <Badge key={i} variant="secondary" size="sm" className="gap-1.5">
                              {getDestinationIcon(dest.type)}
                              <span className="truncate max-w-[150px]">{dest.target}</span>
                            </Badge>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" />
                            Triggered <span className="font-medium text-foreground">{alert.triggerCount}</span> times
                          </span>
                          {alert.lastTriggeredAt && (
                            <span>
                              Last: {format(new Date(alert.lastTriggeredAt), "MMM d, h:mm a")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(alert)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
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

      {/* Create/Edit Alert Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAlert ? "Edit Alert" : "Create Alert"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="alert-name">Alert Name</Label>
              <Input
                id="alert-name"
                placeholder="e.g., Competitor Funding"
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
              />
            </div>

            {/* Conditions */}
            <div className="space-y-3">
              <Label>Conditions</Label>
              {conditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={condition.field}
                    onValueChange={(v) => updateCondition(index, { field: v })}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={(v) => updateCondition(index, { operator: v })}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Value"
                    value={condition.value}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                    className="flex-1"
                  />

                  {conditions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => removeCondition(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCondition}>
                <Plus className="w-4 h-4 mr-1" />
                Add Condition
              </Button>
            </div>

            {/* Delivery */}
            <div className="space-y-4">
              <Label>Delivery</Label>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="email-delivery"
                    checked={emailEnabled}
                    onCheckedChange={(c) => setEmailEnabled(!!c)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="email-delivery" className="font-normal cursor-pointer flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email
                    </Label>
                    {emailEnabled && (
                      <Input
                        placeholder="email@company.com"
                        value={emailTarget}
                        onChange={(e) => setEmailTarget(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="webhook-delivery"
                    checked={webhookEnabled}
                    onCheckedChange={(c) => setWebhookEnabled(!!c)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="webhook-delivery" className="font-normal cursor-pointer flex items-center gap-2">
                      <Webhook className="w-4 h-4 text-muted-foreground" />
                      Webhook
                    </Label>
                    {webhookEnabled && (
                      <Input
                        placeholder="https://..."
                        value={webhookTarget}
                        onChange={(e) => setWebhookTarget(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="slack-delivery"
                    checked={slackEnabled}
                    onCheckedChange={(c) => setSlackEnabled(!!c)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="slack-delivery" className="font-normal cursor-pointer flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      Slack
                    </Label>
                    {slackEnabled && (
                      <Input
                        placeholder="#channel"
                        value={slackTarget}
                        onChange={(e) => setSlackTarget(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAlert} disabled={isSaving}>
              {isSaving ? "Saving..." : editingAlert ? "Save Changes" : "Create Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}