"use client";

import { useEffect } from "react";

/**
 * LangDomSetter - Apply language from backend to DOM
 *
 * This component is responsible for syncing the server-determined language
 * to the DOM. The language comes ONLY from the backend stores API and cannot
 * be overridden by client-side code (e.g., cookies or localStorage).
 *
 * ⚠️ IMPORTANT: Clients cannot change language themselves.
 * Language must be configured in the Mahally dashboard only.
 */
export default function LangDomSetter({ lang }: { lang: "en" | "ar" }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    localStorage.removeItem("lang");
    sessionStorage.removeItem("lang");
  }, [lang]);

  return null; // Renders nothing visually
}
