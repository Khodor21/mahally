"use client";

import { AlertCircle } from "lucide-react";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group">
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm font-semibold text-[#1a1a1a] tracking-wide">
          {label}
        </label>
        {hint && !error && (
          <span className="text-xs text-[#aaa]">{hint}</span>
        )}
      </div>

      {children}

      {error && (
        <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5 animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}