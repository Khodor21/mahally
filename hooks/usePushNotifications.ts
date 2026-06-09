"use client";

import { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";

export function usePushNotifications(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const register = async () => {
      try {
        if (!("Notification" in window)) {
          return;
        }

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          return;
        }

        const messaging = await getFirebaseMessaging();

        if (!messaging) {
          return;
        }

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (!token) {
          return;
        }

        await fetch("/api/notifications/register-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        });
      } catch (error) {
        console.error("FCM registration error:", error);
      }
    };

    register();
  }, [enabled]);
}
