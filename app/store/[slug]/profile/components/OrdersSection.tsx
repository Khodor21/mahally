"use client";

import { useState } from "react";
import { Package, ChevronRight, ChevronDown, Loader2 } from "lucide-react";

type OrderItem = {
  id: string;
  title: string;
  image: string | null;
  price: string;
  qty: number;
  total: string;
};

type Order = {
  id: string;
  displayId: string;
  date: string;
  total: string;
  status: string;
  statusAr: string;
  items: OrderItem[]; // Added the items array here
};
type Props = {
  orders: Order[];
  lang: "en" | "ar";
  loading?: boolean;
  onOrderClick?: (orderId: string) => void;
};

const translations = {
  en: {
    noOrders: "No orders yet",
    startShopping: "Start shopping to see your orders here",
  },
  ar: {
    noOrders: "لا توجد طلبات حتى الآن",
    startShopping: "ابدأ التسوق لرؤية طلباتك هنا",
  },
};

export default function OrdersSection({
  orders,
  lang,
  loading = false,
}: Props) {
  const tr = translations[lang] as any;
  const isArabic = lang === "ar";
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleOrder = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "مكتمل":
      case "completed":
        return "bg-green-100 text-green-700";
      case "processing":
      case "قيد المعالجة":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
      case "ملغى":
        return "bg-red-100 text-red-700";
      default:
        return "bg-brand-primary/10 text-brand-primary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="text-brand-primary animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-900 mb-1">{tr.noOrders}</p>
        <p className="text-xs text-gray-500">{tr.startShopping}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id;

        return (
          <div
            key={order.id}
            className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
              isExpanded
                ? "border-brand-primary/30 shadow-sm"
                : "border-gray-200 hover:border-brand-primary/30"
            }`}
          >
            {/* Clickable Header */}
            <button
              onClick={() => toggleOrder(order.id)}
              className={`w-full text-left p-3 sm:p-4 transition-colors ${
                isExpanded ? "bg-brand-primary/5" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.displayId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{order.date}</p>
                </div>
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {isArabic ? order.statusAr : order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">
                  {order.total}
                </span>
                {isExpanded ? (
                  <ChevronDown size={18} className="text-brand-primary" />
                ) : (
                  <ChevronRight size={18} className="text-gray-400" />
                )}
              </div>
            </button>

            {/* Expandable Items List */}
            {isExpanded && (
              <div className="bg-white border-t border-gray-100 p-3 sm:p-4 flex flex-col gap-3">
                {order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 sm:gap-4 py-2"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover bg-gray-100 border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package size={20} className="text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {isArabic ? "الكمية:" : "Qty:"} {item.qty} ×{" "}
                          {item.price}
                        </p>
                      </div>

                      <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {item.total}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    {isArabic
                      ? "لا توجد تفاصيل لهذا الطلب"
                      : "No item details available"}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
