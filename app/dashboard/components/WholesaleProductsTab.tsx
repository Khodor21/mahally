// components/WholesaleProductsTab.tsx
"use client";

import { useState } from "react";
import { Package, Plus, Check, Loader2 } from "lucide-react";

interface Props {
  products: any[];
  loading: boolean;
  lang: string;
  onImport: (productId: string, qty: number) => Promise<void>;
}

export default function WholesaleProductsTab({
  products,
  loading,
  lang,
  onImport,
}: Props) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [importing, setImporting] = useState<string | null>(null);

  async function handleImport(productId: string, stock: number) {
    const qty = quantities[productId];
    if (!qty || qty < 1 || qty > stock) return;
    setImporting(productId);
    try {
      await onImport(productId, qty);
    } finally {
      setImporting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[rgb(60_28_84)]" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-300 rounded-3xl bg-gray-50/50">
        <Package className="w-10 h-10 text-[rgb(60_28_84)]/40 mb-4" />
        <p className="text-gray-500 text-sm">
          {lang === "ar"
            ? "لا توجد منتجات متاحة من المورد"
            : "No supplier products available"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {products.map((product) => {
        const isImported = product.already_imported;
        const qty = quantities[product.id] ?? "";
        const isImporting = importing === product.id;

        return (
          <div
            key={product.id}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col"
          >
            {product.images?.[0] && (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4 space-y-3 flex-1 flex flex-col">
              <div>
                <p className="font-semibold text-[rgb(60_28_84)] text-sm">
                  {product.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lang === "ar" ? "المتاح:" : "Available:"} {product.stock}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-[rgb(60_28_84)]">
                ${product.price}
                {product.discount_price && (
                  <span className="text-xs text-gray-400 line-through">
                    ${product.discount_price}
                  </span>
                )}
              </div>

              <div className="mt-auto pt-2">
                {isImported ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 text-xs font-semibold bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                    <Check className="w-4 h-4" />
                    {lang === "ar"
                      ? `مضاف (${product.allocated_quantity} وحدة)`
                      : `Imported (${product.allocated_quantity} units)`}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="number"
                      min={1}
                      max={product.stock}
                      value={qty}
                      onChange={(e) =>
                        setQuantities((q) => ({
                          ...q,
                          [product.id]: parseInt(e.target.value),
                        }))
                      }
                      placeholder={lang === "ar" ? "الكمية" : "Qty"}
                      className="w-full sm:w-20 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[rgb(60_28_84)]"
                    />
                    <button
                      onClick={() => handleImport(product.id, product.stock)}
                      disabled={
                        !qty ||
                        Number(qty) < 1 ||
                        Number(qty) > product.stock ||
                        isImporting
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[rgb(60_28_84)] text-white text-xs font-bold py-2 rounded-xl hover:bg-[rgb(60_28_84)]/90 disabled:opacity-40 transition-all"
                    >
                      {isImporting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      {lang === "ar" ? "أضف لمتجري" : "Add to Store"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
