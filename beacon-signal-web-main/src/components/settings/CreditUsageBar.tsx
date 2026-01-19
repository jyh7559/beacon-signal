import { cn } from "@/lib/utils";

export interface CreditUsage {
  label: string;
  used: number;
  total: number;
  unit?: string;
}

interface CreditUsageBarProps {
  usage: CreditUsage;
}

export function CreditUsageBar({ usage }: CreditUsageBarProps) {
  const percentage = Math.min((usage.used / usage.total) * 100, 100);
  
  const getColorClass = (pct: number) => {
    if (pct >= 80) return "bg-destructive";
    if (pct >= 50) return "bg-amber-500";
    return "bg-primary";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium">{usage.label}</span>
        <span className="text-muted-foreground">
          {formatNumber(usage.used)} / {formatNumber(usage.total)} {usage.unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary border border-border overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColorClass(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface CreditUsageListProps {
  usages: CreditUsage[];
  resetDate: string;
  daysUntilReset: number;
}

export function CreditUsageList({ usages, resetDate, daysUntilReset }: CreditUsageListProps) {
  return (
    <div className="space-y-4">
      {usages.map((usage, index) => (
        <CreditUsageBar key={index} usage={usage} />
      ))}
      <p className="text-xs text-muted-foreground pt-2">
        Resets: {resetDate} ({daysUntilReset} days)
      </p>
    </div>
  );
}
