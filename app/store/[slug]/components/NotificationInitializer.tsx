"use client";

import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import NotificationPrompt from "./NotificationPrompt";

export default function NotificationInitializer() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 10;

    const justSignedUp =
      localStorage.getItem("_mahally_just_signed_up") === "true";

    const checkAuth = async () => {
      attempts++;
      try {
        const res = await fetch("/api/customer/auth-status");

        // Bail out early if the user is 401 Unauthorized so we don't crash on res.json()
        if (!res.ok) {
          if (attempts >= maxAttempts && pollInterval) {
            clearInterval(pollInterval);
          }
          return;
        }

        const data = await res.json();

        if (data.authenticated && data.customerId) {
          setCustomerId(data.customerId);
          setIsAuthenticated(true);

          const isRegistered = localStorage.getItem(
            `push_reg_${data.customerId}`,
          );

          if (!isRegistered) {
            if (justSignedUp) {
              setShowPrompt(true);
              localStorage.removeItem("_mahally_just_signed_up");
            } else {
              timeoutId = setTimeout(() => {
                setShowPrompt(true);
              }, 1000);
            }
          }

          if (pollInterval) clearInterval(pollInterval);
        } else if (attempts >= maxAttempts) {
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Auth status check failed:", error);
        if (attempts >= maxAttempts && pollInterval) {
          clearInterval(pollInterval);
        }
      }
    };

    const docLang = document.documentElement.lang as "en" | "ar";
    if (docLang) setLang(docLang);

    if (justSignedUp) {
      // 1. If they just signed up, check immediately, then poll to wait for the cookie
      checkAuth();
      pollInterval = setInterval(checkAuth, 500);
    } else {
      // 2. Normal visitor: just check ONCE. No polling.
      checkAuth();
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
    showPrompt && (
      <NotificationPrompt
        onClose={() => setShowPrompt(false)}
        customerId={customerId}
        lang={lang}
      />
    )
  );
}
