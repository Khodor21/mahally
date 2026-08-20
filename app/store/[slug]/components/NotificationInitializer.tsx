"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";

export default function NotificationInitializer() {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");

  useEffect(() => {
    const docLang = document.documentElement.lang as "en" | "ar";
    if (docLang) setLang(docLang);

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/customer/auth-status");
        if (!res.ok) return;
        const data = await res.json();

        // ✅ فقط للمستخدمين المسجلين — مش guests
        if (!data.authenticated || !data.customerId) return;

        const isRegistered = localStorage.getItem(
          `push_reg_${data.customerId}`,
        );
        if (isRegistered) return;

        setCustomerId(data.customerId);
        setTimeout(() => setShowBanner(true), 1500);
      } catch (e) {
        console.error(e);
      }
    };

    checkAuth();
  }, []);

  const registerPush = async () => {
    setShowBanner(false);

    try {
      if (!("Notification" in window) || !("serviceWorker" in navigator))
        return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const reg = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
          scope: "/",
          updateViaCache: "none",
        },
      );
      await reg.update();

      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) return;

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: reg,
      });
      if (!token) return;

      const response = await fetch("/api/notifications/register-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok && customerId) {
        localStorage.setItem(`push_reg_${customerId}`, "true");
      }
    } catch (err) {
      console.error("Push registration failed:", err);
    }
  };

  const dismiss = () => {
    setShowBanner(false);
    if (customerId) localStorage.setItem(`push_reg_${customerId}`, "true");
  };

  if (!showBanner) return null;

  const text =
    lang === "ar"
      ? {
          msg: "فعّل الإشعارات لتصلك تحديثات الطلبات والعروض",
          enable: "تفعيل",
          dismiss: "لا شكراً",
        }
      : {
          msg: "Enable notifications to get order updates & offers",
          enable: "Enable",
          dismiss: "No thanks",
        };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={dismiss}
      />

      {/* ✅ Center modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <p className="text-sm text-gray-700 text-center">{text.msg}</p>
          <div className="flex gap-3">
            <button
              onClick={dismiss}
              className="flex-1 text-sm text-gray-500 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50"
            >
              {text.dismiss}
            </button>
            <button
              onClick={registerPush}
              className="flex-1 text-sm font-semibold text-white bg-brand-primary rounded-xl py-2.5 hover:opacity-90"
            >
              {text.enable}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
