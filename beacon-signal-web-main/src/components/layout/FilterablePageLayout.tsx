import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterablePageLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  activeFilterCount?: number;
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
}

export function FilterablePageLayout({
  children,
  sidebar,
  activeFilterCount = 0,
  className,
  sidebarClassName,
  contentClassName,
}: FilterablePageLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={cn("flex gap-6", className)}>
      {/* Desktop Sidebar */}
      <aside className={cn("hidden lg:block w-64 shrink-0", sidebarClassName)}>
        <div className="sticky top-6 p-5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
          {sidebar}
        </div>
      </aside>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg h-14 w-14 p-0 relative">
              <SlidersHorizontal className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 justify-center text-[10px]"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{sidebar}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className={cn("flex-1 min-w-0", contentClassName)}>{children}</div>
    </div>
  );
}
