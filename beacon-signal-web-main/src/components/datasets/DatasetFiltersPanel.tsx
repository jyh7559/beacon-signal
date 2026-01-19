import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { X, ChevronDown, Filter, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Dataset, DatasetField } from "@/types";

export interface DatasetFilters {
  status?: string[];
  dateRange?: { from?: Date; to?: Date };
  amountMin?: number;
  amountMax?: number;
  geography?: string[];
  roundType?: string[];
  customFilters?: Record<string, string[]>;
}

interface DatasetFiltersPanelProps {
  dataset: Dataset;
  filters: DatasetFilters;
  onFiltersChange: (filters: DatasetFilters) => void;
  className?: string;
}

// Filter options based on dataset type
const datasetFilterOptions: Record<string, { label: string; options: string[] }[]> = {
  ds_funding: [
    { label: "Round Type", options: ["Seed", "Series A", "Series B", "Series C", "Series D+", "Pre-Seed", "Angel"] },
    { label: "Status", options: ["Announced", "Completed", "Rumored"] },
  ],
  ds_ma: [
    { label: "Status", options: ["Announced", "Completed", "Terminated", "Pending"] },
    { label: "Deal Type", options: ["Acquisition", "Merger", "Divestiture", "Buyout"] },
  ],
  ds_executive: [
    { label: "Role Type", options: ["CEO", "CTO", "CFO", "COO", "CMO", "Board Member", "VP"] },
    { label: "Move Type", options: ["Appointment", "Departure", "Promotion", "Board Change"] },
  ],
  ds_expansion: [
    { label: "Expansion Type", options: ["New Office", "Market Entry", "Data Center", "Engineering Hub"] },
    { label: "Region", options: ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East"] },
  ],
  ds_hiring: [
    { label: "Department", options: ["Engineering", "Sales", "Marketing", "Operations", "Research", "Product"] },
    { label: "Growth Rate", options: ["High (>50%)", "Medium (20-50%)", "Low (<20%)"] },
  ],
  ds_layoffs: [
    { label: "Scale", options: ["Large (>1000)", "Medium (100-1000)", "Small (<100)"] },
    { label: "Departments", options: ["Engineering", "Sales", "Marketing", "Operations", "All"] },
  ],
  ds_product: [
    { label: "Category", options: ["Software", "Hardware", "AI/ML", "Mobile", "Enterprise", "Consumer"] },
    { label: "Type", options: ["New Product", "Feature Release", "Major Update", "Pivot"] },
  ],
  ds_partnership: [
    { label: "Partnership Type", options: ["Strategic", "Technology", "Distribution", "Joint Venture", "Investment"] },
    { label: "Industry", options: ["Technology", "Finance", "Healthcare", "Energy", "Retail"] },
  ],
};

const geoOptions = ["United States", "United Kingdom", "Germany", "France", "India", "Singapore", "Japan", "Brazil", "Canada", "Australia"];

export function DatasetFiltersPanel({ dataset, filters, onFiltersChange, className }: DatasetFiltersPanelProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const filterConfigs = datasetFilterOptions[dataset.id] || [];
  const hasAmountField = dataset.fields.some(f => f.name.includes("amount") || f.name.includes("value") || f.name.includes("investment"));
  const hasDateField = dataset.fields.some(f => f.type === "date");
  const hasGeoField = dataset.fields.some(f => f.name.includes("location") || f.name.includes("geo"));

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status?.length) count++;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    if (filters.amountMin || filters.amountMax) count++;
    if (filters.geography?.length) count++;
    if (filters.roundType?.length) count++;
    Object.values(filters.customFilters || {}).forEach(v => {
      if (v?.length) count++;
    });
    return count;
  }, [filters]);

  const handleFilterToggle = (filterKey: string, value: string) => {
    const currentValues = filters.customFilters?.[filterKey] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      customFilters: {
        ...filters.customFilters,
        [filterKey]: newValues,
      },
    });
  };

  const handleGeoToggle = (geo: string) => {
    const currentGeos = filters.geography || [];
    const newGeos = currentGeos.includes(geo)
      ? currentGeos.filter(g => g !== geo)
      : [...currentGeos, geo];
    
    onFiltersChange({
      ...filters,
      geography: newGeos,
    });
  };

  const handleClearAll = () => {
    onFiltersChange({});
  };

  const handleRemoveFilter = (type: string, value?: string) => {
    if (type === "dateRange") {
      onFiltersChange({ ...filters, dateRange: undefined });
    } else if (type === "amount") {
      onFiltersChange({ ...filters, amountMin: undefined, amountMax: undefined });
    } else if (type === "geography" && value) {
      onFiltersChange({ ...filters, geography: filters.geography?.filter(g => g !== value) });
    } else if (value && filters.customFilters?.[type]) {
      const newCustomFilters = { ...filters.customFilters };
      newCustomFilters[type] = newCustomFilters[type].filter(v => v !== value);
      onFiltersChange({ ...filters, customFilters: newCustomFilters });
    }
  };

  // Collect all active filter chips
  const activeChips: { type: string; value: string; label: string }[] = [];
  
  Object.entries(filters.customFilters || {}).forEach(([key, values]) => {
    values.forEach(v => {
      activeChips.push({ type: key, value: v, label: v });
    });
  });
  
  filters.geography?.forEach(geo => {
    activeChips.push({ type: "geography", value: geo, label: geo });
  });

  if (filters.dateRange?.from || filters.dateRange?.to) {
    const label = filters.dateRange.from && filters.dateRange.to
      ? `${format(filters.dateRange.from, "MMM d")} - ${format(filters.dateRange.to, "MMM d")}`
      : filters.dateRange.from
        ? `From ${format(filters.dateRange.from, "MMM d")}`
        : `Until ${format(filters.dateRange.to!, "MMM d")}`;
    activeChips.push({ type: "dateRange", value: "date", label });
  }

  if (filters.amountMin || filters.amountMax) {
    const label = filters.amountMin && filters.amountMax
      ? `$${(filters.amountMin / 1000000).toFixed(0)}M - $${(filters.amountMax / 1000000).toFixed(0)}M`
      : filters.amountMin
        ? `Min $${(filters.amountMin / 1000000).toFixed(0)}M`
        : `Max $${(filters.amountMax! / 1000000).toFixed(0)}M`;
    activeChips.push({ type: "amount", value: "amount", label });
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" size="sm">{activeFilterCount}</Badge>
          )}
        </div>

        {/* Dynamic Filters based on dataset */}
        {filterConfigs.map((config) => (
          <Popover key={config.label}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                {config.label}
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3 bg-popover" align="start">
              <div className="space-y-2">
                {config.options.map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={(filters.customFilters?.[config.label] || []).includes(option)}
                      onCheckedChange={() => handleFilterToggle(config.label, option)}
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        ))}

        {/* Date Range Filter */}
        {hasDateField && (
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" />
                Date Range
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover" align="start">
              <Calendar
                mode="range"
                selected={{ from: filters.dateRange?.from, to: filters.dateRange?.to }}
                onSelect={(range) => {
                  onFiltersChange({
                    ...filters,
                    dateRange: range ? { from: range.from, to: range.to } : undefined,
                  });
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Amount Range Filter */}
        {hasAmountField && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                Amount
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 bg-popover" align="start">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Min Amount ($M)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.amountMin ? filters.amountMin / 1000000 : ""}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      amountMin: e.target.value ? Number(e.target.value) * 1000000 : undefined,
                    })}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Max Amount ($M)</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={filters.amountMax ? filters.amountMax / 1000000 : ""}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      amountMax: e.target.value ? Number(e.target.value) * 1000000 : undefined,
                    })}
                    className="h-8"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Geography Filter */}
        {hasGeoField && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                Geography
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3 bg-popover" align="start">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {geoOptions.map((geo) => (
                  <label key={geo} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={(filters.geography || []).includes(geo)}
                      onCheckedChange={() => handleGeoToggle(geo)}
                    />
                    <span className="text-sm">{geo}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Clear All */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8 text-muted-foreground">
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip, idx) => (
            <Badge
              key={`${chip.type}-${chip.value}-${idx}`}
              variant="secondary"
              className="gap-1.5 pr-1.5"
            >
              {chip.label}
              <button
                onClick={() => handleRemoveFilter(chip.type, chip.value)}
                className="ml-0.5 rounded-full hover:bg-muted p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
