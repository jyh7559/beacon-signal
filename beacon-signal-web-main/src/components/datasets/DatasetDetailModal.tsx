import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Table, Code, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Dataset } from "@/types";

interface DatasetDetailModalProps {
  dataset: Dataset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeColors: Record<string, string> = {
  string: "text-emerald-500",
  number: "text-blue-500",
  boolean: "text-amber-500",
  date: "text-purple-500",
  array: "text-rose-500",
  object: "text-cyan-500",
};

export function DatasetDetailModal({ dataset, open, onOpenChange }: DatasetDetailModalProps) {
  const { toast } = useToast();
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);

  if (!dataset) return null;

  const endpoint = `https://api.intellizence.io/v1/${dataset.id}`;

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(endpoint);
    setCopiedEndpoint(true);
    toast({ title: "Endpoint copied" });
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(JSON.stringify(dataset.sampleRecord, null, 2));
    setCopiedSample(true);
    toast({ title: "Sample data copied" });
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const formatRecordCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{dataset.name}</DialogTitle>
              <Badge
                variant={dataset.updateFrequency === "realtime" ? "realtime" : "secondary"}
                size="sm"
              >
                {dataset.updateFrequency === "realtime" ? "Real-time" : dataset.updateFrequency}
              </Badge>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {formatRecordCount(dataset.recordCount)} records
            </span>
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{dataset.description}</p>

        {/* Endpoint */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
          <code className="flex-1 text-xs font-mono text-muted-foreground truncate">
            {endpoint}
          </code>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyEndpoint}>
            {copiedEndpoint ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <Tabs defaultValue="schema" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="schema" className="gap-2">
              <Table className="w-4 h-4" />
              Schema
            </TabsTrigger>
            <TabsTrigger value="sample" className="gap-2">
              <Code className="w-4 h-4" />
              Sample Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schema" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {dataset.fields.map((field) => (
                  <div
                    key={field.name}
                    className="p-3 rounded-lg bg-secondary/30 border border-border/30"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <code className="font-mono text-sm font-medium text-foreground">
                        {field.name}
                      </code>
                      <span className={`text-xs font-mono ${typeColors[field.type] || "text-muted-foreground"}`}>
                        {field.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{field.description}</p>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Example: </span>
                      <code className="font-mono text-foreground/80">{field.example}</code>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sample" className="mt-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 z-10"
                onClick={handleCopySample}
              >
                {copiedSample ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <ScrollArea className="h-[300px]">
                <pre className="p-4 rounded-lg bg-secondary/30 border border-border/30 text-xs font-mono overflow-x-auto">
                  {JSON.stringify(dataset.sampleRecord, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="flex-1 gap-2">
            <ExternalLink className="w-4 h-4" />
            API Documentation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
