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

  // ✅ FIX: loosen type for runtime translations (IMPORTANT)
  const safeTr = tr as Record<string, string>;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formTarget, setFormTarget] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      showToast(safeTr.errorOccurred, "error");
    } finally {
      setLoading(false);
    }
  }, [safeTr.errorOccurred]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    setFormLoading(true);
    try {
      if (formMode === "create") {
        const created = await createProduct(data);
        setProducts((prev) => [created, ...prev]);
        showToast(safeTr.createdSuccess, "success");
      } else if (formTarget) {
        const updated = await updateProduct(formTarget.id, data);
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        showToast(safeTr.updatedSuccess, "success");
      }
      setFormOpen(false);
    } catch {
      showToast(safeTr.errorOccurred, "error");
    } finally {
      setFormLoading(false);
    }
  }

  function openDelete(product: Product) {
    setDeleteTarget(product);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast(safeTr.deletedSuccess, "success");
      setDeleteTarget(null);
    } catch {
      showToast(safeTr.errorOccurred, "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalInStock = products.filter((p) => p.stock > 10).length;
  const totalLow = products.filter((p) => p.stock > 0 && p.stock <= 10).length;

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
                value: products.length,
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[rgb(244_242_245)] rounded-xl px-3 py-2 w-56">
            <Search className="w-4 h-4 text-[rgb(60_28_84)]/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={safeTr.searchProducts}
              className="bg-transparent text-sm outline-none w-full"
            />
          </div>

          <button onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <button onClick={openCreate} className="bg-purple-800 text-white px-4 py-2 rounded-xl">
          <Plus className="w-4 h-4" />
          {safeTr.addNewProduct}
        </button>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            tr={safeTr as any}   // ✅ FINAL FIX HERE
            lang={lang}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        ))}
      </div>

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
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          productTitle={deleteTarget.title}
          tr={safeTr as any}
          dir={dir}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => !deleteLoading && setDeleteTarget(null)} lang={"ar"}        />
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