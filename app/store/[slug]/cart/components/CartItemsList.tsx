"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Minus, Plus, AlertTriangle, X } from "lucide-react";

type CartItem = {
  product: {
    id: string | number;
    title: string;
    price?: number;
    image?: string;
    stock?: number;
  };
  qty: number;
};

type Props = {
  items: CartItem[];
  currencySymbol: string;
  isArabic?: boolean;
  onUpdateQty: (id: string | number, qty: number) => void;
  onRemoveItem: (id: string | number) => void;
};

export default function CartItemsList({
  items,
  currencySymbol,
  isArabic = false,
  onUpdateQty,
  onRemoveItem,
}: Props) {
  const [warningId, setWarningId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    itemId: string | number | null;
    itemTitle: string;
  }>({ show: false, itemId: null, itemTitle: "" });

  const handleIncrement = (item: CartItem) => {
    const maxStock = item.product.stock ?? Infinity;

    if (item.qty >= maxStock) {
      setWarningId(item.product.id.toString());
      setTimeout(() => setWarningId(null), 3000);
    } else {
      setWarningId(null);
      onUpdateQty(item.product.id, item.qty + 1);
    }
  };

  const handleDeleteClick = (item: CartItem) => {
    setDeleteConfirm({
      show: true,
      itemId: item.product.id,
      itemTitle: item.product.title,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.itemId !== null) {
      onRemoveItem(deleteConfirm.itemId);
    }
    setDeleteConfirm({ show: false, itemId: null, itemTitle: "" });
  };

  return (
    <div className="bg-white">
      <div className="space-y-5">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex gap-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0"
          >
            {/* Product Image */}
            {item.product.image && (
              <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden relative">
                <Image
                  src={item.product.image}
                  alt={item.product.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}

            {/* Product Details */}
            <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  {/* Product Title */}
                  <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2">
                    {item.product.title}
                  </p>

                  {/* Price */}
                  <p className="text-sm font-extrabold text-brand-primary mt-1.5">
                    {currencySymbol}
                    {item.product.price !== undefined
                      ? item.product.price.toLocaleString()
                      : "0"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteClick(item)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 p-2 rounded-lg"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Quantity Controls & Warning */}
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      onUpdateQty(item.product.id, Math.max(1, item.qty - 1))
                    }
                    className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary transition-all text-gray-600 active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-gray-900 text-sm">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => handleIncrement(item)}
                    className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary transition-all text-gray-600 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Out of Stock Warning */}
                {warningId === item.product.id.toString() && (
                  <p className="text-xs text-red-500 font-bold mt-2.5 animate-in slide-in-from-top-1 fade-in duration-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {isArabic
                      ? "تم الوصول للحد الأقصى للمخزون المتوفر"
                      : "Max available stock reached"}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200"
            dir={isArabic ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 border border-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {isArabic ? "تأكيد الحذف" : "Remove Item?"}
                </h3>
              </div>
              <button
                onClick={() =>
                  setDeleteConfirm({ show: false, itemId: null, itemTitle: "" })
                }
                className="text-gray-400 hover:text-gray-700 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message */}
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {isArabic
                ? `هل أنت متأكد أنك تريد حذف "${deleteConfirm.itemTitle}" من السلة؟`
                : `Are you sure you want to remove "${deleteConfirm.itemTitle}" from your cart?`}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteConfirm({ show: false, itemId: null, itemTitle: "" })
                }
                className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                {isArabic ? "حذف" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
