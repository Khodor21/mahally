"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Copy,
  ChevronDown,
} from "lucide-react";
import { Emoji } from "emoji-picker-react"; // استيراد مكون الإيموجي

// ─── Constants ────────────────────────────────────────────────────────────────

const STORE_TYPES = [
  { value: "fashion", label: "ملابس وأزياء", unified: "1f457" },
  { value: "electronics", label: "إلكترونيات", unified: "1f4f1" },
  { value: "food", label: "مأكولات ومشروبات", unified: "1f354" },
  { value: "beauty", label: "تجميل وعناية", unified: "1f484" },
  { value: "home", label: "منزل وأثاث", unified: "1f3e0" },
  { value: "sports", label: "رياضة وهوايات", unified: "26bd" },
  { value: "books", label: "كتب وتعليم", unified: "1f4da" },
  { value: "jewelry", label: "مجوهرات وإكسسوارات", unified: "1f48d" },
  { value: "toys", label: "ألعاب أطفال", unified: "1f9f8" },
  { value: "other", label: "متجر متنوع", unified: "1f3ea" },
];

const STEPS = [
  { id: 1, label: "البريد" },
  { id: 2, label: "معلوماتك" },
  { id: 3, label: "كلمة المرور" },
  { id: 4, label: "رابطك" },
  { id: 5, label: "" },
];

const INPUT_BASE =
  "w-full h-12 md:h-14 px-4 rounded border border-[#f3ede5] bg-gray-50 " +
  "text-brand-dark placeholder:text-[#bbb] text-sm outline-none " +
  "transition-all duration-200 focus:border-brand-dark focus:bg-white " +
  "focus:ring-4 focus:ring-brand-dark/5";

const LABEL_BASE = "text-sm font-semibold text-brand-dark tracking-wide";

const STORAGE_KEY = "mahalli_onboarding";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);
}

type FormState = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  storeName: string;
  storeType: string;
  slug: string;
  password: string;
  confirmPassword: string;
};

const DEFAULT_FORM: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  location: "",
  storeName: "",
  storeType: "",
  slug: "",
  password: "",
  confirmPassword: "",
};

function loadFromStorage(): { form: FormState; step: number } {
  if (typeof window === "undefined") return { form: DEFAULT_FORM, step: 1 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { form: DEFAULT_FORM, step: 1 };
    const parsed = JSON.parse(raw);
    return {
      form: { ...DEFAULT_FORM, ...parsed.form },
      step: parsed.step ?? 1,
    };
  } catch {
    return { form: DEFAULT_FORM, step: 1 };
  }
}

function saveToStorage(form: FormState, step: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step }));
  } catch {}
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ─── Progress Bar (fixed top) ─────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
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

