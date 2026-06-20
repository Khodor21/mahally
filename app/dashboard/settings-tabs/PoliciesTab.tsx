import { ShieldCheck } from "lucide-react";

interface PoliciesTabProps {
  lang: string;
  dir: string;
  formData: any;
  setFormData: (data: any) => void;
  SaveButton: React.ComponentType;
}

export default function PoliciesTab({
  lang,
  dir,
  formData,
  setFormData,
  SaveButton,
}: PoliciesTabProps) {
  const policyFields = [
    {
      label: lang === "ar" ? "معلومات الشحن" : "Shipping Policy",
      key: "shipping_policy",
      placeholder:
        lang === "ar"
          ? "أدخل تفاصيل الشحن والمدة المتوقعة..."
          : "Enter shipping details and timeframe...",
    },
    {
      label: lang === "ar" ? "الاسترجاع والتبديل" : "Return & Exchange Policy",
      key: "return_policy",
      placeholder:
        lang === "ar"
          ? "شروط استرجاع أو استبدال المنتجات..."
          : "Conditions for returning products...",
    },
    {
      label: lang === "ar" ? "سياسات الخصوصية" : "Privacy Policy",
      key: "privacy_policy",
      placeholder:
        lang === "ar"
          ? "كيفية تعاملك مع بيانات العملاء..."
          : "How you handle customer data...",
    },
  ];

  return (
    <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
      <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
        <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          {lang === "ar" ? "الروابط والسياسات" : "Important Links & Policies"}
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {policyFields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-bold text-[rgb(60_28_84)] mb-2">
              {field.label}
            </label>
            <textarea
              value={formData[field.key]}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  [field.key]: e.target.value,
                }))
              }
              placeholder={field.placeholder}
              rows={4}
              className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-3 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all resize-y"
              dir={dir}
            />
          </div>
        ))}

        <SaveButton />
      </div>
    </div>
  );
}
