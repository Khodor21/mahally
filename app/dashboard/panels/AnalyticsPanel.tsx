"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  MousePointer,
  Loader2,
  Package,
} from "lucide-react";
import { useDashboard } from "../DashboardContext";
import { useOrders, useCustomers, useVisitors } from "@/hooks/useApi";
import type { StoreData } from "../types";

interface AnalyticsPanelProps {
  store: StoreData;
}

export default function AnalyticsPanel({ store }: AnalyticsPanelProps) {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const chartKey = lang === "ar" ? "month" : "monthEn";

  // Fetch real data via hooks
  const { data: ordersData, loading: ordersLoading } = useOrders(store?.id);
  const { data: customersData, loading: customersLoading } = useCustomers();
  const { data: visitorsData, loading: visitorsLoading } = useVisitors(
    store?.id,
  );

  const orders = ordersData ?? [];
  const customers = customersData ?? [];
  const visitors = visitorsData ?? [];

  const loading = ordersLoading || customersLoading || visitorsLoading;

  // Calculate dynamic KPIs and Growth
  const kpis = useMemo(() => {
    const now = new Date();

    const isCurrentMonth = (d: string) => {
      const date = new Date(d);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    };
    const isLastMonth = (d: string) => {
      const date = new Date(d);
      return (
        date.getMonth() === now.getMonth() - 1 &&
        date.getFullYear() === now.getFullYear()
      );
    };

    const calculateGrowth = (cur: number, prev: number) =>
      prev === 0
        ? cur > 0
          ? 100
          : 0
        : Number((((cur - prev) / prev) * 100).toFixed(1));

    let curRev = 0,
      lastRev = 0;
    let curOrds = 0,
      lastOrds = 0;
    let curVisits = 0,
      lastVisits = 0;
    const curCusts = new Set<string>();
    const lastCusts = new Set<string>();

    // Aggregate Orders & Revenue & Customers
    orders.forEach((o) => {
      if (isCurrentMonth(o.created_at)) {
        if (o.status !== "cancelled") {
          curOrds++;
          curRev += Number(o.total || 0);
        }
        curCusts.add(o.customer_name);
      } else if (isLastMonth(o.created_at)) {
        if (o.status !== "cancelled") {
          lastOrds++;
          lastRev += Number(o.total || 0);
        }
        lastCusts.add(o.customer_name);
      }
    });

    // Aggregate Visitors
    visitors.forEach((v) => {
      if (isCurrentMonth(v.count_date)) {
        curVisits += Number(v.visitor_count || 0);
      } else if (isLastMonth(v.count_date)) {
        lastVisits += Number(v.visitor_count || 0);
      }
    });

    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.status !== "cancelled" ? Number(o.total || 0) : 0),
      0,
    );
    const totalOrders = orders.filter((o) => o.status !== "cancelled").length;
    const totalVisits = visitors.reduce(
      (sum, v) => sum + Number(v.visitor_count || 0),
      0,
    );
    const totalCustomers = customers.length;

    const revGrowth = calculateGrowth(curRev, lastRev);
    const ordGrowth = calculateGrowth(curOrds, lastOrds);
    const visGrowth = calculateGrowth(curVisits, lastVisits);
    const custGrowth = calculateGrowth(curCusts.size, lastCusts.size);

    return [
      {
        label: tr.totalRevenue || "إجمالي الإيرادات",
        value: totalRevenue.toLocaleString("en-US", {
          maximumFractionDigits: 2,
        }),
        unit: "$",
        change: `${revGrowth >= 0 ? "+" : ""}${revGrowth}%`,
        icon: TrendingUp,
        good: revGrowth >= 0,
      },
      {
        label: tr.ordersCount || "الطلبات",
        value: totalOrders.toLocaleString(),
        unit: tr.order || "طلب",
        change: `${ordGrowth >= 0 ? "+" : ""}${ordGrowth}%`,
        icon: ShoppingCart,
        good: ordGrowth >= 0,
      },
      {
        label: tr.visits || "الزيارات",
        value: totalVisits.toLocaleString(),
        unit: "",
        change: `${visGrowth >= 0 ? "+" : ""}${visGrowth}%`,
        icon: MousePointer,
        good: visGrowth >= 0,
      },
      {
        label: tr.newCustomers || "العملاء الجدد",
        value: totalCustomers.toLocaleString(),
        unit: "",
        change: `${custGrowth >= 0 ? "+" : ""}${custGrowth}%`,
        icon: Users,
        good: custGrowth >= 0,
      },
    ];
  }, [orders, visitors, customers, tr]);

  // Calculate dynamic Chart Data
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

    const monthlyStats: Record<
      string,
      { sales: number; orders: number; visits: number }
    > = Object.fromEntries(
      months.map((m) => [m.key, { sales: 0, orders: 0, visits: 0 }]),
    );

    orders.forEach((order) => {
      if (order.status !== "cancelled") {
        const orderDate = new Date(order.created_at);
        const monthKey = monthsEn[orderDate.getMonth()];
        if (monthlyStats.hasOwnProperty(monthKey)) {
          monthlyStats[monthKey].sales += Number(order.total || 0);
          monthlyStats[monthKey].orders += 1;
        }
      }
    });

    visitors.forEach((visitor) => {
      const vDate = new Date(visitor.count_date);
      const monthKey = monthsEn[vDate.getMonth()];
      if (monthlyStats.hasOwnProperty(monthKey)) {
        monthlyStats[monthKey].visits += Number(visitor.visitor_count || 0);
      }
    });

    return months.map((m) => ({
      month: m.ar,
      monthEn: m.key,
      sales: monthlyStats[m.key].sales,
      orders: monthlyStats[m.key].orders,
      visits: monthlyStats[m.key].visits,
    }));
  }, [orders, visitors]);

  // Bottom Stats Calculations
  const totalOrdersCount = orders.filter(
    (o) => o.status !== "cancelled",
  ).length;
  const totalRevenueSum = orders.reduce(
    (sum, o) => sum + (o.status !== "cancelled" ? Number(o.total || 0) : 0),
    0,
  );
  const totalVisitsCount = visitors.reduce(
    (sum, v) => sum + Number(v.visitor_count || 0),
    0,
  );

  const conversionRate =
    totalVisitsCount > 0
      ? ((totalOrdersCount / totalVisitsCount) * 100).toFixed(2)
      : "0.00";

  const avgOrderValue =
    totalOrdersCount > 0
      ? (totalRevenueSum / totalOrdersCount).toFixed(2)
      : "0.00";

  const tooltipStyle = {
    background: "white",
    border: "1px solid rgb(244,242,245)",
    borderRadius: "12px",
    fontSize: "12px",
    fontFamily: "Cairo, sans-serif",
    color: "rgb(60,28,84)",
    boxShadow: "0 4px 24px rgba(60,28,84,0.08)",
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[rgb(244_242_245)] flex items-center justify-center">
                <kpi.icon className="w-5 h-5 text-[rgb(60_28_84)]" />
              </div>
              {loading ? (
                <div className="h-6 w-12 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    kpi.good
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {kpi.change}
                </span>
              )}
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse mb-1 mt-2" />
            ) : (
              <p className="text-2xl font-bold text-[rgb(60_28_84)]">
                {kpi.value}
                {kpi.unit && (
                  <span className="text-sm font-normal ms-1 text-[rgb(60_28_84)]/50">
                    {kpi.unit}
                  </span>
                )}
              </p>
            )}
            <p className="text-xs text-[rgb(60_28_84)]/50 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm animate-fade-up delay-100">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-[rgb(60_28_84)] text-base">
              {tr.salesOverview || "نظرة عامة على المبيعات"}
            </h3>
            <p className="text-xs text-[rgb(60_28_84)]/40 mt-0.5">
              {tr.last7Months || "آخر 7 أشهر"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Loader2 className="w-8 h-8 text-[rgb(60_28_84)]/40 animate-spin" />
          </div>
        ) : chartData.length > 0 && chartData.some((d) => d.sales > 0) ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 10, bottom: 0, left: -10 }}
            >
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
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
                  fontFamily: "Cairo",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "rgba(60,28,84,0.5)",
                  fontFamily: "Cairo",
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ fontWeight: 700 }}
                formatter={(value: any) =>
                  `$${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                }
              />
              <Area
                type="monotone"
                dataKey="sales"
                name={tr.revenue || "الإيرادات"}
                stroke="rgb(60,28,84)"
                strokeWidth={2.5}
                fill="url(#gradRevenue)"
                dot={{ fill: "rgb(60,28,84)", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col gap-1 items-center justify-center h-[250px] text-[rgb(60_28_84)]/40">
            <Package className="w-8 md:w-10 h-8 md:h-10 text-gray-300" />
            <p className="text-gray-500">{tr.noData || "لا توجد بيانات"}</p>
          </div>
        )}
      </div>

      {/* Orders + Visits Bar Chart */}
      <div className="grid md:grid-cols-2 gap-6 animate-fade-up delay-200">
        {/* Orders Chart */}
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm">
          <h3 className="font-bold text-[rgb(60_28_84)] text-base mb-5">
            {tr.ordersOverview || "نظرة عامة على الطلبات"}
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="w-8 h-8 text-[rgb(60_28_84)]/40 animate-spin" />
            </div>
          ) : chartData.length > 0 && chartData.some((d) => d.orders > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(244,242,245)"
                  vertical={false}
                />
                <XAxis
                  dataKey={chartKey}
                  tick={{
                    fontSize: 10,
                    fill: "rgba(60,28,84,0.5)",
                    fontFamily: "Cairo",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: "rgba(60,28,84,0.5)",
                    fontFamily: "Cairo",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ fontWeight: 700 }}
                />
                <Bar
                  dataKey="orders"
                  name={tr.ordersCount || "عدد الطلبات"}
                  fill="rgb(60,28,84)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col gap-1 items-center justify-center h-[200px] text-[rgb(60_28_84)]/40">
              <Package className="w-8 h-8 text-gray-300" />
              <p className="text-gray-500 text-sm">
                {tr.noData || "لا توجد بيانات"}
              </p>
            </div>
          )}
        </div>

        {/* Visits Chart */}
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm">
          <h3 className="font-bold text-[rgb(60_28_84)] text-base mb-5">
            {tr.visits || "الزيارات"}
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="w-8 h-8 text-[rgb(60_28_84)]/40 animate-spin" />
            </div>
          ) : chartData.length > 0 && chartData.some((d) => d.visits > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(244,242,245)"
                  vertical={false}
                />
                <XAxis
                  dataKey={chartKey}
                  tick={{
                    fontSize: 10,
                    fill: "rgba(60,28,84,0.5)",
                    fontFamily: "Cairo",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: "rgba(60,28,84,0.5)",
                    fontFamily: "Cairo",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ fontWeight: 700 }}
                />
                <Bar
                  dataKey="visits"
                  name={tr.visits || "الزيارات"}
                  fill="rgb(207,195,223)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col gap-1 items-center justify-center h-[200px] text-[rgb(60_28_84)]/40">
              <Package className="w-8 h-8 text-gray-300" />
              <p className="text-gray-500 text-sm">
                {tr.noData || "لا توجد بيانات"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Conversion + Avg */}
      <div className="grid grid-cols-2 gap-4 animate-fade-up delay-300">
        {[
          {
            label: tr.conversionRate || "معدل التحويل",
            value: `${conversionRate}%`,
            sub:
              lang === "ar" ? "من الزيارات إلى طلبات" : "From visits to orders",
          },
          {
            label: tr.avgOrderValue || "متوسط قيمة الطلب",
            value: `$${avgOrderValue}`,
            sub: lang === "ar" ? "متوسط قيمة كل طلب" : "Average per order",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm"
          >
            <p className="text-xs text-[rgb(60_28_84)]/40 mb-2">{item.label}</p>
            {loading ? (
              <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-[rgb(60_28_84)]">
                {item.value}
              </p>
            )}
            <p className="text-xs text-[rgb(60_28_84)]/40 mt-1">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
