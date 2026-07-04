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
        showToast(safeTr.createdSuccess || "Product created", "success");
      } else if (formTarget) {
        await updateProduct(formTarget.id, data);
        showToast(safeTr.updatedSuccess || "Product updated", "success");
      }
      setFormOpen(false);
      fetchProducts(); // Refresh the product list via hook
    } catch {
      showToast(safeTr.errorOccurred || "An error occurred", "error");
    }
  }

  function openDelete(product: Product) {
    setDeleteTarget(product);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      showToast(safeTr.deletedSuccess || "Product deleted", "success");
      setDeleteTarget(null);
      fetchProducts(); // Refresh the product list via hook
    } catch {
      showToast(safeTr.errorOccurred || "An error occurred", "error");
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
    <div className="space-y-6 md:space-y-8" dir={dir}>
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {loading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm flex flex-col justify-center animate-pulse min-h-[116px]"
              >
                <div className="h-8 w-16 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 w-24 bg-gray-100 rounded-md"></div>
              </div>
            ))
          : [
              {
                label: safeTr.totalProducts || "Total Products",
                value: productsSafe.length,
                color:
                  "bg-[rgb(60_28_84)] text-white shadow-md shadow-[rgb(60_28_84)]/10 border border-[rgb(60_28_84)]",
                valueColor: "text-white",
                labelColor: "text-white/80",
              },
              {
                label: safeTr.inStock || "In Stock",
                value: totalInStock,
                color: "bg-white border border-emerald-100 shadow-sm",
                valueColor: "text-emerald-950",
                labelColor: "text-emerald-600",
              },
              {
                label: safeTr.lowStock || "Low Stock",
                value: totalLow,
                color: "bg-white border border-amber-100 shadow-sm",
                valueColor: "text-amber-950",
                labelColor: "text-amber-600",
              },
            ].map((c) => (
              <div
                key={c.label}
                className={`rounded-2xl p-6 flex flex-col justify-center transition-all ${c.color}`}
              >
                <p
                  className={`text-3xl font-bold tracking-tight ${c.valueColor}`}
                >
                  {c.value}
                </p>
                <p className={`text-sm font-medium mt-1.5 ${c.labelColor}`}>
                  {c.label}
                </p>
              </div>
            ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex flex-1 md:flex-none items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 md:w-72 shadow-sm focus-within:border-[rgb(60_28_84)] focus-within:ring-1 focus-within:ring-[rgb(60_28_84)] transition-all">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={safeTr.searchProducts || "Search products..."}
              className="bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none w-full"
            />
          </div>

          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 text-gray-500 hover:text-[rgb(60_28_84)] bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh products"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Action Buttons */}
        {productsSafe.length > 0 && (
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
            <button
              onClick={() => setFeaturedModalOpen(true)}
              className="flex-1 sm:flex-none bg-white text-amber-700 px-4 py-2.5 rounded-xl text-sm font-semibold flex gap-2 items-center justify-center hover:bg-amber-50 border border-amber-200 transition-all shadow-sm"
            >
              <Star className="w-4 h-4 shrink-0" />
              {lang === "ar" ? "المنتجات المميزة" : "Featured"}
            </button>

            <button
              onClick={openCreate}
              className="flex-1 sm:flex-none bg-[rgb(60_28_84)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex gap-2 items-center justify-center hover:bg-[rgb(60_28_84)]/90 transition-all shadow-md shadow-[rgb(60_28_84)]/15 hover:shadow-[rgb(60_28_84)]/25"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {safeTr.addNewProduct || "Add Product"}
            </button>
          </div>
        )}
      </div>

      {/* Products Area */}
      {productsSafe.length === 0 && !loading ? (
        /* Empty State: No Products in Store */
        <div className="flex flex-col items-center justify-center py-24 px-6 border border-dashed border-gray-300 rounded-3xl bg-gray-50/50 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-gray-100 ring-8 ring-gray-50">
            <Package className="w-8 h-8 text-[rgb(60_28_84)]/60" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2.5">
            {lang === "ar" ? "لا توجد بيانات" : "No products yet"}
          </h3>
          <p className="text-gray-500 text-sm mb-8 max-w-[320px] leading-relaxed">
            {lang === "ar"
              ? "متجرك يبدو فارغاً في الوقت الحالي. ابدأ بإضافة أول منتج لك لتبدأ رحلتك في البيع واستقبال الطلبات."
              : "Your store is looking a bit empty. Add your first product to start taking orders and tracking inventory."}
          </p>
          <button
            onClick={openCreate}
            className="h-12 px-6 bg-[rgb(60_28_84)] text-white rounded-xl text-sm font-semibold flex gap-2.5 items-center justify-center hover:bg-[rgb(60_28_84)]/90 transition-all shadow-md shadow-[rgb(60_28_84)]/20 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {lang === "ar" ? "أضف منتجك الأول الآن" : "Add your first product"}
          </button>
        </div>
      ) : filtered.length === 0 && !loading ? (
        /* Empty State: Search yielded no results */
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white border border-gray-100 rounded-3xl shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-5">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
            {lang === "ar" ? "لا توجد نتائج" : "No results found"}
          </h3>
          <p className="text-gray-500 text-sm">
            {lang === "ar"
              ? `لم نعثر على منتجات تطابق "${search}"`
              : `We couldn't find anything matching "${search}"`}
          </p>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              /* Cast as any to resolve strict TS mismatch with the card props */
              product={product as any}
              tr={safeTr as any}
              lang={lang}
              onEdit={openEdit as any}
              onDelete={openDelete as any}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {formOpen && (
        <ProductFormModal
          mode={formMode}
          /* Cast as any to bypass the discount_price null vs undefined mismatch */
          product={formTarget as any}
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
          lang={lang}
        />
      )}

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
