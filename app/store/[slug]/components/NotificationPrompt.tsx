// app/store/[slug]/components/NotificationPrompt.tsx

"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";

type Props = {
  onClose: () => void;
};

export default function NotificationPrompt({ onClose }: Props) {
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

  return (
    <>
      {/* Backdrop - z-40 */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
        onClick={handleDismiss}
      />

      {/* Notification Card - z-50 (ON TOP) */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-2xl border border-brand-light p-6 animate-in zoom-in-95 duration-300 pointer-events-auto">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 text-brand-dark/40 hover:text-brand-dark transition-colors hover:bg-brand-light rounded-full"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 mb-4">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold text-brand-dark mb-2">
            Stay Updated
          </h3>
          <p className="text-sm text-brand-dark/60 mb-6 leading-6">
            Get instant notifications about exclusive offers, order updates, and
            special deals.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-3 rounded-xl border border-brand-light text-brand-dark font-semibold text-sm hover:bg-brand-light transition-colors active:scale-95"
            >
              Maybe Later
            </button>
            <button
              onClick={handleEnable}
              className="flex-1 px-4 py-3 rounded-xl bg-brand-dark text-white font-semibold text-sm hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              Enable
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
