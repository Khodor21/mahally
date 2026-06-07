"use client";

import { Menu, Bell, Search, Globe } from "lucide-react";
import { useDashboard } from "./DashboardContext";

export default function Topbar() {
  const { activeNav, lang, setLang, setIsSidebarOpen, tr } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  // FIX: Instead of a hardcoded object, pull the title directly from the translation object.
  // We use activeNav as the key to look up the translation.
  // We add a fallback (activeNav) just in case a key is missing.
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
      <h1 className="font-bold text-[rgb(60_28_84)] text-lg flex-1">
        {String(title)}
      </h1>

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

      {/* Notifications */}
      <button className="relative p-2 rounded-xl hover:bg-[rgb(244_242_245)] text-[rgb(60_28_84)] transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-[rgb(60_28_84)] rounded-full border-2 border-white" />
      </button>
    </header>
  );
}
