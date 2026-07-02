// hooks/usePushNotifications.ts

"use client";

import { useEffect, useRef } from "react";
import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";

// Track registration per customer to prevent re-registration on refresh
function isRegistrationCached(customerId: string): boolean {
  const cached = localStorage.getItem(`push_reg_${customerId}`);
  return cached === "true";
}

function markRegistrationCached(customerId: string): void {
  localStorage.setItem(`push_reg_${customerId}`, "true");
}

function clearRegistrationCache(customerId: string): void {
  localStorage.removeItem(`push_reg_${customerId}`);
}

export function usePushNotifications(
  enabled: boolean = true,
  customerId?: string,
) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!enabled || !customerId) {
      if (!enabled) {
      } else {
        console.log("⚠️ usePushNotifications missing customerId");
      }
      return;
    }

    // Skip if already registered in this session
    if (registeredRef.current) {
      console.log("✅ Already registered this session, skipping");
      return;
    }

    registeredRef.current = true;

    const register = async () => {
      try {
        console.log("🚀 Starting push notification registration...");

        // 1. Check browser support
        if (!("Notification" in window)) {
          console.error("❌ Notifications not supported");
          return;
        }

        if (!("serviceWorker" in navigator)) {
          console.error("❌ Service Worker not supported");
          return;
        }

        // 2. Register service worker
        console.log("📝 Registering Service Worker...");
        try {
          const reg = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
            { scope: "/" },
          );
          console.log("✅ Service Worker registered:", reg);
        } catch (err) {
          console.error("❌ Service Worker registration failed:", err);
          return;
        }

        // 3. Check notification permission
        const permission = Notification.permission;
        console.log("🔔 Notification permission:", permission);

        if (permission !== "granted") {
          console.log("⚠️ Permission not granted, requesting...");
          const newPermission = await Notification.requestPermission();
          console.log("🔔 New permission result:", newPermission);
          if (newPermission !== "granted") {
            console.error("❌ Permission denied by user");
            return;
          }
        }

        // 4. Get Firebase messaging instance
        console.log("🔥 Initializing Firebase Messaging...");
        const messaging = await getFirebaseMessaging();
        if (!messaging) {
          console.error("❌ Firebase messaging not initialized");
          return;
        }
        console.log("✅ Firebase Messaging initialized");

        // 5. Get FCM token
        console.log("🎫 Getting FCM token...");
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        console.log("🔑 VAPID Key length:", vapidKey?.length);
        console.log(
          "🔑 VAPID Key (first 30 chars):",
          vapidKey?.substring(0, 30),
        );

        if (!vapidKey) {
          console.error("❌ VAPID key missing in environment variables");
          return;
        }

        const token = await getToken(messaging, { vapidKey });
        console.log("🎫 Generated token:", token);

        if (!token) {
          console.error("❌ No token generated");
          return;
        }

        // 6. Register token with backend
        console.log("📤 Sending token to backend...");
        const response = await fetch("/api/notifications/register-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        console.log("📊 Response status:", response.status);
        const data = await response.json();
        console.log("📊 Response data:", data);

        if (data.success) {
          console.log("✅✅✅ TOKEN REGISTERED SUCCESSFULLY!");
          markRegistrationCached(customerId);
        } else {
          console.error("❌ Token registration failed:", data.message);
          // Clear cache so we retry next time
          clearRegistrationCache(customerId);
        }
      } catch (error) {
        console.error("❌❌❌ ERROR in push notification flow:", error);
        // Clear cache so we retry next time
        clearRegistrationCache(customerId);
      }
    };

    register();
  }, [enabled, customerId]);
}
