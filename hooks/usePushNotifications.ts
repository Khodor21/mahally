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
          // Use updateViaCache to avoid cached SW on mobile HTTPS
          const reg = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
            {
              scope: "/",
              updateViaCache: "none", // Critical for mobile HTTPS updates
            },
          );
          console.log("✅ Service Worker registered:", reg);

          // Force update check (important for mobile)
          reg
            .update()
            .catch((err) => console.warn("SW update check failed:", err));
        } catch (err) {
          console.error("❌ Service Worker registration failed:", err);
          console.error("📍 Stack:", (err as Error).stack);
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

        if (!vapidKey) {
          console.error("❌ VAPID key missing in environment variables");
          console.error("⚠️ Add NEXT_PUBLIC_FIREBASE_VAPID_KEY to .env.local");
          return;
        }

        console.log("🔑 VAPID Key length:", vapidKey.length);
        console.log(
          "🔑 VAPID Key (first 30 chars):",
          vapidKey.substring(0, 30),
        );

        // Validate VAPID key format
        if (vapidKey.length < 100) {
          console.warn(
            "⚠️ VAPID key seems short. Expected ~152 chars, got:",
            vapidKey.length,
          );
        }

        let token;
        try {
          token = await getToken(messaging, { vapidKey });
          console.log("🎫 Generated token:", token);
        } catch (tokenError) {
          console.error("❌ Token generation failed:", tokenError);
          const err = tokenError as Error;

          // Common mobile HTTPS errors
          if (
            err.message?.includes(
              "messaging/failed-service-worker-registration",
            )
          ) {
            console.error(
              "📱 Service Worker registration issue (mobile HTTPS)",
            );
          }
          if (err.message?.includes("messaging/unsupported-browser")) {
            console.error("📱 Browser doesn't support messaging");
          }
          if (err.message?.includes("NotAllowedError")) {
            console.error("📱 Permission denied - user rejected notifications");
          }

          return;
        }

        if (!token) {
          console.error("❌ No token generated - empty response");
          return;
        }

        // 6. Register token with backend (with retry logic for mobile)
        console.log("📤 Sending token to backend...");

        let retries = 0;
        const maxRetries = 3;
        let registrationSuccess = false;

        while (retries < maxRetries && !registrationSuccess) {
          try {
            const response = await fetch("/api/notifications/register-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });

            console.log("📊 Response status:", response.status);
            const data = await response.json();
            console.log("📊 Response data:", data);

            if (response.ok && data.success) {
              console.log("✅✅✅ TOKEN REGISTERED SUCCESSFULLY!");
              markRegistrationCached(customerId);
              registrationSuccess = true;
            } else {
              console.error("❌ Token registration failed:", data.message);
              retries++;

              if (retries < maxRetries) {
                console.log(`🔄 Retrying... (${retries}/${maxRetries})`);
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * retries),
                ); // Exponential backoff
              }
            }
          } catch (fetchError) {
            console.error("❌ Fetch error:", fetchError);
            retries++;

            if (retries < maxRetries) {
              console.log(`🔄 Retrying... (${retries}/${maxRetries})`);
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * retries),
              );
            }
          }
        }

        if (!registrationSuccess) {
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
