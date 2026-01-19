import { Signal } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Bookmark, ExternalLink, MapPin, Calendar, TrendingUp, Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface SignalCardProps {
  signal: Signal;
  onBookmark?: (signal: Signal) => void;
  isBookmarked?: boolean;
  className?: string;
}

const categoryLabels: Record<string, string> = {
  funding: "Funding",
  ma: "M&A",
  executive: "Executive",
  expansion: "Expansion",
  hiring: "Hiring",
  layoffs: "Layoffs",
  product: "Product",
  partnership: "Partnership",
  breach: "Breach",
  competitor: "Competitor",
};

export function SignalCard({ signal, onBookmark, isBookmarked, className }: SignalCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/app/signals/${signal.id}`);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark?.(signal);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <GlassCard 
      hover 
      className={cn("group cursor-pointer", className)}
      onClick={handleCardClick}
    >
      <GlassCardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Company Avatar */}
          <div className="shrink-0 w-11 h-11 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={signal.category as any}>
                  {categoryLabels[signal.category] || signal.category}
                </Badge>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {signal.geo}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(signal.publishedAt), "MMM d")}
                  </span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleBookmarkClick}
                >
                  <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-primary text-primary")} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" 
                  asChild
                  onClick={handleExternalClick}
                >
                  <a href={signal.urls[0]} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Title & Company */}
            <h3 className="font-semibold text-foreground mb-1 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {signal.title}
            </h3>
            <p className="text-sm text-primary font-medium mb-2">
              {signal.company}
            </p>

            {/* Summary */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {signal.summary}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="font-medium text-foreground">{signal.confidence}%</span> confidence
                </span>
                <span>{signal.sourceCount} sources</span>
              </div>
              {signal.amount && (
                <Badge variant="high-confidence" size="sm">
                  ${(signal.amount / 1000000).toFixed(0)}M
                </Badge>
              )}
            </div>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
