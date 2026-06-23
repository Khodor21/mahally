"use client";

import { useMemo, useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  Copy,
  CheckCircle,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Ticket,
  Store,
  MessageCircle,
  Sparkles,
  Palette,
} from "lucide-react";
import FeaturesPanel from "../components/Features";
import { useDashboard } from "../DashboardContext";
import {
  useOrders,
  useProducts,
  useCustomers,
  useVisitors,
} from "@/hooks/useApi";
import type { NavItem, StoreData } from "../types";
import { Emoji } from "emoji-picker-react";

const statusColors: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  processing: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
};

interface HomePanelProps {
  setActiveNav: (n: NavItem) => void;
  store: StoreData;
}

export default function HomePanel({ setActiveNav, store }: HomePanelProps) {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [copied, setCopied] = useState(false);
  const storeUrl = `${store.slug}.mahally.app`;

  const { data: ordersData, loading: ordersLoading } = useOrders(store.id);
  const { data: productsData, loading: productsLoading } = useProducts();
  const { data: customersData, loading: customersLoading } = useCustomers();
  const { data: visitorsData, loading: visitorsLoading } = useVisitors(
    store.id,
  );

  const orders = ordersData ?? [];
  const products = productsData ?? [];
  const customers = customersData ?? [];
  const visitors = visitorsData ?? [];

  const loading =
    ordersLoading || productsLoading || customersLoading || visitorsLoading;

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusLabel: Record<string, string> = {
    completed: tr.completed || "مكتمل",
    processing: tr.processing || "قيد المعالجة",
    pending: tr.pending || "قيد الانتظار",
    cancelled: tr.cancelled || "ملغى",
  };

  const quickActions = [
    {
      label: tr.addProduct || "إضافة منتج",
      icon: Plus,
      nav: "products" as NavItem,
      color: "bg-[rgb(60_28_84)] text-white hover:bg-[rgb(60_28_84)]/90",
    },
    {
      label: tr.viewOrders || "عرض الطلبات",
      icon: Eye,
      nav: "orders" as NavItem,
      color:
        "bg-[rgb(244_242_245)] text-[rgb(60_28_84)] hover:bg-[rgb(207_195_223)]",
    },
    {
      label: tr.createCoupon || "إنشاء كوبون",
      icon: Ticket,
      nav: "coupons" as NavItem,
      color:
        "bg-[rgb(244_242_245)] text-[rgb(60_28_84)] hover:bg-[rgb(207_195_223)]",
    },
    {
      label: tr.manageStore || "إدارة المتجر",
      icon: Store,
      nav: "settings" as NavItem,
      color:
        "bg-[rgb(244_242_245)] text-[rgb(60_28_84)] hover:bg-[rgb(207_195_223)]",
    },
  ];

  console.log("DEBUG - Visitors Data from Hook:", visitorsData);
  console.log(
    "DEBUG - Current 'Today' string:",
    new Date().toISOString().split("T")[0],
  );
  console.log("DEBUG - Current Store ID:", store.id);

  const stats = useMemo(() => {
    const now = new Date();

    const isCurrentMonth = (d: string) =>
      new Date(d).getMonth() === now.getMonth() &&
      new Date(d).getFullYear() === now.getFullYear();
    const isLastMonth = (d: string) =>
      new Date(d).getMonth() === now.getMonth() - 1 &&
      new Date(d).getFullYear() === now.getFullYear();

    const calculateGrowth = (cur: number, prev: number) =>
      prev === 0
        ? cur > 0
          ? 100
          : 0
        : Number((((cur - prev) / prev) * 100).toFixed(1));

    let curRev = 0,
      lastRev = 0,
      curOrds = 0,
      lastOrds = 0;
    const curCusts = new Set<string>(),
      lastCusts = new Set<string>();

    orders.forEach((o) => {
      if (isCurrentMonth(o.created_at)) {
        curOrds++;
        curCusts.add(o.customer_name);
        if (o.status !== "cancelled") curRev += Number(o.total || 0);
      } else if (isLastMonth(o.created_at)) {
        lastOrds++;
        lastCusts.add(o.customer_name);
        if (o.status !== "cancelled") lastRev += Number(o.total || 0);
      }
    });

    return [
      {
        label: tr.totalRevenue || "إجمالي الإيرادات",
        value: orders
          .reduce(
            (sum, o) => sum + (o.status !== "cancelled" ? Number(o.total) : 0),
            0,
          )
          .toLocaleString(),
        unit: "$",
        change: calculateGrowth(curRev, lastRev),
        icon: TrendingUp,
        color: "bg-[rgb(60_28_84)]",
        iconColor: "text-white",
      },
      {
        label: tr.totalOrders || "إجمالي الطلبات",
        value: orders.length.toString(),
        unit: tr.order || "طلب",
        change: calculateGrowth(curOrds, lastOrds),
        icon: ShoppingCart,
        color: "bg-[rgb(244_242_245)]",
        iconColor: "text-[rgb(60_28_84)]",
      },
      {
        label: tr.totalCustomers || "إجمالي العملاء",
        value: customers.length.toString(),
        unit: "",
        change: calculateGrowth(curCusts.size, lastCusts.size),
        icon: Users,
        color: "bg-[rgb(244_242_245)]",
        iconColor: "text-[rgb(60_28_84)]",
      },
      {
        label: tr.totalProducts || "إجمالي المنتجات",
        value: products.length.toString(),
        unit: "",
        change: 0, // Placeholder for product growth, or kept at 0 to show stability
        icon: Package,
        color: "bg-[rgb(244_242_245)]",
        iconColor: "text-[rgb(60_28_84)]",
      },
    ];
  }, [orders, customers, products, tr]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5),
    [orders],
  );

  return (
    <div className="space-y-6" dir={dir}>
      {/* Welcome */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-1">
          <h3 className="text-xl md:text-2xl font-bold text-[rgb(60_28_84)]">
            {tr.welcomeBack || "مرحبا"}{" "}
            {store.admin_name?.split(" ")[0] || "المالك"}
          </h3>{" "}
          <Emoji unified="1f44b" size={24} />
        </div>
        <p className="text-[rgb(60_28_84)]/50 text-xs md:text-sm mt-0.5 font-regular">
          {tr.overviewDesc || "إليك ملخص نشاط متجرك اليوم"}
        </p>
      </div>

      {/* Main 4 Stats grid (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-up delay-100">
        {loading ? (
          /* Stats Skeleton Loaders */
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-lg p-3.5 md:p-5 bg-[rgb(244_242_245)] animate-pulse h-[110px] md:h-[132px] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-[rgb(60_28_84)]/10" />
                  <div className="w-10 h-3 md:w-12 md:h-4 rounded bg-[rgb(60_28_84)]/10" />
                </div>
                <div>
                  <div className="w-16 h-6 md:w-24 md:h-8 rounded bg-[rgb(60_28_84)]/10 mb-1.5 md:mb-2" />
                  <div className="w-12 h-2.5 md:w-16 md:h-3 rounded bg-[rgb(60_28_84)]/10" />
                </div>
              </div>
            ))}
          </>
        ) : (
          /* Actual Stats */
          stats.map((stat, i) => {
            const isPositive = stat.change >= 0;
            return (
              <div
                key={i}
                className={`rounded-lg p-3.5 md:p-5 ${stat.color} transition-all hover:scale-[1.02] cursor-default flex flex-col justify-between`}
              >
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded flex items-center justify-center ${
                      stat.color === "bg-[rgb(60_28_84)]"
                        ? "bg-white/20"
                        : "bg-[rgb(60_28_84)]/10"
                    }`}
                  >
                    <stat.icon
                      className={`w-4 h-4 md:w-5 md:h-5 ${stat.iconColor}`}
                    />
                  </div>
                  <span
                    className={`flex items-center gap-0.5 text-[10px] md:text-xs font-semibold ${
                      isPositive
                        ? stat.color === "bg-[rgb(60_28_84)]"
                          ? "text-emerald-300"
                          : "text-emerald-600"
                        : stat.color === "bg-[rgb(60_28_84)]"
                          ? "text-red-300"
                          : "text-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    ) : (
                      <ArrowDownRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    )}
                    {Math.abs(stat.change)}%
                  </span>
                </div>
                <div>
                  <p
                    className={`text-lg md:text-2xl font-bold ${
                      stat.color === "bg-[rgb(60_28_84)]"
                        ? "text-white"
                        : "text-[rgb(60_28_84)]"
                    }`}
                  >
                    {stat.value}
                    {stat.unit && (
                      <span className="text-xs md:text-sm font-normal ms-1">
                        {stat.unit}
                      </span>
                    )}
                  </p>
                  <p
                    className={`text-[10px] md:text-xs mt-0.5 md:mt-1 font-medium ${
                      stat.color === "bg-[rgb(60_28_84)]"
                        ? "text-white/70"
                        : "text-[rgb(60_28_84)]/60"
                    }`}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Marketing Panel + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 animate-fade-up delay-200">
        {/* Marketing Banner */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-lg bg-gradient-to-br from-[rgb(60_28_84)] to-[rgb(85_40_120)] text-white p-6 md:p-8 flex flex-col justify-center shadow-sm">
          <Palette className="absolute -bottom-6 -end-6 w-32 h-32 text-white opacity-5 pointer-events-none" />
          <Sparkles className="absolute top-6 -start-6 w-24 h-24 text-white opacity-10 pointer-events-none" />

          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium mb-4 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              {tr.premiumServices || "خدمات مخصصة لمتجرك"}
            </span>
            <h3 className="text-lg md:text-2xl font-bold mb-3 leading-tight">
              {tr.marketingTitle || "احصل على تصميم احترافي لمتجرك!"}
            </h3>
            <p className="text-white/80 text-xs md:text-base mb-6 leading-relaxed">
              {tr.marketingDesc ||
                "هل تحتاج إلى تصميم موقع مخصص أو منشورات جذابة لوسائل التواصل الاجتماعي؟ خبراؤنا هنا لمساعدتك في بناء هوية بصرية مميزة تزيد من مبيعاتك وتألّق علامتك التجارية."}
            </p>
            <a
              href="https://wa.me/96171708103"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[rgb(60_28_84)] px-4 py-1.5 rounded-sm font-bold text-xs transition-all hover:scale-105 hover:bg-gray-50 w-max shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {tr.contactWhatsapp || "تواصل معنا عبر واتساب"}
            </a>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="">
          <h3 className="font-bold text-[rgb(60_28_84)] text-base mb-4">
            {tr.quickActions || "الإجراءات السريعة"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setActiveNav(action.nav)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-semibold transition-all hover:scale-[1.03] ${action.color}`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-center text-xs leading-tight">
                  {action.label}
                </span>
              </button>
            ))}
          </div>

          {/* Store Link */}
          <div className="mt-4 p-4 bg-[rgb(244_242_245)] rounded-lg">
            <p className="text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
              {tr.storeLink || "رابط المتجر"}
            </p>
            <p className="text-xs font-mono text-[rgb(60_28_84)] font-bold mb-3 break-all">
              {storeUrl}
            </p>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgb(60_28_84)]/20 text-[rgb(60_28_84)] hover:bg-white transition-all text-xs font-semibold flex-1 justify-center"
              >
                {copied ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? tr.copied || "تم النسخ" : tr.copyLink || "نسخ الرابط"}
              </button>

              <a
                href={`https://${storeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[rgb(60_28_84)] text-white hover:bg-[rgb(60_28_84)]/90 transition-all text-xs font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="animate-fade-up delay-300 bg-white rounded-lg border border-[rgb(244_242_245)] overflow-hidden">
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-[rgb(244_242_245)]">
          <h3 className="font-bold text-[rgb(60_28_84)] text-base">
            {tr.recentOrders || "الطلبات الأخيرة"}
          </h3>
          <button
            onClick={() => setActiveNav("orders")}
            className="text-xs font-semibold text-[rgb(60_28_84)]/60 hover:text-[rgb(60_28_84)] transition-colors flex items-center gap-1"
          >
            {tr.viewAll || "عرض الكل"}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          /* Table Skeleton Loader */
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir={dir}>
              <thead>
                <tr className="border-b border-[rgb(244_242_245)]">
                  {[1, 2, 3, 4, 5].map((h) => (
                    <th key={h} className="px-4 md:px-5 py-3 text-start">
                      <div className="h-4 w-16 bg-[rgb(244_242_245)] rounded animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row} className="border-b border-[rgb(244_242_245)]">
                    <td className="px-4 md:px-5 py-3.5">
                      <div className="h-4 w-16 bg-[rgb(244_242_245)] rounded animate-pulse" />
                    </td>
                    <td className="px-4 md:px-5 py-3.5">
                      <div className="h-4 w-24 md:w-32 bg-[rgb(244_242_245)] rounded animate-pulse" />
                    </td>
                    <td className="px-4 md:px-5 py-3.5">
                      <div className="h-4 w-12 md:w-16 bg-[rgb(244_242_245)] rounded animate-pulse" />
                    </td>
                    <td className="px-4 md:px-5 py-3.5">
                      <div className="h-6 w-16 md:w-20 bg-[rgb(244_242_245)] rounded-full animate-pulse" />
                    </td>
                    <td className="px-4 md:px-5 py-3.5">
                      <div className="h-4 w-20 md:w-24 bg-[rgb(244_242_245)] rounded animate-pulse" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : recentOrders.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col gap-2 items-center justify-center h-[200px] text-[rgb(60_28_84)]/40 bg-[rgb(244_242_245)]/20">
            <Package className="w-8 md:w-10 h-8 md:h-10 text-[#fefefe]" />
            <p className="text-sm font-medium text-[rgb(60_28_84)]/50">
              {tr.noData || "لا توجد بيانات"}
            </p>
          </div>
        ) : (
          /* Actual Table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir={dir}>
              <thead>
                <tr className="border-b border-[rgb(244_242_245)] bg-[rgb(244_242_245)]/30">
                  {[
                    tr.orderId || "رقم الطلب",
                    tr.customer || "العميل",
                    tr.amount || "المبلغ",
                    tr.status || "الحالة",
                    tr.date || "التاريخ",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 md:px-5 py-3 text-start text-[10px] md:text-xs font-bold text-[rgb(60_28_84)]/50 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[rgb(244_242_245)] last:border-0 hover:bg-[rgb(244_242_245)]/50 transition-colors"
                  >
                    <td className="px-4 md:px-5 py-3.5 font-mono text-xs font-bold text-[rgb(60_28_84)]">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 md:px-5 py-3.5 font-medium text-[rgb(60_28_84)] whitespace-nowrap text-xs md:text-sm">
                      {order.customer_name}
                    </td>
                    <td className="px-4 md:px-5 py-3.5 font-bold text-[rgb(60_28_84)] whitespace-nowrap text-xs md:text-sm">
                      $
                      {Number(order.total).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 md:px-5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold ${statusColors[order.status]}`}
                      >
                        {statusLabel[order.status]}
                      </span>
                    </td>
                    <td className="px-4 md:px-5 py-3.5 text-[rgb(60_28_84)]/60 text-[10px] md:text-xs font-medium whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString(
                        dir === "rtl" ? "ar-SA" : "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <FeaturesPanel />
      </div>
    </div>
  );
}
