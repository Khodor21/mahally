import { useState } from "react";
import { Loader2 } from "lucide-react";

interface FeatureFormProps {
  lang: string;
  dir: string;
  storeId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function FeatureForm({
  lang,
  dir,
  storeId,
  onCancel,
  onSuccess,
}: FeatureFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon_name: "Star",
  });
  const [isLoading, setIsLoading] = useState(false);

  const lucideIcons = [
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
  ];

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/features", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create feature");
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[rgb(207_195_223)] rounded-lg p-5 space-y-4">
      <h4 className="font-bold text-sm text-[rgb(60_28_84)]">
        {lang === "ar" ? "إضافة قسم جديد" : "Add New Section"}
      </h4>

      <div>
        <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
          {lang === "ar" ? "العنوان" : "Title"}
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={
            lang === "ar" ? "مثال: التوصيل السريع" : "Example: Fast Shipping"
          }
          className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2 text-sm outline-none border border-transparent focus:border-[rgb(207_195_223)]"
          dir={dir}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
          {lang === "ar" ? "الوصف" : "Description"}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder={
            lang === "ar"
              ? "اشرح الميزة بشكل مختصر..."
              : "Describe the feature briefly..."
          }
          rows={3}
          className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2 text-sm outline-none border border-transparent focus:border-[rgb(207_195_223)] resize-none"
          dir={dir}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
          {lang === "ar" ? "الأيقونة" : "Icon"}
        </label>
        <select
          value={formData.icon_name}
          onChange={(e) =>
            setFormData({ ...formData, icon_name: e.target.value })
          }
          className="w-full bg-[rgb(244_242_245)] rounded-sm px-4 py-2 text-sm outline-none border border-transparent focus:border-[rgb(207_195_223)]"
          dir={dir}
        >
          {lucideIcons.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 text-sm font-semibold text-[rgb(60_28_84)] bg-[rgb(244_242_245)] rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {lang === "ar" ? "إلغاء" : "Cancel"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            isLoading || !formData.title.trim() || !formData.description.trim()
          }
          className="flex-1 px-4 py-2 text-sm font-semibold bg-[rgb(60_28_84)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {lang === "ar" ? "جاري الحفظ..." : "Saving..."}
            </>
          ) : lang === "ar" ? (
            "إضافة"
          ) : (
            "Add"
          )}
        </button>
      </div>
    </div>
  );
}
