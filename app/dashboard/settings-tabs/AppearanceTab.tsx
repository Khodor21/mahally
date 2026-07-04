"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Palette,
  Settings,
  ImageIcon,
  Layout,
  MessageSquare,
  Loader2,
} from "lucide-react";
import FeatureForm from "./FeatureForm";
import Testimonials from "./Testimonials";
import { useDashboard } from "../DashboardContext";
import { HeroBanner, Feature } from "@/types/api";

interface AppearanceTabProps {
  lang: string;
  dir: string;
  formData: any;
  setFormData: (data: any) => void;
  isAddingBanner: boolean;
  setIsAddingBanner: (val: boolean) => void;
  newBanner: any;
  setNewBanner: (banner: any) => void;
  banners: any[];
  expandedBanner: string | null;
  setExpandedBanner: (id: string | null) => void;
  isUploadingBanner: boolean;
  setIsUploadingBanner: (val: boolean) => void;
  isAddingFeature: boolean;
  setIsAddingFeature: (val: boolean) => void;
  features: any[];
  expandedSection: number | null;
  setExpandedSection: (idx: number | null) => void;
  storeId: string;
  refetchFeatures: () => void;
  refetchBanners: () => void;
  handleImageUpload: (file: File) => Promise<string | null>;
  handleSaveBanner: () => Promise<void>;
  isSavingBanner: boolean;
  SaveButton: any;
  showToast: (message: string, type: "success" | "error") => void;
  setBannerConfirm: (state: any) => void;
}

const SECTIONS = [
  {
    id: "branding",
    title: {
      ar: "تخصيص المتجر",
      en: "Store Appearance",
    },
    subtitle: {
      ar: "الألوان، الشعار، واللغة",
      en: "Colors, logo, and language",
    },
    icon: Palette,
  },
  {
    id: "site_sections",
    title: {
      ar: "أقسام الموقع",
      en: "Site Sections",
    },
    subtitle: {
      ar: "إدارة الفئات والمنتجات",
      en: "Manage categories and featured products",
    },
    icon: Settings,
  },
  {
    id: "banners",
    title: {
      ar: "لافتات العرض",
      en: "Display Banners",
    },
    subtitle: {
      ar: "صور العرض الرئيسية",
      en: "Hero banner images",
    },
    icon: ImageIcon,
  },
  {
    id: "features",
    title: {
      ar: "ميزات المتجر",
      en: "Store Features",
    },
    subtitle: {
      ar: "أقسام المميزات مع الأيقونات",
      en: "Feature sections with icons",
    },
    icon: Layout,
  },
  {
    id: "testimonials",
    title: {
      ar: "شهادات العملاء",
      en: "Customer Testimonials",
    },
    subtitle: {
      ar: "آراء ومراجعات العملاء",
      en: "Customer reviews and feedback",
    },
    icon: MessageSquare,
  },
];

interface SectionProps {
  section: (typeof SECTIONS)[0];
  isOpen: boolean;
  onToggle: () => void;
  lang: string;
  dir: string;
  children: React.ReactNode;
}

