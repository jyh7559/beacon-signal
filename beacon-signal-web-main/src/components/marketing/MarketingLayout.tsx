import { Outlet } from "react-router-dom";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";

export function MarketingLayout() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="pt-16">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
