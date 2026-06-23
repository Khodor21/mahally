"use client";
import { useMemo, useState, useEffect } from "react";
import { uploadImages } from "@/lib/image-upload";
import {
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Loader2,
  GripVertical,
} from "lucide-react";
import { useDashboard } from "../DashboardContext";
import Toast from "../components/Toast";
import { Category } from "@/types/api";
import {
  useCategories,
  useCategoryCreate,
  useCategoryUpdate,
  useCategoryDelete,
} from "@/hooks/useApi";

interface ToastState {
  message: string;
  type: "success" | "error";
}

export default function CategoriesPanel({ storeId }: { storeId: string }) {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const { data, loading, retry: fetchCategories } = useCategories(storeId);

  // 👉 FIX: Safely parse data by casting to `any` to prevent TS 'never' errors
  const categories = useMemo(() => {
    if (!data) return [];

    const safeData = data as any;

    // If data is already an array, use it
    if (Array.isArray(safeData)) {
      console.log("✅ Data is an array:", safeData);
      return safeData;
    }

    // If data is an object with a categories property
    if (
      safeData &&
      typeof safeData === "object" &&
      Array.isArray(safeData.categories)
    ) {
      console.log("✅ Data has .categories array:", safeData.categories);
      return safeData.categories;
    }

    // If data is an object with a data property
    if (
      safeData &&
      typeof safeData === "object" &&
      Array.isArray(safeData.data)
    ) {
      console.log("✅ Data has .data array:", safeData.data);
      return safeData.data;
    }

    // Fallback: return empty array
    console.warn("⚠️ Could not parse categories from:", safeData);
    return [];
  }, [data]);

  // 👉 DEBUG: Log the processed categories
  useEffect(() => {
    console.log("Categories Panel - Processed categories:", {
      rawData: data,
      processedCategories: categories,
      count: categories.length,
      hasProductCount: categories[0]?.product_count !== undefined,
    });
  }, [data, categories]);

  const { execute: createCategory, loading: createLoading } =
    useCategoryCreate();
  const { execute: updateCategory, loading: updateLoading } =
    useCategoryUpdate();
  const { execute: deleteCategory, loading: deleteLoading } =
    useCategoryDelete();

  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);

  // Animation States for Create/Edit Modal
  const [formMounted, setFormMounted] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  // Animation States for Delete Modal
  const [deleteMounted, setDeleteMounted] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [formData, setFormData] = useState({ title: "", logo: "" });
  const [uploading, setUploading] = useState(false);

  // 👉 NEW: Drag-to-reorder state
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [tempCategories, setTempCategories] = useState<Category[]>(categories);

  // Update tempCategories when categories change
  useEffect(() => {
    setTempCategories(categories);
  }, [categories]);

  const formLoading = createLoading || updateLoading || uploading;

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title: formData.title,
        logo_url: formData.logo,
      };

      if (formMode === "create") {
        await createCategory(storeId, payload);
      } else if (formMode === "edit" && selectedCategory) {
        payload.id = selectedCategory.id;
        await updateCategory(selectedCategory.id, payload);
      }

      showToast(
        formMode === "create" ? tr.createdSuccess : tr.updatedSuccess,
        "success",
      );
      closeForm();
      fetchCategories();
    } catch {
      showToast(tr.errorOccurred, "error");
    }
  };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploading(true);
      const result = await uploadImages([file]);
      setFormData((prev) => ({
        ...prev,
        logo: result.urls[0],
      }));
    } catch (error: any) {
      alert(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  }

  // Animation Handlers for Form Modal
  const openCreate = () => {
    setFormMode("create");
    setFormData({ title: "", logo: "" });
    setSelectedCategory(null);
    setFormMounted(true);
    setTimeout(() => setFormVisible(true), 10);
  };

  const openEdit = (cat: Category) => {
    setFormMode("edit");
    setSelectedCategory(cat);
    setFormData({ title: cat.title, logo: cat.logo_url || "" });
    setFormMounted(true);
    setTimeout(() => setFormVisible(true), 10);
  };

  const closeForm = () => {
    setFormVisible(false);
    setTimeout(() => setFormMounted(false), 300);
  };

  // Animation Handlers for Delete Modal
  const openDelete = (cat: Category) => {
    setSelectedCategory(cat);
    setDeleteMounted(true);
    setTimeout(() => setDeleteVisible(true), 10);
  };

  const closeDelete = () => {
    setDeleteVisible(false);
    setTimeout(() => setDeleteMounted(false), 300);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory(selectedCategory.id, storeId);
      showToast(tr.deletedSuccess, "success");
      closeDelete();
      fetchCategories();
    } catch {
      showToast(tr.errorOccurred, "error");
    }
  };

  // 👉 NEW: Drag handlers
  const handleDragStart = (cat: Category) => {
    setDraggedCategory(cat);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (targetCat: Category) => {
    if (!draggedCategory || draggedCategory.id === targetCat.id) {
      setDraggedCategory(null);
      return;
    }

    const draggedIndex = tempCategories.findIndex(
      (c) => c.id === draggedCategory.id,
    );
    const targetIndex = tempCategories.findIndex((c) => c.id === targetCat.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedCategory(null);
      return;
    }

    const newCategories = [...tempCategories];
    [newCategories[draggedIndex], newCategories[targetIndex]] = [
      newCategories[targetIndex],
      newCategories[draggedIndex],
    ];

    setTempCategories(newCategories);
    setDraggedCategory(null);

    saveReorder(newCategories);
  };

  const saveReorder = async (orderedCategories: Category[]) => {
    try {
      setReorderLoading(true);

      const orders = orderedCategories.map((cat, index) => ({
        id: cat.id,
        display_order: index,
      }));

      const response = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder categories");
      }

      showToast("Categories reordered successfully", "success");
      fetchCategories();
    } catch (error) {
      showToast("Failed to reorder categories", "error");
      setTempCategories(categories);
    } finally {
      setReorderLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      (tempCategories || []).filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [tempCategories, search],
  );

  console.log("CategoriesPanel render - categories:", {
    length: categories.length,
    filtered: filtered.length,
    loading,
  });

  return (
    <div className="space-y-6 relative" dir={dir}>
      {/* HEADER CARDS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-6 bg-[rgb(60_28_84)] text-white shadow-sm transition-transform hover:-translate-y-1 duration-300">
          <p className="text-3xl font-bold">{categories.length}</p>
          <p className="text-sm opacity-80 mt-1">{tr.totalCategories}</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="bg-gray-50 w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(60_28_84)]/20 focus:border-[rgb(60_28_84)] transition-all"
              placeholder={tr.searchCategories}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={fetchCategories}
            className="p-2 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw
              size={18}
              className={`text-gray-600 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <button
          onClick={openCreate}
          className="bg-[rgb(60_28_84)] hover:bg-[rgb(75_35_105)] transition-colors text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm shrink-0"
        >
          {tr.addCategory}
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-center">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold text-gray-400 w-12 text-xs uppercase tracking-wider"></th>
              <th className="p-4 font-bold text-gray-400 text-xs uppercase tracking-wider">
                {tr.logo}
              </th>
              <th className="p-4 font-bold text-gray-400 text-xs uppercase tracking-wider">
                {tr.title}
              </th>
              <th className="p-4 font-bold text-gray-400 text-xs uppercase tracking-wider">
                {tr.productsCount}
              </th>
              <th className="p-4 font-bold text-gray-400 text-xs uppercase tracking-wider">
                {tr.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <Loader2 className="animate-spin mx-auto text-[rgb(60_28_84)] w-8 h-8" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-12 text-center text-gray-500 font-medium"
                >
                  {tr.noData || "No categories found"}
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr
                  key={cat.id}
                  draggable
                  onDragStart={() => handleDragStart(cat)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(cat)}
                  className={`transition-colors cursor-move ${
                    draggedCategory?.id === cat.id
                      ? "bg-[rgb(60_28_84)]/5 opacity-60"
                      : "hover:bg-gray-50/50"
                  }`}
                >
                  <td className="p-4 text-gray-300 hover:text-gray-500 transition-colors">
                    <GripVertical size={16} className="mx-auto" />
                  </td>

                  <td className="p-4">
                    {cat.logo_url ? (
                      <img
                        src={cat.logo_url}
                        alt={cat.title}
                        className="w-10 h-10 rounded-lg object-cover mx-auto bg-gray-50 border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-50 mx-auto flex items-center justify-center border border-gray-100 text-[10px] font-bold text-gray-400">
                        N/A
                      </div>
                    )}
                  </td>

                  <td className="p-4 font-bold text-gray-900">{cat.title}</td>

                  <td className="p-4 text-gray-600">
                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                      {cat.product_count !== undefined ? cat.product_count : 0}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openDelete(cat)}
                        className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REORDER HINT */}
      {!loading && categories.length > 1 && (
        <div className="text-xs font-medium text-gray-400 text-center flex items-center justify-center gap-1.5 pt-2">
          <GripVertical size={12} />
          Drag rows to reorder categories
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {formMounted && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none p-0 md:p-4">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
              formVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeForm}
          />

          {/* Panel */}
          <div
            className={`relative bg-white rounded-t-[1.5rem] md:rounded-2xl shadow-2xl w-full max-w-md p-6 pointer-events-auto transition-all duration-300 transform ${
              formVisible
                ? "translate-y-0 opacity-100 md:scale-100"
                : "translate-y-full md:translate-y-8 opacity-0 md:scale-95"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {formMode === "create" ? tr.addCategory : tr.editCategory}
              </h3>
              <button
                onClick={closeForm}
                className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">
                  {tr.title}
                </label>
                <input
                  required
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(60_28_84)]/20 focus:border-[rgb(60_28_84)] transition-all text-sm font-medium"
                  placeholder={tr.title}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  {tr.logo}
                </label>
                {formData.logo ? (
                  <div className="relative inline-block group">
                    <img
                      src={formData.logo}
                      alt="Category Logo"
                      className="w-32 h-32 rounded-xl object-cover border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: "" })}
                      className="absolute -top-2 -right-2 bg-white text-red-500 hover:bg-red-50 border border-gray-100 rounded-full p-1.5 shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[rgb(60_28_84)] transition-colors group">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[rgb(60_28_84)]" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 mb-2 text-gray-300 group-hover:text-[rgb(60_28_84)] transition-colors" />
                        <span className="text-xs font-bold text-gray-400 group-hover:text-[rgb(60_28_84)] transition-colors">
                          Upload Image
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-5 mt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-lg transition-colors flex-1 md:flex-none"
                >
                  {tr.cancel}
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 bg-[rgb(60_28_84)] hover:bg-[rgb(75_35_105)] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center min-w-[100px] flex-1 md:flex-none"
                >
                  {formLoading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    tr.save
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteMounted && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none p-0 md:p-4">
          <div
            className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
              deleteVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeDelete}
          />

          <div
            className={`relative bg-white rounded-t-[1.5rem] md:rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center pointer-events-auto transition-all duration-300 transform ${
              deleteVisible
                ? "translate-y-0 opacity-100 md:scale-100"
                : "translate-y-full md:translate-y-8 opacity-0 md:scale-95"
            }`}
          >
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">
              Delete "{selectedCategory.title}"?
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={closeDelete}
                className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-lg transition-colors w-full"
              >
                {tr.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-colors w-full flex items-center justify-center"
              >
                {deleteLoading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999]">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}
