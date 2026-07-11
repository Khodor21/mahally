import { Store, Check, CreditCard } from "lucide-react";
import { ComponentType } from "react";
import { LucideProps } from "lucide-react";
import { StoreData } from "../types"; // Use ONE import path

interface StoreTabProps {
  lang: string;
  dir: string;
  tr: any;
  formData: any;
  setFormData: (data: any) => void;
  store: StoreData | undefined; // Changed from null to undefined to match useStore return type
  socialMediaFields: Array<{
    label: string;
    key: string;
    icon: ComponentType<LucideProps>;
  }>;
  createdDate: string;
  SaveButton: React.ComponentType;
}

const PAYMENT_OPTIONS = [
  {
    id: "cash_on_delivery",
    label: { ar: "دفع عند الاستلام", en: "Cash on Delivery" },
  },
  { id: "whish_money", label: { ar: "ويش موني", en: "Whish Money" } },
  { id: "bob_finance", label: { ar: "بوب فينانس", en: "Bob Finance" } },
];

export default function StoreTab({
  lang,
  dir,
  tr,
  formData,
  setFormData,
  store,
  socialMediaFields,
  createdDate,
  SaveButton,
}: StoreTabProps) {
  // FIX: Single declaration of currentMethods
  const currentMethods: string[] = formData.payment_methods
    ? JSON.parse(formData.payment_methods)
    : [];

  const togglePaymentMethod = (methodId: string) => {
    // FIX: Use the outer currentMethods, don't redeclare
    const updated = currentMethods.includes(methodId)
      ? currentMethods.filter((m: string) => m !== methodId)
      : [...currentMethods, methodId];

    setFormData((prev: any) => ({
      ...prev,
      payment_methods: JSON.stringify(updated),
    }));
  };

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
            <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-3">
              {lang === "ar"
                ? "طرق الدفع المتاحة"
                : "Available Payment Methods"}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PAYMENT_OPTIONS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => togglePaymentMethod(method.id)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-sm border text-sm transition-all ${
                    currentMethods.includes(method.id)
                      ? "border-[rgb(60_28_84)] bg-[rgb(60_28_84)] text-white"
                      : "border-[rgb(244_242_245)] bg-[rgb(244_242_245)] text-[rgb(60_28_84)] hover:border-[rgb(207_195_223)]"
                  }`}
                >
                  {method.label[lang as "ar" | "en"]}
                  {currentMethods.includes(method.id) && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
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
