import {
  Plus,
  ImageIcon,
  ChevronDown,
  Loader2,
  Trash2,
  Edit2,
} from "lucide-react";
import { HeroBanner, Feature } from "@/types/api";
import Testimonials from "./Testimonials";
import FeatureForm from "./FeatureForm";
import React from "react";
interface AppearanceTabProps {
  lang: string;
  dir: string;
  appearanceActive:
    | "promo"
    | "color"
    | "language"
    | "sections"
    | "features"
    | "banners"
    | "testimonials";
  setAppearanceActive: (
    section:
      | "promo"
      | "color"
      | "language"
      | "sections"
      | "features"
      | "banners"
      | "testimonials",
  ) => void;
  appearanceSections: Array<{
    id:
      | "promo"
      | "color"
      | "language"
      | "sections"
      | "features"
      | "banners"
      | "testimonials";
    label: string;
  }>;
  formData: any;
  setFormData: (data: any) => void;
  isAddingBanner: boolean;
  setIsAddingBanner: (value: boolean) => void;
  newBanner: Partial<HeroBanner>;
  setNewBanner: (banner: Partial<HeroBanner>) => void;
  banners: HeroBanner[];
  expandedBanner: string | null;
  setExpandedBanner: (id: string | null) => void;
  isUploadingBanner: boolean;
  setIsUploadingBanner: (value: boolean) => void;
  isAddingFeature: boolean;
  setIsAddingFeature: (value: boolean) => void;
  features: Feature[];
  expandedSection: number | null;
  setExpandedSection: (id: number | null) => void;
  storeId: string;
  refetchFeatures: () => void;
  refetchBanners: () => void;
  handleImageUpload: (file: File) => Promise<string | null>;
  handleSaveBanner: () => Promise<void>;
  isSavingBanner: boolean;
  SaveButton: React.ComponentType;
  showToast: (message: string, type: "success" | "error") => void;
  setBannerConfirm: (state: any) => void;
}

