import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Calendar,
  FileText,
} from "lucide-react";
import type { DataSourceInfo } from "@/types";

interface DataAuthenticityPanelProps {
  sourceInfo: DataSourceInfo;
}

export function DataAuthenticityPanel({
  sourceInfo,
}: DataAuthenticityPanelProps) {
  const getQualityIcon = () => {
    switch (sourceInfo.dataQuality) {
      case "verified":
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case "disputed":
        return <ShieldAlert className="w-4 h-4 text-destructive" />;
      default:
        return <Shield className="w-4 h-4 text-amber-500" />;
    }
  };

  const getQualityBadge = () => {
    switch (sourceInfo.dataQuality) {
      case "verified":
        return (
          <Badge variant="teal" size="sm" className="gap-1">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </Badge>
        );
      case "disputed":
        return (
          <Badge variant="destructive" size="sm" className="gap-1">
            <ShieldAlert className="w-3 h-3" />
            Disputed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" size="sm" className="gap-1 text-amber-600 border-amber-600/30">
            <Shield className="w-3 h-3" />
            Unverified
          </Badge>
        );
    }
  };

  const getConfidenceColor = () => {
    if (sourceInfo.confidenceScore >= 80) return "bg-emerald-500";
    if (sourceInfo.confidenceScore >= 60) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
      <div className="flex items-center gap-2">
        {getQualityIcon()}
        <h4 className="font-semibold text-sm">Data Authenticity</h4>
      </div>

      {/* Confidence Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Confidence Score</span>
          <span className="font-semibold">{sourceInfo.confidenceScore}%</span>
        </div>
        <div className="relative">
          <Progress
            value={sourceInfo.confidenceScore}
            className="h-2"
          />
          <div
            className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getConfidenceColor()}`}
            style={{ width: `${sourceInfo.confidenceScore}%` }}
          />
        </div>
      </div>

      {/* Status & Last Updated */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getQualityBadge()}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {new Date(sourceInfo.lastUpdated).toLocaleDateString()}
        </div>
      </div>

      <Separator />

      {/* Sources */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Sources ({sourceInfo.sources.length})
        </div>
        <div className="space-y-1.5">
          {sourceInfo.sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-lg bg-background/50 hover:bg-background transition-colors text-sm group"
            >
              <span className="truncate">{source.name}</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary flex-shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Interpretation */}
      {sourceInfo.interpretation && (
        <>
          <Separator />
          <div className="space-y-2">
            <h5 className="text-sm font-medium">Interpretation</h5>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {sourceInfo.interpretation}
            </p>
          </div>
        </>
      )}

      {/* Methodology */}
      {sourceInfo.methodology && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Methodology: </span>
          {sourceInfo.methodology}
        </div>
      )}
    </div>
  );
}
