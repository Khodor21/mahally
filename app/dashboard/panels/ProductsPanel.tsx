"use client";

import { useState } from "react";
import { Search, Plus, RefreshCw, Package, Star } from "lucide-react";
import type { Product, ProductFormData } from "@/types/api";
import {
  useProducts,
  useProductCreate,
  useProductUpdate,
  useProductDelete,
} from "@/hooks/useApi";
import { useDashboard } from "../DashboardContext";
import ProductCard from "../components/ProductCard";
import ProductFormModal from "../components/ProductFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import FeaturedProductsModal from "../components/FeaturedProductsModal";
import Toast from "../components/Toast";

interface ToastState {
  message: string;
  type: "success" | "error";
}

export default function ProductsPanel({ storeId }: { storeId: string }) {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  // ✅ FIX: loosen type for runtime translations (IMPORTANT)
  const safeTr = tr as Record<string, string>;

  const { data: products, loading, retry: fetchProducts } = useProducts();
  const productsSafe: Product[] = products ?? [];
  const { execute: createProduct, loading: createLoading } = useProductCreate();
  const { execute: updateProduct, loading: updateLoading } = useProductUpdate();
  const { execute: deleteProduct, loading: deleteLoading } = useProductDelete();

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formTarget, setFormTarget] = useState<Product | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [featuredModalOpen, setFeaturedModalOpen] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  const formLoading = createLoading || updateLoading;

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
  }

  function openCreate() {
    setFormMode("create");
    setFormTarget(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setFormMode("edit");
    setFormTarget(product);
    setFormOpen(true);
  }

  async function handleFormSubmit(data: ProductFormData) {
    try {
      if (formMode === "create") {
        await createProduct(data);
        showToast(safeTr.createdSuccess, "success");
      } else if (formTarget) {
        await updateProduct(formTarget.id, data);
        showToast(safeTr.updatedSuccess, "success");
      }
      setFormOpen(false);
      fetchProducts(); // Refresh the product list via hook
    } catch {
      showToast(safeTr.errorOccurred, "error");
    }
  }

  function openDelete(product: Product) {
    setDeleteTarget(product);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      showToast(safeTr.deletedSuccess, "success");
      setDeleteTarget(null);
      fetchProducts(); // Refresh the product list via hook
    } catch {
      showToast(safeTr.errorOccurred, "error");
    }
  }

  const filtered = productsSafe.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalInStock = productsSafe.filter((p) => p.stock > 10).length;
  const totalLow = productsSafe.filter(
    (p) => p.stock > 0 && p.stock <= 10,
  ).length;

  return (
    <div className="space-y-6" dir={dir}>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {loading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-5 bg-[rgb(244_242_245)] animate-pulse"
              />
            ))
          : [
              {
                label: safeTr.totalProducts,
                value: productsSafe.length,
                color: "bg-[rgb(60_28_84)] text-white",
              },
              {
                label: safeTr.inStock,
                value: totalInStock,
                color: "bg-emerald-50 text-emerald-700",
              },
              {
                label: safeTr.lowStock,
                value: totalLow,
                color: "bg-amber-50 text-amber-700",
              },
            ].map((c) => (
              <div key={c.label} className={`rounded-2xl p-5 ${c.color}`}>
                <p className="text-3xl font-bold">{c.value}</p>
                <p className="text-sm opacity-70">{c.label}</p>
              </div>
            ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3">
        <div className="flex items-center justify-between md:justify-center gap-2">
          <div className="flex items-center gap-2 bg-[rgb(244_242_245)] rounded-xl px-3 py-2 w-56">
            <Search className="w-4 h-4 text-[rgb(60_28_84)]/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={safeTr.searchProducts}
              className="bg-transparent text-sm outline-none w-full"
            />
          </div>

          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Buttons Group */}
        {productsSafe.length > 0 && (
          <div className="flex gap-2 justify-between md:justify-center">
            {/* Featured Products Button */}
            <button
              onClick={() => setFeaturedModalOpen(true)}
              className="bg-amber-50 text-amber-700 px-4 py-2 rounded text-xs flex gap-2 items-center justify-center hover:bg-amber-100 transition-colors border border-amber-200"
            >
              <Star className="w-3 h-3" />
              {lang === "ar" ? "المنتجات المميزة" : "Featured"}
            </button>

            {/* Add New Product Button */}
            <button
              onClick={openCreate}
              className="bg-brand-dark text-white px-4 py-2 rounded text-xs flex gap-2 items-center justify-center hover:bg-[#333] transition-colors"
            >
              <Plus className="w-3 h-3" />
              {safeTr.addNewProduct}
            </button>
          </div>
        )}
      </div>

      {/* Products Area */}
      {productsSafe.length === 0 && !loading ? (
        /* Empty State: No Products in Store */
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-5 border border-gray-100">
            <Package className="w-10 h-10 text-brand-dark opacity-60" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            لا توجد بيانات
          </h3>
          <p className="text-gray-500 text-sm mb-8 max-w-md leading-relaxed">
            متجرك يبدو فارغاً في الوقت الحالي. ابدأ بإضافة أول منتج لك لتبدأ
            رحلتك في البيع واستقبال الطلبات.
          </p>
          <button
            onClick={openCreate}
            className="h-14 px-8 bg-brand-dark text-white rounded-2xl text-base font-bold flex gap-3 items-center justify-center hover:bg-[#333] transition-all hover:scale-105 shadow-lg shadow-brand-dark/20"
          >
            <Plus className="w-5 h-5" />
            أضف منتجك الأول الآن
          </button>
        </div>
      ) : filtered.length === 0 && !loading ? (
        /* Empty State: Search yielded no results */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Package className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            لا توجد نتائج
          </h3>
          <p className="text-gray-500 text-sm">
            لم نعثر على منتجات تطابق كلمة البحث "{search}"
          </p>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              tr={safeTr as any}
              lang={lang}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {formOpen && (
        <ProductFormModal
          mode={formMode}
          product={formTarget}
          tr={safeTr as any}
          dir={dir}
          loading={formLoading}
          onSubmit={handleFormSubmit}
          onClose={() => !formLoading && setFormOpen(false)}
          storeId={storeId}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          productTitle={deleteTarget.title}
          tr={safeTr as any}
          dir={dir}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => !deleteLoading && setDeleteTarget(null)}
          lang={"ar"}
        />
      )}

      {/* Featured Products Modal */}
      {featuredModalOpen && (
        <FeaturedProductsModal
          isOpen={featuredModalOpen}
          products={productsSafe}
          tr={safeTr}
          dir={dir}
          onClose={() => setFeaturedModalOpen(false)}
        />
      )}

      {/* Toast */}
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
