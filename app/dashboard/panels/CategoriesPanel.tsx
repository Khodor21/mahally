"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Tags,
  X,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

import { useDashboard } from "../DashboardContext";
import Toast from "../components/Toast";

interface Category {
  id: string;
  title: string;
  logo_url?: string;
  product_count: number;
  created_at: string;
}

interface ToastState {
  message: string;
  type: "success" | "error";
}

export default function CategoriesPanel({ storeId }: { storeId: string }) {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [formLoading, setFormLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", logo: "" });

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ message, type });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories?store_id=${storeId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data);
    } catch {
      showToast(tr.errorOccurred, "error");
    } finally {
      setLoading(false);
    }
  }, [storeId, tr.errorOccurred]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const url =
        formMode === "create"
          ? "/api/categories"
          : `/api/categories/${selectedCategory?.id}`;
      const method = formMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          logo_url: formData.logo,
          store_id: storeId,
        }),
      });

      if (!res.ok) throw new Error();

      showToast(
        formMode === "create" ? tr.createdSuccess : tr.updatedSuccess,
        "success",
      );
      setFormOpen(false);
      fetchCategories();
    } catch {
      showToast(tr.errorOccurred, "error");
    } finally {
      setFormLoading(false);
    }
  };

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
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `/api/categories/${selectedCategory.id}?store_id=${storeId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error();
      showToast(tr.deletedSuccess, "success");
      setDeleteOpen(false);
      fetchCategories();
    } catch {
      showToast(tr.errorOccurred, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      categories.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [categories, search],
  );

  return (
    <div className="space-y-6" dir={dir}>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-6 bg-[rgb(60_28_84)] text-white">
          <p className="text-3xl font-bold">{categories.length}</p>
          <p className="text-sm opacity-80">{tr.totalCategories}</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2">
          <input
            className="bg-gray-50 border rounded-lg px-3 py-2 text-sm"
            placeholder={tr.searchCategories}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={fetchCategories}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <button
          onClick={openCreate}
          className="bg-[rgb(60_28_84)] text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          {tr.addCategory}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-center">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">{tr.logo}</th>
              <th className="p-4">{tr.title}</th>
              <th className="p-4">{tr.productsCount}</th>
              <th className="p-4">{tr.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center">
                  <Loader2 className="animate-spin mx-auto" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-gray-500">
                  {tr.noData}
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr key={cat.id} className="border-t">
                  <td className="p-4">
                    <img
                      src={cat.logo_url || ""}
                      className="w-10 h-10 rounded object-cover mx-auto bg-gray-100"
                    />
                  </td>
                  <td className="p-4 font-bold">{cat.title}</td>
                  <td className="p-4">{cat.product_count}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => openEdit(cat)}>
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => openDelete(cat)}
                      className="text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">
              {formMode === "create" ? tr.addCategory : tr.editCategory}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                required
                className="w-full p-2 border rounded-lg"
                placeholder={tr.title}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <input
                className="w-full p-2 border rounded-lg"
                placeholder={tr.logoUrl || "Logo URL"}
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  {tr.cancel}
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-[rgb(60_28_84)] text-white rounded-lg"
                >
                  {formLoading ? <Loader2 className="animate-spin" /> : tr.save}
                </button>
              </div>
            </form>
          </div>
        </div>
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
