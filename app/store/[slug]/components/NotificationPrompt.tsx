// app/store/[slug]/components/NotificationPrompt.tsx

"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";

type Props = {
  onClose: () => void;
  lang?: "en" | "ar";
};

export default function NotificationPrompt({ onClose, lang = "en" }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        console.log("✅ Notification permission granted");
      } else if (permission === "denied") {
        console.log("❌ Notification permission denied");
      }

      setIsVisible(false);
      onClose();
    } catch (error) {
      console.error("❌ Permission error:", error);
      setIsVisible(false);
      onClose();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onClose();
  };

  const dir = lang === "ar" ? "rtl" : "ltr";

  const content = {
    en: {
      title: "Stay Updated",
      description:
        "Get instant notifications about exclusive offers, order updates, and special deals.",
      cancel: "Maybe Later",
      enable: "Enable",
    },
    ar: {
      title: "ابق على اطلاع",
      description:
        "احصل على إشعارات فورية حول العروض الحصرية، تحديثات الطلبات، والصفقات الخاصة.",
      cancel: "ربما لاحقاً",
      enable: "تفعيل",
    },
  };

  const t = content[lang];

  return (
    <>
      {/* Backdrop - z-40 */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Notification Card - z-50 (ON TOP) */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 pointer-events-none"
        dir={dir}
      >
        <div className="max-w-[340px] w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-300 ease-out pointer-events-auto relative overflow-hidden">
          
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 end-4 p-1.5 text-gray-400 hover:text-gray-700 transition-colors hover:bg-gray-100 rounded-full"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-primary/10 mb-5">
            <Bell className="w-6 h-6 text-brand-primary" />
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-900 mb-2.5 tracking-tight">
            {t.title}
          </h3>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            {t.description}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:text-gray-900 transition-colors active:scale-95 flex items-center justify-center"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleEnable}
              className="flex-1 px-4 py-3 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:opacity-90 transition-all shadow-md shadow-brand-primary/25 active:scale-95 flex items-center justify-center"
            >
              {t.enable}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}