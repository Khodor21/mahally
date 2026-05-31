"use client";

import { useState, useEffect, useMemo } from "react";
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
import type { NavItem, StoreData } from "../types";

const statusColors: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  processing: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
};

interface Order {
  id: string;
  customer_name: string;
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  created_at: string;
  order_items?: Array<{ id: string; qty: number }>;
}

interface Product {
  id: string;
  title: string;
  store_id: string;
}

interface Customer {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
}

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
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const storeUrl = `${store.slug}.mysaas.com`;

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      if (!store?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch orders
        const ordersRes = await fetch(`/api/checkout?storeId=${store.id}`);
        const ordersData = await ordersRes.json();
        setOrders(ordersData.data || []);

        // Fetch products
        const productsRes = await fetch(`/api/products?storeId=${store.id}`);
        const productsData = await productsRes.json();
        setProducts(productsData.data || []);

        // Fetch customers from the correct endpoint
        try {
          const customersRes = await fetch(`/api/store-customers`);
          const customersData = await customersRes.json();
          setCustomers(customersData.data || []);
        } catch (error) {
          console.error("Error fetching customers:", error);
          setCustomers([]);
        }

        // Generate chart data from orders (last 7 months)
        generateChartData(ordersData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [store?.id]);

  // Generate chart data from orders - LAST 7 MONTHS (DYNAMIC)
  const generateChartData = (ordersList: Order[]) => {
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

    // Get last 7 months dynamically from today
    const now = new Date();
    const months: Array<{ key: string; ar: string; date: Date }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      months.push({
        key: monthsEn[monthIndex],
        ar: monthsAr[monthIndex],
        date,
      });
    }

    const monthlyData: Record<string, number> = {};
    months.forEach((m) => {
      monthlyData[m.key] = 0;
    });

    // Sum sales by month (include all non-cancelled orders)
    ordersList.forEach((order) => {
      if (order.status !== "cancelled") {
        const orderDate = new Date(order.created_at);
        const monthIndex = orderDate.getMonth();
        const monthKey = monthsEn[monthIndex];
        monthlyData[monthKey] += Number(order.total || 0);
      }
    });

    // Create chart data
    const data = months.map((m) => ({
      month: m.ar,
      monthEn: m.key,
      sales: monthlyData[m.key],
    }));

    setChartData(data);
  };

  // Copy store link to clipboard
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

  // Calculate statistics from real data
  const stats = useMemo(() => {
    // 1. Setup Dates for Month-over-Month Comparison
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get exact previous month (handles year wrap-around automatically)
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    // Helper functions
    const isCurrentMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };

    const isLastMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    };

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0; // 100% if first month with sales
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    // 2. Base Totals
    const activeOrders = orders.filter((o) => o.status !== "cancelled");
    const totalRevenue = activeOrders.reduce(
      (sum, o) => sum + Number(o.total || 0),
      0,
    );
    const totalOrders = orders.length;
    const uniqueCustomers =
      customers.length > 0
        ? customers.length
        : new Set(orders.map((o) => o.customer_name)).size;

    // 3. Calculate Current vs Previous Month Data
    let currentMonthRev = 0,
      lastMonthRev = 0;
    let currentMonthOrds = 0,
      lastMonthOrds = 0;
    const currentMonthCusts = new Set<string>();
    const lastMonthCusts = new Set<string>();

    orders.forEach((o) => {
      const amount = Number(o.total || 0);
      const isCur = isCurrentMonth(o.created_at);
      const isPrev = isLastMonth(o.created_at);
      const notCancelled = o.status !== "cancelled";

      if (isCur) {
        currentMonthOrds++;
        currentMonthCusts.add(o.customer_name);
        if (notCancelled) currentMonthRev += amount;
      } else if (isPrev) {
        lastMonthOrds++;
        lastMonthCusts.add(o.customer_name);
        if (notCancelled) lastMonthRev += amount;
      }
    });

    // 4. Generate Professional Growth Percentages
    const revenueChange = calculateGrowth(currentMonthRev, lastMonthRev);
    const ordersChange = calculateGrowth(currentMonthOrds, lastMonthOrds);
    const customersChange = calculateGrowth(
      currentMonthCusts.size,
      lastMonthCusts.size,
    );

    const productsChange = 0;

    return [
      {
        label: tr.totalRevenue || "إجمالي الإيرادات",
        value: totalRevenue.toLocaleString("en-US", {
          maximumFractionDigits: 2,
        }),
        unit: "$",
        change: revenueChange,
        icon: TrendingUp,
        color: "bg-[rgb(60_28_84)]",
        iconColor: "text-white",
      },
      {
        label: tr.totalOrders || "إجمالي الطلبات",
        value: totalOrders.toString(),
        unit: tr.order || "طلب",
        change: ordersChange,
        icon: ShoppingCart,
        color: "bg-[rgb(244_242_245)]",
        iconColor: "text-[rgb(60_28_84)]",
      },
      {
        label: tr.totalCustomers || "إجمالي العملاء",
        value: uniqueCustomers.toString(),
        unit: "",
        change: customersChange,
        icon: Users,
        color: "bg-[rgb(244_242_245)]",
        iconColor: "text-[rgb(60_28_84)]",
      },
      {
        label: tr.totalProducts || "إجمالي المنتجات",
        value: products.length.toString(),
        unit: tr.piece || "قطعة",
        change: productsChange,
        icon: Package,
        color: "bg-[rgb(244_242_245)]",
        iconColor: "text-[rgb(60_28_84)]",
      },
    ];
  }, [orders, products, customers, tr]);

  const chartKey = lang === "ar" ? "month" : "monthEn";

  // Get recent 5 orders
  const recentOrders = useMemo(() => {
    return orders
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);
  }, [orders]);

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-100">
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
                  formatter={(value: number) =>
                    `$${value.toLocaleString("en-US", {
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
