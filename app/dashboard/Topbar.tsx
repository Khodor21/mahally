"use client";

import { Menu, Bell, Search, Globe } from "lucide-react";
import { useDashboard } from "./DashboardContext";

interface TopbarProps {
  newOrdersCount?: number;
  onNotificationClick?: () => void;
}

export default function Topbar({
  newOrdersCount = 0,
  onNotificationClick,
}: TopbarProps) {
  const { activeNav, lang, setLang, setIsSidebarOpen, tr } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const title = tr[activeNav as keyof typeof tr] || activeNav;

  return (
    <header
      className="h-16 bg-white border-b border-[rgb(244_242_245)] flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30"
      dir={dir}
    >
      {/* Mobile menu */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden p-2 rounded-xl hover:bg-[rgb(244_242_245)] text-[rgb(60_28_84)] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <h3 className="font-bold text-[rgb(60_28_84)] text-lg flex-1">
        {String(title)}
      </h3>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-[rgb(244_242_245)] rounded-xl px-3 py-2 w-56">
        <Search className="w-4 h-4 text-[rgb(60_28_84)]/40" />
        <input
          type="text"
          placeholder={lang === "ar" ? "بحث..." : "Search..."}
          className="bg-transparent text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/40 outline-none flex-1 w-full"
          dir={dir}
        />
      </div>

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgb(244_242_245)] text-[rgb(60_28_84)] hover:bg-[rgb(207_195_223)] transition-all text-sm font-semibold"
      >
        <Globe className="w-4 h-4" />
        <span>{lang === "ar" ? "EN" : "AR"}</span>
      </button>

      {/* Notifications / Live Orders Bell */}
      <button
        onClick={onNotificationClick}
        className="relative p-2 rounded-xl hover:bg-[rgb(244_242_245)] text-[rgb(60_28_84)] transition-colors"
        title={lang === "ar" ? "الطلبات الجديدة" : "New Orders"}
      >
        <Bell className="w-5 h-5" />
        {newOrdersCount > 0 ? (
          <>
            <span className="absolute -top-1 -end-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm animate-bounce">
              {newOrdersCount > 99 ? "99+" : newOrdersCount}
            </span>
            <span className="absolute top-1.5 end-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75" />
          </>
        ) : (
          <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-[rgb(60_28_84)] rounded-full border-2 border-white" />
        )}
      </button>
    </header>
  );
}
