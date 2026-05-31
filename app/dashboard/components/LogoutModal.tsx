"use client";

import { Loader2, LogOut, X } from "lucide-react";
import { useDashboard } from "../DashboardContext";

interface LogoutModalProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const translations = {
  title: { ar: "تسجيل الخروج", en: "Sign Out" },
  message: {
    ar: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
    en: "Are you sure you want to sign out?",
  },
  cancel: { ar: "إلغاء", en: "Cancel" },
  confirm: { ar: "تسجيل الخروج", en: "Sign Out" },
};

export default function LogoutModal({
  open,
  loading,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  const { lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      <div
        className="fixed inset-0 flex items-center justify-center z-[101] p-4"
        dir={dir}
      >
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          <div className="p-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>

            <h3 className="mt-4 text-center text-lg font-bold text-[rgb(60_28_84)]">
              {translations.title[lang]}
            </h3>

            <p className="mt-2 text-center text-sm text-[rgb(60_28_84)]/60">
              {translations.message[lang]}
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 h-8 rounded-lg border border-[rgb(244_242_245)] text-[rgb(60_28_84)] font-medium hover:bg-[rgb(244_242_245)] transition"
              >
                {translations.cancel[lang]}
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 h-8 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    {translations.confirm[lang]}
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 end-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
