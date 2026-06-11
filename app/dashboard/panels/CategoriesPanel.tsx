"use client";

import { useMemo, useState } from "react";
import { uploadImages } from "@/lib/image-upload";
import {
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Loader2,
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
  const categories = data || [];

  const { execute: createCategory, loading: createLoading } =
    useCategoryCreate();
  const { execute: updateCategory, loading: updateLoading } =
    useCategoryUpdate();
  const { execute: deleteCategory, loading: deleteLoading } =
    useCategoryDelete();

  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", logo: "" });
  const [uploading, setUploading] = useState(false);

  const formLoading = createLoading || updateLoading || uploading;

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // FIX: The backend PUT requires the ID in the body payload!
      const payload: any = {
        title: formData.title,
        logo_url: formData.logo,
      };

      if (formMode === "create") {
        await createCategory(storeId, payload);
      } else if (formMode === "edit" && selectedCategory) {
        payload.id = selectedCategory.id; // <-- This was missing!
        await updateCategory(selectedCategory.id, payload);
      }

      showToast(
        formMode === "create" ? tr.createdSuccess : tr.updatedSuccess,
        "success",
      );
      setFormOpen(false);
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

  const openCreate = () => {
    setFormMode("create");
    setFormData({ title: "", logo: "" });
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const openEdit = (cat: Category) => {
    setFormMode("edit");
    setSelectedCategory(cat);
    setFormData({ title: cat.title, logo: cat.logo_url || "" });
    setFormOpen(true);
  };

  const openDelete = (cat: Category) => {
    setSelectedCategory(cat);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory(selectedCategory.id, storeId);
      showToast(tr.deletedSuccess, "success");
      setDeleteOpen(false);
      fetchCategories();
    } catch {
      showToast(tr.errorOccurred, "error");
    }
  };

  const filtered = useMemo(
    () =>
      (categories || []).filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [categories, search],
  );

  return (
    <div className="space-y-6 relative" dir={dir}>
      {/* HEADER CARDS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-6 bg-[rgb(60_28_84)] text-white">
          <p className="text-3xl font-bold">{categories.length}</p>
          <p className="text-sm opacity-80">{tr.totalCategories}</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="bg-gray-50 border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(60_28_84)]"
              placeholder={tr.searchCategories}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={fetchCategories}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <button
          onClick={openCreate}
          className="bg-[rgb(60_28_84)] hover:bg-[rgb(75_35_105)] transition text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
        >
          {tr.addCategory}
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-center">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 font-semibold text-gray-600">{tr.logo}</th>
              <th className="p-4 font-semibold text-gray-600">{tr.title}</th>
              <th className="p-4 font-semibold text-gray-600">
                {tr.productsCount}
              </th>
              <th className="p-4 font-semibold text-gray-600">{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center">
                  <Loader2 className="animate-spin mx-auto text-[rgb(60_28_84)] w-8 h-8" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-gray-500 font-medium">
                  {tr.noData || "No categories found"}
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4">
                    {cat.logo_url ? (
                      <img
                        src={cat.logo_url}
                        alt={cat.title}
                        className="w-12 h-12 rounded-lg object-cover mx-auto bg-gray-100 border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 mx-auto flex items-center justify-center border text-xs text-gray-400">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-bold text-gray-800">{cat.title}</td>
                  <td className="p-4 text-gray-600">
                    {cat.product_count || 0}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-lg transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => openDelete(cat)}
                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              {formMode === "create" ? tr.addCategory : tr.editCategory}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                  {tr.title}
                </label>
                <input
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(60_28_84)]"
                  placeholder={tr.title}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  {tr.logo}
                </label>
                {formData.logo ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.logo}
                      alt="Category Logo"
                      className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: "" })}
                      className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[rgb(60_28_84)] transition group">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-[rgb(60_28_84)]" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 mb-2 text-gray-400 group-hover:text-[rgb(60_28_84)] transition" />
                        <span className="text-sm font-medium text-gray-500 group-hover:text-[rgb(60_28_84)]">
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

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                >
                  {tr.cancel}
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 bg-[rgb(60_28_84)] hover:bg-[rgb(75_35_105)] text-white font-medium rounded-lg transition flex items-center justify-center min-w-[100px]"
                >
                  {formLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    tr.save
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (FIXED) */}
      {deleteOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Delete "{selectedCategory.title}"?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteOpen(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition w-full"
              >
                {tr.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition w-full flex items-center justify-center"
              >
                {deleteLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST (Forced to Top Right) */}
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
