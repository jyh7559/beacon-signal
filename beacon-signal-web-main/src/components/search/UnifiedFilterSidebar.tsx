import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, ChevronRight, X, Search, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Generic filter option
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// Filter group configuration
export interface FilterGroupConfig {
  id: string;
  label: string;
  type: "checkbox" | "range" | "date" | "amount";
  options?: FilterOption[];
  searchable?: boolean;
  defaultOpen?: boolean;
  min?: number;
  max?: number;
  step?: number;
  // Date constraints
  minDate?: Date;
  maxDate?: Date;
}

// Current filter values
export interface FilterValues {
  [key: string]: string[] | number | { from?: Date; to?: Date } | { min?: number; max?: number } | undefined;
}

interface UnifiedFilterSidebarProps {
  filterGroups: FilterGroupConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onClearAll: () => void;
  onApply?: () => void;
  hasUnappliedChanges?: boolean;
  className?: string;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
  count,
  searchable,
  searchValue,
  onSearchChange,
}: FilterSectionProps) {
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
      {isOpen && (
        <div className="space-y-2 pl-1">
          {searchable && onSearchChange && (
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

export function UnifiedFilterSidebar({
  filterGroups,
  values,
  onChange,
  onClearAll,
  onApply,
  hasUnappliedChanges,
  className,
}: UnifiedFilterSidebarProps) {
  // Track search queries for each searchable group
  const [groupSearchQueries, setGroupSearchQueries] = useState<Record<string, string>>({});

  // Calculate total active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(values).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) count += value.length;
      else if (typeof value === "number" && value > 0) count++;
      else if (typeof value === "object" && value !== null) {
        if ("from" in value || "to" in value) {
          if (value.from || value.to) count++;
        } else if ("min" in value || "max" in value) {
          if (value.min || value.max) count++;
        }
      }
    });
    return count;
  }, [values]);

  const hasFilters = activeFilterCount > 0;

  const handleCheckboxToggle = (groupId: string, optionValue: string) => {
    const current = (values[groupId] as string[]) || [];
    const updated = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    onChange({ ...values, [groupId]: updated });
  };

  const handleRangeChange = (groupId: string, value: number) => {
    onChange({ ...values, [groupId]: value });
  };

  const handleDateChange = (groupId: string, range: { from?: Date; to?: Date } | undefined) => {
    onChange({ ...values, [groupId]: range });
  };

  const handleAmountChange = (groupId: string, field: "min" | "max", value: number | undefined) => {
    const current = (values[groupId] as { min?: number; max?: number }) || {};
    onChange({
      ...values,
      [groupId]: { ...current, [field]: value },
    });
  };

  const getGroupCount = (groupId: string): number => {
    const value = values[groupId];
    if (Array.isArray(value)) return value.length;
    if (typeof value === "number" && value > 0) return 1;
    if (typeof value === "object" && value !== null) {
      if ("from" in value || "to" in value) {
        return (value.from || value.to) ? 1 : 0;
      }
      if ("min" in value || "max" in value) {
        return (value.min !== undefined || value.max !== undefined) ? 1 : 0;
      }
    }
    return 0;
  };

  const renderFilterGroup = (group: FilterGroupConfig) => {
    const searchQuery = groupSearchQueries[group.id] || "";

    switch (group.type) {
      case "checkbox": {
        const selectedValues = (values[group.id] as string[]) || [];
        const filteredOptions = group.searchable && searchQuery
          ? group.options?.filter((opt) =>
              opt.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : group.options;

        return (
          <FilterSection
            key={group.id}
            title={group.label}
            defaultOpen={group.defaultOpen ?? true}
            count={getGroupCount(group.id)}
            searchable={group.searchable && (group.options?.length || 0) > 5}
            searchValue={searchQuery}
            onSearchChange={(value) =>
              setGroupSearchQueries((prev) => ({ ...prev, [group.id]: value }))
            }
          >
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {filteredOptions?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No results found</p>
              ) : (
                filteredOptions?.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <Checkbox
                      checked={selectedValues.includes(option.value)}
                      onCheckedChange={() => handleCheckboxToggle(group.id, option.value)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                      {option.label}
                    </span>
                    {option.count !== undefined && (
                      <span className="text-xs text-muted-foreground">{option.count}</span>
                    )}
                  </label>
                ))
              )}
            </div>
          </FilterSection>
        );
      }

      case "range": {
        const value = (values[group.id] as number) || group.min || 0;
        return (
          <FilterSection
            key={group.id}
            title={group.label}
            defaultOpen={group.defaultOpen ?? true}
            count={getGroupCount(group.id)}
          >
            <div className="space-y-4 pt-1 px-1">
              <Slider
                value={[value]}
                onValueChange={([v]) => handleRangeChange(group.id, v)}
                min={group.min || 0}
                max={group.max || 100}
                step={group.step || 5}
                className="w-full"
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{group.min || 0}%</span>
                <span className="text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded">
                  {value}%
                </span>
                <span className="text-muted-foreground">{group.max || 100}%</span>
              </div>
            </div>
          </FilterSection>
        );
      }

      case "date": {
        const dateValue = values[group.id] as { from?: Date; to?: Date } | undefined;
        const today = new Date();
        // Use group constraints or default to today as max (no future dates)
        const effectiveMaxDate = group.maxDate ? (group.maxDate < today ? group.maxDate : today) : today;
        const effectiveMinDate = group.minDate;
        
        return (
          <FilterSection
            key={group.id}
            title={group.label}
            defaultOpen={group.defaultOpen ?? false}
            count={getGroupCount(group.id)}
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !dateValue?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateValue?.from ? (
                    dateValue.to ? (
                      <>
                        {format(dateValue.from, "LLL dd")} - {format(dateValue.to, "LLL dd")}
                      </>
                    ) : (
                      format(dateValue.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateValue?.from, to: dateValue?.to }}
                  onSelect={(range) => handleDateChange(group.id, range)}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                  disabled={(date) => {
                    // Disable future dates
                    if (date > effectiveMaxDate) return true;
                    // Disable dates before subscription start
                    if (effectiveMinDate && date < effectiveMinDate) return true;
                    return false;
                  }}
                  toMonth={effectiveMaxDate}
                  defaultMonth={effectiveMaxDate}
                />
              </PopoverContent>
            </Popover>
            {/* Show allowed date range hint if constraints exist */}
            {(effectiveMinDate || group.maxDate) && (
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Data available: {effectiveMinDate ? format(effectiveMinDate, "MMM d, yyyy") : "Start"} – {format(effectiveMaxDate, "MMM d, yyyy")}
              </p>
            )}
            {(dateValue?.from || dateValue?.to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDateChange(group.id, undefined)}
                className="w-full mt-2 h-7 text-xs"
              >
                Clear dates
              </Button>
            )}
          </FilterSection>
        );
      }

      case "amount": {
        const amountValue = values[group.id] as { min?: number; max?: number } | undefined;
        return (
          <FilterSection
            key={group.id}
            title={group.label}
            defaultOpen={group.defaultOpen ?? false}
            count={getGroupCount(group.id)}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Min ($M)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amountValue?.min !== undefined ? amountValue.min / 1000000 : ""}
                  onChange={(e) =>
                    handleAmountChange(
                      group.id,
                      "min",
                      e.target.value ? Number(e.target.value) * 1000000 : undefined
                    )
                  }
                  className="h-8"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max ($M)</label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={amountValue?.max !== undefined ? amountValue.max / 1000000 : ""}
                  onChange={(e) =>
                    handleAmountChange(
                      group.id,
                      "max",
                      e.target.value ? Number(e.target.value) * 1000000 : undefined
                    )
                  }
                  className="h-8"
                />
              </div>
            </div>
          </FilterSection>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="h-px bg-border/60" />

      {/* Filter Groups */}
      {filterGroups.map((group, index) => (
        <div key={group.id}>
          {renderFilterGroup(group)}
          {index < filterGroups.length - 1 && <div className="h-px bg-border/60 mt-5" />}
        </div>
      ))}

      {/* Apply Button */}
      {onApply && (
        <>
          <div className="h-px bg-border/60" />
          <div className="space-y-2">
            <Button 
              onClick={onApply} 
              className="w-full"
              disabled={!hasUnappliedChanges && !hasFilters}
            >
              Apply Filters
              {hasUnappliedChanges && (
                <span className="ml-2 w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
              )}
            </Button>
            {hasUnappliedChanges && (
              <p className="text-[10px] text-center text-muted-foreground">
                You have unapplied filter changes
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
