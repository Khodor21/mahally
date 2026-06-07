"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  LayoutTemplate,
  X,
  Image as ImageIcon,
  Loader2,
  GripVertical,
} from "lucide-react";

import { useDashboard } from "../DashboardContext";
import Toast from "../components/Toast";

// --- Types ---
interface StoreSection {
  id: string;
  title: string;
  banner_url?: string;
  category_id: string; // The category this section pulls products from
  status: "active" | "draft";
  order: number;
}

interface ToastState {
  message: string;
  type: "success" | "error";
}

// Mock Categories for dropdown
const mockCategories = [
  { id: "1", title: "Burgers" },
  { id: "2", title: "Drinks" },
  { id: "3", title: "Desserts" },
];

// Mock API
const mockFetchSections = async (): Promise<StoreSection[]> => {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          {
            id: "s1",
            title: "عروض البرغر",
            banner_url: "https://placehold.co/1200x400/png?text=Banner",
            category_id: "1",
            status: "active",
            order: 0,
          },
          {
            id: "s2",
            title: "مشروبات منعشة",
            category_id: "2",
            status: "draft",
            order: 1,
          },
        ]),
      800,
    ),
  );
};

export default function StorefrontPanel() {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [sections, setSections] = useState<StoreSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedSection, setSelectedSection] = useState<StoreSection | null>(
    null,
  );
  const [formLoading, setFormLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState<Omit<StoreSection, "id" | "order">>({
    title: "",
    banner_url: "",
    category_id: "",
    status: "active",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mockFetchSections();
      setSections(data.sort((a, b) => a.order - b.order));
    } catch {
      showToast(tr.errorOccurred || "حدث خطأ أثناء تحميل الأقسام", "error");
    } finally {
      setLoading(false);
    }
  }, [tr]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const activeCount = useMemo(
    () => sections.filter((s) => s.status === "active").length,
    [sections],
  );

  // Handlers
  const openCreate = () => {
    setFormMode("create");
    setFormData({
      title: "",
      banner_url: "",
      category_id: mockCategories[0]?.id || "",
      status: "active",
    });
    setFormOpen(true);
  };

  const openEdit = (section: StoreSection) => {
    setFormMode("edit");
    setSelectedSection(section);
    setFormData({
      title: section.title,
      banner_url: section.banner_url || "",
      category_id: section.category_id,
      status: section.status,
    });
    setFormOpen(true);
  };

  const openDelete = (section: StoreSection) => {
    setSelectedSection(section);
    setDeleteOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category_id) {
      showToast(tr.requiredField || "يرجى تعبئة الحقول المطلوبة", "error");
      return;
    }

    setFormLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 800)); // MOCK
      if (formMode === "create") {
        const newSec: StoreSection = {
          id: Math.random().toString(36).substr(2, 9),
          ...formData,
          order: sections.length,
        };
        setSections((prev) => [...prev, newSec]);
        showToast(tr.createdSuccess || "تم إنشاء القسم بنجاح", "success");
      } else if (selectedSection) {
        setSections((prev) =>
          prev.map((s) =>
            s.id === selectedSection.id ? { ...s, ...formData } : s,
          ),
        );
        showToast(tr.updatedSuccess || "تم التحديث بنجاح", "success");
      }
      setFormOpen(false);
    } catch {
      showToast(tr.errorOccurred || "حدث خطأ", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSection) return;
    setDeleteLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 800)); // MOCK
      setSections((prev) => prev.filter((s) => s.id !== selectedSection.id));
      showToast(tr.deletedSuccess || "تم الحذف بنجاح", "success");
      setDeleteOpen(false);
    } catch {
      showToast(tr.errorOccurred || "حدث خطأ", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Summary Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[rgb(60_28_84)] to-[rgb(80_40_110)] rounded-xl flex items-center justify-center text-white shadow-md">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {tr.storefront || "واجهة المتجر"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              إدارة أقسام واجهة العرض واللافتات الإعلانية
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-center px-4 md:border-s border-gray-200">
            <p className="text-2xl font-bold text-[rgb(60_28_84)]">
              {activeCount}
            </p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
              مفعل
            </p>
          </div>
          <div className="text-center px-4 border-s border-gray-200">
            <p className="text-2xl font-bold text-gray-400">
              {sections.length - activeCount}
            </p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
              مسودة
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {tr.sections || "أقسام الصفحة الرئيسية"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSections}
            disabled={loading}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreate}
            className="bg-[rgb(60_28_84)] text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex gap-2 items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {tr.addSection || "إضافة قسم"}
          </button>
        </div>
      </div>

      {/* Sections List (Stacked Cards for Layout feel) */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 h-32 animate-pulse"
            >
              <div className="w-48 h-full bg-gray-100 rounded-lg"></div>
              <div className="flex-1 space-y-3 py-2">
                <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : sections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-20 flex flex-col items-center justify-center gap-4">
            <LayoutTemplate className="w-16 h-16 text-gray-200" />
            <p className="text-gray-500 font-medium">
              لم يتم إضافة أي أقسام لواجهة المتجر بعد
            </p>
          </div>
        ) : (
          sections.map((section) => {
            const categoryName =
              mockCategories.find((c) => c.id === section.category_id)?.title ||
              "Unknown";
            return (
              <div
                key={section.id}
                className="group flex flex-col md:flex-row bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Drag Handle (Visual only in this mock) */}
                <div className="hidden md:flex bg-gray-50 w-10 items-center justify-center border-e border-gray-100 cursor-move text-gray-300 group-hover:text-gray-500 transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Banner Preview */}
                <div className="w-full md:w-64 h-32 bg-gray-100 flex items-center justify-center relative shrink-0 overflow-hidden">
                  {section.banner_url ? (
                    <img
                      src={section.banner_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 gap-2">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">
                        بدون لافتة
                      </span>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 start-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm ${
                        section.status === "active"
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-800 text-white"
                      }`}
                    >
                      {section.status === "active" ? "نشط" : "مسودة"}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 md:p-5 flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    {section.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      {/* <Tags className="w-3 h-3" /> */}
                      مرتبط بتصنيف: {categoryName}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 md:p-5 flex flex-row md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-s border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => openEdit(section)}
                    className="flex-1 md:flex-none p-2 md:w-10 md:h-10 rounded-lg text-gray-500 hover:text-[rgb(60_28_84)] hover:bg-[rgb(60_28_84)]/10 transition-colors flex justify-center items-center"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDelete(section)}
                    className="flex-1 md:flex-none p-2 md:w-10 md:h-10 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors flex justify-center items-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                {formMode === "create" ? "إضافة قسم جديد" : "تعديل القسم"}
              </h3>
              <button
                onClick={() => !formLoading && setFormOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  عنوان القسم (يظهر للعملاء) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/20 focus:border-[rgb(60_28_84)] transition-all"
                  placeholder="مثال: الأكثر مبيعاً"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  ربط بتصنيف المنتجات *
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/20 focus:border-[rgb(60_28_84)] transition-all"
                  dir={dir}
                >
                  <option value="" disabled>
                    اختر تصنيفاً...
                  </option>
                  {mockCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  رابط لافتة إعلانية (Banner URL) - اختياري
                </label>
                <input
                  type="url"
                  value={formData.banner_url}
                  onChange={(e) =>
                    setFormData({ ...formData, banner_url: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/20 focus:border-[rgb(60_28_84)] transition-all"
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  حالة العرض
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as any,
                        })
                      }
                      className="accent-[rgb(60_28_84)] w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      نشط (ظاهر)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === "draft"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as any,
                        })
                      }
                      className="accent-[rgb(60_28_84)] w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-500">
                      مسودة (مخفي)
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-[rgb(60_28_84)] hover:opacity-90 rounded-xl transition-opacity flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  حفظ القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteOpen && selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              تأكيد الحذف
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              هل أنت متأكد من رغبتك في حذف قسم{" "}
              <strong>"{selectedSection.title}"</strong> من واجهة المتجر؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => !deleteLoading && setDeleteOpen(false)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                حذف
              </button>
            </div>
          </div>
        </div>
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
