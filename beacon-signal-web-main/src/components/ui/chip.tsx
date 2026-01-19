import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ChipProps extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "active" | "outline";
  size?: "sm" | "default" | "lg";
  removable?: boolean;
  onRemove?: () => void;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant = "default", size = "default", removable = false, onRemove, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          {
            // Variants
            "bg-secondary/80 text-secondary-foreground hover:bg-secondary": variant === "default",
            "bg-primary text-primary-foreground shadow-sm shadow-primary/20": variant === "active",
            "border border-border bg-transparent text-foreground hover:bg-secondary/50": variant === "outline",
            // Sizes
            "px-2.5 py-1 text-xs": size === "sm",
            "px-3 py-1.5 text-sm": size === "default",
            "px-4 py-2 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
        {removable && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>
    );
  }
);
Chip.displayName = "Chip";

interface ChipGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ChipGroup = React.forwardRef<HTMLDivElement, ChipGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap gap-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ChipGroup.displayName = "ChipGroup";

export { Chip, ChipGroup };
