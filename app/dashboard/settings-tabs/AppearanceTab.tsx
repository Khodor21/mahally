import { Plus, ImageIcon, ChevronDown, Loader2 } from "lucide-react";
import { HeroBanner, Feature } from "@/types/api";
import Testimonials from "./Testimonials";
import FeatureForm from "./FeatureForm";

interface AppearanceTabProps {
  lang: string;
  dir: string;
  appearanceActive:
    | "promo"
    | "color"
    | "language"
    | "sections"
    | "banners"
    | "testimonials";
  setAppearanceActive: (
    section:
      | "promo"
      | "color"
      | "language"
      | "sections"
      | "banners"
      | "testimonials",
  ) => void;
  appearanceSections: Array<{
    id:
      | "promo"
      | "color"
      | "language"
      | "sections"
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
            {!isAddingFeature && (
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
    </div>
  );
}