export default function AppearanceTab({
  lang,
  dir,
  appearanceActive,
  setAppearanceActive,
  appearanceSections,
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
}: AppearanceTabProps) {
  const [editingFeature, setEditingFeature] = React.useState<Feature | null>(
    null,
  );
  const [deletingFeature, setDeletingFeature] = React.useState<
    string | number | null
  >(null);
  const [isDeletingFeature, setIsDeletingFeature] = React.useState(false);

  const handleDeleteFeature = async (featureId: string | number) => {
    setIsDeletingFeature(true);
    try {
      const response = await fetch(`/api/features/${featureId}`, {
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
    <div className="space-y-6">
      {/* Appearance Sub-tabs */}
      <div className="flex gap-2 bg-[rgb(244_242_245)] rounded-sm p-2 overflow-x-auto no-scrollbar">
        {appearanceSections.map((section) => (
          <button
            key={section.id}
            onClick={() => setAppearanceActive(section.id)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              appearanceActive === section.id
                ? "bg-white text-[rgb(60_28_84)] shadow-sm"
                : "text-[rgb(60_28_84)]/50 hover:text-[rgb(60_28_84)]"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Promo Bar */}
      {appearanceActive === "promo" && (
        <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
            <h3 className="font-bold text-[rgb(60_28_84)]">
              {lang === "ar" ? "الشريط الإعلاني العلوي" : "Top Promo Bar"}
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                {lang === "ar" ? "نص الشريط الإعلاني" : "Promo Bar Text"}
              </label>
              <input
                type="text"
                value={formData.promo_text}
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
            </div>
            <SaveButton />
          </div>
        </div>
      )}

      {/* Colors */}
      {appearanceActive === "color" && (
        <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
            <h3 className="font-bold text-[rgb(60_28_84)]">
              {lang === "ar" ? "اللون الرئيسي" : "Primary Brand Color"}
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-3">
                {lang === "ar"
                  ? "اختر اللون الرئيسي للمتجر"
                  : "Choose your brand color"}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primary_color: e.target.value,
                    })
                  }
                  className="w-16 h-16 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primary_color: e.target.value,
                    })
                  }
                  className="flex-1 max-w-xs bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] uppercase"
                  dir="ltr"
                />
              </div>
            </div>
            <SaveButton />
          </div>
        </div>
      )}

      {/* Language */}
      {appearanceActive === "language" && (
        <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
            <h3 className="font-bold text-[rgb(60_28_84)]">
              {lang === "ar" ? "لغة المتجر" : "Store Language"}
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                {lang === "ar" ? "اختر لغة المتجر" : "Select store language"}
              </label>
              <select
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                dir={dir}
              >
                <option value="ar">
                  {lang === "ar" ? "العربية" : "Arabic"}
                </option>
                <option value="en">
                  {lang === "ar" ? "الإنجليزية" : "English"}
                </option>
              </select>
            </div>
            <SaveButton />
          </div>
        </div>
      )}

      {/* Sections (Features) */}
      {appearanceActive === "sections" && (
        <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)] flex justify-between items-center">
            <h3 className="font-bold text-[rgb(60_28_84)]">
              {lang === "ar" ? "أقسام الموقع" : "Site Sections"}
            </h3>
            {!isAddingFeature && !editingFeature && (
              <button
                onClick={() => setIsAddingFeature(true)}
                className="flex items-center gap-1 text-sm bg-[rgb(244_242_245)] hover:bg-[rgb(207_195_223)] text-[rgb(60_28_84)] px-3 py-1.5 rounded-lg transition-colors font-semibold"
              >
                <Plus className="w-4 h-4" />
                {lang === "ar" ? "إضافة قسم" : "Add Section"}
              </button>
            )}
          </div>

          <div className="p-6 space-y-4">
            {isAddingFeature && (
              <FeatureForm
                lang={lang}
                dir={dir}
                onCancel={() => setIsAddingFeature(false)}
                storeId={storeId}
                onSuccess={() => {
                  setIsAddingFeature(false);
                  refetchFeatures();
                  showToast(
                    lang === "ar"
                      ? "تم إضافة القسم بنجاح!"
                      : "Section added successfully!",
                    "success",
                  );
                }}
              />
            )}

            {editingFeature && (
              <FeatureForm
                lang={lang}
                dir={dir}
                initialData={editingFeature}
                onCancel={() => setEditingFeature(null)}
                storeId={storeId}
                featureId={editingFeature.id}
                onSuccess={() => {
                  setEditingFeature(null);
                  refetchFeatures();
                  showToast(
                    lang === "ar"
                      ? "تم تحديث القسم بنجاح!"
                      : "Section updated successfully!",
                    "success",
                  );
                }}
              />
            )}

            <div className="space-y-3">
              {features && features.length > 0 ? (
                features.map((feature) => (
                  <div
                    key={feature.id}
                    className="bg-[rgb(244_242_245)] rounded-sm p-4"
                  >
                    <button
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === feature.id
                            ? null
                            : (feature.id as any),
                        )
                      }
                      className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <div className="w-10 h-10 rounded-lg bg-[rgb(60_28_84)] text-white flex items-center justify-center text-sm font-semibold">
                          {feature.icon_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[rgb(60_28_84)]">
                            {feature.title}
                          </p>
                          <p className="text-xs text-[rgb(60_28_84)]/60">
                            {feature.description.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-[rgb(60_28_84)]/50 transition-transform ${
                          expandedSection === feature.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedSection === feature.id && (
                      <div className="mt-4 pt-4 border-t border-[rgb(207_195_223)] space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-1">
                            {lang === "ar" ? "العنوان" : "Title"}
                          </label>
                          <p className="text-sm text-[rgb(60_28_84)]">
                            {feature.title}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-1">
                            {lang === "ar" ? "الوصف" : "Description"}
                          </label>
                          <p className="text-sm text-[rgb(60_28_84)]">
                            {feature.description}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-1">
                            {lang === "ar" ? "الأيقونة" : "Icon"}
                          </label>
                          <p className="text-sm text-[rgb(60_28_84)]">
                            {feature.icon_name}
                          </p>
                        </div>

                        {/* Edit/Delete Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setEditingFeature(feature)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors text-xs font-semibold"
                          >
                            <Edit2 className="w-3 h-3" />
                            {lang === "ar" ? "تعديل" : "Edit"}
                          </button>
                          <button
                            onClick={() => setDeletingFeature(feature.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors text-xs font-semibold"
                          >
                            <Trash2 className="w-3 h-3" />
                            {lang === "ar" ? "حذف" : "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[rgb(60_28_84)]/50 text-center py-4">
                  {lang === "ar"
                    ? "لا توجد أقسام مضافة بعد."
                    : "No sections added yet."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      {appearanceActive === "features" && (
        <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)] flex justify-between items-center">
            <h3 className="font-bold text-[rgb(60_28_84)]">
              {lang === "ar" ? "المميزات" : "Features"}
            </h3>
            {!isAddingFeature && !editingFeature && (
              <button
                onClick={() => setIsAddingFeature(true)}
                className="flex items-center gap-1 text-sm bg-[rgb(244_242_245)] hover:bg-[rgb(207_195_223)] text-[rgb(60_28_84)] px-3 py-1.5 rounded-lg transition-colors font-semibold"
              >
                <Plus className="w-4 h-4" />
                {lang === "ar" ? "إضافة ميزة" : "Add Feature"}
              </button>
            )}
          </div>
          <div className="p-6 space-y-4">
            {isAddingFeature && (
              <FeatureForm
                lang={lang}
                dir={dir}
                onCancel={() => setIsAddingFeature(false)}
                storeId={storeId}
                onSuccess={() => {
                  setIsAddingFeature(false);
                  refetchFeatures();
                  showToast(
                    lang === "ar"
                      ? "تم إضافة الميزة بنجاح!"
                      : "Feature added successfully!",
                    "success",
                  );
                }}
              />
            )}

            {editingFeature && (
              <FeatureForm
                lang={lang}
                dir={dir}
                initialData={editingFeature}
                onCancel={() => setEditingFeature(null)}
                storeId={storeId}
                featureId={editingFeature.id}
                onSuccess={() => {
                  setEditingFeature(null);
                  refetchFeatures();
                  showToast(
                    lang === "ar"
                      ? "تم تحديث الميزة بنجاح!"
                      : "Feature updated successfully!",
                    "success",
                  );
                }}
              />
            )}

            <div className="space-y-3">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-[rgb(244_242_245)] rounded-sm p-4 flex items-start justify-between group hover:bg-[rgb(240_238_245)] transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[rgb(60_28_84)]">
                      {feature.title}
                    </p>
                    <p className="text-xs text-[rgb(60_28_84)]/60">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingFeature(feature)}
                      className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                      title={lang === "ar" ? "تعديل" : "Edit"}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingFeature(feature.id)}
                      className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                      title={lang === "ar" ? "حذف" : "Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Banners */}
      {appearanceActive === "banners" && (
        <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)] flex justify-between items-center">
            <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {lang === "ar" ? "لافتات العرض" : "Hero Banners"}
            </h3>
            {!isAddingBanner && (
              <button
                onClick={() => setIsAddingBanner(true)}
                className="flex items-center gap-1 text-sm bg-[rgb(244_242_245)] hover:bg-[rgb(207_195_223)] text-[rgb(60_28_84)] px-3 py-1.5 rounded-lg transition-colors font-semibold"
              >
                <Plus className="w-4 h-4" />
                {lang === "ar" ? "إضافة لافتة" : "Add Banner"}
              </button>
            )}
          </div>

          <div className="p-6">
            {isAddingBanner && (
              <div className="bg-[rgb(244_242_245)] rounded-sm p-5 mb-6 space-y-4">
                <h4 className="font-bold text-sm text-[rgb(60_28_84)] border-b border-[rgb(207_195_223)] pb-2">
                  {lang === "ar" ? "إضافة لافتة جديدة" : "Add New Banner"}
                </h4>

                <div className="w-full relative">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-[rgb(60_28_84)]/60">
                      {lang === "ar" ? "صورة اللافتة" : "Banner Image"}
                    </label>
                    {isUploadingBanner && (
                      <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {lang === "ar" ? "جاري الرفع..." : "Uploading..."}
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIsUploadingBanner(true);
                        const url = await handleImageUpload(file);
                        if (url) setNewBanner({ ...newBanner, image: url });
                        setIsUploadingBanner(false);
                      }
                    }}
                    className="w-full bg-white rounded-lg px-4 py-2 text-sm text-[rgb(60_28_84)] file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[rgb(60_28_84)] file:text-white hover:file:bg-[rgb(60_28_84)]/90 cursor-pointer"
                  />

                  {newBanner.image && (
                    <div className="mt-3 w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={newBanner.image}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAddingBanner(false)}
                    className="px-4 py-2 text-sm font-semibold text-[rgb(60_28_84)]/60 hover:bg-[rgb(207_195_223)] rounded-lg transition-colors"
                    disabled={isSavingBanner}
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </button>

                  <button
                    onClick={handleSaveBanner}
                    disabled={
                      isUploadingBanner || isSavingBanner || !newBanner.image
                    }
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-[rgb(60_28_84)] text-white rounded-lg disabled:opacity-50 transition-all hover:bg-[rgb(60_28_84)]/90"
                  >
                    {isSavingBanner ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {lang === "ar" ? "جاري النشر..." : "Publishing..."}
                      </>
                    ) : lang === "ar" ? (
                      "نشر اللافتة"
                    ) : (
                      "Save Banner"
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {!banners || banners.length === 0 ? (
                <p className="text-sm text-[rgb(60_28_84)]/50 text-center py-4">
                  {lang === "ar"
                    ? "لا توجد لافتات مضافة بعد."
                    : "No hero banners added yet."}
                </p>
              ) : (
                banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className="bg-[rgb(244_242_245)] rounded-sm p-3"
                  >
                    <button
                      onClick={() =>
                        setExpandedBanner(
                          expandedBanner === banner.id
                            ? null
                            : (banner.id as any),
                        )
                      }
                      className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-12 h-12 rounded-lg bg-cover bg-center border border-gray-200 flex-shrink-0"
                          style={{
                            backgroundImage: `url(${banner.image})`,
                          }}
                        />
                        <div className="text-left">
                          <p className="font-semibold text-sm text-[rgb(60_28_84)]">
                            {lang === "ar"
                              ? `لافتة ${index + 1}`
                              : `Banner ${index + 1}`}
                          </p>
                          <p
                            className={`text-xs ${
                              banner.active
                                ? "text-emerald-500"
                                : "text-red-400"
                            }`}
                          >
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
                        className={`w-4 h-4 text-[rgb(60_28_84)]/50 transition-transform ${
                          expandedBanner === banner.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedBanner === banner.id && (
                      <div className="mt-3 pt-3 border-t border-[rgb(207_195_223)] flex gap-2">
                        <button
                          onClick={() =>
                            setBannerConfirm({
                              isOpen: true,
                              action: "toggle",
                              banner,
                              loading: false,
                            })
                          }
                          className={`flex-1 px-3 py-2 rounded-lg transition-colors text-xs font-semibold ${
                            banner.active
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                          }`}
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
                          className="flex-1 px-3 py-2 bg-red-100 text-red-500 hover:bg-red-200 rounded-lg transition-colors text-xs font-semibold"
                        >
                          {lang === "ar" ? "حذف" : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Testimonials */}
      {appearanceActive === "testimonials" && (
        <div className="animate-fade-up">
          <Testimonials dir={dir} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFeature && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
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
