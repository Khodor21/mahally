"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Package,
  Star,
  ChevronDown,
  X,
} from "lucide-react";
import type { Product, ProductFormData } from "@/types/api";
import {
  useProducts,
  useProductCreate,
  useProductUpdate,
  useProductDelete,
  useCategories,
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
  const { data: rawCategoriesData } = useCategories(storeId);
  const categoriesList = Array.isArray(rawCategoriesData)
    ? rawCategoriesData
    : (rawCategoriesData as any)?.data ||
      (rawCategoriesData as any)?.categories ||
      [];

  const [search, setSearch] = useState("");
  const [quantityFilter, setQuantityFilter] = useState<"all" | "low" | "out">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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
      fetchProducts();
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
      fetchProducts();
    } catch {
      showToast(safeTr.errorOccurred || "An error occurred", "error");
    }
  }

  const totalOutOfStock = productsSafe.filter((p) => p.stock === 0).length;
  const totalInStock = productsSafe.filter((p) => p.stock > 10).length;
  const totalLow = productsSafe.filter(
    (p) => p.stock > 0 && p.stock <= 10,
  ).length;

  let filtered = productsSafe.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  if (quantityFilter === "low") {
    filtered = filtered.filter((p) => p.stock > 0 && p.stock <= 10);
  } else if (quantityFilter === "out") {
    filtered = filtered.filter((p) => p.stock === 0);
  }

  if (categoryFilter !== "all") {
    filtered = filtered.filter((p) => p.category_id === categoryFilter);
  }

  const getCategoryName = (id: string) => {
    return categoriesList.find((c: any) => c.id === id)?.title || id;
  };

  return (
    <div className="space-y-6 md:space-y-8" dir={dir}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-4 sm:p-6 bg-white border border-gray-100 shadow-sm flex flex-col justify-center animate-pulse min-h-[100px] sm:min-h-[116px]"
              >
                <div className="h-6 sm:h-8 w-12 bg-gray-200 rounded-lg mb-2 sm:mb-3"></div>
                <div className="h-3 sm:h-4 w-20 bg-gray-100 rounded-md"></div>
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
              {
                label: lang === "ar" ? "نفاد المخزون" : "Out of Stock",
                value: totalOutOfStock,
                color: "bg-white border border-red-100 shadow-sm",
                valueColor: "text-red-950",
                labelColor: "text-red-600",
              },
            ].map((c) => (
              <div
                key={c.label}
                className={`rounded-2xl p-4 sm:p-6 flex flex-col justify-center transition-all ${c.color}`}
              >
                <p
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${c.valueColor}`}
                >
                  {c.value}
                </p>
                <p
                  className={`text-xs sm:text-sm font-medium mt-1 sm:mt-1.5 ${c.labelColor}`}
                >
                  {c.label}
                </p>
              </div>
            ))}
      </div>

      <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div className="flex flex-1 md:flex-none items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 md:w-72 shadow-sm focus-within:border-[rgb(60_28_84)] focus-within:ring-1 focus-within:ring-[rgb(60_28_84)] transition-all">
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
            className="p-2 sm:p-2.5 text-gray-500 hover:text-[rgb(60_28_84)] bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh products"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex gap-2 flex-wrap md:gap-3 md:flex-nowrap">
          {[
            { key: "all", label: lang === "ar" ? "الكل" : "All" },
            { key: "low", label: lang === "ar" ? "مخزون منخفض" : "Low Stock" },
            {
              key: "out",
              label: lang === "ar" ? "نفاد المخزون" : "Out of Stock",
            },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() =>
                setQuantityFilter(btn.key as "all" | "low" | "out")
              }
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                quantityFilter === btn.key
                  ? "bg-[rgb(60_28_84)] text-white shadow-md shadow-[rgb(60_28_84)]/20"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[rgb(60_28_84)] hover:text-[rgb(60_28_84)]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {categoriesList.length > 0 && (
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className={`w-full md:w-auto flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                showCategoryDropdown || categoryFilter !== "all"
                  ? "bg-[rgb(60_28_84)] text-white border border-[rgb(60_28_84)] shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[rgb(60_28_84)] hover:text-[rgb(60_28_84)]"
              }`}
            >
              <span className="truncate">
                {categoryFilter === "all"
                  ? lang === "ar"
                    ? "📁 الفئات"
                    : "📁 Categories"
                  : getCategoryName(categoryFilter)}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 transition-transform ${
                  showCategoryDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showCategoryDropdown && (
              <>
                <div
                  className="md:hidden fixed inset-0 z-40"
                  onClick={() => setShowCategoryDropdown(false)}
                />

                <div
                  className={`absolute top-full ${
                    dir === "rtl" ? "right-0" : "left-0"
                  } mt-2 w-full sm:w-72 md:w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden`}
                >
                  <div className="text-[rgb(60_28_84)] px-4 py-3 border-b border-[rgb(60_28_84)]/20">
                    <p className="text-sm font-bold">
                      {lang === "ar" ? "اختر فئة" : "Select Category"}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setCategoryFilter("all");
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors flex items-center gap-3 ${
                      categoryFilter === "all"
                        ? "bg-[rgb(60_28_84)] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {lang === "ar" ? "جميع الفئات" : "All Categories"}
                  </button>

                  <div className="border-t border-gray-100"></div>

                  <div className="max-h-64 overflow-y-auto">
                    {categoriesList.map((cat: any) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setCategoryFilter(cat.id);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-right px-4 py-3 text-sm font-medium transition-colors flex items-center gap-3 border-t border-gray-50 ${
                          categoryFilter === cat.id
                            ? "bg-blue-50 text-[rgb(60_28_84)]"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex-1">{cat.title}</span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
                    {lang === "ar"
                      ? `${categoriesList.length} فئة متاحة`
                      : `${categoriesList.length} categories available`}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {productsSafe.length > 0 && (
          <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 w-full md:w-auto">
            <button
              onClick={() => setFeaturedModalOpen(true)}
              className="flex-1 sm:flex-none bg-white text-amber-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex gap-2 items-center justify-center hover:bg-amber-50 border border-amber-200 transition-all shadow-sm"
            >
              <Star className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">
                {lang === "ar" ? "المنتجات المميزة" : "Featured"}
              </span>
              <span className="sm:hidden">
                {lang === "ar" ? "مميز" : "Star"}
              </span>
            </button>

            <button
              onClick={openCreate}
              className="flex-1 sm:flex-none bg-[rgb(60_28_84)] text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex gap-2 items-center justify-center hover:bg-[rgb(60_28_84)]/90 transition-all shadow-md shadow-[rgb(60_28_84)]/15 hover:shadow-[rgb(60_28_84)]/25"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">
                {safeTr.addNewProduct || "Add Product"}
              </span>
              <span className="sm:hidden">
                {lang === "ar" ? "جديد" : "Add"}
              </span>
            </button>
          </div>
        )}
      </div>

      {(quantityFilter !== "all" || categoryFilter !== "all") && (
        <div className="flex flex-wrap gap-2">
          {quantityFilter !== "all" && (
            <button
              onClick={() => setQuantityFilter("all")}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span>
                {quantityFilter === "low"
                  ? lang === "ar"
                    ? "مخزون منخفض"
                    : "Low Stock"
                  : lang === "ar"
                    ? "نفاد المخزون"
                    : "Out of Stock"}
              </span>
              <X className="w-3 h-3" />
            </button>
          )}
          {categoryFilter !== "all" && (
            <button
              onClick={() => setCategoryFilter("all")}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span>{getCategoryName(categoryFilter)}</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {productsSafe.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 sm:py-24 px-4 sm:px-6 border border-dashed border-gray-300 rounded-3xl bg-gray-50/50 text-center">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 sm:mb-6 border border-gray-100 ring-8 ring-gray-50">
            <Package className="w-6 sm:w-8 h-6 sm:h-8 text-[rgb(60_28_84)]/60" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-2.5">
            {lang === "ar" ? "لا توجد بيانات" : "No products yet"}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8 max-w-[320px] leading-relaxed">
            {lang === "ar"
              ? "متجرك يبدو فارغاً في الوقت الحالي. ابدأ بإضافة أول منتج لك لتبدأ رحلتك في البيع واستقبال الطلبات."
              : "Your store is looking a bit empty. Add your first product to start taking orders and tracking inventory."}
          </p>
          <button
            onClick={openCreate}
            className="h-10 sm:h-12 px-4 sm:px-6 bg-[rgb(60_28_84)] text-white rounded-xl text-xs sm:text-sm font-semibold flex gap-2.5 items-center justify-center hover:bg-[rgb(60_28_84)]/90 transition-all shadow-md shadow-[rgb(60_28_84)]/20 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {lang === "ar" ? "أضف منتجك الأول الآن" : "Add your first product"}
          </button>
        </div>
      ) : filtered.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 sm:px-6 text-center bg-white border border-gray-100 rounded-3xl shadow-sm">
          <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 sm:mb-5">
            <Search className="w-5 sm:w-6 h-5 sm:h-6 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-1.5">
            {lang === "ar" ? "لا توجد نتائج" : "No results found"}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-4">
            {lang === "ar"
              ? "لم نعثر على منتجات تطابق البحث والفلاتر المختارة"
              : "No products match your search and filter criteria"}
          </p>
          <button
            onClick={() => {
              setSearch("");
              setQuantityFilter("all");
              setCategoryFilter("all");
            }}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-[rgb(60_28_84)] bg-white border border-[rgb(60_28_84)] rounded-lg hover:bg-[rgb(60_28_84)]/5 transition-colors"
          >
            {lang === "ar" ? "مسح الفلاتر" : "Clear filters"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product as any}
              tr={safeTr as any}
              lang={lang}
              onEdit={openEdit as any}
              onDelete={openDelete as any}
            />
          ))}
        </div>
      )}

      {formOpen && (
        <ProductFormModal
          mode={formMode}
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
