"use client";

import { useDashboard } from "./DashboardContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import HomePanel from "./panels/HomePanel";
import AIChatPanel from "./panels/AIChatPanel";
import OrdersPanel from "./panels/OrdersPanel";
import ProductsPanel from "./panels/ProductsPanel";
import CustomersPanel from "./panels/CustomersPanel";
import AnalyticsPanel from "./panels/AnalyticsPanel";
import SettingsPanel from "./panels/SettingsPanel";
import CouponsPanel from "./panels/CouponsPanel";
import OccasionsPanel from "./panels/OccasionsPanel";
import PartnershipsPanel from "./panels/PartnershipsPanel";
import CategoriesPanel from "./panels/CategoriesPanel";
import StoreFrontPanel from "./panels/StoreFrontPanel";
import type { StoreData } from "./types";

interface DashboardProps {
  store: StoreData;
}

export default function Dashboard({ store }: DashboardProps) {
  const { activeNav, setActiveNav, lang } = useDashboard();

  const isRTL = lang === "ar";

  // FIX: no type mutation, keep original store shape
  const renderPanel = () => {
    switch (activeNav) {
      case "home":
        return <HomePanel setActiveNav={setActiveNav} store={store} />;
      case "orders":
        return <OrdersPanel store={store} />;
      case "products":
        return <ProductsPanel />;
      case "customers":
        return <CustomersPanel />;
      case "analytics":
        return <AnalyticsPanel />;
      case "settings":
        return <SettingsPanel />;
      case "categories":
        return <CategoriesPanel />;
      case "ai":
        return <AIChatPanel />;
      case "storefront":
        return <StoreFrontPanel />;
      case "coupons":
        return <CouponsPanel />;
      case "occasions":
        return <OccasionsPanel />;
      case "partnerships":
        return <PartnershipsPanel />;
      default:
        return <HomePanel setActiveNav={setActiveNav} store={store} />;
    }
  };

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar store={store} />

      <div
        className={`
      min-h-screen
      transition-all duration-300
      ${isRTL ? "md:pr-64" : "md:pl-64"}
    `}
      >
        <Topbar />

        <main
          className={`
    bg-[rgb(244_242_245)]/30
    min-h-[calc(100vh-64px)]
    ${activeNav === "ai" ? "p-0" : "p-5 md:p-8"}
  `}
        >
          <div key={activeNav} className="animate-fade-in">
            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  );
}
