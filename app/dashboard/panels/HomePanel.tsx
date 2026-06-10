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
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboard } from "../DashboardContext";
import {
  useOrders,
  useProducts,
  useCustomers,
  useVisitors,
} from "@/hooks/useApi";
import type { NavItem, StoreData } from "../types";

const statusColors: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  processing: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
};

interface ChartDataPoint {
  month: string;
  monthEn: string;
  sales: number;
}

interface HomePanelProps {
  setActiveNav: (n: NavItem) => void;
  store: StoreData;
}

export default function HomePanel({ setActiveNav, store }: HomePanelProps) {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [copied, setCopied] = useState(false);
  const storeUrl = `${store.slug}.mysaas.com`;

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

  // Generate chart data dynamically
  const chartData = useMemo(() => {
    const monthsAr = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    const monthsEn = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const now = new Date();
    const months: Array<{ key: string; ar: string; date: Date }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: monthsEn[date.getMonth()],
        ar: monthsAr[date.getMonth()],
        date,
      });
    }

    const monthlyData: Record<string, number> = Object.fromEntries(
      months.map((m) => [m.key, 0]),
    );

    orders.forEach((order) => {
      if (order.status !== "cancelled") {
        const orderDate = new Date(order.created_at);
        const monthKey = monthsEn[orderDate.getMonth()];
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += Number(order.total || 0);
        }
      }
    });

    return months.map((m) => ({
      month: m.ar,
      monthEn: m.key,
      sales: monthlyData[m.key],
    }));
  }, [orders]);

  const chartKey = lang === "ar" ? "month" : "monthEn";

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

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

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

    // Visitors data
    const todayVisitors =
      visitors.find((v) => v.count_date === today)?.visitor_count || 0;
    const yesterdayVisitors =
      visitors.find((v) => v.count_date === yesterday)?.visitor_count || 0;
    const visitorGrowth = calculateGrowth(todayVisitors, yesterdayVisitors);

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
        unit: tr.piece || "قطعة",
        change: 0,
        icon: Package,
        color: "bg-[rgb(244_242_245)]",
        iconColor: "text-[rgb(60_28_84)]",
      },
      {
        label: tr.visits || "الزوار",
        value: todayVisitors.toString(),
        unit: "زائر",
        change: visitorGrowth,
        icon: Eye,
        color: "bg-[rgb(244_242_245)]",
        iconColor: "text-[rgb(60_28_84)]",
      },
    ];
  }, [orders, products, customers, visitors, tr]);

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
        <h2 className="text-2xl font-bold text-[rgb(60_28_84)]">
          {tr.welcomeBack || "مرحبا"}{" "}
          {store.admin_name?.split(" ")[0] || "المالك"} 👋
        </h2>
        <p className="text-[rgb(60_28_84)]/50 text-sm mt-0.5">
          {tr.overviewDesc || "إليك ملخص نشاط متجرك اليوم"}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-up delay-100">
        {stats.map((stat, i) => {
          const isPositive = stat.change >= 0;
          return (
            <div
              key={i}
              className={`rounded-2xl p-5 ${stat.color} transition-all hover:scale-[1.02] cursor-default`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stat.color === "bg-[rgb(60_28_84)]"
                      ? "bg-white/20"
                      : "bg-[rgb(60_28_84)]/10"
                  }`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold ${
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
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(stat.change)}%
                </span>
              </div>
              <p
                className={`text-2xl font-bold ${
                  stat.color === "bg-[rgb(60_28_84)]"
                    ? "text-white"
                    : "text-[rgb(60_28_84)]"
                }`}
              >
                {stat.value}
                {stat.unit && (
                  <span className="text-sm font-normal ms-1">{stat.unit}</span>
                )}
              </p>
              <p
                className={`text-xs mt-1 ${
                  stat.color === "bg-[rgb(60_28_84)]"
                    ? "text-white/60"
                    : "text-[rgb(60_28_84)]/50"
                }`}
              >
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 animate-fade-up delay-200">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-[rgb(60_28_84)] text-base">
                {tr.revenueChart || "مخطط الإيرادات"}
              </h3>
              <p className="text-xs text-[rgb(60_28_84)]/40 mt-0.5">
                {tr.last7Months || "آخر 7 أشهر"}
              </p>
            </div>
            <span className="text-xs bg-[rgb(244_242_245)] text-[rgb(60_28_84)]/60 px-3 py-1.5 rounded-lg font-medium">
              $
            </span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="w-8 h-8 text-[rgb(60_28_84)]/40 animate-spin" />
            </div>
          ) : chartData.length > 0 && chartData.some((d) => d.sales > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="rgb(60,28,84)"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="rgb(60,28,84)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(244,242,245)"
                  vertical={false}
                />
                <XAxis
                  dataKey={chartKey}
                  tick={{
                    fontSize: 11,
                    fill: "rgba(60,28,84,0.5)",
                    fontFamily: "Cairo, sans-serif",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "rgba(60,28,84,0.5)",
                    fontFamily: "Cairo, sans-serif",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid rgb(244,242,245)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontFamily: "Cairo, sans-serif",
                    color: "rgb(60,28,84)",
                    boxShadow: "0 4px 24px rgba(60,28,84,0.08)",
                  }}
                  labelStyle={{ fontWeight: 700, color: "rgb(60,28,84)" }}
                  formatter={(value: any) =>
                    `$${Number(value ?? 0).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}`
                  }
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="rgb(60,28,84)"
                  strokeWidth={2.5}
                  fill="url(#colorSales)"
                  dot={{ fill: "rgb(60,28,84)", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-[rgb(60_28_84)]/40">
              <p>{tr.noData || "لا توجد بيانات"}</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm">
          <h3 className="font-bold text-[rgb(60_28_84)] text-base mb-4">
            {tr.quickActions || "الإجراءات السريعة"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setActiveNav(action.nav)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03] ${action.color}`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-center text-xs leading-tight">
                  {action.label}
                </span>
              </button>
            ))}
          </div>

          {/* Store Link */}
          <div className="mt-4 p-4 bg-[rgb(244_242_245)] rounded-xl">
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

              {/* FIXED: Added missing 'a' tag here */}
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
      <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up delay-300">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(244_242_245)]">
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[rgb(60_28_84)]/40 animate-spin" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-[rgb(60_28_84)]/40">
            <p>{tr.noData || "لا توجد طلبات"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir={dir}>
              <thead>
                <tr className="border-b border-[rgb(244_242_245)]">
                  {[
                    tr.orderId || "رقم الطلب",
                    tr.customer || "العميل",
                    tr.amount || "المبلغ",
                    tr.status || "الحالة",
                    tr.date || "التاريخ",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-start text-xs font-semibold text-[rgb(60_28_84)]/40 uppercase tracking-wider whitespace-nowrap"
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
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[rgb(60_28_84)]">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[rgb(60_28_84)] whitespace-nowrap">
                      {order.customer_name}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[rgb(60_28_84)] whitespace-nowrap">
                      $
                      {Number(order.total).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}
                      >
                        {statusLabel[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[rgb(60_28_84)]/50 text-xs whitespace-nowrap">
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
      </div>
    </div>
  );
}
