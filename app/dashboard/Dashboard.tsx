"use client";

import { useState, useMemo, useEffect } from "react";
import { useDashboard } from "./DashboardContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useOrders } from "@/hooks/useApi";

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
  store: StoreData & { plan_type?: string };
}

export default function Dashboard({ store }: DashboardProps) {
  const { activeNav, setActiveNav, lang } = useDashboard();

  const isRTL = lang === "ar";
  const isMiniPlan = store.plan_type === "Mini";

  // Fetch real-time orders at the dashboard root level
  const { data: ordersData } = useOrders(store.id, { skip: !store.id });
  const orders = ordersData ?? [];

  // Total pending orders count from the database
  const totalPendingOrders = useMemo(() => {
    return orders.filter((o) => o.status === "pending").length;
  }, [orders]);

  // Track the baseline count when the admin last acknowledged/viewed the notifications
  const [lastSeenCount, setLastSeenCount] = useState<number | null>(null);

  // Initialize lastSeenCount on first load so existing pending orders don't trigger false unread alerts
  useEffect(() => {
    if (lastSeenCount === null && ordersData !== undefined) {
      setLastSeenCount(totalPendingOrders);
    }
  }, [ordersData, totalPendingOrders, lastSeenCount]);

  // Calculate unread new orders since the last acknowledgment
  const unreadOrdersCount = useMemo(() => {
    if (lastSeenCount === null) return 0;
    const diff = totalPendingOrders - lastSeenCount;
    return diff > 0 ? diff : 0;
  }, [totalPendingOrders, lastSeenCount]);

  // Handle admin clicking the notification bell
  const handleNotificationClick = () => {
    setLastSeenCount(totalPendingOrders);
    setActiveNav("orders");
  };

  // Automatically mark as read if the admin navigates directly to the orders panel
  useEffect(() => {
    if (activeNav === "orders" && lastSeenCount !== totalPendingOrders) {
      setLastSeenCount(totalPendingOrders);
    }
  }, [activeNav, totalPendingOrders, lastSeenCount]);

  const renderPanel = () => {
    switch (activeNav) {
      case "home":
        return <HomePanel setActiveNav={setActiveNav} store={store} />;
      case "orders":
        return <OrdersPanel store={{ ...store, language: lang } as any} />;
      case "products":
        return <ProductsPanel storeId={store.id} />;
      case "customers":
        return isMiniPlan ? (
          <HomePanel setActiveNav={setActiveNav} store={store} />
        ) : (
          <CustomersPanel />
        );
      case "analytics":
        return isMiniPlan ? (
          <HomePanel setActiveNav={setActiveNav} store={store} />
        ) : (
          <AnalyticsPanel store={store} />
        );
      case "settings":
        return <SettingsPanel />;
      case "categories":
        return <CategoriesPanel storeId={store.id} />;
      case "ai":
        return isMiniPlan ? (
          <HomePanel setActiveNav={setActiveNav} store={store} />
        ) : (
          <AIChatPanel />
        );
      case "sections":
        return isMiniPlan ? (
          <HomePanel setActiveNav={setActiveNav} store={store} />
        ) : (
          <StoreFrontPanel />
        );
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
        <Topbar
          newOrdersCount={unreadOrdersCount}
          onNotificationClick={handleNotificationClick}
        />

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
