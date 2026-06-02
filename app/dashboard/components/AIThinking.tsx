"use client";

import { useDashboard } from "../DashboardContext";

export default function AIThinking() {
  const { lang } = useDashboard();

  const dir = lang === "ar" ? "rtl" : "ltr";

  const t = {
    thinking: lang === "ar" ? "ChatGPT يفكر..." : "ChatGPT is thinking...",
  };

  return (
    <div className="px-4 py-3" dir={dir}>
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <span className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
        </span>

        <span>{t.thinking}</span>
      </div>
    </div>
  );
}
