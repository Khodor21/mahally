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
} from "lucide-react";

import { useDashboard } from "../DashboardContext";
import { useOrders, useOrderStatusUpdate } from "@/hooks/useApi";
import Toast from "../components/Toast";
import type { Order, StoreData } from "@/types/api";

const statusStyles: Record<
  string,
  { bg: string; text: string; icon: string; label: string }
> = {
  pending: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-400",
    icon: "⏳",
    label: "قيد الانتظار",
  },
  completed: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: "✓",
    label: "مكتمل",
  },
  cancelled: {
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-700 dark:text-red-400",
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const statusLabel: Record<string, string> = {
    completed: tr.completed || "مكتمل",
    pending: tr.pending || "قيد الانتظار",
    cancelled: tr.cancelled || "ملغى",
  };

  const filters = [
    { key: "all", label: tr.allOrders || "جميع الطلبات" },
    { key: "pending", label: tr.pending || "قيد الانتظار" },
    { key: "completed", label: tr.completed || "مكتمل" },
    { key: "cancelled", label: tr.cancelled || "ملغى" },
  ];

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
  }

  const errorMsg = tr.errorOccurred || "حدث خطأ";

  // Show error toast automatically if hook returns error
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
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeOrderModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "";
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!selectedOrder || updatingStatus) return;

    try {
      await updateStatus(selectedOrder.id, newStatus);

      const updatedOrder = { ...selectedOrder, status: newStatus as any };
      setSelectedOrder(updatedOrder);

      // We still update local state optimistically here or refetch
      // To ensure strict sync with hook pattern, we call fetchOrders()
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
      {/* Summary Cards - Grid updated to 3 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 animate-fade-up">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg md:rounded-xl p-3 md:p-6 bg-gray-100 animate-pulse"
              />
            ))
          : [
              {
                label: tr.allOrders || "جميع الطلبات",
                value: orders.length,
                color:
                  "bg-gradient-to-br from-[rgb(60_28_84)] to-[rgb(80_40_110)] text-white ",
              },
              {
                label: tr.pending || "قيد الانتظار",
                value: orders.filter((o) => o.status === "pending").length,
                color:
                  "bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700",
              },
              {
                label: tr.completed || "مكتمل",
                value: orders.filter((o) => o.status === "completed").length,
                color:
                  "bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700",
              },
            ].map((c) => (
              <div
                key={c.label}
                className={`rounded-lg md:rounded-xl p-3 md:p-6 ${c.color} transition-all duration-300 hover:shadow-md hover:scale-105`}
              >
                <p className="text-xl md:text-3xl font-bold font-sans">
                  {c.value}
                </p>
                <p className="text-xs md:text-sm mt-1 md:mt-2 opacity-70 font-medium leading-tight">
                  {c.label}
                </p>
              </div>
            ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-up delay-100">
        {/* Toolbar */}
        <div
          className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-5 border-b border-gray-100 bg-gray-50`}
        >
          <div className="flex items-center gap-2 w-full md:w-auto">
            {loading ? (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 md:px-4 py-2 flex-1 md:flex-none animate-pulse w-full md:w-56">
                <div className="w-4 h-4 rounded-full bg-gray-300/40"></div>
                <div className="h-4 w-24 rounded bg-gray-300/40"></div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 md:px-4 py-2 flex-1 md:flex-none">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder={tr.searchOrders || "ابحث عن طلب..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
                  dir={dir}
                />
              </div>
            )}

            <button
              onClick={fetchOrders}
              disabled={loading || !storeId}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 shrink-0"
              title="تحديث"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto overflow-x-auto md:overflow-x-visible">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                  filter === f.key
                    ? "bg-[rgb(60_28_84)] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Revenue Bar */}
        {loading ? (
          <div className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-[rgb(60_28_84)]/5 to-transparent border-b border-gray-100 flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-gray-300/40 animate-pulse"></div>
            <div className="h-6 w-16 rounded bg-gray-300/40 animate-pulse"></div>
          </div>
        ) : (
          <div className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-[rgb(60_28_84)]/5 to-transparent border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
              {tr.totalRevenue || "إجمالي الإيرادات"}:
            </span>
            <span className="text-lg font-bold text-[rgb(60_28_84)]">
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
              <tr className="border-b border-gray-100 bg-gray-50">
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
                    className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 md:border-b md:border-gray-100"
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="h-4 w-20 mx-auto rounded bg-gray-200 animate-pulse"></div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <div className="h-4 w-24 mx-auto rounded bg-gray-200 animate-pulse"></div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <div className="h-4 w-16 mx-auto rounded bg-gray-200 animate-pulse"></div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="h-4 w-16 mx-auto rounded bg-gray-200 animate-pulse"></div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <div className="h-4 w-20 mx-auto rounded bg-gray-200 animate-pulse"></div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <div className="h-4 w-24 mx-auto rounded bg-gray-200 animate-pulse"></div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <div className="h-8 w-8 mx-auto rounded-lg bg-gray-200 animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 md:py-20 px-4 md:px-6 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
                      <Package className="w-10 md:w-12 h-10 md:h-12 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        {tr.noData || "لا توجد طلبات"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order, idx) => (
                  <tr
                    key={order.id}
                    onClick={() => openOrderModal(order)}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer text-center ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    {/* Order ID */}
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[rgb(60_28_84)]" />
                        <span className="font-mono text-xs font-bold text-gray-900">
                          {order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </td>

                    {/* Customer Name */}
                    <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold">
                          {order.customer_name}
                        </span>
                        <span className="text-xs text-gray-500 md:hidden">
                          {order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </td>

                    {/* Items Count */}
                    <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 font-medium hidden md:table-cell">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                        {order.order_items?.length || 0}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 md:px-6 py-3 md:py-4 font-bold text-gray-900 whitespace-nowrap">
                      <div className="flex flex-col md:flex-row md:items-center justify-center">
                        <span className="text-xs text-gray-500 md:hidden">
                          {tr.amount || "المبلغ"}
                        </span>
                        <span className="font-bold text-[rgb(60_28_84)]">
                          ${" "}
                          {Number(order.total).toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusStyles[order.status].bg} ${statusStyles[order.status].text}`}
                      >
                        {statusLabel[order.status]}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 md:px-6 py-3 md:py-4 text-gray-500 text-xs whitespace-nowrap hidden md:table-cell">
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
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <div className="flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderModal(order);
                          }}
                          className="p-2 rounded-lg hover:bg-[rgb(60_28_84)]/10 text-gray-400 hover:text-[rgb(60_28_84)] transition-all duration-200 group"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM SHEET MODAL */}
      {modalOpen && selectedOrder && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
              modalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={closeOrderModal}
          />

          <div
            className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 transform max-h-[95vh] overflow-hidden ${
              modalOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
            dir={dir}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between rounded-t-3xl z-10">
              <button
                onClick={closeOrderModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              <div className="flex-1 text-center">
                <h2 className="text-lg font-bold text-gray-900">
                  {tr.orderId || "رقم الطلب"}
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  {selectedOrder.id}
                </p>
              </div>

              <div className="w-10" />
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-60px)] px-4 md:px-8 py-6 space-y-6">
              {/* Status Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {tr.status || "حالة الطلب"}
                  </h3>
                  {updatingStatus && (
                    <Loader2 className="w-4 h-4 text-[rgb(60_28_84)] animate-spin" />
                  )}
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-bold tracking-wide mb-2">
                    {tr.currentStatus || "الحالة الحالية"}
                  </p>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusStyles[selectedOrder.status].bg} ${statusStyles[selectedOrder.status].text}`}
                  >
                    <span>{statusStyles[selectedOrder.status].icon}</span>
                    {statusLabel[selectedOrder.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (
                          selectedOrder.status !== option.value &&
                          !updatingStatus
                        ) {
                          updateOrderStatus(option.value);
                        }
                      }}
                      disabled={
                        updatingStatus || selectedOrder.status === option.value
                      }
                      className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        selectedOrder.status === option.value
                          ? `${statusStyles[option.value].bg} ${statusStyles[option.value].text} ring-2 ring-offset-2`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                      }`}
                    >
                      {lang === "ar" ? option.label : option.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {tr.customer || "بيانات العميل"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 uppercase font-bold tracking-wide mb-2">
                      {tr.customer || "الاسم"}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedOrder.customer_name}
                    </p>
                  </div>

                  {selectedOrder.customer_phone && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 uppercase font-bold tracking-wide flex items-center gap-2 mb-2">
                        <Phone className="w-3 h-3" /> {tr.phone || "الهاتف"}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 font-mono">
                        {selectedOrder.customer_phone}
                      </p>
                    </div>
                  )}

                  {selectedOrder.customer_email && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2">
                      <p className="text-xs text-gray-600 uppercase font-bold tracking-wide flex items-center gap-2 mb-2">
                        <Mail className="w-3 h-3" />{" "}
                        {tr.email || "البريد الإلكتروني"}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 break-all">
                        {selectedOrder.customer_email}
                      </p>
                    </div>
                  )}

                  {selectedOrder.address && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2">
                      <p className="text-xs text-gray-600 uppercase font-bold tracking-wide flex items-center gap-2 mb-2">
                        <MapPin className="w-3 h-3" /> {tr.address || "العنوان"}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedOrder.address}
                        {selectedOrder.city && `, ${selectedOrder.city}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {tr.items || "العناصر"}
                </h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 md:gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 md:w-16 h-12 md:h-16 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {item.title || `Item #${item.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {tr.quantity || "الكمية"}:{" "}
                          <span className="font-bold text-gray-700">
                            {item.qty}
                          </span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {item.total && (
                          <p className="text-sm font-bold text-gray-900">
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

              {/* Order Summary */}
              <div className="space-y-3 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">
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
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">
                      {tr.shipping || "الشحن"}
                    </span>
                    <span className="text-gray-900 font-bold">
                      ${" "}
                      {Number(selectedOrder.shipping).toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ) : null}

                <div className="border-t border-gray-300 pt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {tr.total || "الإجمالي"}
                  </span>
                  <span className="text-2xl font-bold text-[rgb(60_28_84)]">
                    ${" "}
                    {Number(selectedOrder.total).toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="h-4" />
            </div>
          </div>
        </>
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
