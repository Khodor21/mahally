"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Eye,
  RefreshCw,
  X,
  Package,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Calendar,
  CreditCard,
  User,
} from "lucide-react";

import { useDashboard } from "../DashboardContext";
import { useOrders, useOrderStatusUpdate } from "@/hooks/useApi";
import Toast from "../components/Toast";
import type { Order, StoreData } from "@/types/api";

const statusStyles: Record<
  string,
  {
    bg: string;
    text: string;
    icon: string;
    label: string;
    border: string;
    ring: string;
  }
> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    ring: "ring-amber-500",
    icon: "⏳",
    label: "قيد الانتظار",
  },
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    ring: "ring-emerald-500",
    icon: "✓",
    label: "مكتمل",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    ring: "ring-red-500",
    icon: "✕",
    label: "ملغى",
  },
};

interface ToastState {
  message: string;
  type: "success" | "error";
}

interface OrdersPanelProps {
  store?: StoreData;
}

const statusOptions = [
  { value: "pending", label: "قيد الانتظار", labelEn: "Pending" },
  { value: "completed", label: "مكتمل", labelEn: "Completed" },
  { value: "cancelled", label: "ملغى", labelEn: "Cancelled" },
];

export default function OrdersPanel({ store }: OrdersPanelProps) {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const storeId = store?.id || "";

  const {
    data: ordersData,
    loading,
    error,
    retry: fetchOrders,
  } = useOrders(storeId, {
    skip: !storeId,
  });

  const orders = ordersData ?? [];

  const { execute: updateStatus, loading: updatingStatus } =
    useOrderStatusUpdate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [toast, setToast] = useState<ToastState | null>(null);

  // Animation states separated from mounting state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const statusLabel: Record<string, string> = {
    completed: tr.completed || "مكتمل",
    pending: tr.pending || "قيد الانتظار",
    cancelled: tr.cancelled || "ملغى",
  };

  const filters = [
    { key: "all", label: tr.allOrders || "الكل" },
    { key: "pending", label: tr.pending || "قيد الانتظار" },
    { key: "completed", label: tr.completed || "مكتمل" },
    { key: "cancelled", label: tr.cancelled || "ملغى" },
  ];

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
  }

  const errorMsg = tr.errorOccurred || "حدث خطأ";

  useMemo(() => {
    if (error) showToast(errorMsg, "error");
  }, [error, errorMsg]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.id.includes(search);

      const matchFilter = filter === "all" || o.status === filter;

      return matchSearch && matchFilter;
    });
  }, [orders, search, filter]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      return sum + Number(order.total || 0);
    }, 0);
  }, [orders]);

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    document.body.style.overflow = "hidden";
    // Slight delay to allow DOM to mount before adding transition classes
    setTimeout(() => setModalOpen(true), 10);
  };

  const closeOrderModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "";
    // Wait for the transition to finish before unmounting
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!selectedOrder || updatingStatus) return;

    try {
      await updateStatus(selectedOrder.id, newStatus);

      const updatedOrder = { ...selectedOrder, status: newStatus as any };
      setSelectedOrder(updatedOrder);

      fetchOrders();

      showToast(
        lang === "ar"
          ? "تم تحديث حالة الطلب بنجاح"
          : "Order status updated successfully",
        "success",
      );
    } catch {
      showToast(errorMsg, "error");
    }
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Summary Cards - Grid updated to 4 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-up">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg md:rounded-xl p-4 md:p-6 bg-gray-100 animate-pulse h-[88px] md:h-[104px]"
              />
            ))
          : [
              {
                label: tr.allOrders || "جميع الطلبات",
                value: orders.length,
                color:
                  "bg-gradient-to-br from-[rgb(60_28_84)] to-[rgb(80_40_110)] text-white shadow-sm",
              },
              {
                label: tr.pending || "قيد الانتظار",
                value: orders.filter((o) => o.status === "pending").length,
                color:
                  "bg-gradient-to-br from-amber-50 to-orange-50 text-amber-800 border border-amber-100 shadow-sm",
              },
              {
                label: tr.completed || "مكتمل",
                value: orders.filter((o) => o.status === "completed").length,
                color:
                  "bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-100 shadow-sm",
              },
              {
                label: tr.cancelled || "ملغى",
                value: orders.filter((o) => o.status === "cancelled").length,
                color:
                  "bg-gradient-to-br from-red-50 to-rose-50 text-red-800 border border-red-100 shadow-sm",
              },
            ].map((c) => (
              <div
                key={c.label}
                className={`rounded-lg md:rounded-xl p-4 md:p-6 ${c.color} transition-all duration-300 hover:-translate-y-1`}
              >
                <p className="text-2xl md:text-3xl font-bold font-sans">
                  {c.value}
                </p>
                <p className="text-xs md:text-sm mt-1 md:mt-2 opacity-80 font-medium leading-tight">
                  {c.label}
                </p>
              </div>
            ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-fade-up delay-100">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 px-4 md:px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 w-full md:w-auto">
            {loading ? (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1 md:flex-none animate-pulse w-full md:w-64">
                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                <div className="h-4 w-24 rounded bg-gray-200"></div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1 md:flex-none focus-within:ring-2 focus-within:ring-[rgb(60_28_84)]/20 focus-within:border-[rgb(60_28_84)] transition-all">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder={tr.searchOrders || "ابحث عن طلب..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none w-full"
                  dir={dir}
                />
              </div>
            )}

            <button
              onClick={fetchOrders}
              disabled={loading || !storeId}
              className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 shrink-0"
              title="تحديث"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                  filter === f.key
                    ? "bg-[rgb(60_28_84)] text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Revenue Bar */}
        {loading ? (
          <div className="px-4 md:px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-gray-200 animate-pulse"></div>
            <div className="h-6 w-16 rounded bg-gray-200 animate-pulse"></div>
          </div>
        ) : (
          <div className="px-4 md:px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              {tr.totalRevenue || "إجمالي الإيرادات"}:
            </span>
            <span className="text-base md:text-lg font-bold text-[rgb(60_28_84)]">
              ${" "}
              {totalRevenue.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-gray-100 bg-white">
                {[
                  tr.orderId || "رقم الطلب",
                  tr.customer || "العميل",
                  tr.items || "العناصر",
                  tr.amount || "المبلغ",
                  tr.status || "الحالة",
                  tr.date || "التاريخ",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-6 py-4 text-start text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 md:px-6 py-4">
                      <div className="h-4 w-20 rounded bg-gray-100 animate-pulse"></div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <div className="h-4 w-32 rounded bg-gray-100 animate-pulse"></div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <div className="h-4 w-12 rounded bg-gray-100 animate-pulse"></div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="h-4 w-16 rounded bg-gray-100 animate-pulse"></div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <div className="h-6 w-24 rounded-full bg-gray-100 animate-pulse"></div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <div className="h-4 w-24 rounded bg-gray-100 animate-pulse"></div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 md:py-24 px-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">
                        {tr.noData || "لا توجد طلبات تطابق بحثك"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => openOrderModal(order)}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Order ID */}
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[rgb(60_28_84)] bg-[rgb(60_28_84)]/5 px-2 py-1 rounded">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </td>

                    {/* Customer Name */}
                    <td className="px-4 md:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {order.customer_name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 md:hidden">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </td>

                    {/* Items Count */}
                    <td className="px-4 md:px-6 py-4 text-gray-500 font-medium hidden md:table-cell">
                      <span className="text-xs font-semibold bg-gray-100 px-2.5 py-1 rounded-full text-gray-600">
                        {order.order_items?.length || 0} {tr.items || "عناصر"}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 md:px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex flex-col md:flex-row md:items-center">
                        <span className="text-[10px] text-gray-400 font-medium md:hidden uppercase tracking-wider mb-0.5">
                          {tr.amount || "المبلغ"}
                        </span>
                        <span className="font-bold text-[rgb(60_28_84)] text-sm md:text-base">
                          ${" "}
                          {Number(order.total).toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${statusStyles[order.status].bg} ${statusStyles[order.status].text} border ${statusStyles[order.status].border}`}
                      >
                        {statusLabel[order.status]}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 md:px-6 py-4 text-gray-500 text-xs whitespace-nowrap hidden md:table-cell font-medium">
                      {new Date(order.created_at).toLocaleDateString(
                        dir === "rtl" ? "ar-SA" : "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell text-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openOrderModal(order);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-[rgb(60_28_84)] hover:bg-[rgb(60_28_84)]/5 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL / DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
              modalOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeOrderModal}
          />

          {/* Modal Panel - Bottom sheet on mobile, Centered card on desktop */}
          <div
            className={`relative w-full md:max-w-2xl bg-white rounded-t-[1.5rem] md:rounded-2xl shadow-2xl max-h-[90vh] md:max-h-[85vh] flex flex-col pointer-events-auto transition-all duration-300 transform ${
              modalOpen
                ? "translate-y-0 opacity-100 md:scale-100"
                : "translate-y-full md:translate-y-8 opacity-0 md:scale-95"
            }`}
            dir={dir}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-[1.5rem] md:rounded-t-2xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgb(60_28_84)]/5 flex items-center justify-center">
                  <Package className="w-5 h-5 text-[rgb(60_28_84)]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    {tr.orderDetails || "تفاصيل الطلب"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[rgb(60_28_84)]" />
                    <p className="text-[11px] text-gray-500 font-mono font-bold tracking-wider">
                      {selectedOrder.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={closeOrderModal}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-4 md:p-6 space-y-6 hide-scrollbar flex-1 bg-gray-50/30">
              {/* Status Manager */}
              <div className="">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">
                    {tr.statusOrder || "حالة الطلب"}
                  </h3>
                  {updatingStatus && (
                    <Loader2 className="w-4 h-4 text-[rgb(60_28_84)] animate-spin" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {statusOptions.map((option) => {
                    const isActive = selectedOrder.status === option.value;
                    const style = statusStyles[option.value];
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          if (!isActive && !updatingStatus) {
                            updateOrderStatus(option.value);
                          }
                        }}
                        disabled={updatingStatus || isActive}
                        className={`relative flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg text-xs font-bold transition-all duration-200 border ${
                          isActive
                            ? `${style.bg} ${style.border} ${style.text} ring-1 ${style.ring}`
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        }`}
                      >
                        <span>
                          {lang === "ar" ? option.label : option.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Information (Clean Card Style) */}
              <div className="">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {tr.customerData || "بيانات العميل"}
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                        {tr.customer || "الاسم"}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedOrder.customer_name}
                      </p>
                    </div>

                    {selectedOrder.customer_phone && (
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {tr.phone || "الهاتف"}
                        </p>
                        <p
                          className="text-sm font-semibold text-gray-900 font-mono"
                          dir="ltr"
                          style={{
                            textAlign: dir === "rtl" ? "right" : "left",
                          }}
                        >
                          {selectedOrder.customer_phone}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-end">
                    {selectedOrder.address && (
                      <div className="md:col-span-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{" "}
                          {tr.address || "العنوان"}
                        </p>
                        <p className="text-sm font-medium text-gray-900 leading-relaxed">
                          {selectedOrder.address}
                          {selectedOrder.city && `، ${selectedOrder.city}`}
                        </p>
                      </div>
                    )}

                    <div className="md:col-span-2 pt-2 border-t border-gray-50">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {tr.date || "تاريخ الطلب"}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedOrder.created_at).toLocaleString(
                          dir === "rtl" ? "ar-SA" : "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items List */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    {tr.items || "المنتجات"} (
                    {selectedOrder.order_items?.length || 0})
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {selectedOrder.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-colors"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-gray-300" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {item.title || `منتج #${item.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-gray-900 font-medium mt-0.5">
                          {tr.quantity || "الكمية"}:{" "}
                          <span className="font-bold text-gray-900">
                            {item.qty}
                          </span>
                        </p>
                      </div>

                      <div className="text-end shrink-0">
                        {item.total && (
                          <p className="text-base font-bold text-[rgb(60_28_84)]">
                            ${" "}
                            {Number(item.total).toLocaleString("en-US", {
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary / Total */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">
                    {tr.subtotal || "المجموع الجزئي"}
                  </span>
                  <span className="text-gray-900 font-bold">
                    ${" "}
                    {Number(selectedOrder.subtotal || 0).toLocaleString(
                      "en-US",
                      { maximumFractionDigits: 2 },
                    )}
                  </span>
                </div>

                {selectedOrder.shipping ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 font-medium">
                      {tr.shipping || "رسوم الشحن"}
                    </span>
                    <span className="text-gray-900 font-bold">
                      ${" "}
                      {Number(selectedOrder.shipping).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ) : null}

                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[rgb(60_28_84)]" />
                    {tr.total || "الإجمالي"}
                  </span>
                  <span className="text-xl md:text-2xl font-black text-[rgb(60_28_84)]">
                    ${" "}
                    {Number(selectedOrder.total).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
