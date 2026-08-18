"use client";
import { useMemo, useState, useEffect } from "react";
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
  Wallet,
  Banknote,
  Building2,
  Smartphone,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Truck,
  Tag,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
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
    border: string;
    ring: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    ring: "ring-amber-400",
    icon: <Clock className="w-4 h-4" />,
    label: "قيد الانتظار",
  },
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    ring: "ring-emerald-400",
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "مكتمل",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    ring: "ring-red-400",
    icon: <XCircle className="w-4 h-4" />,
    label: "ملغى",
  },
};

const paymentMethodConfig: Record<
  string,
  {
    icon: React.ReactNode;
    labelAr: string;
    labelEn: string;
    bg: string;
    text: string;
    border: string;
  }
> = {
  cash_on_delivery: {
    icon: <Banknote className="w-4 h-4" />,
    labelAr: "الدفع عند الاستلام",
    labelEn: "Cash on Delivery",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  card: {
    icon: <CreditCard className="w-4 h-4" />,
    labelAr: "بطاقة ائتمان",
    labelEn: "Credit Card",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  bank_transfer: {
    icon: <Building2 className="w-4 h-4" />,
    labelAr: "تحويل بنكي",
    labelEn: "Bank Transfer",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  mobile_payment: {
    icon: <Smartphone className="w-4 h-4" />,
    labelAr: "دفع عبر الجوال",
    labelEn: "Mobile Payment",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  other: {
    icon: <Wallet className="w-4 h-4" />,
    labelAr: "أخرى",
    labelEn: "Other",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  },
};

const getDefaultPaymentConfig = (method: string) => ({
  icon: <Wallet className="w-4 h-4" />,
  labelAr: method || "غير محدد",
  labelEn: method || "Not specified",
  bg: "bg-gray-50",
  text: "text-gray-700",
  border: "border-gray-200",
});

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
  } = useOrders(storeId, { skip: !storeId });

  const orders = ordersData ?? [];
  const { execute: updateStatus, loading: updatingStatus } =
    useOrderStatusUpdate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notesExpanded, setNotesExpanded] = useState(true);
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

  useEffect(() => {
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
    return orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [orders]);

  const copyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setNotesExpanded(true);
    document.body.style.overflow = "hidden";
    setTimeout(() => setModalOpen(true), 10);
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
      setSelectedOrder({ ...selectedOrder, status: newStatus as any });
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

  const getPaymentConfig = (method: string) =>
    paymentMethodConfig[method] || getDefaultPaymentConfig(method);

  return (
    <div className="space-y-6" dir={dir}>
      {/* Summary Cards */}
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
                  tr.paymentMethod || "طريقة الدفع",
                  tr.status || "الحالة",
                  tr.date || "التاريخ",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 md:px-6 py-4 text-start text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap"
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
                      <div className="h-5 w-20 rounded-full bg-gray-100 animate-pulse"></div>
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
                  <td colSpan={8} className="py-16 md:py-24 px-4 text-center">
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
                filtered.map((order) => {
                  const paymentConfig = getPaymentConfig(
                    order.payment_method || "",
                  );
                  const st = statusStyles[order.status];
                  return (
                    <tr
                      key={order.id}
                      onClick={() => openOrderModal(order)}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                        <span className="font-mono text-xs font-bold text-[rgb(60_28_84)] bg-[rgb(60_28_84)]/5 px-2 py-1 rounded">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
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
                      <td className="px-4 md:px-6 py-4 text-gray-500 font-medium hidden md:table-cell">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-gray-600">
                          {order.order_items?.length || 0}
                        </span>
                      </td>
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
                      <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${paymentConfig.bg} ${paymentConfig.text} border ${paymentConfig.border}`}
                        >
                          {paymentConfig.icon}
                          {lang === "ar"
                            ? paymentConfig.labelAr
                            : paymentConfig.labelEn}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${st.bg} ${st.text} border ${st.border}`}
                        >
                          {st.icon}
                          {statusLabel[order.status]}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-gray-500 text-xs whitespace-nowrap hidden md:table-cell font-medium">
                        {new Date(order.created_at).toLocaleDateString(
                          dir === "rtl" ? "ar-SA" : "en-US",
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================ */}
      {/* MODAL                                        */}
      {/* ============================================ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
              modalOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeOrderModal}
          />

          {/* Panel */}
          <div
            className={`relative w-full md:max-w-xl bg-white rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[92vh] md:max-h-[85vh] flex flex-col pointer-events-auto transition-all duration-300 ${
              modalOpen
                ? "translate-y-0 opacity-100 md:scale-100"
                : "translate-y-full md:translate-y-6 opacity-0 md:scale-95"
            }`}
            dir={dir}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {tr.orderDetails || "تفاصيل الطلب"}
                  </h3>
                  <button
                    onClick={() => copyOrderId(selectedOrder.id)}
                    className="flex items-center gap-1.5 mt-0.5 group/id hover:opacity-70 transition-opacity"
                  >
                    <span className="text-[11px] text-gray-400 font-mono font-medium tracking-wider">
                      #{selectedOrder.id.slice(0, 8).toUpperCase()}
                    </span>
                    {copiedId === selectedOrder.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-300 group-hover/id:text-gray-500 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={closeOrderModal}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 hide-scrollbar">
              <div className="p-5 space-y-4">
                {/* Status + Payment — horizontal pills row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Current status pill */}
                  {(() => {
                    const st = statusStyles[selectedOrder.status];
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${st.bg} ${st.text} ${st.border}`}
                      >
                        {st.icon}
                        {statusLabel[selectedOrder.status]}
                      </span>
                    );
                  })()}
                  {/* Payment pill */}
                  {(() => {
                    const cfg = getPaymentConfig(
                      selectedOrder.payment_method || "",
                    );
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        {cfg.icon}
                        {lang === "ar" ? cfg.labelAr : cfg.labelEn}
                      </span>
                    );
                  })()}
                  {/* Date */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-100 bg-gray-50 text-gray-500 ms-auto">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(selectedOrder.created_at).toLocaleDateString(
                      dir === "rtl" ? "ar-SA" : "en-US",
                      { year: "numeric", month: "short", day: "numeric" },
                    )}
                  </span>
                </div>

                {/* Status updater */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                    {tr.updateStatus || "تحديث الحالة"}
                    {updatingStatus && (
                      <Loader2 className="inline w-3 h-3 ms-1.5 animate-spin text-[rgb(60_28_84)]" />
                    )}
                  </p>
                  <div className="flex gap-2">
                    {statusOptions.map((option) => {
                      const isActive = selectedOrder.status === option.value;
                      const st = statusStyles[option.value];
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            if (!isActive && !updatingStatus) {
                              updateOrderStatus(option.value);
                            }
                          }}
                          disabled={updatingStatus || isActive}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                            isActive
                              ? `${st.bg} ${st.border} ${st.text} ring-2 ${st.ring}/30`
                              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                          }`}
                        >
                          {st.icon}
                          {lang === "ar" ? option.label : option.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      {tr.customerData || "بيانات العميل"}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {/* Name */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <User className="w-4 h-4 text-gray-300 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 mb-0.5">
                          {tr.customer || "الاسم"}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedOrder.customer_name}
                        </p>
                      </div>
                    </div>
                    {/* Phone */}
                    {selectedOrder.customer_phone && (
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Phone className="w-4 h-4 text-gray-300 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 mb-0.5">
                            {tr.phone || "الهاتف"}
                          </p>
                          <a
                            href={`tel:${selectedOrder.customer_phone}`}
                            className="text-sm font-medium text-[rgb(60_28_84)] hover:underline font-mono"
                            dir="ltr"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {selectedOrder.customer_phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {/* Email */}
                    {selectedOrder.customer_email && (
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Mail className="w-4 h-4 text-gray-300 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 mb-0.5">
                            {tr.email || "البريد الإلكتروني"}
                          </p>
                          <a
                            href={`mailto:${selectedOrder.customer_email}`}
                            className="text-sm font-medium text-[rgb(60_28_84)] hover:underline truncate block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {selectedOrder.customer_email}
                          </a>
                        </div>
                      </div>
                    )}
                    {/* Address */}
                    {(selectedOrder.address || selectedOrder.city) && (
                      <div className="flex items-center gap-3 px-4 py-3">
                        <MapPin className="w-4 h-4 text-gray-300 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 mb-0.5">
                            {tr.address || "العنوان"}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedOrder.address}
                            {selectedOrder.city &&
                              selectedOrder.address &&
                              "، "}
                            {selectedOrder.city}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && selectedOrder.notes.trim() !== "" && (
                  <div className="rounded-xl border border-amber-100 overflow-hidden">
                    <button
                      onClick={() => setNotesExpanded(!notesExpanded)}
                      className="w-full px-4 py-3 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between hover:bg-amber-50 transition-colors"
                    >
                      <span className="text-xs font-bold text-amber-700 flex items-center gap-2">
                        <StickyNote className="w-3.5 h-3.5" />
                        {tr.notes || "ملاحظات العميل"}
                      </span>
                      {notesExpanded ? (
                        <ChevronUp className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-amber-400" />
                      )}
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        notesExpanded
                          ? "max-h-40 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-3.5 h-3.5" />
                      {tr.items || "المنتجات"}
                      <span className="font-normal text-gray-400">
                        ({selectedOrder.order_items?.length || 0})
                      </span>
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {selectedOrder.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-4"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-11 h-11 rounded-lg object-cover border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {item.title || `منتج #${item.id.slice(0, 8)}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {tr.quantity || "الكمية"}:{" "}
                            <span className="font-bold text-gray-600">
                              {item.qty}
                            </span>
                            {" · "}
                            {item.original_price &&
                            item.original_price &&
                            item.original_price > (item.price ?? 0) ? (
                              <>
                                <span className="line-through text-gray-300 me-1">
                                  ${Number(item.original_price).toFixed(2)}
                                </span>
                                <span className="text-emerald-600 font-semibold">
                                  ${Number(item.price).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span>${Number(item.price).toFixed(2)}</span>
                            )}{" "}
                            {lang === "ar" ? "للواحدة" : "each"}
                          </p>
                        </div>
                        {item.total && (
                          <p className="text-sm font-bold text-[rgb(60_28_84)] shrink-0">
                            $
                            {Number(item.total).toLocaleString("en-US", {
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5" />
                      {tr.orderSummary || "ملخص الطلب"}
                    </h3>
                  </div>
                  <div className="px-4 py-4 space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {tr.subtotal || "المجموع الجزئي"}
                      </span>
                      <span className="font-semibold text-gray-900">
                        $
                        {Number(selectedOrder.subtotal || 0).toLocaleString(
                          "en-US",
                          { maximumFractionDigits: 2 },
                        )}
                      </span>
                    </div>
                    {selectedOrder.shipping && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" />
                          {tr.shipping || "رسوم الشحن"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          $
                          {Number(selectedOrder.shipping).toLocaleString(
                            "en-US",
                            { maximumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                    )}
                    {selectedOrder.discount_amount &&
                      Number(selectedOrder.discount_amount) > 1 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-emerald-600 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" />
                            {tr.discount || "الخصم"}
                            {selectedOrder.coupon_code && (
                              <span className="text-[10px] font-mono bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-emerald-700">
                                {selectedOrder.coupon_code}
                              </span>
                            )}
                          </span>
                          <span className="text-emerald-600 font-semibold">
                            -$
                            {Number(
                              selectedOrder.discount_amount,
                            ).toLocaleString("en-US", {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                    <div className="pt-2.5 mt-1 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">
                        {tr.total || "الإجمالي"}
                      </span>
                      <span className="text-xl font-black text-[rgb(60_28_84)]">
                        $
                        {Number(selectedOrder.total).toLocaleString("en-US", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-1" />
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
