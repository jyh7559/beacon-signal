import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserDropdown } from "@/components/header/UserDropdown";
import { Logo } from "@/components/brand/Logo";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { DATASET_CONFIG, getAllDatasets } from "@/config/datasets.config";
import {
  LayoutDashboard,
  Search,
  Database,
  Bookmark,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/app/dashboard" },
  { icon: Database, label: "Datasets", href: "/app/datasets" },
  { icon: Bookmark, label: "Saved", href: "/app/saved" },
  { icon: Bell, label: "Alerts", href: "/app/alerts" },
];

// Get dataset items from config
const datasetItems = getAllDatasets().map(ds => ({
  id: ds.id,
  label: ds.name,
  icon: ds.icon,
}));

const getPageTitle = (pathname: string) => {
  const item = mainNavItems.find((nav) => nav.href === pathname);
  if (item) return item.label;
  if (pathname === "/app/settings") return "Settings";
  if (pathname.startsWith("/app/datasets/")) {
    const datasetId = pathname.split("/app/datasets/")[1];
    const datasetInfo = DATASET_CONFIG[datasetId];
    return datasetInfo?.name || "Dataset";
  }
  return "Dashboard";
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [datasetsExpanded, setDatasetsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const pageTitle = getPageTitle(location.pathname);
  
  // Check if we're viewing a specific dataset
  const isDatasetView = location.pathname.startsWith("/app/datasets/");
  const currentDatasetId = isDatasetView ? location.pathname.split("/app/datasets/")[1] : null;
  const currentDataset = currentDatasetId ? DATASET_CONFIG[currentDatasetId] : null;
  const isDatasetsSection = location.pathname.startsWith("/app/datasets");

  // Auto-expand datasets when viewing a dataset
  const shouldShowDatasets = datasetsExpanded || isDatasetView;

  // Build breadcrumb items
  const getBreadcrumbItems = () => {
    if (isDatasetView && currentDataset) {
      return [
        { label: "Datasets", href: "/app/datasets" },
        { label: currentDataset.name }
      ];
    }
    return [];
  };

  const toggleDatasetsExpanded = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDatasetsExpanded(!datasetsExpanded);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border/50 bg-sidebar-background transition-all duration-300 ease-out",
          sidebarOpen ? "w-60" : "w-[68px]"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Logo to="/" showText={sidebarOpen} size="md" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronLeft
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                !sidebarOpen && "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href === "/app/datasets" && isDatasetsSection);
            const isDatasets = item.href === "/app/datasets";
            
            return (
              <div key={item.href}>
                <div className="flex items-center">
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group flex-1",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    )}
                  >
                    {isActive && !isDatasetView && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full" />
                    )}
                    <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                    {sidebarOpen && (
                      <span className="font-medium text-sm flex-1">{item.label}</span>
                    )}
                  </Link>
                  {isDatasets && sidebarOpen && (
                    <button
                      onClick={toggleDatasetsExpanded}
                      className="p-1.5 rounded hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={shouldShowDatasets ? "Collapse datasets" : "Expand datasets"}
                    >
                      {shouldShowDatasets ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Dataset Tree - Show when expanded or viewing a dataset */}
                {isDatasets && shouldShowDatasets && sidebarOpen && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-border/50 pl-3">
                    {datasetItems.map((dataset) => {
                      const isCurrentDataset = currentDatasetId === dataset.id;
                      const DatasetIcon = dataset.icon;
                      return (
                        <Link
                          key={dataset.id}
                          to={`/app/datasets/${dataset.id}`}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-200 relative",
                            isCurrentDataset
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                          )}
                        >
                          {isCurrentDataset ? (
                            <GitBranch className="w-3 h-3 shrink-0 text-primary" />
                          ) : (
                            <DatasetIcon className="w-3 h-3 shrink-0 opacity-70" />
                          )}
                          <span className="truncate">{dataset.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Section - Settings & Logout */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {/* Settings */}
          <Link
            to="/app/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
              location.pathname === "/app/settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            )}
          >
            {location.pathname === "/app/settings" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full" />
            )}
            <Settings className={cn("w-5 h-5 shrink-0", location.pathname === "/app/settings" && "text-primary")} />
            {sidebarOpen && <span className="font-medium text-sm">Settings</span>}
          </Link>
          
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {isDatasetView ? (
              <Breadcrumb items={getBreadcrumbItems()} />
            ) : (
              <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search signals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 h-9"
              />
            </form>
            <ThemeToggle />
            <UserDropdown />
          </div>
        </header>

        {/* Mobile header */}
        <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
          <Logo to="/" size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserDropdown />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed top-14 left-0 right-0 bottom-0 z-30 bg-background/98 backdrop-blur-md overflow-y-auto"
            >
              {/* Mobile Search */}
              <div className="p-4 border-b border-border/50">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search signals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </form>
              </div>
              
              <nav className="p-4 space-y-1">
                {mainNavItems.map((item) => {
                  const isActive = location.pathname === item.href ||
                    (item.href === "/app/datasets" && isDatasetsSection);
                  const isDatasets = item.href === "/app/datasets";
                  
                  return (
                  <div key={item.href}>
                      <div className="flex items-center">
                        <Link
                          to={item.href}
                          onClick={() => !isDatasets && setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors flex-1",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium flex-1">{item.label}</span>
                        </Link>
                        {isDatasets && (
                          <button
                            onClick={toggleDatasetsExpanded}
                            className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {shouldShowDatasets ? (
                              <Minus className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      {/* Mobile Dataset Tree - Show when expanded or viewing a dataset */}
                      {isDatasets && shouldShowDatasets && (
                        <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-border/50 pl-3">
                          {datasetItems.map((dataset) => {
                            const isCurrentDataset = currentDatasetId === dataset.id;
                            const DatasetIcon = dataset.icon;
                            return (
                              <Link
                                key={dataset.id}
                                to={`/app/datasets/${dataset.id}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  "flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-all duration-200",
                                  isCurrentDataset
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                )}
                              >
                                {isCurrentDataset ? (
                                  <GitBranch className="w-3.5 h-3.5 shrink-0 text-primary" />
                                ) : (
                                  <DatasetIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                                )}
                                <span>{dataset.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                <div className="pt-4 mt-4 border-t border-border space-y-1">
                  {/* Settings */}
                  <Link
                    to="/app/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      location.pathname === "/app/settings"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign out</span>
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
