"use client";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart2,
  Settings,
  Ticket,
  Handshake,
  Gift,
  LogOut,
  Bot,
  X,
  Store,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDashboard } from "./DashboardContext";
import type { NavItem, StoreData } from "./types";
import { useState } from "react";
import { signOut } from "next-auth/react";
import LogoutModal from "./components/LogoutModal";

interface NavGroup {
  items: {
    id: NavItem;
    icon: React.ComponentType<{ className?: string }>;
    labelKey: keyof typeof import("./i18n").t.ar;
    soon?: boolean;
  }[];
  titleKey?: keyof typeof import("./i18n").t.ar;
}

const navGroups: NavGroup[] = [
  {
    items: [
      { id: "home", icon: LayoutDashboard, labelKey: "home" },
      { id: "orders", icon: ShoppingCart, labelKey: "orders" },
      { id: "products", icon: Package, labelKey: "products" },
      { id: "customers", icon: Users, labelKey: "customers" },
      { id: "analytics", icon: BarChart2, labelKey: "analytics" },
      { id: "settings", icon: Settings, labelKey: "settings" },
      { id: "ai", icon: Bot, labelKey: "ai" },
    ],
  },
  {
    titleKey: "marketing",
    items: [
      { id: "coupons", icon: Ticket, labelKey: "coupons" },
      {
        id: "partnerships",
        icon: Handshake,
        labelKey: "partnerships",
        soon: true,
      },
      { id: "occasions", icon: Gift, labelKey: "occasions", soon: true },
    ],
  },
];

interface SidebarProps {
  store: StoreData;
}

export default function Sidebar({ store }: SidebarProps) {
  const { activeNav, setActiveNav, tr, lang, isSidebarOpen, setIsSidebarOpen } =
    useDashboard();

  const dir = lang === "ar" ? "rtl" : "ltr";
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await signOut({
        callbackUrl: "/login",
      });
    } catch (error) {
      console.error(error);
      setIsLoggingOut(false);
    }
  };

  const ChevronIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  const handleNav = (id: NavItem, soon?: boolean) => {
    if (soon) return;
    setActiveNav(id);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 h-full w-64 bg-white border-e border-[rgb(244_242_245)] z-50
          flex flex-col transition-transform duration-300 shadow-xl
          md:translate-x-0 md:shadow-none
          ${
            dir === "rtl"
              ? `right-0 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`
              : `left-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`
          }
        `}
        dir={dir}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[rgb(244_242_245)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[rgb(60_28_84)] flex items-center justify-center shadow-md">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-[rgb(60_28_84)] text-sm leading-none">
                {store.store_name}
              </p>
              <p className="text-[10px] text-[rgb(60_28_84)]/50 mt-0.5">
                {store.slug}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-[rgb(244_242_245)] text-[rgb(60_28_84)]/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.titleKey && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-[rgb(60_28_84)]/40 px-3 mb-2">
                  {tr[group.titleKey] as string}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id, item.soon)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-200
                        ${
                          isActive
                            ? "bg-[rgb(60_28_84)] text-white"
                            : item.soon
                              ? "text-[rgb(60_28_84)]/30 cursor-not-allowed"
                              : "text-[rgb(60_28_84)]/70 hover:bg-[rgb(244_242_245)] hover:text-[rgb(60_28_84)]"
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-start">
                        {tr[item.labelKey] as string}
                      </span>
                      {item.soon && (
                        <span className="text-[9px] font-bold bg-[rgb(207_195_223)] text-[rgb(60_28_84)] px-1.5 py-0.5 rounded-full">
                          {tr.comingSoon}
                        </span>
                      )}
                      {isActive && (
                        <ChevronIcon className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 pt-3 border-t border-[rgb(244_242_245)]">
          <div className="flex items-center gap-3 px-3 py-3 mb-1 rounded-xl hover:bg-[rgb(244_242_245)] transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-[rgb(60_28_84)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {store.admin_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[rgb(60_28_84)] truncate">
                {store.admin_name}
              </p>
              <p className="text-[11px] text-[rgb(60_28_84)]/50 truncate">
                {store.admin_email}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all font-medium mt-1"
          >
            <LogOut className="w-4 h-4" />
            <span>{tr.signOut}</span>
          </button>
        </div>
      </aside>

      <LogoutModal
        open={showLogoutModal}
        loading={isLoggingOut}
        onClose={() => {
          if (!isLoggingOut) setShowLogoutModal(false);
        }}
        onConfirm={handleLogout}
      />
    </>
  );
}
