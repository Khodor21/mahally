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

        if (data.authenticated && data.customerId) {
          setCustomerId(data.customerId);
          const isRegistered = localStorage.getItem(
            `push_reg_${data.customerId}`,
          );
          if (!isRegistered) {
            setTimeout(() => setShowBanner(true), 1500);
          }
        }
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

      // iOS requires permission request from direct user gesture — this click IS the gesture
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

      if (response.ok) {
        if (customerId) localStorage.setItem(`push_reg_${customerId}`, "true");
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

  const text = {
    en: {
      msg: "Enable notifications to get order updates & offers",
      enable: "Enable",
      dismiss: "No thanks",
    },
    ar: {
      msg: "فعّل الإشعارات لتصلك تحديثات الطلبات والعروض",
      enable: "تفعيل",
      dismiss: "لا شكراً",
    },
  }[lang];

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center gap-3"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <p className="text-sm text-gray-700 flex-1">{text.msg}</p>
      <button
        onClick={dismiss}
        className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
      >
        {text.dismiss}
      </button>
      <button
        onClick={registerPush}
        className="text-xs font-semibold text-white bg-brand-primary px-3 py-1.5 rounded-lg shrink-0"
      >
        {text.enable}
      </button>
    </div>
  );
}
