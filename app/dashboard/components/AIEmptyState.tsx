"use client";

import { useDashboard } from "../DashboardContext";

export default function AIEmptyState() {
  const { lang } = useDashboard();

  const dir = lang === "ar" ? "rtl" : "ltr";

  const t = {
    title: lang === "ar" ? "بماذا تعمل الآن؟" : "What are you working on?",
  };

  return (
    <div
      className="flex h-full flex-col items-center justify-center px-4 text-center"
      dir={dir}
    >
      <h1 className="text-2xl font-medium text-gray-800">{t.title}</h1>
    </div>
  );
}
