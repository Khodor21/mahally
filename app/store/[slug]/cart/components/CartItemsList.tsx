"use client";

import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";

type CartItem = {
  product: {
    id: string | number;
    title: string;
    price?: number;
    image?: string;
  };
  qty: number;
};

type Props = {
  items: CartItem[];
  currencySymbol: string;
  onUpdateQty: (id: string | number, qty: number) => void;
  onRemoveItem: (id: string | number) => void;
};

export default function CartItemsList({
  items,
  currencySymbol,
  onUpdateQty,
  onRemoveItem,
}: Props) {
  return (
    <div className="bg-white">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
          >
            {/* Product Image */}
            {item.product.image && (
              <div className="flex-shrink-0 w-24 h-auto bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative">
                <Image
                  src={item.product.image}
                  alt={item.product.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Product Details */}
            <div className="flex-1 min-w-0 py-1">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  {/* Product Title */}
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {item.product.title}
                  </p>

                  {/* Price */}
                  <p className="text-sm font-bold text-brand-primary mt-1">
                    {currencySymbol}
                    {item.product.price !== undefined
                      ? item.product.price.toLocaleString()
                      : "0"}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="text-red-500 hover:text-red-800 transition-colors flex-shrink-0 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() =>
                    onUpdateQty(item.product.id, Math.max(1, item.qty - 1))
                  }
                  className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary transition-all text-gray-600"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-gray-900 text-sm">
                  {item.qty}
                </span>
                <button
                  onClick={() => onUpdateQty(item.product.id, item.qty + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary transition-all text-gray-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}