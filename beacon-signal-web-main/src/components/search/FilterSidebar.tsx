import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignalCategory, SearchParams } from "@/types";

interface FilterSidebarProps {
  filters: SearchParams;
  onFiltersChange: (filters: SearchParams) => void;
  onClearAll: () => void;
  className?: string;
}

const signalCategories: { value: SignalCategory; label: string }[] = [
  { value: "funding", label: "Funding" },
  { value: "ma", label: "M&A" },
  { value: "executive", label: "Executive Moves" },
  { value: "expansion", label: "Expansion" },
  { value: "hiring", label: "Hiring" },
  { value: "layoffs", label: "Layoffs" },
  { value: "product", label: "Product Launches" },
  { value: "partnership", label: "Partnerships" },
];

const geographies = [
  { value: "USA", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "EU", label: "Europe" },
  { value: "APAC", label: "Asia Pacific" },
  { value: "LATAM", label: "Latin America" },
];

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}

function FilterSection({ title, children, defaultOpen = true, count }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors group"
      >
        <span className="flex items-center gap-2">
          {title}
          {count !== undefined && count > 0 && (
            <span className="text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-md font-semibold">
              {count}
            </span>
          )}
        </span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>
      {isOpen && <div className="space-y-2 pl-1">{children}</div>}
    </div>
  );
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  onClearAll,
  className,
}: FilterSidebarProps) {
  const categoryCount = filters.categories?.length ?? 0;
  const geoCount = filters.geos?.length ?? 0;
  const hasFilters = categoryCount > 0 || geoCount > 0 || (filters.confidenceMin ?? 0) > 0;

  const toggleCategory = (category: SignalCategory) => {
    const current = filters.categories || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onFiltersChange({ ...filters, categories: updated });
  };

  const toggleGeo = (geo: string) => {
    const current = filters.geos || [];
    const updated = current.includes(geo)
      ? current.filter((g) => g !== geo)
      : [...current, geo];
    onFiltersChange({ ...filters, geos: updated });
  };

  return (
    <div className={cn("space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="h-px bg-border/60" />

      {/* Signal Type */}
      <FilterSection title="Signal Type" count={categoryCount}>
        <div className="space-y-2.5">
          {signalCategories.map((category) => (
            <label
              key={category.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <Checkbox
                id={`category-${category.value}`}
                checked={filters.categories?.includes(category.value) ?? false}
                onCheckedChange={() => toggleCategory(category.value)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {category.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-border/60" />

      {/* Geography */}
      <FilterSection title="Geography" count={geoCount}>
        <div className="space-y-2.5">
          {geographies.map((geo) => (
            <label
              key={geo.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <Checkbox
                id={`geo-${geo.value}`}
                checked={filters.geos?.includes(geo.value) ?? false}
                onCheckedChange={() => toggleGeo(geo.value)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {geo.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-border/60" />

      {/* Confidence */}
      <FilterSection title="Minimum Confidence">
        <div className="space-y-4 pt-1 px-1">
          <Slider
            value={[filters.confidenceMin ?? 0]}
            onValueChange={([value]) =>
              onFiltersChange({ ...filters, confidenceMin: value })
            }
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">0%</span>
            <span className="text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded">
              {filters.confidenceMin ?? 0}%
            </span>
            <span className="text-muted-foreground">100%</span>
          </div>
        </div>
      </FilterSection>
    </div>
  );
}
