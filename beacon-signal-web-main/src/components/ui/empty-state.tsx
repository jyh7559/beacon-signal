import { cn } from "@/lib/utils";
import { FileQuestion, Search, AlertCircle, Inbox } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  variant?: "default" | "search" | "error" | "inbox";
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantIcons = {
  default: FileQuestion,
  search: Search,
  error: AlertCircle,
  inbox: Inbox,
};

export function EmptyState({
  variant = "default",
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const Icon = variantIcons[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-4">
        {icon || <Icon className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
