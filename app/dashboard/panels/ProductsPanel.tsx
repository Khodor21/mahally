import { useState, useEffect, useCallback } from "react";
import { Search, Plus, RefreshCw } from "lucide-react";
import type { Product, ProductFormData } from "../types";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api";
import { useDashboard } from "../DashboardContext";
import ProductCard from "../components/ProductCard";
import ProductFormModal from "../components/ProductFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import Toast from "../components/Toast";

interface ToastState {
  message: string;
  type: "success" | "error";
}

export default function ProductsPanel() {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formTarget, setFormTarget] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);

  // ─── Fetch ───────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      showToast(tr.errorOccurred, "error");
    } finally {
      setLoading(false);
    }
  }, [tr.errorOccurred]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ─── Toast helper ─────────────────────────────────────────────────
  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
  }

  // ─── Create / Edit ────────────────────────────────────────────────
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
    setFormLoading(true);
    try {
      if (formMode === "create") {
        const created = await createProduct(data);
        setProducts((prev) => [created, ...prev]);
        showToast(tr.createdSuccess, "success");
      } else if (formTarget) {
        const updated = await updateProduct(formTarget.id, data);
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        showToast(tr.updatedSuccess, "success");
      }
      setFormOpen(false);
    } catch {
      showToast(tr.errorOccurred, "error");
    } finally {
      setFormLoading(false);
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────
  function openDelete(product: Product) {
    setDeleteTarget(product);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast(tr.deletedSuccess, "success");
      setDeleteTarget(null);
    } catch {
      showToast(tr.errorOccurred, "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  // ─── Filtered list ────────────────────────────────────────────────
  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalInStock = products.filter((p) => p.stock > 10).length;
  const totalLow = products.filter((p) => p.stock > 0 && p.stock <= 10).length;

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6" dir={dir}>
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {loading
          ? // Skeleton for Summary Cards
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-5 bg-[rgb(244_242_245)] animate-pulse"
              >
                <div className="h-8 w-1/3 rounded bg-gray-300/40 mb-2"></div>
                <div className="h-4 w-2/3 rounded bg-gray-300/40 mt-1"></div>
              </div>
            ))
          : // Actual Summary Cards
            [
              {
                label: tr.totalProducts,
                value: products.length,
                color: "bg-[rgb(60_28_84)] text-white",
              },
              {
                label: tr.inStock,
                value: totalInStock,
                color: "bg-emerald-50 text-emerald-700",
              },
              {
                label: tr.lowStock,
                value: totalLow,
                color: "bg-amber-50 text-amber-700",
              },
            ].map((c) => (
              <div key={c.label} className={`rounded-2xl p-5 ${c.color}`}>
                <p className="text-3xl font-bold">{c.value}</p>
                <p className="text-sm mt-1 opacity-70">{c.label}</p>
              </div>
            ))}
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-5 py-4 border-b border-[rgb(244_242_245)]">
          <div className="flex items-center gap-2">
            {/* Search Skeleton / Input */}
            {loading ? (
              <div className="h-10 w-56 bg-[rgb(244_242_245)] rounded-xl animate-pulse"></div>
            ) : (
              <div className="flex items-center gap-2 bg-[rgb(244_242_245)] rounded-xl px-3 py-2 w-56">
                <Search className="w-4 h-4 text-[rgb(60_28_84)]/40 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={tr.searchProducts}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/40 outline-none w-full"
                  dir={dir}
                />
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="p-2 rounded-xl bg-[rgb(244_242_245)] text-[rgb(60_28_84)] hover:bg-[rgb(207_195_223)] transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[rgb(60_28_84)] text-white rounded-xl text-sm font-semibold hover:bg-[rgb(60_28_84)]/90 transition-all shadow-md shadow-[rgb(60_28_84)]/20"
          >
            <Plus className="w-4 h-4" />
            {tr.addNewProduct}
          </button>
        </div>

        {/* Product grid */}
        <div className="p-5">
          {loading ? (
            // Skeleton for Product Cards
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[rgb(244_242_245)] overflow-hidden animate-pulse"
                >
                  {/* Image placeholder */}
                  <div className="w-full h-40 bg-gray-200"></div>
                  {/* Content placeholder */}
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-5 w-1/4 rounded bg-gray-200"></div>
                      <div className="h-8 w-8 rounded-lg bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[rgb(244_242_245)] flex items-center justify-center">
                <Search className="w-8 h-8 text-[rgb(60_28_84)]/20" />
              </div>
              <p className="text-sm text-[rgb(60_28_84)]/40 font-medium">
                {tr.noData}
              </p>
              {products.length === 0 && (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-[rgb(60_28_84)] text-white rounded-xl text-sm font-semibold hover:bg-[rgb(60_28_84)]/90 transition-all shadow-md shadow-[rgb(60_28_84)]/20 mt-1"
                >
                  <Plus className="w-4 h-4" />
                  {tr.addNewProduct}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  tr={tr}
                  lang={lang}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {formOpen && (
        <ProductFormModal
          mode={formMode}
          product={formTarget}
          tr={tr}
          dir={dir}
          loading={formLoading}
          onSubmit={handleFormSubmit}
          onClose={() => !formLoading && setFormOpen(false)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          productTitle={deleteTarget.title}
          tr={tr}
          dir={dir}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => !deleteLoading && setDeleteTarget(null)}
        />
      )}

      {/* ── Toast ── */}
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
