"use client";

import { useEffect, useState } from "react";
import {
  X,
  Plus,
  GripVertical,
  Trash2,
  AlertCircle,
  Search,
} from "lucide-react";
import type { Product } from "@/types/api";
import type { FeaturedProduct } from "@/hooks/useRecommendations";
import {
  useRecommendations,
  useRecommendationCreate,
  useRecommendationUpdate,
  useRecommendationDelete,
} from "@/hooks/useRecommendations";

interface FeaturedProductsModalProps {
  isOpen: boolean;
  products: Product[];
  tr: Record<string, string>;
  dir: string;
  onClose: () => void;
}

export default function FeaturedProductsModal({
  isOpen,
  products,
  tr,
  dir,
  onClose,
}: FeaturedProductsModalProps) {
  const {
    data: featured,
    loading: fetchLoading,
    fetch: fetchRecommendations,
  } = useRecommendations();
  const { execute: addRecommendation, loading: addLoading } =
    useRecommendationCreate();
  const { execute: updateRecommendation, loading: updateLoading } =
    useRecommendationUpdate();
  const { execute: deleteRecommendation, loading: deleteLoading } =
    useRecommendationDelete();

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [localFeatured, setLocalFeatured] = useState<FeaturedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRecommendations();
    }
  }, [isOpen, fetchRecommendations]);

  useEffect(() => {
    setLocalFeatured(featured);
  }, [featured]);

  if (!isOpen) return null;

  const availableProducts = products.filter(
    (p) => !localFeatured.some((f) => f.product_id === p.id),
  );

  const filteredProducts = availableProducts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  async function handleAddProduct() {
    if (!selectedProduct) return;

    try {
      const maxPriority =
        localFeatured.length > 0
          ? Math.max(...localFeatured.map((f) => f.priority))
          : 0;

      const newRec = await addRecommendation(selectedProduct, maxPriority + 10);
      setLocalFeatured([...localFeatured, newRec]);
      setSelectedProduct("");
      setSearchQuery("");
      setShowDropdown(false);
      showToast("تمت إضافة المنتج بنجاح", "success");
    } catch (err: any) {
      showToast(err.message || "فشل إضافة المنتج", "error");
    }
  }

  async function handleRemove(recommendationId: string) {
    try {
      await deleteRecommendation(recommendationId);
      setLocalFeatured(localFeatured.filter((f) => f.id !== recommendationId));
      showToast("تمت إزالة المنتج بنجاح", "success");
    } catch (err: any) {
      showToast(err.message || "فشل حذف المنتج", "error");
    }
  }

  async function handleDragEnd(draggedId: string, targetId: string) {
    if (draggedId === targetId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = localFeatured.findIndex((f) => f.id === draggedId);
    const targetIndex = localFeatured.findIndex((f) => f.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const newFeatured = [...localFeatured];
    [newFeatured[draggedIndex], newFeatured[targetIndex]] = [
      newFeatured[targetIndex],
      newFeatured[draggedIndex],
    ];

    const updated = newFeatured.map((item, idx) => ({
      ...item,
      priority: Math.max(0, 100 - idx * 10),
    }));

    setLocalFeatured(updated);
    setDraggedItem(null);

    try {
      await Promise.all(
        updated.map((item) => updateRecommendation(item.id, item.priority)),
      );
      showToast("تم تحديث الترتيب بنجاح", "success");
    } catch (err: any) {
      showToast("فشل تحديث الترتيب", "error");
      fetchRecommendations();
    }
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const isLoading =
    fetchLoading || addLoading || updateLoading || deleteLoading;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
        dir={dir}
      >
        <div className="bg-white rounded-t-xl md:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col animate-fade-up md:animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 md:px-8 py-5 md:py-6 border-b border-gray-100">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              {dir === "rtl" ? "إدارة المنتجات المميزة" : "Manage Featured"}
            </h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
            {/* Add Product Section */}
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-wide font-bold text-gray-500 mb-3">
                {dir === "rtl" ? "إضافة منتج جديد" : "Add Product"}
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Searchable Combobox */}
                <div className="flex-1 relative">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-[rgb(60_28_84)]/20 transition-all">
                    <input
                      type="text"
                      placeholder={
                        dir === "rtl"
                          ? availableProducts.length === 0
                            ? "جميع المنتجات مميزة بالفعل"
                            : "ابحث عن منتج..."
                          : availableProducts.length === 0
                            ? "All featured"
                            : "Search products..."
                      }
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      disabled={isLoading || availableProducts.length === 0}
                      className="flex-1 px-4 py-3 md:py-3.5 text-sm outline-none bg-transparent disabled:bg-gray-50 text-gray-800 placeholder-gray-400"
                    />
                  </div>

                  {/* Dropdown List */}
                  {showDropdown && availableProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="px-4 py-4 text-sm text-gray-500 text-center">
                          {dir === "rtl"
                            ? "لا توجد منتجات"
                            : "No products found"}
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              setSelectedProduct(product.id);
                              setSearchQuery(product.title);
                              setShowDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-[rgb(60_28_84)]/5 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                          >
                            <img
                              src={
                                product.images?.[0] ||
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect fill='%23f0f0f0' width='32' height='32'/%3E%3C/svg%3E"
                              }
                              alt={product.title}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                            />
                            <span className="text-sm font-semibold text-gray-900 truncate">
                              {product.title}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddProduct}
                  disabled={!selectedProduct || isLoading}
                  className="px-6 py-3 md:py-3.5 bg-[rgb(60_28_84)] text-white rounded-xl text-sm font-semibold hover:bg-[rgb(60_28_84)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  {dir === "rtl" ? "إضافة للقائمة" : "Add"}
                </button>
              </div>
            </div>

            {/* Featured Products List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-wide font-bold text-gray-500">
                  {dir === "rtl"
                    ? `المنتجات المميزة الحالية (${localFeatured.length})`
                    : `Current Featured (${localFeatured.length})`}
                </h3>
              </div>

              {localFeatured.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-gray-500">
                  <AlertCircle className="w-10 h-10 mb-3 text-gray-300" />
                  <p className="text-sm font-medium">
                    {dir === "rtl"
                      ? "لا توجد منتجات مميزة حالياً"
                      : "No featured products yet"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">
                    {dir === "rtl"
                      ? "ابحث عن منتج في الأعلى لإضافته إلى قائمة المنتجات المميزة في متجرك"
                      : "Search for a product above to feature it on your store"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {localFeatured.map((featured, idx) => (
                    <div
                      key={featured.id}
                      draggable
                      onDragStart={() => setDraggedItem(featured.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDragEnd(draggedItem!, featured.id)}
                      onDragEnd={() => setDraggedItem(null)}
                      className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                        draggedItem === featured.id
                          ? "opacity-50 border-[rgb(60_28_84)] shadow-md scale-[1.02] z-10 relative"
                          : "border-gray-200 hover:border-gray-300 shadow-sm hover:shadow"
                      }`}
                    >
                      <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />

                      <div className="flex-shrink-0">
                        <img
                          src={
                            featured.products.images?.[0] ||
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23f0f0f0' width='48' height='48'/%3E%3C/svg%3E"
                          }
                          alt={featured.products.title}
                          className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover bg-gray-100 border border-gray-100"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate text-sm">
                          {featured.products.title}
                        </p>
                        <p className="text-xs font-semibold text-[rgb(60_28_84)] mt-0.5">
                          $
                          {Number(featured.products.price).toLocaleString(
                            "en-US",
                            { maximumFractionDigits: 2 },
                          )}
                        </p>
                      </div>

                      <div className="flex-shrink-0 text-center hidden sm:block">
                        <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-[rgb(244_242_245)] text-[rgb(60_28_84)]">
                          #{idx + 1}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemove(featured.id)}
                        disabled={isLoading}
                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all flex-shrink-0 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 md:px-8 py-4 pb-8 md:pb-4 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full md:w-auto px-8 py-3 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {dir === "rtl" ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-fade-up">
          <div
            className={`px-6 py-3 rounded-full shadow-lg text-sm font-bold text-white flex items-center gap-2 ${
              toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            {toast.msg}
          </div>
        </div>
      )}
    </>
  );
}
