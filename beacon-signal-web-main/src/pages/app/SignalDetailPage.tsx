import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import {
  ArrowLeft,
  Bookmark,
  Share2,
  ExternalLink,
  Building2,
  MapPin,
  Calendar,
  TrendingUp,
  Globe,
  Users,
  Link2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { format } from "date-fns";
import type { Signal } from "@/types";
import { useBookmarks } from "@/hooks/useBookmarks";

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

export default function SignalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedSignals, setRelatedSignals] = useState<Signal[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const signalData = await api.getSignalById(id);
        setSignal(signalData);
        
        if (signalData) {
          // Fetch related signals (same category or company)
          const { data } = await api.getSignals({ 
            categories: [signalData.category], 
            pageSize: 4 
          });
          setRelatedSignals(data.filter(s => s.id !== id).slice(0, 3));
        }
      } catch (error) {
        toast({ title: "Failed to load signal", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, toast]);

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  };

  const handleBookmark = () => {
    if (signal) {
      toggleBookmark(signal.id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Signal not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBookmark}
            className="gap-2"
          >
            <Bookmark className={isBookmarked(signal.id) ? "w-4 h-4 fill-primary text-primary" : "w-4 h-4"} />
            {isBookmarked(signal.id) ? "Saved" : "Save"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard>
          <GlassCardContent className="p-6 sm:p-8">
            {/* Category & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant={signal.category as any} size="lg">
                {categoryLabels[signal.category] || signal.category}
              </Badge>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {signal.geo}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(signal.publishedAt), "MMMM d, yyyy")}
                </span>
              </div>
            </div>

            {/* Company */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-primary">{signal.company}</p>
                <p className="text-sm text-muted-foreground">Company</p>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">
              {signal.title}
            </h1>

            {/* Amount if funding */}
            {signal.amount && (
              <div className="flex items-center gap-2 mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-3xl font-bold text-primary">
                  ${(signal.amount / 1000000).toFixed(0)}M
                </span>
                <span className="text-muted-foreground">{signal.currency || "USD"}</span>
              </div>
            )}

            {/* Summary */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Summary
              </h2>
              <p className="text-foreground leading-relaxed">
                {signal.summary}
              </p>
            </div>

            {/* Confidence & Sources */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Confidence Score</span>
                </div>
                <span className="text-2xl font-bold text-foreground">{signal.confidence}%</span>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Sources Verified</span>
                </div>
                <span className="text-2xl font-bold text-foreground">{signal.sourceCount}</span>
              </div>
            </div>

            {/* Sources */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Sources
              </h2>
              <div className="space-y-2">
                {signal.urls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors group"
                  >
                    <Link2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground truncate flex-1">
                      {url.replace(/^https?:\/\//, "").split("/")[0]}
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </motion.div>

      {/* Related Signals */}
      {relatedSignals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Related Signals</h2>
          <div className="grid gap-4">
            {relatedSignals.map((relatedSignal) => (
              <GlassCard 
                key={relatedSignal.id} 
                hover 
                className="cursor-pointer"
                onClick={() => navigate(`/app/signals/${relatedSignal.id}`)}
              >
                <GlassCardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={relatedSignal.category as any} size="sm">
                          {categoryLabels[relatedSignal.category]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(relatedSignal.publishedAt), "MMM d")}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground line-clamp-1">{relatedSignal.title}</h3>
                      <p className="text-sm text-primary">{relatedSignal.company}</p>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
