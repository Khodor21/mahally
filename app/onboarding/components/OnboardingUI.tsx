import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { STEPS, LABEL_BASE } from "./OnboardingConstants";

// ─── Progress Bar (fixed top) ─────────────────────────────────────────────────
export function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = ((current - 1) / (total - 1)) * 100;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#e8e3db]">
      <div
        className="h-full bg-brand-dark transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Step Pills ───────────────────────────────────────────────────────────────
export function StepPills({ current }: { current: number }) {
  return (
    <div className="flex justify-center pt-3 pb-2 px-3">
      {/* Mobile: numbered dots only */}
      <div className="flex md:hidden items-center gap-2">
        {STEPS.map((s) => {
          const isDone = s.id < current;
          const isActive = s.id === current;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300",
                  isDone
                    ? "bg-brand-dark text-white"
                    : isActive
                      ? "bg-[#e5e7eb] text-brand-dark ring-2 ring-brand-dark/20"
                      : "bg-transparent text-[#ccc] border border-[#e5e7eb]",
                ].join(" ")}
              >
                {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : s.id}
              </div>
              {s.id < STEPS.length && (
                <div
                  className={[
                    "w-4 h-px transition-all duration-500",
                    isDone ? "bg-brand-dark" : "bg-[#e8e3db]",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Desktop: full pills with labels */}
      <div className="hidden md:flex items-center gap-1.5">
        {STEPS.map((s) => {
          const isDone = s.id < current;
          const isActive = s.id === current;
          return (
            <div key={s.id} className="flex items-center gap-1.5">
              <div
                className={[
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-300",
                  isDone
                    ? "bg-brand-dark text-white"
                    : isActive
                      ? "bg-[#e5e7eb] text-brand-dark"
                      : "bg-transparent text-[#ccc]",
                ].join(" ")}
              >
                {isDone && <CheckCircle className="w-3 h-3" />}
                <span>{s.label}</span>
              </div>
              {s.id < STEPS.length && (
                <div
                  className={[
                    "w-3 h-px transition-all duration-500",
                    isDone ? "bg-brand-dark" : "bg-[#e8e3db]",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <div className="flex items-baseline justify-between mb-2">
          <label className={LABEL_BASE}>{label}</label>
          {hint && !error && (
            <span className="text-xs text-[#aaa]">{hint}</span>
          )}
        </div>
      )}
      {children}
      {error && (
        <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Animated Step Wrapper ────────────────────────────────────────────────────
export function StepWrapper({
  children,
  stepKey,
}: {
  children: React.ReactNode;
  stepKey: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(16px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
    >
      {children}
    </div>
  );
}

// ─── Shared Nav Row (back + next) ─────────────────────────────────────────────
export function NavRow({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb] mt-2">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 px-6 h-10 rounded-lg md:rounded-2xl text-sm bg-[#e5e7eb] text-[#1e1e1e] hover:text-brand-dark hover:bg-[#d1d5db] transition-colors"
      >
        <ArrowRight className="w-4 h-4" /> رجوع
      </button>
      <button
        type="button"
        onClick={onNext}
        className="h-10 px-6 rounded-lg md:rounded-2xl bg-brand-dark text-white text-sm font-bold flex items-center gap-2 hover:bg-[#333] transition-all duration-200"
      >
        التالي <ArrowLeft className="w-4 h-4" />
      </button>
    </div>
  );
}

export function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8 أحرف على الأقل", pass: password.length >= 8 },
    { label: "حرف كبير", pass: /[A-Z]/.test(password) },
    { label: "رقم", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-400", "bg-yellow-400", "bg-emerald-400"];
  const labels = ["ضعيفة", "متوسطة", "قوية"];
  if (!password) return null;
  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={[
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < score ? colors[score - 1] : "bg-[#e8e3db]",
            ].join(" ")}
          />
        ))}
      </div>
      {/* Checks */}
      <div className="flex gap-3 flex-wrap">
        {checks.map((c) => (
          <span
            key={c.label}
            className={[
              "text-[11px] flex items-center gap-1 transition-colors duration-200",
              c.pass ? "text-emerald-600" : "text-[#bbb]",
            ].join(" ")}
          >
            <CheckCircle className="w-3 h-3" />
            {c.label}
          </span>
        ))}
      </div>
      {password && (
        <p className="text-xs text-[#888]">
          قوة كلمة المرور:{" "}
          <span
            className={
              score === 3 ? "text-emerald-600 font-semibold" : "text-[#aaa]"
            }
          >
            {labels[score - 1] ?? "ضعيفة جداً"}
          </span>
        </p>
      )}
    </div>
  );
}
