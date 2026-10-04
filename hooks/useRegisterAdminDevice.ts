"use client";

import { useEffect, useRef } from "react";
import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";

export function useRegisterAdminDevice() {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (registeredRef.current) return;
    registeredRef.current = true;

    (async () => {
      try {
        console.log("🚀 Admin device registration...");

        if (!("Notification" in window) || !("serviceWorker" in navigator)) {
          console.error("❌ No browser support");
          return;
        }

        // Register SW
        const reg = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          { scope: "/", updateViaCache: "none" },
        );
        console.log("✅ SW registered");

        // Permission
        let permission = Notification.permission;
        if (permission !== "granted") {
          permission = await Notification.requestPermission();
          if (permission !== "granted") {
            console.error("❌ Permission denied");
            return;
          }
        }

        // Firebase
        const messaging = await getFirebaseMessaging();
        if (!messaging) {
          console.error("❌ Firebase not initialized");
          return;
        }

        // Token
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error("❌ VAPID key missing");
          return;
        }

        const token = await getToken(messaging, { vapidKey });
        console.log("✅ Token:", token?.substring(0, 50));

        if (!token) return;

        // Register
        const res = await fetch("/api/admin/register-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fcmToken: token,
            deviceName: navigator.userAgent.split(" ").pop(),
          }),
        });

        const data = await res.json();
        console.log("✅ Admin device registered:", data);
      } catch (err) {
        console.error("❌ Admin registration failed:", err);
      }
    })();
  }, []);
}
