import { cn } from "@/lib/utils";
import { LucideIcon, ArrowRight, MoreVertical, EyeOff, Settings2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface TileConfigOption {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: LucideIcon;
  className?: string;
  href?: string;
  onClick?: () => void;
  configurable?: boolean;
  onHide?: () => void;
  onConfigure?: () => void;
  onRefresh?: () => void;
  configOptions?: TileConfigOption[];
}

export function StatCard({ 
  label, 
  value, 
  change, 
  icon: Icon, 
  className, 
  href, 
  onClick,
  configurable = false,
  onHide,
  onConfigure,
  onRefresh,
  configOptions,
}: StatCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const isClickable = !!href || !!onClick;
  const showConfigMenu = configurable || onHide || onConfigure || onRefresh || (configOptions && configOptions.length > 0);

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        "relative rounded-xl bg-card/70 backdrop-blur-xl border border-border/40 p-5 transition-all duration-200 hover:bg-card/85 hover:border-border/60 hover:shadow-lg hover:shadow-primary/5 overflow-hidden group",
        isClickable && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50",
        className
      )}
    >
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Config Menu - Always visible with subtle styling */}
      {showConfigMenu && (
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 bg-muted/50 hover:bg-muted border border-border/50 shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {onConfigure && (
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onConfigure(); }}
                  className="font-medium"
                >
                  <Settings2 className="h-4 w-4 mr-2 text-primary" />
                  Configure tile
                </DropdownMenuItem>
              )}
              {onRefresh && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRefresh(); }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh data
                </DropdownMenuItem>
              )}
              {configOptions?.map((option, idx) => (
                <DropdownMenuItem 
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); option.onClick(); }}
                  className={option.destructive ? "text-destructive" : ""}
                >
                  {option.icon && <option.icon className="h-4 w-4 mr-2" />}
                  {option.label}
                </DropdownMenuItem>
              ))}
              {(onRefresh || onConfigure || (configOptions && configOptions.length > 0)) && onHide && (
                <DropdownMenuSeparator />
              )}
              {onHide && (
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onHide(); }}
                  className="text-muted-foreground"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide tile
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            {change && (
              <span
                className={cn("text-sm font-medium", {
                  "text-[hsl(var(--category-hiring))]": change.type === "increase",
                  "text-[hsl(var(--category-layoffs))]": change.type === "decrease",
                  "text-muted-foreground": change.type === "neutral",
                })}
              >
                {change.type === "increase" && "+"}
                {change.type === "decrease" && "-"}
                {Math.abs(change.value)}%
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/15">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          {isClickable && (
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
    </div>
  );
}
