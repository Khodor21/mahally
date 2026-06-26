"use client";

import { useState } from "react";
import { Package, ChevronRight, Loader2 } from "lucide-react";

type Order = {
  id: string;
  date: string;
  total: string;
  status: string;
  statusAr: string;
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
  onOrderClick,
}: Props) {
  const tr = translations[lang] as any;
  const isArabic = lang === "ar";

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
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
      {orders.map((order) => (
        <button
          key={order.id}
          onClick={() => onOrderClick?.(order.id)}
          className="text-left border border-gray-200 rounded-2xl p-3 sm:p-4 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{order.id}</p>
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
            <ChevronRight size={18} className="text-gray-300" />
          </div>
        </button>
      ))}
    </div>
  );
}
