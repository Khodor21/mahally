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
    let pollInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 10; // Poll up to 10 times (5 seconds)

    const checkAuth = async () => {
      attempts++;
      try {
        const res = await fetch("/api/customer/auth-status");
        const data = await res.json();

        if (data.authenticated && data.customerId) {
          setCustomerId(data.customerId);
          setIsAuthenticated(true);

          const isRegistered = localStorage.getItem(
            `push_reg_${data.customerId}`,
          );

          if (!isRegistered) {
            timeoutId = setTimeout(() => {
              setShowPrompt(true);
            }, 1000);
          }

          // Clear polling once authenticated
          if (pollInterval) clearInterval(pollInterval);
        } else if (attempts >= maxAttempts) {
          // Stop polling after max attempts
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Auth status check failed:", error);
        if (attempts >= maxAttempts && pollInterval) {
          clearInterval(pollInterval);
        }
      }
    };

    // Initial immediate check
    checkAuth();

    // Poll every 500ms for up to 5 seconds
    if (attempts < maxAttempts) {
      pollInterval = setInterval(checkAuth, 500);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // ONLY call the hook when showPrompt is true AND we have customerId
  usePushNotifications(showPrompt && isAuthenticated, customerId || undefined);

  // Don't render anything - the prompt handles itself
  return (
    showPrompt && <NotificationPrompt onClose={() => setShowPrompt(false)} />
  );
}
