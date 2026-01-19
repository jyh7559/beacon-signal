import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ManageColumnsModal } from "@/components/datasets/ManageColumnsModal";
import { RecordDetailModal } from "@/components/datasets/RecordDetailModal";
import { RecordCompareModal } from "@/components/datasets/RecordCompareModal";
import { SaveDatasetSearchModal } from "@/components/datasets/SaveDatasetSearchModal";
import { CreateDatasetAlertModal } from "@/components/datasets/CreateDatasetAlertModal";
import { FilterablePageLayout } from "@/components/layout/FilterablePageLayout";
import { UnifiedFilterSidebar, FilterValues } from "@/components/search/UnifiedFilterSidebar";
import {
  ArrowLeft,
  Download,
  Columns3,
  Search,
  ExternalLink,
  Plus,
  GitCompare,
  Copy,
  X,
  Lock,
  Sparkles,
  Save,
  Bell,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDatasetFilters, convertFiltersToApiFormat } from "@/hooks/useDatasetFilters";
import { datasetsApi, type DatasetFilter } from "@/services/api/datasets.api";
import { normalizeDatasetId, type ColumnConfig, type DatasetInfo } from "@/config/datasets.config";
import type { DatasetRecord } from "@/types";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function DatasetTablePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { planType, subscriptions, isAuthenticated } = useAuth();
  
  // Normalize the URL ID to dataset type
  const datasetType = useMemo(() => normalizeDatasetId(id || ''), [id]);
  const datasetInfo = useMemo(() => datasetsApi.getDatasetInfo(datasetType), [datasetType]);
  
  // Calculate date constraints from subscription
  const dateConstraints = useMemo(() => {
    if (!datasetInfo) return undefined;
    const resourceName = datasetInfo.apiResource;
    const subscription = subscriptions.find(sub => sub.resource === resourceName);
    if (!subscription) return undefined;
    
    const today = new Date();
    const minDate = subscription.allowedStartDate ? new Date(subscription.allowedStartDate) : undefined;
    const expiresOn = subscription.expiresOn ? new Date(subscription.expiresOn) : undefined;
    // Max date is the earlier of today or subscription expiry
    const maxDate = expiresOn && expiresOn < today ? expiresOn : today;
    
    return { minDate, maxDate };
  }, [datasetInfo, subscriptions]);
  
  // Get dynamic filters based on dataset type with date constraints
  const { filterGroups, isLoading: isLoadingFilters } = useDatasetFilters(datasetType, dateConstraints);
  
  const [records, setRecords] = useState<DatasetRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  
  // Draft filters (what user is selecting) vs Applied filters (what API uses)
  const [draftFilterValues, setDraftFilterValues] = useState<FilterValues>({});
  const [appliedFilterValues, setAppliedFilterValues] = useState<FilterValues>({});
  const [draftSearchQuery, setDraftSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Record detail modal state
  const [selectedRecord, setSelectedRecord] = useState<DatasetRecord | null>(null);
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Bulk selection state
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<number>>(new Set());
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [saveSearchModalOpen, setSaveSearchModalOpen] = useState(false);
  const [createAlertModalOpen, setCreateAlertModalOpen] = useState(false);
  
  // Check if user has access to this dataset based on subscriptions
  const hasDatasetAccess = useMemo(() => {
    if (!datasetInfo) return false;
    // Map dataset type to resource name (e.g., 'layoff' -> 'dataset.layoff')
    const resourceName = `dataset.${datasetType}`;
    return subscriptions.some(sub => sub.resource === resourceName);
  }, [subscriptions, datasetType, datasetInfo]);
  
  // Check if there are unapplied filter changes
  const hasUnappliedChanges = useMemo(() => {
    const draftStr = JSON.stringify(draftFilterValues);
    const appliedStr = JSON.stringify(appliedFilterValues);
    const searchChanged = draftSearchQuery !== appliedSearchQuery;
    return draftStr !== appliedStr || searchChanged;
  }, [draftFilterValues, appliedFilterValues, draftSearchQuery, appliedSearchQuery]);

  // Initialize selected columns from dataset config
  useEffect(() => {
    if (datasetInfo) {
      const visibleCols = datasetInfo.columns
        .filter(c => c.visible)
        .map(c => c.key);
      setSelectedColumns(visibleCols);
    }
  }, [datasetInfo]);

  // Fetch data from API - only uses APPLIED filters
  useEffect(() => {
    const fetchData = async () => {
      // Check authentication first
      if (!isAuthenticated) {
        console.log('[DatasetTablePage] Not authenticated, redirecting to login');
        navigate('/app/login');
        return;
      }
      
      if (!datasetType || !planType) return;
      
      setLoading(true);
      setAccessDenied(false);
      try {
        // Build API filters with dataset-aware conversion using APPLIED values
        const apiFilters: DatasetFilter = {
          ...convertFiltersToApiFormat(appliedFilterValues, appliedSearchQuery, datasetType),
          page: currentPage,
          pageSize,
        };
        
        console.log('[DatasetTablePage] Fetching with filters:', { datasetType, apiFilters, isAuthenticated });
        
        const response = await datasetsApi.getDatasetByType(datasetType, planType, apiFilters);
        setRecords(Array.isArray(response.data) ? (response.data as DatasetRecord[]) : []);
        setTotalRecords(typeof response.total === "number" ? response.total : 0);
        
        // Show success feedback when filters are applied
        if (Object.keys(appliedFilterValues).length > 0 || appliedSearchQuery) {
          console.log('[DatasetTablePage] Filtered results loaded:', response.total, 'records');
        }
      } catch (error: unknown) {
        console.error('Failed to fetch dataset:', error);
        
        // Check if it's an authentication error
        if (error instanceof Error && error.message.includes('Session expired')) {
          // Already handled by client.ts redirect
          return;
        }
        
        // Check if it's an access denied error (subscription issue)
        const errorWithCode = error as Error & { code?: string };
        if (errorWithCode.code === 'ACCESS_DENIED' || 
            (error instanceof Error && error.message.includes('upgrade'))) {
          setAccessDenied(true);
        } else {
          toast({ title: "Failed to load dataset", description: "Please try again", variant: "destructive" });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [datasetType, planType, appliedFilterValues, appliedSearchQuery, currentPage, pageSize, toast, isAuthenticated, navigate]);

  // Reset to page 1 when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchQuery, appliedFilterValues]);

  // Clear selection when applied filters change
  useEffect(() => {
    setSelectedRecordIds(new Set());
  }, [appliedSearchQuery, appliedFilterValues, currentPage]);

  // Calculate columns to display
  const visibleColumns = useMemo(() => {
    if (!datasetInfo) return [];
    return datasetInfo.columns.filter(c => selectedColumns.includes(c.key) && !c.key.startsWith('_'));
  }, [datasetInfo, selectedColumns]);

  // All available columns for the column manager
  const allColumns = useMemo(() => {
    if (!datasetInfo) return [];
    return datasetInfo.columns.filter(c => !c.key.startsWith('_'));
  }, [datasetInfo]);

  // Pagination calculations
  const totalPages = Math.ceil(totalRecords / pageSize);

  // Calculate active APPLIED filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(appliedFilterValues).forEach(([_, value]) => {
      if (Array.isArray(value) && value.length > 0) count += value.length;
      else if (typeof value === "object" && value !== null) {
        if ("from" in value || "to" in value) {
          const dateVal = value as { from?: Date; to?: Date };
          if (dateVal.from || dateVal.to) count++;
        } else if ("min" in value || "max" in value) {
          const amountVal = value as { min?: number; max?: number };
          if (amountVal.min !== undefined || amountVal.max !== undefined) count++;
        }
      }
    });
    return count;
  }, [appliedFilterValues]);

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndices = records.map((_, idx) => idx);
      setSelectedRecordIds(new Set(allIndices));
    } else {
      setSelectedRecordIds(new Set());
    }
  };

  const handleSelectRecord = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRecordIds);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRecordIds(newSelected);
  };

  const isAllSelected = records.length > 0 && records.every((_, idx) => selectedRecordIds.has(idx));
  const isSomeSelected = selectedRecordIds.size > 0 && !isAllSelected;

  const selectedRecords = useMemo(() => {
    return Array.from(selectedRecordIds).map(idx => records[idx]).filter(Boolean);
  }, [selectedRecordIds, records]);

  // Get nested value from object
  const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
    return path.split('.').reduce((acc: unknown, part) => {
      if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  };

  // Format cell value based on column type
  const formatCellValue = (value: unknown, column: ColumnConfig): string => {
    if (value === null || value === undefined) return "—";
    
    switch (column.type) {
      case 'currency':
        if (typeof value === 'number') {
          if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
          if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
          return `$${value}`;
        }
        return String(value);
        
      case 'percent':
        return typeof value === 'number' ? `${value}%` : String(value);
        
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value);
        
      case 'date':
        if (typeof value === 'string') {
          try {
            return new Date(value).toLocaleDateString();
          } catch {
            return value;
          }
        }
        return String(value);
        
      case 'array':
        if (Array.isArray(value)) return value.join(", ");
        return String(value);
        
      case 'company':
      case 'string':
      case 'badge':
      default:
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }
  };

  const handleExport = (exportSelected = false) => {
    if (!datasetInfo) return;
    
    const dataToExport = exportSelected ? selectedRecords : records;
    if (dataToExport.length === 0) return;

    const exportData = dataToExport.map(record => {
      const filtered: Record<string, unknown> = {};
      selectedColumns.forEach(colKey => {
        if (!colKey.startsWith("_")) {
          filtered[colKey] = getNestedValue(record, colKey);
        }
      });
      return filtered;
    });

    let content: string;
    let mimeType: string;
    let extension: string;

    if (exportFormat === "json") {
      content = JSON.stringify(exportData, null, 2);
      mimeType = "application/json";
      extension = "json";
    } else {
      const headers = selectedColumns.filter(c => !c.startsWith("_")).join(",");
      const rows = exportData.map(row =>
        selectedColumns.filter(c => !c.startsWith("_")).map(col => {
          const val = row[col];
          if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(",")
      );
      content = [headers, ...rows].join("\n");
      mimeType = "text/csv";
      extension = "csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${datasetInfo.name.toLowerCase().replace(/\s+/g, "-")}${exportSelected ? "-selected" : ""}-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: `Exported ${dataToExport.length} records as ${exportFormat.toUpperCase()}` });
  };

  const handleCopySelected = () => {
    const text = selectedRecords.map(record => {
      return visibleColumns.map(col => `${col.label}: ${formatCellValue(getNestedValue(record, col.key), col)}`).join("\n");
    }).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast({ title: `Copied ${selectedRecords.length} records to clipboard` });
  };

  const handleCompare = () => {
    if (selectedRecords.length < 2) {
      toast({ title: "Select at least 2 records to compare", variant: "destructive" });
      return;
    }
    if (selectedRecords.length > 5) {
      toast({ title: "Select up to 5 records to compare", variant: "destructive" });
      return;
    }
    setCompareModalOpen(true);
  };

  const handleColumnsChange = (columns: string[]) => {
    setSelectedColumns(columns);
  };

  // Apply filters - copies draft to applied
  const handleApplyFilters = () => {
    setAppliedFilterValues({ ...draftFilterValues });
    setAppliedSearchQuery(draftSearchQuery);
    toast({ 
      title: "Applying filters...", 
      description: "Loading filtered results" 
    });
  };

  const handleClearFilters = () => {
    setDraftFilterValues({});
    setAppliedFilterValues({});
    setDraftSearchQuery("");
    setAppliedSearchQuery("");
  };

  const handleRowClick = (record: DatasetRecord, index: number) => {
    setSelectedRecord(record);
    setSelectedRecordIndex(index);
    setDetailModalOpen(true);
  };

  const handleRecordNavigate = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? selectedRecordIndex - 1 : selectedRecordIndex + 1;
    if (newIndex >= 0 && newIndex < records.length) {
      setSelectedRecordIndex(newIndex);
      setSelectedRecord(records[newIndex]);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading && !records.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-11 w-80" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!datasetInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Dataset not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app/datasets")}>
          Back to Datasets
        </Button>
      </div>
    );
  }

  // Access denied - show upgrade CTA
  if (accessDenied) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/datasets")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{datasetInfo.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{datasetInfo.description}</p>
          </div>
        </div>
        
        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-6"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Upgrade to Access This Dataset</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Your current plan doesn't include access to the <strong>{datasetInfo.name}</strong> dataset. 
            Upgrade your subscription to unlock full access to this data.
          </p>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/app/settings?tab=plan")} size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
            <Button variant="outline" onClick={() => navigate("/app/datasets")}>
              View Other Datasets
            </Button>
          </div>
          
          {/* Feature preview */}
          <div className="mt-10 p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm max-w-lg">
            <h3 className="font-semibold text-foreground mb-3">What you'll get with this dataset:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Real-time data updates
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Export to CSV/JSON
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Advanced filtering & search
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                API access for integrations
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/datasets")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{datasetInfo.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {totalRecords.toLocaleString()} records
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as "csv" | "json")}>
            <SelectTrigger className="w-24 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => handleExport(false)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setColumnsModalOpen(true)}>
            <Columns3 className="w-4 h-4 mr-2" />
            Columns
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSaveSearchModalOpen(true)}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCreateAlertModalOpen(true)}>
            <Bell className="w-4 h-4 mr-2" />
            Alert
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedRecordIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20"
        >
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              {selectedRecordIds.size} selected
            </Badge>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCompare}
                disabled={selectedRecordIds.size < 2 || selectedRecordIds.size > 5}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Compare
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopySelected}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedRecordIds(new Set())}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </motion.div>
      )}

      {/* Main Content with Filter Sidebar */}
      <FilterablePageLayout
        activeFilterCount={activeFilterCount}
        sidebar={
          <UnifiedFilterSidebar
            filterGroups={filterGroups}
            values={draftFilterValues}
            onChange={setDraftFilterValues}
            onClearAll={handleClearFilters}
            onApply={handleApplyFilters}
            hasUnappliedChanges={hasUnappliedChanges}
          />
        }
      >
        {/* Search and Stats */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 max-w-md flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={draftSearchQuery}
                onChange={(e) => setDraftSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleApplyFilters();
                  }
                }}
                className="pl-10 h-11"
              />
            </div>
            {hasUnappliedChanges && (
              <Button size="sm" onClick={handleApplyFilters}>
                Apply
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearFilters}
                className="text-primary hover:text-primary"
              >
                <X className="w-3 h-3 mr-1" />
                Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
              </Button>
            )}
            <span>
              Showing <span className="font-semibold text-foreground">{startRecord}-{endRecord}</span> of{" "}
              <span className="font-semibold text-foreground">{totalRecords}</span> records
            </span>
            <span>·</span>
            <span>
              <span className="font-semibold text-foreground">{selectedColumns.length}</span> columns
            </span>
          </div>
        </div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          {/* Loading Overlay - shows when refetching with existing data */}
          {loading && records.length > 0 && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border border-border shadow-lg">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
                    />
                  </TableHead>
                  {visibleColumns.map((column) => (
                    <TableHead key={column.key} className="font-semibold whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span>{column.label}</span>
                        <Badge variant="outline" size="sm" className="w-fit text-[10px] font-mono">
                          {column.type}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setColumnsModalOpen(true)}
                      title="Add or remove columns"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 2} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-muted-foreground">
                          {loading ? "Loading..." : activeFilterCount > 0 
                            ? "No records match your filters" 
                            : "No records found"}
                        </p>
                        {!loading && activeFilterCount > 0 && (
                          <Button variant="outline" size="sm" onClick={handleClearFilters}>
                            <X className="w-3 h-3 mr-1" />
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record, idx) => {
                    const isSelected = selectedRecordIds.has(idx);
                    return (
                      <TableRow
                        key={idx}
                        className={`group cursor-pointer ${isSelected ? "bg-primary/5" : "hover:bg-muted/50"}`}
                        onClick={() => handleRowClick(record, idx)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectRecord(idx, !!checked)}
                            aria-label={`Select record ${idx + 1}`}
                          />
                        </TableCell>
                        {visibleColumns.map((column) => {
                          const value = getNestedValue(record, column.key);
                          return (
                            <TableCell key={column.key} className="max-w-[300px]">
                              <div className="truncate" title={formatCellValue(value, column)}>
                                {column.type === 'url' && value ? (
                                  <a
                                    href={String(value)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {String(value).replace(/^https?:\/\//, "").split("/")[0]}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : column.type === 'badge' ? (
                                  <Badge variant="outline" size="sm">
                                    {formatCellValue(value, column)}
                                  </Badge>
                                ) : (
                                  formatCellValue(value, column)
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(record, idx);
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {renderPageNumbers().map((page, idx) =>
                  page === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </FilterablePageLayout>

      {/* Manage Columns Modal */}
      <ManageColumnsModal
        open={columnsModalOpen}
        onOpenChange={setColumnsModalOpen}
        fields={allColumns.map(c => ({ 
          name: c.key, 
          type: c.type as 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object', 
          description: c.label,
          example: '' 
        }))}
        selectedColumns={selectedColumns}
        onColumnsChange={handleColumnsChange}
        datasetName={datasetInfo.name}
      />

      {/* Record Detail Modal */}
      {selectedRecord && (
        <RecordDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          record={selectedRecord}
          fields={allColumns.map(c => ({ 
            name: c.key, 
            type: c.type as 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object', 
            description: c.label,
            example: '' 
          }))}
          currentIndex={selectedRecordIndex}
          totalRecords={records.length}
          onNavigate={handleRecordNavigate}
        />
      )}

      {/* Compare Modal */}
      <RecordCompareModal
        open={compareModalOpen}
        onOpenChange={setCompareModalOpen}
        records={selectedRecords}
        fields={allColumns.map(c => ({ 
          name: c.key, 
          type: c.type as 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object', 
          description: c.label,
          example: '' 
        }))}
      />

      {/* Save Search Modal */}
      <SaveDatasetSearchModal
        open={saveSearchModalOpen}
        onOpenChange={setSaveSearchModalOpen}
        datasetType={datasetType}
        datasetName={datasetInfo?.name || ''}
        filterValues={appliedFilterValues}
        searchQuery={appliedSearchQuery}
        onSave={(name) => {
          toast({ title: `Search "${name}" saved` });
          setSaveSearchModalOpen(false);
        }}
      />

      {/* Create Alert Modal */}
      <CreateDatasetAlertModal
        open={createAlertModalOpen}
        onOpenChange={setCreateAlertModalOpen}
        datasetType={datasetType}
        datasetName={datasetInfo?.name || ''}
        filterValues={appliedFilterValues}
        searchQuery={appliedSearchQuery}
        onSave={(alert) => {
          toast({ title: `Alert "${alert.name}" created` });
          setCreateAlertModalOpen(false);
        }}
      />
    </div>
  );
}
