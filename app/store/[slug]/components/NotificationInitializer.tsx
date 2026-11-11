"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";

type IOSState = "none" | "show-install" | "show-notify";

export default function NotificationInitializer() {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [iosState, setIosState] = useState<IOSState>("none");

  const isIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const isInStandaloneMode = () =>
    "standalone" in navigator && (navigator as any).standalone === true;

  useEffect(() => {
    const docLang = document.documentElement.lang as "en" | "ar";
    if (docLang) setLang(docLang);

    const checkAuth = async () => {
      try {
        // إذا عنده push مسجل بأي account
        const alreadyRegistered = Object.keys(localStorage).some((key) =>
          key.startsWith("push_reg_"),
        );
        if (alreadyRegistered) return;

        // إذا تحققنا بآخر 24 ساعة وكان غير مسجل
        const lastCheck = localStorage.getItem("customer_auth_last_check");
        if (lastCheck) {
          const elapsed = Date.now() - parseInt(lastCheck);
          if (elapsed < 24 * 60 * 60 * 1000) return;
        }

        const res = await fetch("/api/customer/auth-status");

        if (!res.ok) {
          localStorage.setItem(
            "customer_auth_last_check",
            Date.now().toString(),
          );
          return;
        }

        const data = await res.json();

        if (!data.authenticated || !data.customerId) {
          localStorage.setItem(
            "customer_auth_last_check",
            Date.now().toString(),
          );
          return;
        }

        // logged in — امسح الـ timestamp لأنو المستخدم مسجل
        localStorage.removeItem("customer_auth_last_check");

        const isRegistered = localStorage.getItem(
          `push_reg_${data.customerId}`,
        );
        if (isRegistered) return;

        setCustomerId(data.customerId);

        if (isIOS()) {
          if (!isInStandaloneMode()) {
            setTimeout(() => setIosState("show-install"), 1500);
          } else {
            setTimeout(() => setIosState("show-notify"), 1500);
          }
        } else {
          setTimeout(() => setShowBanner(true), 1500);
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkAuth();
  }, []);

  const registerPush = async () => {
    setShowBanner(false);
    setIosState("none");

    try {
      if (!("Notification" in window) || !("serviceWorker" in navigator))
        return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const reg = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/", updateViaCache: "none" },
      );
      await reg.update();

      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        console.error("❌ Firebase Messaging not supported on this browser");
        return;
      }

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
    setIosState("none");
    if (customerId) localStorage.setItem(`push_reg_${customerId}`, "true");
  };

  const text = {
    en: {
      notifyMsg: "Enable notifications to get order updates & offers",
      enable: "Enable",
      dismiss: "No thanks",
      installTitle: "Add to Home Screen",
      installMsg:
        'To enable notifications, tap the Share button below, then select "Add to Home Screen"',
      installDismiss: "Maybe Later",
      installIcon: "⬆️",
    },
    ar: {
      notifyMsg: "فعّل الإشعارات لتصلك تحديثات الطلبات والعروض",
      enable: "تفعيل",
      dismiss: "لا شكراً",
      installTitle: "أضف للشاشة الرئيسية",
      installMsg:
        'لتفعيل الإشعارات، اضغط على زر المشاركة ⬆️ ثم اختر "إضافة إلى الشاشة الرئيسية"',
      installDismiss: "ربما لاحقاً",
      installIcon: "⬆️",
    },
  }[lang];

  const Modal = ({ children }: { children: React.ReactNode }) => (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={dismiss}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          {children}
        </div>
      </div>
    </>
  );

  if (iosState === "show-install") {
    return (
      <Modal>
        <div className="text-center text-3xl">📲</div>
        <h3 className="text-base font-bold text-gray-900 text-center">
          {text.installTitle}
        </h3>
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          {text.installMsg}
        </p>
        <div className="text-center text-2xl animate-bounce">
          {text.installIcon}
        </div>
        <button
          onClick={dismiss}
          className="w-full text-sm text-gray-500 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50"
        >
          {text.installDismiss}
        </button>
      </Modal>
    );
  }

  if (iosState === "show-notify") {
    return (
      <Modal>
        <p className="text-sm text-gray-700 text-center">{text.notifyMsg}</p>
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
      </Modal>
    );
  }

  if (!showBanner) return null;
  return (
    <Modal>
      <p className="text-sm text-gray-700 text-center">{text.notifyMsg}</p>
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
    </Modal>
  );
}
