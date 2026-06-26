import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface FeatureFormProps {
  lang: string;
  dir: string;
  storeId: string;
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: any;
  featureId?: string | number;
}

const LUCIDE_ICONS = [
  "Star",
  "Heart",
  "Shield",
  "Zap",
  "Gift",
  "Truck",
  "Lock",
  "Clock",
  "Award",
  "Check",
  "Smile",
  "Leaf",
  "Sparkles",
  "Rocket",
  "Target",
  "Gem",
  "Book",
  "Shirt",
  "Coffee",
  "Camera",
  "Smartphone",
  "Headphones",
];

const LABELS = {
  ar: {
    title: "العنوان",
    description: "الوصف",
    icon: "الأيقونة",
    add: "إضافة قسم جديد",
    edit: "تعديل القسم",
    cancel: "إلغاء",
    add_btn: "إضافة",
    update_btn: "تحديث",
    saving: "جاري الحفظ...",
    title_placeholder: "مثال: التوصيل السريع",
    desc_placeholder: "اشرح الميزة بشكل مختصر...",
    errors: {
      title_required: "العنوان مطلوب",
      desc_required: "الوصف مطلوب",
      title_max: "العنوان لا يجب أن يزيد عن 255 حرف",
      desc_max: "الوصف لا يجب أن يزيد عن 500 حرف",
    },
  },
  en: {
    title: "Title",
    description: "Description",
    icon: "Icon",
    add: "Add New Section",
    edit: "Edit Section",
    cancel: "Cancel",
    add_btn: "Add",
    update_btn: "Update",
    saving: "Saving...",
    title_placeholder: "Example: Fast Shipping",
    desc_placeholder: "Describe the feature briefly...",
    errors: {
      title_required: "Title is required",
      desc_required: "Description is required",
      title_max: "Title must not exceed 255 characters",
      desc_max: "Description must not exceed 500 characters",
    },
  },
};

export default function FeatureForm({
  lang,
  dir,
  storeId,
  onCancel,
  onSuccess,
  initialData,
  featureId,
}: FeatureFormProps) {
  const t = LABELS[lang as "ar" | "en"];
  const isEditing = !!featureId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon_name: "Star",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        icon_name: initialData.icon_name,
      });
      setErrors({});
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t.errors.title_required;
    } else if (formData.title.length > 255) {
      newErrors.title = t.errors.title_max;
    }

    if (!formData.description.trim()) {
      newErrors.description = t.errors.desc_required;
    } else if (formData.description.length > 500) {
      newErrors.description = t.errors.desc_max;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const method = featureId ? "PATCH" : "POST";
      const url = "/api/features";

      const payload = featureId ? { ...formData, id: featureId } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          featureId ? "Failed to update feature" : "Failed to create feature",
        );
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      setErrors({
        submit: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[rgb(207_195_223)] rounded-lg p-5 space-y-4 animate-fade-down">
      <h3 className="font-bold text-sm text-[rgb(60_28_84)]">
        {isEditing ? t.edit : t.add}
      </h3>

      {/* Title Field */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50">
            {t.title}
          </label>
          <span className="text-xs text-[rgb(60_28_84)]/30">
            {formData.title.length}/255
          </span>
        </div>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => {
            setFormData({ ...formData, title: e.target.value });
            if (errors.title) setErrors({ ...errors, title: "" });
          }}
          placeholder={t.title_placeholder}
          className={`w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm outline-none border transition-colors ${
            errors.title
              ? "border-red-500 focus:border-red-500"
              : "border-transparent focus:border-[rgb(207_195_223)]"
          }`}
          dir={dir}
          maxLength={255}
        />
        {errors.title && (
          <div className="flex items-center gap-1 mt-2 text-red-500">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs">{errors.title}</span>
          </div>
        )}
      </div>

      {/* Description Field */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50">
            {t.description}
          </label>
          <span className="text-xs text-[rgb(60_28_84)]/30">
            {formData.description.length}/500
          </span>
        </div>
        <textarea
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
            if (errors.description) setErrors({ ...errors, description: "" });
          }}
          placeholder={t.desc_placeholder}
          rows={3}
          className={`w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2.5 text-sm outline-none border transition-colors resize-none ${
            errors.description
              ? "border-red-500 focus:border-red-500"
              : "border-transparent focus:border-[rgb(207_195_223)]"
          }`}
          dir={dir}
          maxLength={500}
        />
        {errors.description && (
          <div className="flex items-center gap-1 mt-2 text-red-500">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs">{errors.description}</span>
          </div>
        )}
      </div>

      {/* Icon Field */}
      <div>
        <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
          {t.icon}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {LUCIDE_ICONS.map((iconName) => {
            const IconComponent = (LucideIcons as any)[iconName];
            return (
              <button
                key={iconName}
                onClick={() =>
                  setFormData({ ...formData, icon_name: iconName })
                }
                className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center ${
                  formData.icon_name === iconName
                    ? "border-[rgb(60_28_84)] bg-[rgb(60_28_84)]/5"
                    : "border-[rgb(207_195_223)] hover:border-[rgb(60_28_84)]/30"
                }`}
                type="button"
              >
                {IconComponent ? (
                  <IconComponent className="w-5 h-5 text-[rgb(60_28_84)]" />
                ) : (
                  iconName[0]
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs">{errors.submit}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-[rgb(60_28_84)] bg-[rgb(244_242_245)] rounded-lg hover:bg-[rgb(207_195_223)] transition-colors disabled:opacity-50"
        >
          {t.cancel}
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            !formData.title.trim() ||
            !formData.description.trim() ||
            Object.keys(errors).length > 0
          }
          className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[rgb(60_28_84)] text-white rounded-lg hover:bg-[rgb(60_28_84)]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.saving}
            </>
          ) : isEditing ? (
            t.update_btn
          ) : (
            t.add_btn
          )}
        </button>
      </div>
    </div>
  );
}
