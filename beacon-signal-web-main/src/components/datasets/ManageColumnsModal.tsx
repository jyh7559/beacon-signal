import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Lock, Crown, Search, Plus } from "lucide-react";
import { AddCustomColumnModal } from "./AddCustomColumnModal";
import type { DatasetField } from "@/types";

interface ManageColumnsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: DatasetField[];
  selectedColumns: string[];
  onColumnsChange: (columns: string[]) => void;
  datasetName?: string;
}

const REQUIRED_COLUMNS = ["company_name", "company", "acquirer", "person_name", "partner_1", "product_name"];
const PREMIUM_COLUMNS = ["valuation", "investment", "deal_value", "growth_rate"];

export function ManageColumnsModal({
  open,
  onOpenChange,
  fields,
  selectedColumns,
  onColumnsChange,
  datasetName = "Dataset",
}: ManageColumnsModalProps) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedColumns);
  const [searchQuery, setSearchQuery] = useState("");
  const [customColumnModalOpen, setCustomColumnModalOpen] = useState(false);

  useEffect(() => {
    setLocalSelected(selectedColumns);
    setSearchQuery("");
  }, [selectedColumns, open]);

  const requiredFields = fields.filter(f => 
    REQUIRED_COLUMNS.some(req => f.name.toLowerCase().includes(req.toLowerCase()))
  );
  const optionalFields = fields.filter(f => 
    !REQUIRED_COLUMNS.some(req => f.name.toLowerCase().includes(req.toLowerCase()))
  );

  const filteredOptionalFields = useMemo(() => {
    if (!searchQuery) return optionalFields;
    const q = searchQuery.toLowerCase();
    return optionalFields.filter(f => 
      f.name.toLowerCase().includes(q) || 
      f.description?.toLowerCase().includes(q)
    );
  }, [optionalFields, searchQuery]);

  const handleToggle = (fieldName: string) => {
    if (REQUIRED_COLUMNS.some(req => fieldName.toLowerCase().includes(req.toLowerCase()))) {
      return;
    }
    setLocalSelected(prev =>
      prev.includes(fieldName)
        ? prev.filter(c => c !== fieldName)
        : [...prev, fieldName]
    );
  };

  const handleSelectAll = () => {
    setLocalSelected(fields.map(f => f.name));
  };

  const handleDeselectOptional = () => {
    setLocalSelected(requiredFields.map(f => f.name));
  };

  const handleDone = () => {
    onColumnsChange(localSelected);
    onOpenChange(false);
  };

  const isPremium = (fieldName: string) => 
    PREMIUM_COLUMNS.some(p => fieldName.toLowerCase().includes(p.toLowerCase()));

  const formatFieldName = (name: string) =>
    name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Columns</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectOptional}>
                Required Only
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto gap-1"
                onClick={() => setCustomColumnModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add Custom
              </Button>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {/* Required Columns */}
              {requiredFields.length > 0 && !searchQuery && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">Required Columns</h4>
                    <Badge variant="secondary" size="sm">Always visible</Badge>
                  </div>
                  <div className="space-y-2">
                    {requiredFields.map((field) => (
                      <div
                        key={field.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox checked disabled className="opacity-50" />
                          <div>
                            <span className="text-sm font-medium">{formatFieldName(field.name)}</span>
                            <Badge variant="outline" size="sm" className="ml-2 text-[10px] font-mono">
                              {field.type}
                            </Badge>
                          </div>
                        </div>
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!searchQuery && <Separator className="my-4" />}

              {/* Optional Columns */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    {searchQuery ? "Search Results" : "Optional Columns"}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {localSelected.length - requiredFields.length} of {optionalFields.length} selected
                  </span>
                </div>
                {filteredOptionalFields.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No columns found</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2"
                      onClick={() => setCustomColumnModalOpen(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Request a new column
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredOptionalFields.map((field) => (
                      <div
                        key={field.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/30 hover:border-border/60 transition-colors cursor-pointer"
                        onClick={() => handleToggle(field.name)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={localSelected.includes(field.name)}
                            onCheckedChange={() => handleToggle(field.name)}
                          />
                          <div>
                            <span className="text-sm font-medium">{formatFieldName(field.name)}</span>
                            <Badge variant="outline" size="sm" className="ml-2 text-[10px] font-mono">
                              {field.type}
                            </Badge>
                          </div>
                        </div>
                        {isPremium(field.name) && (
                          <Badge variant="teal" size="sm" className="gap-1">
                            <Crown className="w-3 h-3" />
                            Pro
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleDone}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddCustomColumnModal
        open={customColumnModalOpen}
        onOpenChange={setCustomColumnModalOpen}
        datasetName={datasetName}
      />
    </>
  );
}
