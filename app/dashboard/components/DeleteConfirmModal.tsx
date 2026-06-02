import { Trash2, X, AlertTriangle } from "lucide-react";
import type { Translations } from "../i18n";

interface Props {
  productTitle: string;
  tr: Translations;
  lang: "ar" | "en";
  dir: "ltr" | "rtl";
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  productTitle,
  tr,
  lang,
  dir,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const t = tr[lang];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir={dir}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[rgb(60_28_84)]/40 hover:text-[rgb(60_28_84)] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[rgb(60_28_84)]">
              {t.deleteTitle}
            </h2>

            <p className="text-sm text-[rgb(60_28_84)]/60 mt-1">
              {t.deleteConfirm}{" "}
              <span className="font-semibold text-[rgb(60_28_84)]">
                "{productTitle}"
              </span>
              ?
            </p>

            <p className="text-xs text-red-500 mt-2">{t.deleteNote}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-[rgb(207_195_223)] text-[rgb(60_28_84)] text-sm font-semibold hover:bg-[rgb(244_242_245)] transition-colors disabled:opacity-50"
          >
            {t.cancel}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {loading ? t.deleting : t.deleteBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
