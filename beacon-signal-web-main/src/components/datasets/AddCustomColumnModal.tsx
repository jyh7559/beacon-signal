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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Calculator, MessageSquare, Link2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddCustomColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetName: string;
}

type ColumnType = "computed" | "requested" | "linked";

export function AddCustomColumnModal({
  open,
  onOpenChange,
  datasetName,
}: AddCustomColumnModalProps) {
  const { toast } = useToast();
  const [columnType, setColumnType] = useState<ColumnType>("requested");
  const [columnName, setColumnName] = useState("");
  const [description, setDescription] = useState("");
  const [formula, setFormula] = useState("");

  const handleSubmit = () => {
    if (!columnName.trim()) {
      toast({ title: "Please enter a column name", variant: "destructive" });
      return;
    }

    // In a real app, this would call an API
    toast({
      title: "Request submitted",
      description:
        columnType === "requested"
          ? "Our data team will review your request"
          : "Custom column will be processed",
    });

    setColumnName("");
    setDescription("");
    setFormula("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Add Custom Column
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Column Type Selection */}
          <div className="space-y-3">
            <Label>Column Type</Label>
            <RadioGroup
              value={columnType}
              onValueChange={(v) => setColumnType(v as ColumnType)}
              className="grid gap-3"
            >
              <label
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  columnType === "requested"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80"
                }`}
              >
                <RadioGroupItem value="requested" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="font-medium">Request New Data</span>
                    <Badge variant="secondary" size="sm">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submit a request for our data team to add new fields
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  columnType === "computed"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80"
                }`}
              >
                <RadioGroupItem value="computed" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-primary" />
                    <span className="font-medium">Computed Column</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create a formula-based column from existing data
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  columnType === "linked"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80"
                }`}
              >
                <RadioGroupItem value="linked" className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-primary" />
                    <span className="font-medium">Link External Data</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Connect data from another dataset or source
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Column Name */}
          <div className="space-y-2">
            <Label htmlFor="column-name">Column Name</Label>
            <Input
              id="column-name"
              placeholder="e.g., Revenue Growth Rate"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
            />
          </div>

          {/* Type-specific fields */}
          {columnType === "requested" && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what data you need and why it would be valuable..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Our team typically responds within 2-3 business days
              </p>
            </div>
          )}

          {columnType === "computed" && (
            <div className="space-y-2">
              <Label htmlFor="formula">Formula</Label>
              <Textarea
                id="formula"
                placeholder="e.g., amount / valuation * 100"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="font-mono text-sm"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Use field names from the dataset. Supports basic math operations.
              </p>
            </div>
          )}

          {columnType === "linked" && (
            <div className="space-y-2">
              <Label htmlFor="link-description">Link Configuration</Label>
              <Textarea
                id="link-description"
                placeholder="Describe which dataset or external source you want to link and the matching criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Dataset Context */}
          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <span className="text-muted-foreground">Adding column to: </span>
            <span className="font-medium">{datasetName}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {columnType === "requested" ? "Submit Request" : "Create Column"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
