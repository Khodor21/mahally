"use client";
import { useMemo, useState, useEffect } from "react";

// Hide scrollbar on mobile while keeping scroll functionality
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  @media (min-width: 768px) {
    .scrollbar-hide {
      -ms-overflow-style: auto;
      scrollbar-width: auto;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: block;
    }
  }
`;
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
import { useFetch, useCategories, useStore } from "@/hooks/useApi";
import { uploadImages } from "@/lib/image-upload";
// --- Types ---
interface StoreSection {
  id: string;
  title: string;
  banner_url?: string;
  category_id: string;
  status: "active" | "draft";
  section_order: number;
}
interface ToastState {
  message: string;
  type: "success" | "error";
}
export default function StorefrontPanel() {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [toast, setToast] = useState<ToastState | null>(null);

  // Inject scrollbar hide styles on mount
  useEffect(() => {
    const styleId = "scrollbar-hide-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = scrollbarHideStyles;
      document.head.appendChild(style);
    }
  }, []);
  // Dynamic API Hooks
  const { data: store } = useStore();
  const storeId = store?.id || "";
  // Fetch real categories to replace mockCategories
  const { data: categories = [] } = useCategories(storeId, { skip: !storeId });
  // Use the generic useFetch hook since useSections doesn't exist natively in useApi.ts yet
  const {
    data,
    loading,
    retry: fetchSections,
  } = useFetch<StoreSection[]>(
    async () => {
      const res = await fetch(`/api/sections?store_id=${storeId}`);
      if (!res.ok) throw new Error("Failed to fetch sections");
      const data = await res.json();
      return data.sort(
        (a: StoreSection, b: StoreSection) => a.section_order - b.section_order,
      );
    },
    { skip: !storeId },
  );
  const sections = data ?? [];
  // Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedSection, setSelectedSection] = useState<StoreSection | null>(
    null,
  );
  const [formLoading, setFormLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      setUploading(true);
      const result = await uploadImages([file]);
      setFormData((prev) => ({
        ...prev,
        banner_url: result.urls[0],
      }));
    } catch (error: any) {
      showToast(error.message || "Failed to upload image", "error");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  }
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Form Data State
  const [formData, setFormData] = useState<
    Omit<StoreSection, "id" | "section_order">
  >({
    title: "",
    banner_url: "",
    category_id: "",
    status: "active",
  });
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };
  const activeCount = useMemo(
    () =>
      (sections || []).filter((s: StoreSection) => s.status === "active")
        .length,
    [sections],
  );
  // Handlers
  const openCreate = () => {
    setFormMode("create");
    setFormData({
      title: "",
      banner_url: "",
      category_id: categories?.length ? categories[0].id : "",
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
    if (!storeId) return;
    setFormLoading(true);
    try {
      const url =
        formMode === "create"
          ? "/api/sections"
          : `/api/sections/${selectedSection?.id}`;
      const method = formMode === "create" ? "POST" : "PUT";
      const payload =
        formMode === "create"
          ? {
              ...formData,
              store_id: storeId,
              section_order: sections?.length ?? 0,
            }
          : { ...formData, store_id: storeId };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      showToast(
        formMode === "create"
          ? tr.createdSuccess || "تم إنشاء القسم بنجاح"
          : tr.updatedSuccess || "تم التحديث بنجاح",
        "success",
      );
      setFormOpen(false);
      fetchSections();
    } catch {
      showToast(tr.errorOccurred || "حدث خطأ", "error");
    } finally {
      setFormLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!selectedSection || !storeId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `/api/sections/${selectedSection.id}?store_id=${storeId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error();
      showToast(tr.deletedSuccess || "تم الحذف بنجاح", "success");
      setDeleteOpen(false);
      fetchSections();
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
            <h3 className="text-xl font-bold text-gray-900">
              {tr.storefront || "واجهة المتجر"}
            </h3>
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
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {tr.sections || "أقسام الصفحة الرئيسية"}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSections}
            disabled={loading || !storeId}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreate}
            disabled={!storeId}
            className="bg-[rgb(60_28_84)] text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex gap-2 items-center justify-center hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
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
              categories?.find((c) => c.id === section.category_id)?.title ||
              "Unknown";
            return (
              <div
                key={section.id}
                className="group flex flex-col md:flex-row bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Drag Handle */}
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
      {/* Form Modal - FIX 3: Responsive bottom sheet on mobile */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:w-full md:max-w-lg max-h-[90vh] md:max-h-[calc(100vh-2rem)] overflow-y-auto md:overflow-y-auto animate-in slide-in-from-bottom md:zoom-in-95 duration-200 scrollbar-hide md:scrollbar-auto">
            {/* Mobile spacer at top */}
            <div className="h-1 w-12 bg-gray-300 rounded-full mx-auto mt-2 md:hidden"></div>

            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 sticky top-0 z-10">
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

            <form
              onSubmit={handleFormSubmit}
              className="p-6 space-y-5 pb-8 md:pb-0"
            >
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
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  لافتة إعلانية (Banner)
                </label>
                <div className="space-y-2">
                  <p className="text-[11px] text-amber-600 font-medium">
                    <strong>الحد الأقصى:</strong> 400 كيلوبايت |{" "}
                    <strong>Max:</strong> 400KB
                  </p>
                  <p className="text-[11px] text-blue-600 font-medium">
                    <strong>الأبعاد المثالية:</strong> نسبة 3:1 (مثال: 1200×400)
                    | <strong>Ideal:</strong> 3:1 aspect ratio (e.g.,
                    1200×400px)
                  </p>
                </div>
                {formData.banner_url ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border">
                    <img
                      src={formData.banner_url}
                      className="w-full h-full object-cover"
                      alt="banner"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, banner_url: "" })
                      }
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500 font-medium">
                          رفع صورة البانر
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleBannerUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
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
              <div className="pt-4 flex gap-3 border-t border-gray-100 mt-4 sticky bottom-0 bg-white py-4 z-10">
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
                  disabled={formLoading || uploading}
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
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in slide-in-from-bottom md:zoom-in-95 duration-200">
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
