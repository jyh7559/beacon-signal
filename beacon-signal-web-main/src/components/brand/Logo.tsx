import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import intellizenceLogo from "@/assets/intellizence-logo.png";

interface LogoProps {
  to?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ to = "/", showText = true, size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img 
        src={intellizenceLogo} 
        alt="Intellizence" 
        className={cn(sizeClasses[size], "w-auto")}
      />
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
