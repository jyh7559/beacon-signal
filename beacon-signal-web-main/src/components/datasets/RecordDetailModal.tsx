import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataAuthenticityPanel } from "./DataAuthenticityPanel";
import type { DatasetField, DatasetRecord, DataSourceInfo } from "@/types";

interface RecordDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: DatasetRecord | null;
  fields: DatasetField[];
  currentIndex: number;
  totalRecords: number;
  onNavigate: (direction: "prev" | "next") => void;
}

export function RecordDetailModal({
  open,
  onOpenChange,
  record,
  fields,
  currentIndex,
  totalRecords,
  onNavigate,
}: RecordDetailModalProps) {
  const { toast } = useToast();

  if (!record) return null;

  const sourceInfo = record._sourceInfo as DataSourceInfo | undefined;

  const formatFieldName = (name: string) =>
    name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    if (typeof value === "number") {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    }
    return String(value);
  };

  const isUrl = (fieldName: string) =>
    fieldName.toLowerCase().includes("url") ||
    fieldName.toLowerCase().includes("website");

  const handleCopy = () => {
    const text = fields
      .filter((f) => !f.name.startsWith("_"))
      .map((f) => `${formatFieldName(f.name)}: ${formatValue(record[f.name])}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Record copied to clipboard" });
  };

  const handleExport = () => {
    const exportData = { ...record };
    delete exportData._sourceInfo;
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `record-${currentIndex + 1}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Record exported" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between pr-8">
            <span>Record Details</span>
            <span className="text-sm font-normal text-muted-foreground">
              {currentIndex + 1} of {totalRecords}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("prev")}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("next")}
              disabled={currentIndex >= totalRecords - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <Separator />

          {/* Record Fields */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-4 pr-4">
              {/* Data Authenticity Panel */}
              {sourceInfo && (
                <>
                  <DataAuthenticityPanel sourceInfo={sourceInfo} />
                  <Separator />
                </>
              )}

              {/* Fields */}
              {fields
                .filter((f) => !f.name.startsWith("_"))
                .map((field) => {
                  const value = record[field.name];
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {formatFieldName(field.name)}
                        </span>
                        <Badge
                          variant="outline"
                          size="sm"
                          className="text-[10px] font-mono"
                        >
                          {field.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-foreground bg-muted/30 rounded-lg p-3 break-words">
                        {isUrl(field.name) && value ? (
                          <a
                            href={String(value)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {String(value)}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="whitespace-pre-wrap">
                            {formatValue(value)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </ScrollArea>

          <Separator />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
