// app/store/[slug]/components/NotificationInitializer.tsx

"use client";

import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import NotificationPrompt from "./NotificationPrompt";

export default function NotificationInitializer() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if customer is logged in (via API)
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/customer/auth-status");
        const data = await res.json();

        if (data.authenticated && data.customerId) {
          console.log("✅ Customer authenticated:", data.customerId);
          setCustomerId(data.customerId);
          setIsAuthenticated(true);

          // Check if already registered to skip prompt
          const isRegistered = localStorage.getItem(
            `push_reg_${data.customerId}`
          );

          if (!isRegistered) {
            // Show prompt only if NOT already registered
            const timer = setTimeout(() => {
              console.log("⏰ Showing notification prompt...");
              setShowPrompt(true);
            }, 2000);

            return () => clearTimeout(timer);
          } else {
            console.log("✅ Already registered for push notifications");
          }
        } else {
          console.log("⏭️  Customer not authenticated - skipping notifications");
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
      }
    };

    checkAuth();
  }, []);

  // ONLY call the hook when showPrompt is true AND we have customerId
  usePushNotifications(showPrompt && isAuthenticated, customerId || undefined);

  // Don't render anything - the prompt handles itself
  return (
    showPrompt && <NotificationPrompt onClose={() => setShowPrompt(false)} />
  );
}