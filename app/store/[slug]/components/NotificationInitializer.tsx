// app/store/[slug]/components/NotificationInitializer.tsx

"use client";

import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import NotificationPrompt from "./NotificationPrompt";

export default function NotificationInitializer() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if customer is logged in (via API)
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/customer/auth-status");
        const data = await res.json();

        if (data.authenticated) {
          console.log("✅ Customer authenticated");
          setIsAuthenticated(true);

          // Show prompt after 2 seconds
          const timer = setTimeout(() => {
            console.log("⏰ Showing notification prompt...");
            setShowPrompt(true);
          }, 2000);

          return () => clearTimeout(timer);
        } else {
          console.log("❌ Customer not authenticated");
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
      }
    };

    checkAuth();
  }, []);

  // ONLY call the hook when showPrompt is true
  usePushNotifications(showPrompt && isAuthenticated);

  return (
    showPrompt && <NotificationPrompt onClose={() => setShowPrompt(false)} />
  );
}
