"use client";

import { useEffect } from "react";

export default function LangDomSetter({ lang }: { lang: "en" | "ar" }) {
  useEffect(() => {
    // This forces the browser DOM to update instantly, exactly like your dashboard
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return null; // It renders nothing visually
}
