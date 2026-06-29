// app/store/[slug]/components/NotificationInitializer.tsx

"use client";

import { useEffect, useState } from "react";
import { getToken, deleteToken } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import NotificationPrompt from "./NotificationPrompt";

export default function NotificationInitializer() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/customer/auth-status");
        const data = await res.json();

        if (data.authenticated) {
          console.log("✅ Customer authenticated:", data.customerId);
          setCustomerId(data.customerId);
          setIsAuthenticated(true);

          const isRegistered = localStorage.getItem(
            `push_reg_${data.customerId}`,
          );

          if (!isRegistered) {
            const timer = setTimeout(() => {
              console.log("⏰ Showing notification prompt...");
              setShowPrompt(true);
            }, 2000);

            return () => clearTimeout(timer);
          } else {
            console.log("✅ Already registered for push notifications");
            validateExistingToken(data.customerId);
          }
        } else {
          console.log("❌ Customer not authenticated");
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  const validateExistingToken = async (custId: string) => {
    try {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) return;

      // Delete the cached token to force Firebase to generate a fresh one
      console.log("🗑️ Deleting cached token to force refresh...");
      try {
        await deleteToken(messaging);
        console.log("✅ Cached token deleted");
      } catch (err) {
        console.log("ℹ️ No cached token to delete:", err);
      }

      // Now get a completely fresh token
      const freshToken = await getToken(messaging, { vapidKey });
      console.log("🆕 Fresh token:", freshToken?.substring(0, 20) + "...");

      if (!freshToken) {
        console.error("❌ Could not generate fresh token");
        localStorage.removeItem(`push_reg_${custId}`);
        return;
      }

      // Sync fresh token with backend
      const response = await fetch("/api/notifications/register-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: freshToken }),
      });

      const data = await response.json();
      console.log("📊 Token sync response:", data);

      if (data.success) {
        console.log("✅ Fresh token synced successfully");
      } else {
        console.error("❌ Token sync failed:", data.message);
        localStorage.removeItem(`push_reg_${custId}`);
      }
    } catch (error) {
      console.error("❌ Token validation error:", error);
      localStorage.removeItem(`push_reg_${custId}`);
    }
  };

  return (
    showPrompt && <NotificationPrompt onClose={() => setShowPrompt(false)} />
  );
}
