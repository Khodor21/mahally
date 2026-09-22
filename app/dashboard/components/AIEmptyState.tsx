"use client";

import { useDashboard } from "../DashboardContext";

const SUGGESTIONS_AR = [
  "ما هي أكثر منتجاتي مبيعًا؟",
  "كيف أحسّن صفحة متجري؟",
  "اقترح عليّ أفكارًا للعروض",
];

const SUGGESTIONS_EN = [
  "What are my best-selling products?",
  "How can I improve my store page?",
  "Suggest promotional ideas for me",
];

interface AIEmptyStateProps {
  onSuggestionClick?: (text: string) => void;
}

export default function AIEmptyState({ onSuggestionClick }: AIEmptyStateProps) {
  const { lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const isAr = lang === "ar";

  const suggestions = isAr ? SUGGESTIONS_AR : SUGGESTIONS_EN;
  const greeting = isAr ? "مرحبًا، كيف يمكنني مساعدتك؟" : "Hi, how can I help?";

  return (
    <div className="flex flex-col items-center text-center" dir={dir}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900">
        <span className="text-xl text-white font-bold">م</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{greeting}</h3>

      {onSuggestionClick && (
        <div className="flex flex-col gap-2 w-full">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestionClick(s)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors text-start"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