function AccordionSection({
  section,
  isOpen,
  onToggle,
  lang,
  dir,
  children,
}: SectionProps) {
  const SectionIcon = section.icon;
  return (
    <div className="border border-[rgb(207_195_223)] rounded-lg overflow-hidden animate-fade-up hover:border-[rgb(207_195_223)]/80 transition-colors">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-[rgb(244_242_245)] transition-colors group"
      >
        {/* FIX: Added flex-row-reverse for RTL */}
        <div className="flex items-center gap-3 flex-1">
          {SectionIcon && (
            <div className="w-9 h-9 rounded-md bg-[rgb(60_28_84)]/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[rgb(60_28_84)]/10 transition-colors">
              <SectionIcon className="w-5 h-5 text-[rgb(60_28_84)]" />
            </div>
          )}
          {/* KEEP text-right for RTL */}
          <div className={dir === "rtl" ? "text-right" : "text-left"}>
            <h3 className="font-bold text-sm text-[rgb(60_28_84)]">
              {section.title[lang as "ar" | "en"]}
            </h3>
            <p className="text-xs text-[rgb(60_28_84)]/50 mt-0.5">
              {section.subtitle[lang as "ar" | "en"]}
            </p>
          </div>
        </div>
        {/* Chevron */}
        <ChevronDown
          className={`w-5 h-5 text-[rgb(60_28_84)]/60 transition-transform duration-300 flex-shrink-0 ${
            dir === "rtl"
              ? isOpen
                ? "rotate-180"
                : "rotate-0"
              : isOpen
                ? "rotate-180"
                : "rotate-0"
          }`}
        />
      </button>
      {/* Content */}
      {isOpen && (
        <div className="border-t border-[rgb(207_195_223)] bg-white px-5 py-4 animate-fade-down">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AppearanceTab(props: AppearanceTabProps) {
  const {
    lang,
    dir,
    formData,
    setFormData,
    isAddingBanner,
    setIsAddingBanner,
    newBanner,
    setNewBanner,
    banners,
    expandedBanner,
    setExpandedBanner,
    isUploadingBanner,
    setIsUploadingBanner,
    isAddingFeature,
    setIsAddingFeature,
    features,
    expandedSection,
    setExpandedSection,
    storeId,
    refetchFeatures,
    refetchBanners,
    handleImageUpload,
    handleSaveBanner,
    isSavingBanner,
    SaveButton,
    showToast,
    setBannerConfirm,
  } = props;

  const [expandedSections, setExpandedSections] = useState<string[]>([
    "branding",
  ]);
  const [deletingFeature, setDeletingFeature] = useState<
    string | number | null
  >(null);
  const [isDeletingFeature, setIsDeletingFeature] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const handleColorChange = (color: string) => {
    setFormData({ ...formData, primary_color: color });
  };

  const handleLogoUpload = async (file: File) => {
    setIsUploadingBanner(true);
    const url = await handleImageUpload(file);
    if (url) {
      setFormData({ ...formData, logo_url: url });
    }
    setIsUploadingBanner(false);
  };

  const handleDeleteFeature = async (featureId: string | number) => {
    setIsDeletingFeature(true);
    try {
      const response = await fetch(`/api/features?id=${featureId}`, {
        method: "DELETE",
        headers: {
          "x-store-id": storeId,
        },
      });
      if (!response.ok) throw new Error("Failed to delete feature");
      setDeletingFeature(null);
      refetchFeatures();
      showToast(
        lang === "ar"
          ? "تم حذف الميزة بنجاح!"
          : "Feature deleted successfully!",
        "success",
      );
    } catch (error) {
      console.error(error);
      showToast(
        lang === "ar" ? "خطأ في حذف الميزة" : "Error deleting feature",
        "error",
      );
    } finally {
      setIsDeletingFeature(false);
    }
  };

  return (
    <div className="space-y-3 w-full" dir={dir}>
      {/* Branding Section */}
      <AccordionSection
        section={SECTIONS[0]}
        isOpen={expandedSections.includes("branding")}
        onToggle={() => toggleSection("branding")}
        lang={lang}
        dir={dir}
      >
        <div className="space-y-6">
          {/* Primary Color */}
          <div>
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-3">
              {lang === "ar" ? "اللون الأساسي" : "Primary Color"}
            </label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.primary_color || "#3C1C54"}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-12 rounded-lg border-2 border-[rgb(207_195_223)] cursor-pointer hover:border-[rgb(207_195_223)]/60"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.primary_color || "#3C1C54"}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2 text-sm outline-none border border-transparent focus:border-[rgb(207_195_223)] font-mono"
                  placeholder="#3C1C54"
                />
              </div>
            </div>
            <p className="text-xs text-[rgb(60_28_84)]/40 mt-2">
              {lang === "ar"
                ? "يُستخدم في الأزرار والروابط والعناصر المهمة"
                : "Used in buttons, links, and important elements"}
            </p>
          </div>
          {/* Logo */}
          <div>
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-3">
              {lang === "ar" ? "شعار المتجر" : "Store Logo"}
            </label>
            <div className="flex flex-col gap-3">
              {formData.logo_url && (
                <div className="w-full bg-[rgb(244_242_245)] rounded-lg p-4 flex items-center justify-center">
                  <img
                    src={formData.logo_url}
                    alt="Logo"
                    className="max-w-32 max-h-32 object-contain"
                  />
                </div>
              )}
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[rgb(207_195_223)] rounded-lg cursor-pointer hover:bg-[rgb(244_242_245)] transition-colors">
                <Plus className="w-4 h-4 text-[rgb(60_28_84)]/60" />
                <span className="text-sm font-semibold text-[rgb(60_28_84)]">
                  {lang === "ar"
                    ? isUploadingBanner
                      ? "جاري الرفع..."
                      : "اختر شعاراً"
                    : isUploadingBanner
                      ? "Uploading..."
                      : "Choose logo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                  disabled={isUploadingBanner}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          {/* Language Selection */}
          <div>
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-3">
              {lang === "ar" ? "لغة المتجر" : "Store Language"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["ar", "en"].map((lng) => (
                <button
                  key={lng}
                  onClick={() => setFormData({ ...formData, language: lng })}
                  className={`px-4 py-2.5 rounded-sm text-sm font-semibold transition-all border ${
                    formData.language === lng
                      ? "bg-[rgb(60_28_84)] text-white border-[rgb(60_28_84)]"
                      : "bg-[rgb(244_242_245)] text-[rgb(60_28_84)] border-transparent hover:border-[rgb(207_195_223)]"
                  }`}
                >
                  {lng === "ar" ? "العربية" : "English"}
                </button>
              ))}
            </div>
          </div>
          {/* Promo Bar Text */}
          <div>
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-3">
              {lang === "ar" ? "نص الشريط الإعلاني" : "Top Promo Bar Text"}
            </label>
            <input
              type="text"
              value={formData.promo_text || ""}
              onChange={(e) =>
                setFormData({ ...formData, promo_text: e.target.value })
              }
              placeholder={
                lang === "ar"
                  ? "مثال: توصيل مجاني للطلبات أكثر من 50 دولار"
                  : "Example: Free delivery for orders over 50$"
              }
              className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
              dir={dir}
            />
            <p className="text-xs text-[rgb(60_28_84)]/40 mt-2">
              {lang === "ar"
                ? "يظهر في الأعلى في جميع صفحات المتجر"
                : "Displays at the top of your storefront"}
            </p>
          </div>
          {/* Delivery Fees */}
          <div>
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-3">
              {lang === "ar" ? "رسوم التسليم" : "Delivery Fee"}
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.delivery_cost ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delivery_cost: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
              />
            </div>
            <p className="text-xs text-[rgb(60_28_84)]/40 mt-2">
              {lang === "ar"
                ? "تكلفة التسليم المحسوبة في سلة المشتريات"
                : "Shipping cost applied to all orders"}
            </p>
          </div>
          {/* Save Button */}
          <div className="pt-2">
            <SaveButton />
          </div>
        </div>
      </AccordionSection>

      {/* Site Sections Quick Access */}
      <AccordionSection
        section={SECTIONS[1]}
        isOpen={expandedSections.includes("site_sections")}
        onToggle={() => toggleSection("site_sections")}
        lang={lang}
        dir={dir}
      >
        <div className="space-y-4">
          <a href="#sections" className="block">
            <button className="w-full flex items-center justify-center gap-3 px-5 py-3 text-sm font-semibold bg-[rgb(60_28_84)] text-white rounded-sm hover:bg-[rgb(60_28_84)]/90 transition-all shadow-sm">
              <Settings className="w-4 h-4" />
              {lang === "ar" ? "إدارة أقسام الموقع" : "Manage Site Sections"}
            </button>
          </a>
          <p className="text-xs text-[rgb(60_28_84)]/50 text-center mt-3">
            {lang === "ar"
              ? "انتقل إلى علامة التبويب أقسام للتحكم في الفئات والمنتجات"
              : "Go to Sections tab in sidebar to manage categories"}
          </p>
        </div>
      </AccordionSection>

      {/* Banners Section */}
      <AccordionSection
        section={SECTIONS[2]}
        isOpen={expandedSections.includes("banners")}
        onToggle={() => toggleSection("banners")}
        lang={lang}
        dir={dir}
      >
        <div className="space-y-4">
          {/* Add Banner Button */}
          <button
            onClick={() => setIsAddingBanner(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[rgb(207_195_223)] rounded-lg hover:bg-[rgb(244_242_245)] transition-colors group"
          >
            <Plus className="w-4 h-4 text-[rgb(60_28_84)] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-[rgb(60_28_84)]">
              {lang === "ar" ? "إضافة لافتة جديدة" : "Add New Banner"}
            </span>
          </button>
          {/* Add Banner Form */}
          {isAddingBanner && (
            <div className="bg-[rgb(244_242_245)] rounded-lg p-4 space-y-3 border border-[rgb(207_195_223)]">
              {/* Banner Upload */}
              <div>
                <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                  {lang === "ar" ? "الصورة" : "Image"}
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[rgb(207_195_223)] rounded-lg cursor-pointer hover:bg-white transition-colors bg-white">
                  <Plus className="w-4 h-4 text-[rgb(60_28_84)]/60" />
                  <span className="text-sm font-semibold text-[rgb(60_28_84)]">
                    {lang === "ar"
                      ? isUploadingBanner
                        ? "جاري الرفع..."
                        : "اختر صورة"
                      : isUploadingBanner
                        ? "Uploading..."
                        : "Choose image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIsUploadingBanner(true);
                        handleImageUpload(file).then((url) => {
                          if (url) setNewBanner({ ...newBanner, image: url });
                          setIsUploadingBanner(false);
                        });
                      }
                    }}
                    disabled={isUploadingBanner}
                    className="hidden"
                  />
                </label>
              </div>
              {/* Preview */}
              {newBanner.image && (
                <div className="w-full bg-white rounded-lg p-2">
                  <img
                    src={newBanner.image}
                    alt="Preview"
                    className="w-full h-auto max-h-48 object-cover rounded"
                  />
                </div>
              )}
              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsAddingBanner(false);
                    setNewBanner({ image: "", active: true, order: 1 });
                  }}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-[rgb(60_28_84)] bg-white rounded-lg hover:opacity-80 transition-opacity"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleSaveBanner}
                  disabled={!newBanner.image || isSavingBanner}
                  className="flex-1 px-4 py-2 text-sm font-semibold bg-[rgb(60_28_84)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {lang === "ar" ? "حفظ" : "Save"}
                </button>
              </div>
            </div>
          )}
          {/* Banners List */}
          {banners.length > 0 ? (
            <div className="space-y-2">
              {banners.map((banner: any) => (
                <div
                  key={banner.id}
                  className="border border-[rgb(207_195_223)] rounded-lg overflow-hidden hover:border-[rgb(207_195_223)]/60 transition-colors"
                >
                  <button
                    onClick={() =>
                      setExpandedBanner(
                        expandedBanner === banner.id ? null : banner.id,
                      )
                    }
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[rgb(244_242_245)] transition-colors"
                  >
                    {/* FIX: Added flex-row-reverse for RTL */}
                    <div
                      className={`flex items-center gap-3 flex-1 ${dir === "rtl" ? "flex-row-reverse" : ""}`}
                    >
                      <img
                        src={banner.image}
                        alt="Banner"
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                      />
                      {/* FIX: Added text alignment for RTL */}
                      <div
                        className={dir === "rtl" ? "text-right" : "text-left"}
                      >
                        <p className="text-sm font-semibold text-[rgb(60_28_84)]">
                          {lang === "ar" ? "لافتة #" : "Banner #"}
                          {banner.order}
                        </p>
                        <p className="text-xs text-[rgb(60_28_84)]/50">
                          {banner.active
                            ? lang === "ar"
                              ? "نشط"
                              : "Active"
                            : lang === "ar"
                              ? "معطل"
                              : "Disabled"}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[rgb(60_28_84)]/60 transition-transform flex-shrink-0 ${
                        expandedBanner === banner.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedBanner === banner.id && (
                    <div className="border-t border-[rgb(207_195_223)] bg-[rgb(244_242_245)] px-4 py-3 flex gap-2">
                      <button
                        onClick={() =>
                          setBannerConfirm({
                            isOpen: true,
                            action: "toggle",
                            banner,
                            loading: false,
                          })
                        }
                        className="flex-1 px-3 py-2 text-xs font-semibold text-[rgb(60_28_84)] bg-white rounded hover:opacity-80 transition-opacity"
                      >
                        {banner.active
                          ? lang === "ar"
                            ? "تعطيل"
                            : "Disable"
                          : lang === "ar"
                            ? "تفعيل"
                            : "Enable"}
                      </button>
                      <button
                        onClick={() =>
                          setBannerConfirm({
                            isOpen: true,
                            action: "delete",
                            banner,
                            loading: false,
                          })
                        }
                        className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                      >
                        {lang === "ar" ? "حذف" : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[rgb(60_28_84)]/50">
                {lang === "ar" ? "لا توجد لافتات حتى الآن" : "No banners yet"}
              </p>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Features Section */}
      <AccordionSection
        section={SECTIONS[3]}
        isOpen={expandedSections.includes("features")}
        onToggle={() => toggleSection("features")}
        lang={lang}
        dir={dir}
      >
        <div className="space-y-4">
          {/* Add Feature Button */}
          <button
            onClick={() => {
              setEditingFeature(null);
              setIsAddingFeature(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[rgb(207_195_223)] rounded-lg hover:bg-[rgb(244_242_245)] transition-colors group"
          >
            <Plus className="w-4 h-4 text-[rgb(60_28_84)] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-[rgb(60_28_84)]">
              {lang === "ar" ? "إضافة ميزة جديدة" : "Add New Feature"}
            </span>
          </button>
          {/* Add/Edit Feature Form */}
          {(isAddingFeature || editingFeature) && (
            <FeatureForm
              lang={lang}
              dir={dir}
              storeId={storeId}
              featureId={editingFeature?.id}
              initialData={editingFeature}
              onCancel={() => {
                setIsAddingFeature(false);
                setEditingFeature(null);
              }}
              onSuccess={() => {
                setIsAddingFeature(false);
                setEditingFeature(null);
                refetchFeatures();
                showToast(
                  lang === "ar"
                    ? "تم حفظ الميزة بنجاح!"
                    : "Feature saved successfully!",
                  "success",
                );
              }}
            />
          )}
          {/* Features List */}
          {features.length > 0 ? (
            <div className="space-y-2">
              {features.map((feature: any, index: number) => (
                <div
                  key={feature.id}
                  className="border border-[rgb(207_195_223)] rounded-lg overflow-hidden hover:border-[rgb(207_195_223)]/60 transition-colors"
                >
                  <button
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === index ? null : index,
                      )
                    }
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[rgb(244_242_245)] transition-colors"
                  >
                    {/* FIX: Added flex-row-reverse for RTL */}
                    <div
                      className={`flex items-center gap-3 flex-1 ${dir === "rtl" ? "flex-row-reverse" : ""}`}
                    >
                      <div className="w-9 h-9 rounded-md bg-[rgb(60_28_84)]/5 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-[rgb(60_28_84)]">
                          {feature.icon_name?.[0] || "✓"}
                        </span>
                      </div>
                      {/* FIX: Added text alignment for RTL */}
                      <div
                        className={dir === "rtl" ? "text-right" : "text-left"}
                      >
                        <p className="text-sm font-semibold text-[rgb(60_28_84)]">
                          {feature.title}
                        </p>
                        <p className="text-xs text-[rgb(60_28_84)]/50 line-clamp-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[rgb(60_28_84)]/60 transition-transform flex-shrink-0 ${
                        expandedSection === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSection === index && (
                    <div className="border-t border-[rgb(207_195_223)] bg-[rgb(244_242_245)] px-4 py-3 space-y-3">
                      <div className="bg-white rounded p-3 space-y-2 text-sm">
                        <div>
                          <p className="text-xs font-semibold text-[rgb(60_28_84)]/50">
                            {lang === "ar" ? "الوصف" : "Description"}
                          </p>
                          <p className="text-sm text-[rgb(60_28_84)] mt-1">
                            {feature.description}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[rgb(60_28_84)]/50">
                            {lang === "ar" ? "الأيقونة" : "Icon"}
                          </p>
                          <p className="text-sm text-[rgb(60_28_84)] font-mono mt-1">
                            {feature.icon_name}
                          </p>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingFeature(feature);
                            setIsAddingFeature(false);
                            setExpandedSection(null);
                          }}
                          className="flex-1 px-3 py-2 text-xs font-semibold text-[rgb(60_28_84)] bg-white rounded hover:opacity-80 transition-opacity flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          {lang === "ar" ? "تعديل" : "Edit"}
                        </button>
                        <button
                          onClick={() => setDeletingFeature(feature.id)}
                          className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          {lang === "ar" ? "حذف" : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[rgb(60_28_84)]/50">
                {lang === "ar" ? "لا توجد ميزات حتى الآن" : "No features yet"}
              </p>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* Testimonials Section */}
      <AccordionSection
        section={SECTIONS[4]}
        isOpen={expandedSections.includes("testimonials")}
        onToggle={() => toggleSection("testimonials")}
        lang={lang}
        dir={dir}
      >
        <Testimonials dir={dir} />
      </AccordionSection>

      {/* Delete Feature Confirmation Modal */}
      {deletingFeature && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h3 className="font-bold text-lg text-[rgb(60_28_84)] mb-2">
              {lang === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
            </h3>
            <p className="text-sm text-[rgb(60_28_84)]/70 mb-6">
              {lang === "ar"
                ? "هل أنت متأكد من حذف هذه الميزة؟ لا يمكن التراجع عن هذا الإجراء."
                : "Are you sure you want to delete this feature? This action cannot be undone."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingFeature(null)}
                disabled={isDeletingFeature}
                className="flex-1 px-4 py-2 text-sm font-semibold text-[rgb(60_28_84)] bg-[rgb(244_242_245)] rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={() => handleDeleteFeature(deletingFeature)}
                disabled={isDeletingFeature}
                className="flex-1 px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingFeature ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {lang === "ar" ? "جاري الحذف..." : "Deleting..."}
                  </>
                ) : lang === "ar" ? (
                  "حذف"
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
