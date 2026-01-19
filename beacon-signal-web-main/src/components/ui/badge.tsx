import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary:
          "border-border bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/15 text-destructive",
        outline: 
          "text-foreground border-border bg-transparent",
        ghost:
          "border-transparent bg-transparent text-muted-foreground",
        teal:
          "border-transparent bg-primary/12 text-primary",
        lime:
          "border-transparent bg-accent/12 text-accent",
        realtime:
          "border-primary/20 bg-primary/10 text-primary font-semibold",
        api:
          "border-transparent bg-primary/15 text-primary font-semibold",
        weekly:
          "border-transparent bg-muted text-muted-foreground",
        // Category variants with refined colors
        funding:
          "border-transparent bg-[hsl(var(--category-funding)/0.12)] text-[hsl(var(--category-funding))]",
        ma:
          "border-transparent bg-[hsl(var(--category-ma)/0.12)] text-[hsl(var(--category-ma))]",
        executive:
          "border-transparent bg-[hsl(var(--category-executive)/0.12)] text-[hsl(var(--category-executive))]",
        expansion:
          "border-transparent bg-[hsl(var(--category-expansion)/0.12)] text-[hsl(var(--category-expansion))]",
        hiring:
          "border-transparent bg-[hsl(var(--category-hiring)/0.12)] text-[hsl(var(--category-hiring))]",
        layoffs:
          "border-transparent bg-[hsl(var(--category-layoffs)/0.12)] text-[hsl(var(--category-layoffs))]",
        product:
          "border-transparent bg-[hsl(var(--category-product)/0.12)] text-[hsl(var(--category-product))]",
        partnership:
          "border-transparent bg-[hsl(var(--category-partnership)/0.12)] text-[hsl(var(--category-partnership))]",
        // Confidence variants
        "high-confidence":
          "border-transparent bg-primary/15 text-primary font-semibold",
        "medium-confidence":
          "border-transparent bg-[hsl(var(--category-executive)/0.15)] text-[hsl(var(--category-executive))] font-semibold",
        "low-confidence":
          "border-transparent bg-muted text-muted-foreground",
      },
      size: {
        default: "px-2 py-0.5 text-xs",
        sm: "px-1.5 py-0.5 text-[10px]",
        lg: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
