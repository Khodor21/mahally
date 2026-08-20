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
  ChevronDown,
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
  const isAr = lang === "ar";
  const [toast, setToast] = useState<ToastState | null>(null);

  // --- Robust Local Translations ---
  const t = {
    storefront: tr.storefront || (isAr ? "واجهة المتجر" : "Storefront"),
    storefrontDesc:
      tr.storefrontDesc ||
      (isAr
        ? "إدارة أقسام واجهة العرض واللافتات الإعلانية"
        : "Manage storefront sections and promotional banners"),
    active: tr.active || (isAr ? "مفعل" : "Active"),
    draft: isAr ? "مسودة" : "Draft",
    sections:
      tr.sections || (isAr ? "أقسام الصفحة الرئيسية" : "Homepage Sections"),
    addSection: tr.addSection || (isAr ? "إضافة قسم" : "Add Section"),
    noSections: isAr
      ? "لم يتم إضافة أي أقسام لواجهة المتجر بعد"
      : "No storefront sections added yet",
    noBanner: isAr ? "بدون لافتة" : "No Banner",
    linkedTo: isAr ? "مرتبط بتصنيف:" : "Linked to:",
    unknown: isAr ? "غير معروف" : "Unknown",
    addTitle: isAr ? "إضافة قسم جديد" : "Add New Section",
    editTitle: isAr ? "تعديل القسم" : "Edit Section",
    sectionNameLabel: isAr
      ? "عنوان القسم (يظهر للعملاء) *"
      : "Section Title (Visible to customers) *",
    sectionNamePlaceholder: isAr ? "مثال: الأكثر مبيعاً" : "e.g., Best Sellers",
    categoryLabel: isAr
      ? "ربط بتصنيف المنتجات *"
      : "Link to Product Category *",
    selectCategory: isAr ? "اختر تصنيفاً..." : "Select a category...",
    bannerLabel: isAr ? "لافتة إعلانية (Banner)" : "Promotional Banner",
    bannerMax: isAr ? "الحد الأقصى: 400 كيلوبايت" : "Max Size: 400KB",
    bannerIdeal: isAr
      ? "الأبعاد المثالية: نسبة 3:1 (مثال: 1200×400)"
      : "Ideal Dimensions: 3:1 ratio (e.g., 1200x400)",
    uploadBanner: isAr ? "رفع صورة البانر" : "Upload Banner Image",
    displayStatus: isAr ? "حالة العرض" : "Display Status",
    visible: isAr ? "نشط (ظاهر)" : "Active (Visible)",
    hidden: isAr ? "مسودة (مخفي)" : "Draft (Hidden)",
    cancel: tr.cancel || (isAr ? "إلغاء" : "Cancel"),
    save: tr.save || (isAr ? "حفظ القسم" : "Save Section"),
    confirmDeleteTitle: isAr ? "تأكيد الحذف" : "Confirm Deletion",
    confirmDeleteDesc: isAr
      ? "هل أنت متأكد من رغبتك في حذف قسم"
      : "Are you sure you want to delete section",
    delete: tr.delete || (isAr ? "حذف" : "Delete"),
    requiredField:
      tr.requiredField ||
      (isAr
        ? "يرجى تعبئة الحقول المطلوبة"
        : "Please fill in all required fields"),
    createdSuccess:
      tr.createdSuccess ||
      (isAr ? "تم إنشاء القسم بنجاح" : "Section created successfully"),
    updatedSuccess:
      tr.updatedSuccess || (isAr ? "تم التحديث بنجاح" : "Updated successfully"),
    deletedSuccess:
      tr.deletedSuccess || (isAr ? "تم الحذف بنجاح" : "Deleted successfully"),
    errorOccurred: tr.errorOccurred || (isAr ? "حدث خطأ" : "An error occurred"),
  };

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
  const { data: categories = [] } = useCategories(storeId, { skip: !storeId });

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
      showToast(t.requiredField, "error");
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
        formMode === "create" ? t.createdSuccess : t.updatedSuccess,
        "success",
      );
      setFormOpen(false);
      fetchSections();
    } catch {
      showToast(t.errorOccurred, "error");
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
      showToast(t.deletedSuccess, "success");
      setDeleteOpen(false);
      fetchSections();
    } catch {
      showToast(t.errorOccurred, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6" dir={dir}>
      {/* Summary Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[rgb(60_28_84)] to-[rgb(80_40_110)] rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t.storefront}</h3>
            <p className="text-sm text-gray-500 mt-1">{t.storefrontDesc}</p>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
          <div
            className={`flex-1 text-center px-4 ${isAr ? "md:border-l" : "md:border-r"} border-gray-200`}
          >
            <p className="text-2xl font-bold text-[rgb(60_28_84)]">
              {activeCount}
            </p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-0.5">
              {t.active}
            </p>
          </div>
          <div className="flex-1 text-center px-4">
            <p className="text-2xl font-bold text-gray-400">
              {sections.length - activeCount}
            </p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-0.5">
              {t.draft}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {t.sections}
        </h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchSections}
            disabled={loading || !storeId}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreate}
            disabled={!storeId}
            className="flex-1 sm:flex-none bg-[rgb(60_28_84)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex gap-2 items-center justify-center hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {t.addSection}
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 h-32 animate-pulse shadow-sm"
            >
              <div className="w-32 md:w-48 h-full bg-gray-100/80 rounded-xl" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-5 w-1/3 bg-gray-100 rounded-md" />
                <div className="h-4 w-1/4 bg-gray-100 rounded-md" />
              </div>
            </div>
          ))
        ) : sections.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 py-24 flex flex-col items-center justify-center gap-4 shadow-sm">
            <LayoutTemplate
              className="w-16 h-16 text-gray-200"
              strokeWidth={1.5}
            />
            <p className="text-gray-500 font-medium text-center px-4">
              {t.noSections}
            </p>
          </div>
        ) : (
          sections.map((section) => {
            const categoryName =
              categories?.find((c) => c.id === section.category_id)?.title ||
              t.unknown;
            return (
              <div
                key={section.id}
                className="group flex flex-col md:flex-row bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Drag Handle */}
                <div
                  className={`hidden md:flex bg-gray-50/50 w-10 items-center justify-center border-${isAr ? "l" : "r"} border-gray-100 cursor-move text-gray-300 group-hover:text-gray-500 transition-colors`}
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Banner Preview */}
                <div className="w-full md:w-64 h-36 md:h-32 bg-gray-50 flex items-center justify-center relative shrink-0 overflow-hidden">
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
                        {t.noBanner}
                      </span>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div
                    className={`absolute top-3 ${isAr ? "right-3" : "left-3"}`}
                  >
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm ${
                        section.status === "active"
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-800 text-white"
                      }`}
                    >
                      {section.status === "active" ? t.active : t.draft}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 md:p-5 flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-gray-900">
                    {section.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      {t.linkedTo}{" "}
                      <span className="font-bold">{categoryName}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className={`p-4 md:p-5 flex flex-row md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-${isAr ? "r" : "l"} border-gray-100 bg-gray-50/30`}
                >
                  <button
                    onClick={() => openEdit(section)}
                    className="flex-1 md:flex-none p-2 md:w-10 md:h-10 rounded-xl text-gray-500 hover:text-[rgb(60_28_84)] hover:bg-[rgb(60_28_84)]/10 transition-colors flex justify-center items-center bg-white md:bg-transparent border md:border-transparent border-gray-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDelete(section)}
                    className="flex-1 md:flex-none p-2 md:w-10 md:h-10 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors flex justify-center items-center bg-white md:bg-transparent border md:border-transparent border-gray-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal - Responsive bottom sheet on mobile */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full md:w-full md:max-w-lg max-h-[90vh] md:max-h-[calc(100vh-2rem)] overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-200 flex flex-col">
            {/* Mobile Drag Indicator */}
            <div className="h-1.5 w-12 bg-gray-200 rounded-full mx-auto mt-3 mb-2 md:hidden" />

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <h3 className="text-lg font-bold text-gray-900">
                {formMode === "create" ? t.addTitle : t.editTitle}
              </h3>
              <button
                onClick={() => !formLoading && setFormOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="overflow-y-auto scrollbar-hide md:scrollbar-auto flex-1">
              <form
                id="section-form"
                onSubmit={handleFormSubmit}
                className="p-6 space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    {t.sectionNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/20 focus:border-[rgb(60_28_84)] transition-all placeholder:text-gray-400 text-gray-900"
                    placeholder={t.sectionNamePlaceholder}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    {t.categoryLabel}
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[rgb(60_28_84)]/20 focus:border-[rgb(60_28_84)] transition-all appearance-none text-gray-900 cursor-pointer ${isAr ? "pl-10" : "pr-10"}`}
                      dir={dir}
                    >
                      <option value="" disabled>
                        {t.selectCategory}
                      </option>
                      {categories?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    <div
                      className={`absolute inset-y-0 ${isAr ? "left-0 pl-3" : "right-0 pr-3"} flex items-center pointer-events-none text-gray-500`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    {t.bannerLabel}
                  </label>
                  <div className="space-y-1.5 mb-3">
                    <p className="text-[11px] text-amber-600 font-semibold bg-amber-50 inline-block px-2 py-0.5 rounded-md">
                      {t.bannerMax}
                    </p>
                    <p className="text-[11px] text-blue-600 font-semibold bg-blue-50 inline-block px-2 py-0.5 rounded-md">
                      {t.bannerIdeal}
                    </p>
                  </div>

                  {formData.banner_url ? (
                    <div className="relative w-full h-40 md:h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
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
                        className="absolute top-3 right-3 bg-white/90 text-red-600 p-2 rounded-full shadow-sm hover:bg-white hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group">
                      {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[rgb(60_28_84)]" />
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
                            <ImageIcon className="w-5 h-5 text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-600 font-medium">
                            {t.uploadBanner}
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

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    {t.displayStatus}
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="relative flex items-center">
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
                          className="peer w-5 h-5 accent-[rgb(60_28_84)] cursor-pointer"
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold transition-colors ${formData.status === "active" ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"}`}
                      >
                        {t.visible}
                      </span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="relative flex items-center">
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
                          className="peer w-5 h-5 accent-[rgb(60_28_84)] cursor-pointer"
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold transition-colors ${formData.status === "draft" ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"}`}
                      >
                        {t.hidden}
                      </span>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0 pb-8 md:pb-6">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={formLoading}
                className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                form="section-form"
                disabled={formLoading || uploading}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-[rgb(60_28_84)] hover:opacity-90 rounded-xl transition-opacity flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteOpen && selectedSection && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 text-center animate-in slide-in-from-bottom md:zoom-in-95 duration-200 pb-10 md:pb-8">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-8 h-8 text-red-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t.confirmDeleteTitle}
            </h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              {t.confirmDeleteDesc}{" "}
              <strong className="text-gray-900 font-bold px-1 block mt-1">
                "{selectedSection.title}"
              </strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => !deleteLoading && setDeleteOpen(false)}
                disabled={deleteLoading}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.delete}
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
