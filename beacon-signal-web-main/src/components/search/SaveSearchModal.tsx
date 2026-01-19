import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchParams } from "@/types";
import { Badge } from "@/components/ui/badge";

interface SaveSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SearchParams;
  onSave: (name: string) => void;
}

export function SaveSearchModal({
  open,
  onOpenChange,
  filters,
  onSave,
}: SaveSearchModalProps) {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName("");
      onOpenChange(false);
    }
  };

  const activeFilters = [
    ...(filters.categories?.map((c) => `Category: ${c}`) || []),
    ...(filters.geos?.map((g) => `Geo: ${g}`) || []),
    ...(filters.confidenceMin ? [`Confidence: ≥${filters.confidenceMin}%`] : []),
    ...(filters.query ? [`Query: "${filters.query}"`] : []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">Search Name</Label>
            <Input
              id="search-name"
              placeholder="e.g., AI Funding Rounds"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          {activeFilters.length > 0 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {filter}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
