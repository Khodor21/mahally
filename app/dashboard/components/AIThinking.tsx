"use client";

import { useDashboard } from "../DashboardContext";

export default function AIThinking() {
  const { lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const label = lang === "ar" ? "يفكر..." : "Thinking...";

  return (
    <div className="px-4 py-3" dir={dir}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-900">
          <span className="text-[10px] text-white font-bold">م</span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="flex gap-1">
            <span
              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </span>
          <span className="text-xs text-gray-400">{label}</span>
        </div>
      </div>
    </div>
  );
}
