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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FilterValues } from "@/components/search/UnifiedFilterSidebar";

interface SaveDatasetSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetType: string;
  datasetName: string;
  filterValues: FilterValues;
  searchQuery?: string;
  onSave: (name: string, description?: string) => void;
}

export function SaveDatasetSearchModal({
  open,
  onOpenChange,
  datasetType,
  datasetName,
  filterValues,
  searchQuery,
  onSave,
}: SaveDatasetSearchModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
      toast({ title: "Please enter a name", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      onSave(name.trim(), description.trim() || undefined);
      toast({ title: "Search saved successfully" });
      onOpenChange(false);
      setName("");
      setDescription("");
    } catch (error) {
      toast({ title: "Failed to save search", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Save Dataset Search
          </DialogTitle>
          <DialogDescription>
            Save your current filters to quickly access this search later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Search Summary */}
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Dataset</span>
              <Badge variant="secondary">{datasetName}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Active Filters</span>
              <Badge variant="outline" className="gap-1">
                <Filter className="w-3 h-3" />
                {activeFilterCount}
              </Badge>
            </div>
            {searchQuery && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Search Query</span>
                <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                  "{searchQuery}"
                </span>
              </div>
            )}
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="search-name">Name *</Label>
            <Input
              id="search-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tech Companies Layoffs 2024"
              autoFocus
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="search-description">Description (optional)</Label>
            <Textarea
              id="search-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this search..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Search"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
