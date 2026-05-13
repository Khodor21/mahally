"use client";

import { User, Store, Link2, Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "حسابك", sublabel: "معلوماتك الشخصية", icon: User },
  { id: 2, label: "متجرك", sublabel: "بيانات النشاط", icon: Store },
  { id: 3, label: "رابطك", sublabel: "هويتك الرقمية", icon: Link2 },
];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isDone = s.id < current;
        const isActive = s.id === current;

        return (
          <div key={s.id} className="flex items-center">
            {/* Step pill */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`
                  relative w-11 h-11 rounded-full flex items-center justify-center
                  transition-all duration-500
                  ${isDone ? "bg-[#1a1a1a]" : isActive ? "bg-[#1a1a1a] ring-4 ring-[#1a1a1a]/10" : "bg-[#f0ede8] border border-[#ddd9d2]"}
                `}
              >
                {isDone ? (
                  <Check className="w-4 h-4 text-[#f5f0e8]" strokeWidth={2.5} />
                ) : (
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-[#f5f0e8]" : "text-[#999]"}`}
                    strokeWidth={1.8}
                  />
                )}

                {isActive && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#c8a97e] border-2 border-white" />
                )}
              </div>

              <div className="text-center">
                <p
                  className={`text-xs font-bold tracking-wide transition-colors duration-300
                    ${isActive ? "text-[#1a1a1a]" : isDone ? "text-[#1a1a1a]/60" : "text-[#bbb]"}`}
                >
                  {s.label}
                </p>
                <p
                  className={`text-[10px] tracking-wide transition-colors duration-300
                    ${isActive ? "text-[#c8a97e]" : "text-transparent"}`}
                >
                  {s.sublabel}
                </p>
              </div>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className="w-16 md:w-24 h-px mx-3 mb-6 relative overflow-hidden bg-[#e8e4de]">
                <div
                  className="absolute inset-y-0 right-0 bg-[#1a1a1a] transition-all duration-700"
                  style={{ width: isDone ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}