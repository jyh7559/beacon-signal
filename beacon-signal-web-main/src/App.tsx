import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ContrastModeProvider } from "@/hooks/useContrastMode";
import { AuthProvider } from "@/hooks/useAuth";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import HomePage from "@/pages/marketing/HomePage";
import ProductPage from "@/pages/marketing/ProductPage";
import DatasetsPage from "@/pages/marketing/DatasetsPage";
import PricingPage from "@/pages/marketing/PricingPage";
import SecurityPage from "@/pages/marketing/SecurityPage";
import DocsPage from "@/pages/marketing/DocsPage";
import BlogPage from "@/pages/marketing/BlogPage";
import LoginPage from "@/pages/app/LoginPage";
import OnboardingPage from "@/pages/app/OnboardingPage";
import AppLayout from "@/pages/app/AppLayout";
import DashboardPage from "@/pages/app/DashboardPage";
import SearchPage from "@/pages/app/SearchPage";
import SavedPage from "@/pages/app/SavedPage";
import AlertsPage from "@/pages/app/AlertsPage";
import SettingsPage from "@/pages/app/SettingsPage";
import DatasetsCatalogPage from "@/pages/app/DatasetsCatalogPage";
import DatasetTablePage from "@/pages/app/DatasetTablePage";
import SignalDetailPage from "@/pages/app/SignalDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Main App component with providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="intellizence-theme">
      <ContrastModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Marketing Routes */}
                <Route element={<MarketingLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/product" element={<ProductPage />} />
                  <Route path="/datasets" element={<DatasetsPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/security" element={<SecurityPage />} />
                  <Route path="/docs" element={<DocsPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                </Route>

                {/* App Routes */}
                <Route path="/app/login" element={<LoginPage />} />
                <Route path="/app/onboarding" element={<OnboardingPage />} />
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="signals/:id" element={<SignalDetailPage />} />
                  <Route path="datasets" element={<DatasetsCatalogPage />} />
                  <Route path="datasets/:id" element={<DatasetTablePage />} />
                  <Route path="saved" element={<SavedPage />} />
                  <Route path="alerts" element={<AlertsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ContrastModeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
