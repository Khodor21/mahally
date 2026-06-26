import { Store, Loader2 } from "lucide-react";
import { StoreData } from "@/types/api";
import { ComponentType } from "react";
import { LucideProps } from "lucide-react";

interface StoreTabProps {
  lang: string;
  dir: string;
  tr: any;
  formData: any;
  setFormData: (data: any) => void;
  store: StoreData | null;
  isUploadingLogo: boolean;
  setIsUploadingLogo: (value: boolean) => void;
  handleImageUpload: (file: File) => Promise<string | null>;
  socialMediaFields: Array<{
    label: string;
    key: string;
    icon: ComponentType<LucideProps>;
  }>;
  createdDate: string;
  SaveButton: React.ComponentType;
}

export default function StoreTab({
  lang,
  dir,
  tr,
  formData,
  setFormData,
  store,
  isUploadingLogo,
  setIsUploadingLogo,
  handleImageUpload,
  socialMediaFields,
  createdDate,
  SaveButton,
}: StoreTabProps) {
  return (
    <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
      <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
        <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
          <Store className="w-5 h-5" />
          {tr.storeSettings}
        </h3>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { label: tr.storeName, key: "store_name", type: "text" },
            { label: tr.location, key: "location", type: "text" },
            { label: tr.phone, key: "phone", type: "tel" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                value={formData[field.key]}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                dir={dir}
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
              {lang === "ar" ? "شعار المتجر (Logo)" : "Store Logo"}
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setIsUploadingLogo(true);
                  const url = await handleImageUpload(file);
                  if (url)
                    setFormData((prev: any) => ({
                      ...prev,
                      logo_url: url,
                    }));
                  setIsUploadingLogo(false);
                }
              }}
              className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2 text-sm text-[rgb(60_28_84)] file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[rgb(60_28_84)] file:text-white hover:file:bg-[rgb(60_28_84)]/90 outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all cursor-pointer"
            />

            {isUploadingLogo && (
              <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {lang === "ar" ? "جاري الرفع..." : "Uploading..."}
              </div>
            )}

            {formData.logo_url && (
              <div className="mt-3 p-2 bg-[rgb(244_242_245)] rounded-sm inline-block">
                <img
                  src={formData.logo_url}
                  alt="Logo"
                  className="h-10 object-contain"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
              {tr.storeType}
            </label>

            <select
              value={formData.store_type}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  store_type: e.target.value,
                }))
              }
              className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
              dir={dir}
            >
              <option value="">Select Type</option>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
              <option value="service">Service</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-1 gap-5 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
              {lang === "ar" ? "وصف المتجر" : "Store Description"}
            </label>

            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={
                lang === "ar"
                  ? "اكتب وصفاً مختصراً عن متجرك..."
                  : "Write a brief description of your store..."
              }
              className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all resize-none"
              dir={dir}
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-[rgb(244_242_245)]">
          <h3 className="text-sm font-bold text-[rgb(60_28_84)]">
            {lang === "ar" ? "وسائل التواصل الاجتماعي" : "Social Media"}
          </h3>

          <div className="grid md:grid-cols-2 gap-5">
            {socialMediaFields.map((social) => {
              const Icon = social.icon;

              return (
                <div key={social.key}>
                  <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {social.label}
                  </label>

                  <input
                    type="text"
                    value={formData[social.key]}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        [social.key]: e.target.value,
                      }))
                    }
                    placeholder={
                      social.key === "whatsapp_number"
                        ? lang === "ar"
                          ? "رقم الهاتف..."
                          : "Phone number..."
                        : "https://..."
                    }
                    className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                    dir="ltr"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-[rgb(244_242_245)] grid md:grid-cols-2 gap-4">
          <div className="bg-[rgb(244_242_245)] rounded-sm px-4 py-3">
            <p className="text-xs text-[rgb(60_28_84)]/40 mb-1">{tr.storeId}</p>
            <p className="text-sm font-bold text-[rgb(60_28_84)] font-mono">
              #{store?.id?.slice(0, 8).toUpperCase() ?? "N/A"}
            </p>
          </div>

          <div className="bg-[rgb(244_242_245)] rounded-sm px-4 py-3">
            <p className="text-xs text-[rgb(60_28_84)]/40 mb-1">
              {tr.memberSince}
            </p>
            <p className="text-sm font-bold text-[rgb(60_28_84)]">
              {createdDate}
            </p>
          </div>
        </div>

        <SaveButton />
      </div>
    </div>
  );
}
