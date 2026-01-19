import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Check, X, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DatasetField, DatasetRecord } from "@/types";

interface RecordCompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: DatasetRecord[];
  fields: DatasetField[];
}

export function RecordCompareModal({
  open,
  onOpenChange,
  records,
  fields,
}: RecordCompareModalProps) {
  const { toast } = useToast();

  const formatFieldName = (name: string) =>
    name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "number") {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    }
    return String(value);
  };

  const valuesAreSame = (field: DatasetField) => {
    if (records.length < 2) return true;
    const firstValue = JSON.stringify(records[0][field.name]);
    return records.every((r) => JSON.stringify(r[field.name]) === firstValue);
  };

  const handleExport = () => {
    const data = {
      comparedAt: new Date().toISOString(),
      recordCount: records.length,
      records: records.map((r) => {
        const filtered: Record<string, unknown> = {};
        fields.forEach((f) => {
          filtered[f.name] = r[f.name];
        });
        return filtered;
      }),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comparison-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Comparison exported" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>Compare {records.length} Records</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-3 font-semibold border-b border-border/50 min-w-[150px]">
                    Field
                  </th>
                  {records.map((_, idx) => (
                    <th
                      key={idx}
                      className="text-left p-3 font-semibold border-b border-border/50 min-w-[200px]"
                    >
                      Record {idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields
                  .filter((f) => !f.name.startsWith("_"))
                  .map((field) => {
                    const isSame = valuesAreSame(field);
                    return (
                      <tr
                        key={field.name}
                        className={`border-b border-border/30 ${
                          !isSame ? "bg-amber-500/5" : ""
                        }`}
                      >
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-2">
                            <span>{formatFieldName(field.name)}</span>
                            {!isSame && (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-amber-600 border-amber-600/30"
                              >
                                Differs
                              </Badge>
                            )}
                          </div>
                        </td>
                        {records.map((record, idx) => (
                          <td key={idx} className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[180px]">
                                {formatValue(record[field.name])}
                              </span>
                              {!isSame && (
                                <span className="flex-shrink-0">
                                  {idx === 0 ? (
                                    <Minus className="w-3 h-3 text-muted-foreground" />
                                  ) : JSON.stringify(record[field.name]) ===
                                    JSON.stringify(records[0][field.name]) ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <X className="w-3 h-3 text-amber-500" />
                                  )}
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Minus className="w-3 h-3" /> Reference
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" /> Same
            </span>
            <span className="flex items-center gap-1">
              <X className="w-3 h-3 text-amber-500" /> Different
            </span>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