function StepPills({ current }: { current: number }) {
  return (
    <div className="flex justify-center pt-3 pb-2">
      <div className="flex items-center gap-1.5">
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
                      ? "bg-[#f5f0e8] text-brand-dark"
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

function Field({
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

function StepWrapper({
  children,
  stepKey,
}: {
  children: React.ReactNode;
  stepKey: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on mount
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

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ slug }: { slug: string }) {
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "mahalli.lb";
  const storeUrl = `${slug}.${domain}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-white flex items-center justify-center px-5 py-10"
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image src="/Logo.svg" alt="محلي" width={140} height={48} />
        </div>

        <div className="text-center">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl text-green-400 mb-4 flex items-center justify-center gap-3 leading-tight">
            متجرك صار جاهز للعمل
            <Emoji unified="1f389" size={36} />
          </h1>

          <p className="text-gray-600 text-base leading-relaxed mb-8 px-2">
            مبروك! خطوتك الأولى في التجارة الإلكترونية تمت بنجاح. عشان تبدأ صح
            وبدون لخبطة، جهّزنا لك الخطوات الجاية بكل بساطة:
          </p>

          {/* Step-by-Step Baby UX */}
          <div className="text-right space-y-4 mb-8">
            {/* Step 1 */}
            <div className="flex items-start gap-3 bg-gray-50 p-4 border border-gray-200 rounded transition-colors hover:bg-gray-100">
              <div className="flex-shrink-0 w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-brand-dark mt-0.5">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-brand-dark mb-1">
                  احفظ رابط متجرك
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  هذا هو عنوانك على الإنترنت، انسخه وخلّيه عندك عشان تشاركه مع
                  زبائنك ويبدأوا يطلبوا.
                </p>

                {/* URL Card Integrated */}
                <div className="bg-white border border-gray-200 rounded p-3 flex items-center justify-between gap-4">
                  <p
                    className="text-brand-dark font-bold text-left break-all text-sm md:text-base"
                    dir="ltr"
                  >
                    {slug}
                    <span className="text-gray-400">.{domain}</span>
                  </p>
                  <button
                    onClick={handleCopy}
                    className={[
                      "flex-shrink-0 px-3 py-2 rounded border font-semibold text-xs flex items-center gap-1.5 transition-all duration-300",
                      copied
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-gray-200 text-brand-dark hover:border-brand-dark hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> انسخ
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 bg-gray-50 p-4 border border-gray-200 rounded transition-colors hover:bg-gray-100">
              <div className="flex-shrink-0 w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-brand-dark mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-semibold text-brand-dark mb-1">
                  ادخل للوحة التحكم
                </h3>
                <p className="text-sm text-gray-500">
                  لوحة التحكم هي الإدارة المخفية لمتجرك؛ من هناك بتقدر تضيف أول
                  منتج، تحدد طرق الدفع، وتتابع أرباحك وطلباتك.
                </p>
              </div>
            </div>
          </div>

          {/* Main Call to Action */}
          <Link
            href="/login"
            className="w-full h-14 rounded bg-brand-dark text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-[#333] transition-all duration-300 shadow-sm"
          >
            يلا نبدأ، الذهاب للوحة التحكم
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Nav Row (back + next) ─────────────────────────────────────────────

function NavRow({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-[#f0ede8] mt-2">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 px-7 h-12 rounded-lg md:rounded-2xl text-sm bg-[#f0ede8] text-[#1e1e1e] hover:text-brand-dark transition-colors"
      >
        <ArrowRight className="w-4 h-4" /> رجوع
      </button>
      <button
        type="button"
        onClick={onNext}
        className="h-12 px-7 rounded-lg md:rounded-2xl bg-brand-dark text-white text-sm font-bold flex items-center gap-2 hover:bg-[#333] transition-all duration-200"
      >
        التالي <ArrowLeft className="w-4 h-4" />
      </button>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
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
// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  // ── Hydration-safe localStorage init ──────────────────────────────────────
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  // Load from localStorage only after hydration to avoid SSR mismatch
  useEffect(() => {
    const saved = loadFromStorage();
    setForm(saved.form);
    setStep(saved.step);
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever form or step changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(form, step);
  }, [form, step, hydrated]);

  const [loading, setLoading] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Track whether slug was manually edited so auto-gen doesn't override it
  const slugManuallyEdited = useRef(false);

  // Auto-generate slug from storeName ONLY if not manually edited
  useEffect(() => {
    if (!hydrated) return;
    if (slugManuallyEdited.current) return;
    if (form.storeName) {
      const generated = generateSlug(form.storeName);
      setForm((f) => ({ ...f, slug: generated }));
    }
  }, [form.storeName, hydrated]);

  // Slug availability check — debounced
  useEffect(() => {
    if (!form.slug || form.slug.length < 2) {
      setSlugAvailable(null);
      return;
    }
    setSlugChecking(true);
    setSlugAvailable(null);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-slug?slug=${form.slug}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 600);
    return () => {
      clearTimeout(t);
    };
  }, [form.slug]);

  const set = useCallback((key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }, []);

  const validate = useCallback(
    (targetStep: number): boolean => {
      const errs: Record<string, string> = {};

      if (targetStep === 1) {
        if (!/\S+@\S+\.\S+/.test(form.email))
          errs.email = "بريد إلكتروني غير صالح";
      }
      if (targetStep === 2) {
        if (!form.firstName.trim()) errs.firstName = "الاسم الأول مطلوب";
        if (!form.lastName.trim()) errs.lastName = "الاسم الأخير مطلوب";
        if (!form.phone.trim()) errs.phone = "رقم الهاتف مطلوب";
        if (!form.location.trim()) errs.location = "المدينة مطلوبة";
      }
      if (targetStep === 3) {
        if (!form.storeName.trim()) errs.storeName = "اسم المتجر مطلوب";
        if (!form.storeType) errs.storeType = "اختر نوع المتجر";
      }

      if (targetStep === 4) {
        if (!form.password) {
          errs.password = "كلمة المرور مطلوبة";
        } else if (form.password.length < 8) {
          errs.password = "8 أحرف على الأقل";
        } else if (!/[A-Z]/.test(form.password)) {
          errs.password = "يجب أن تحتوي على حرف كبير";
        } else if (!/[0-9]/.test(form.password)) {
          errs.password = "يجب أن تحتوي على رقم";
        }
        if (form.password !== form.confirmPassword) {
          errs.confirmPassword = "كلمتا المرور غير متطابقتين";
        }
      }
      if (targetStep === 5) {
        if (!form.slug || form.slug.length < 2)
          errs.slug = "اختر رابطًا للمتجر";
        if (slugAvailable === false) errs.slug = "هذا الرابط محجوز، جرّب آخر";
        if (slugChecking) errs.slug = "يرجى الانتظار…";
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [form, slugAvailable, slugChecking],
  );

  const handleStep1Next = async () => {
    if (!validate(1)) return;
    setLoading(true);
    try {
      await fetch("/api/send-welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
    } catch {
      // non-blocking
    } finally {
      setLoading(false);
      setStep(2);
    }
  };

  const handleNext = () => {
    if (validate(step)) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validate(4)) return;
    // Extra guard
    if (slugAvailable === false || slugChecking || !form.slug) return;

    setLoading(true);
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminName: `${form.firstName} ${form.lastName}`,
          adminEmail: form.email,
          phone: form.phone,
          location: form.location,
          storeName: form.storeName,
          storeType: form.storeType,
          slug: form.slug,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ global: data.error || "حدث خطأ غير متوقع" });
        return;
      }
      // Clear persisted data on success
      clearStorage();
      setSuccess(true);
    } catch {
      setErrors({
        global: "تعذّر الاتصال بالخادم، تحقق من اتصالك وحاول مجددًا.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) return <SuccessScreen slug={form.slug} />;

  // Don't render form content until hydrated (avoids flicker)
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-dark/30" />
      </div>
    );
  }

  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "mahalli.lb";

  return (
    <div dir="rtl" className="min-h-screen bg-white flex flex-col">
      {/* Fixed progress bar */}
      <ProgressBar current={step} total={STEPS.length} />

      {/* ── Static Header (logo + CTA) ──────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-[#f0ede8]">
        {/* Progress bar sits at very top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#e8e3db]">
          <div
            className="h-full bg-brand-dark transition-all duration-700"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <Image src="/Logo.svg" alt="محلي" width={86} height={86} />
          <a
            href="#demo"
            className="text-xs text-brand-dark/50 border-[2px] border-brand-dark/20 p-3 rounded-full hover:text-brand-dark transition-colors"
          >
            تصفّح المتجر التجريبي
          </a>
        </div>

        {/* Step pills below logo row */}
        <StepPills current={step} />
      </header>

      {/* ── Body: vertically centered ───────────────────────────────────── */}
      {/* 
        The header is ~88px tall (progress 4px + logo row ~44px + pills ~40px).
        We use pt to offset the fixed header, then flex-1 + flex to center content.
      */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pt-[100px] pb-16 min-h-screen">
        <div className="w-full max-w-sm">
          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <StepWrapper stepKey={1}>
              <div className="space-y-6">
                <div className="mb-8">
                  <h1
                    className="text-[32px] leading-[1.25] text-brand-dark mb-3"
                    style={{ fontFamily: "Lalezar, sans-serif" }}
                  >
                    ابدأ متجرك اليوم
                  </h1>
                  <p className="text-[#777] text-sm leading-[1.9]">
                    مع محلي، حوّل فكرتك إلى متجر إلكتروني ناجح بسهولة وثقة.
                    <br />
                    خطوتك الأولى لبناء ونمو متجرك تبدأ هنا.
                  </p>
                </div>

                <Field label="بريدك الإلكتروني" error={errors.email}>
                  <input
                    type="email"
                    dir="ltr"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStep1Next()}
                    className={INPUT_BASE}
                    autoFocus
                  />
                </Field>

                <button
                  type="button"
                  onClick={handleStep1Next}
                  disabled={loading}
                  className="w-full h-12 md:h-14 rounded-2xl bg-brand-dark text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#333] transition-all duration-200 disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> جاري الإرسال…
                    </>
                  ) : (
                    <>
                      ابدأ الآن <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-base text-brand-dark/70 mt-2">
                  عندك حساب سابق؟{" "}
                  <Link
                    href="/login"
                    className="text-brand-dark font-semibold underline underline-offset-2"
                  >
                    سجّل دخول
                  </Link>
                </p>
              </div>
            </StepWrapper>
          )}
          {/* ── Step 2: Personal Info ── */}
          {step === 2 && (
            <StepWrapper stepKey={2}>
              <div className="space-y-5">
                <div className="mb-6">
                  <h2
                    className="text-[28px] text-brand-dark mb-2 leading-tight"
                    style={{ fontFamily: "Lalezar, sans-serif" }}
                  >
                    أهلاً، من تكون؟
                  </h2>
                  <p className="text-sm text-[#888] leading-relaxed">
                    معلوماتك الشخصية تساعدنا نحضّر تجربة مخصصة لك.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="الاسم الأول" error={errors.firstName}>
                    <input
                      type="text"
                      placeholder="سارة"
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      className={INPUT_BASE}
                    />
                  </Field>
                  <Field label="الاسم الأخير" error={errors.lastName}>
                    <input
                      type="text"
                      placeholder="العلي"
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      className={INPUT_BASE}
                    />
                  </Field>
                </div>

                <Field label="رقم الهاتف" error={errors.phone}>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 h-12 md:h-14 px-3 rounded-lg md:rounded-2xl border border-[#e8e3db] bg-[#faf8f5] text-sm text-brand-dark font-medium whitespace-nowrap select-none">
                      🇱🇧 <span dir="ltr">+961</span>
                    </div>
                    <input
                      type="tel"
                      dir="ltr"
                      placeholder="70 000 000"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className={INPUT_BASE + " flex-1"}
                    />
                  </div>
                </Field>

                <Field label="المدينة / المنطقة" error={errors.location}>
                  <input
                    type="text"
                    placeholder="بيروت"
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    className={INPUT_BASE}
                  />
                </Field>

                <NavRow onBack={() => setStep(1)} onNext={handleNext} />
              </div>
            </StepWrapper>
          )}
          {/* ── Step 3: Store Info ── */}
          {step === 3 && (
            <StepWrapper stepKey={3}>
              <div className="space-y-5">
                <div className="mb-6">
                  <h2
                    className="text-[28px] text-brand-dark mb-2 leading-tight"
                    style={{ fontFamily: "Lalezar, sans-serif" }}
                  >
                    أخبرنا عن متجرك
                  </h2>
                  <p className="text-sm text-[#888] leading-relaxed">
                    كل تفصيل تكتبه يُقرّب زبائنك منك أكثر.
                  </p>
                </div>

                <Field
                  label="اسم المتجر"
                  hint="يظهر للزبائن"
                  error={errors.storeName}
                >
                  <input
                    type="text"
                    placeholder="مثلاً: بوتيك نور"
                    value={form.storeName}
                    onChange={(e) => set("storeName", e.target.value)}
                    className={INPUT_BASE}
                  />
                </Field>

                <Field label="ما الذي تبيعه؟" error={errors.storeType}>
                  <div className="grid grid-cols-2 gap-2.5 mt-1">
                    {STORE_TYPES.map((t) => {
                      const active = form.storeType === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => set("storeType", t.value)}
                          className={[
                            "group relative flex items-center gap-1 px-4 py-3.5 rounded text-right transition-all duration-200 overflow-hidden",
                            active
                              ? "border-brand-dark bg-brand-dark text-white shadow-md scale-[1.02]"
                              : " border border-[#f3ede5] bg-gray-50 text-[#555] hover:border-brand-dark/20 hover:bg-[#f5f0e8]",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-200",
                              active ? "" : "",
                            ].join(" ")}
                          >
                            <Emoji unified={t.unified} size={20} />
                          </span>
                          <span
                            className={[
                              "text-[13px] font-semibold leading-snug",
                              active ? "text-white" : "text-brand-dark",
                            ].join(" ")}
                          >
                            {t.label}
                          </span>
                          {active && (
                            <CheckCircle className="absolute top-2 left-2 w-3.5 h-3.5 text-white/60" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <NavRow onBack={() => setStep(2)} onNext={handleNext} />
              </div>
            </StepWrapper>
          )}
          {step === 4 && (
            <StepWrapper stepKey={4}>
              <div className="space-y-5">
                <div className="mb-6">
                  <h2
                    className="text-[28px] text-[#1a1a1a] mb-2 leading-tight"
                    style={{ fontFamily: "Lalezar, sans-serif" }}
                  >
                    أنشئ كلمة مرورك
                  </h2>
                  <p className="text-sm text-[#888] leading-relaxed">
                    ستستخدمها لتسجيل الدخول إلى لوحة التحكم.
                  </p>
                </div>

                {/* Password strength indicator */}
                <PasswordStrength password={form.password} />

                <Field label="كلمة المرور" error={errors.password}>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      dir="ltr"
                      placeholder="8 أحرف على الأقل، حرف كبير ورقم"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className={INPUT_BASE + " pl-12 text-right"}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#1a1a1a] transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </Field>

                <Field label="تأكيد كلمة المرور" error={errors.confirmPassword}>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      dir="ltr"
                      placeholder="أعد إدخال كلمة المرور"
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      className={INPUT_BASE + " pl-12 text-right"}
                      autoComplete="new-password"
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#1a1a1a] transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </Field>

                {errors.global && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errors.global}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-[#f0ede8] mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex items-center gap-1.5 px-7 h-12 rounded-2xl text-sm bg-[#f0ede8] text-[#1a1a1a] hover:bg-[#e8e4de] transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" /> رجوع
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    disabled={loading}
                    className="h-12 px-7 rounded-2xl bg-brand-dark text-white text-sm font-bold flex items-center gap-2 hover:bg-[#333] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> جاري
                        الإنشاء…
                      </>
                    ) : (
                      <>
                        اختر رابط متجرك <ArrowLeft className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </StepWrapper>
          )}{" "}
          {/* ── Step 4: Slug / Domain ── */}
          {step === 5 && (
            <StepWrapper stepKey={5}>
              <div className="space-y-5">
                <div className="mb-6">
                  <h2
                    className="text-[28px] text-brand-dark mb-2 leading-tight"
                    style={{ fontFamily: "Lalezar, sans-serif" }}
                  >
                    اختر هويتك الرقمية
                  </h2>
                  <p className="text-sm text-[#888] leading-relaxed">
                    الرابط هو عنوانك على الإنترنت — اجعله بسيطًا ولا يُنسى.
                  </p>
                </div>

                <Field
                  label="رابط المتجر"
                  hint="حروف إنجليزية، أرقام وشرطات"
                  error={errors.slug}
                >
                  <div
                    className={[
                      "flex items-center h-12 md:h-14 rounded-2xl border bg-[#faf8f5] overflow-hidden transition-all duration-200",
                      errors.slug
                        ? "border-red-300 focus-within:ring-4 focus-within:ring-red-100"
                        : "border-[#e8e3db] focus-within:border-brand-dark focus-within:ring-4 focus-within:ring-brand-dark/5 focus-within:bg-white",
                    ].join(" ")}
                  >
                    {/* Domain suffix — shown on LEFT in RTL, so visually leads */}
                    <div className="h-full flex items-center px-3 border-l border-[#e8e3db] bg-[#f0ede8] text-[#999] text-xs font-medium whitespace-nowrap">
                      .{domain}
                    </div>
                    <input
                      type="text"
                      dir="ltr"
                      value={form.slug}
                      placeholder="my-store"
                      onChange={(e) => {
                        slugManuallyEdited.current = true;
                        set("slug", generateSlug(e.target.value));
                      }}
                      className="flex-1 h-full px-4 bg-transparent text-brand-dark text-sm outline-none placeholder:text-[#bbb]"
                    />

                    {/* Status icon with Cool Loader */}
                    <div className="w-12 flex items-center justify-center">
                      {slugChecking && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-brand-dark/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-brand-dark/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-brand-dark/40 rounded-full animate-bounce"></div>
                        </div>
                      )}
                      {!slugChecking && slugAvailable === true && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                      {!slugChecking &&
                        slugAvailable === false &&
                        form.slug && (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                    </div>
                  </div>
                </Field>

                {/* Preview */}
                {form.slug && (
                  <div className="rounded-2xl border border-[#e8e3db] bg-[#f5f0e8] p-4">
                    <p className="text-[10px] font-semibold text-[#aaa] uppercase tracking-widest mb-1.5">
                      هكذا سيبدو رابطك
                    </p>
                    <p
                      className="font-bold text-brand-dark break-all text-sm"
                      dir="ltr"
                    >
                      <span className="text-brand-dark/60">https://</span>
                      {form.slug}
                      <span className="text-brand-dark/60">.{domain}</span>
                    </p>
                  </div>
                )}

                {/* Status Messages */}
                <div className="min-h-[20px]">
                  {/* Checking message */}
                  {slugChecking && (
                    <p className="text-xs text-[#888] flex items-center gap-2 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري
                      التحقق من توفر الرابط...
                    </p>
                  )}

                  {/* Availability message */}
                  {!slugChecking && !errors.slug && slugAvailable === true && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> هذا الرابط متاح
                      ومجاني
                    </p>
                  )}
                </div>

                {/* Global error */}
                {errors.global && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errors.global}</span>
                  </div>
                )}

                {/* Final Nav */}
                <div className="flex items-center justify-between pt-4 border-t border-[#f0ede8] mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex items-center gap-1.5 px-7 h-12 rounded-lg md:rounded-2xl text-sm bg-[#f0ede8] text-brand-dark hover:bg-[#e8e4de] transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" /> رجوع
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      loading ||
                      slugAvailable === false ||
                      slugChecking ||
                      !form.slug
                    }
                    className="h-12 px-7 rounded-2xl bg-brand-dark text-white text-sm font-bold flex items-center gap-2 hover:bg-[#333] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> جاري
                        الإنشاء…
                      </>
                    ) : (
                      <>
                        إنشاء المتجر الآن <ArrowLeft className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </StepWrapper>
          )}
        </div>
      </main>
    </div>
  );
}
