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
} from "lucide-react";
import { Emoji } from "emoji-picker-react";

import {
  STORE_TYPES,
  PAYMENT_METHODS,
  STEPS,
  INPUT_BASE,
  generateSlug,
  FormState,
  DEFAULT_FORM,
  loadFromStorage,
  saveToStorage,
  clearStorage,
} from "./components/OnboardingConstants";
import {
  ProgressBar,
  StepPills,
  Field,
  StepWrapper,
  NavRow,
  PasswordStrength,
} from "./components/OnboardingUI";
import { SuccessScreen } from "./components/SuccessScreen";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  useEffect(() => {
    console.log("Hydration effect fired");
    const saved = loadFromStorage();
    setForm(saved.form);
    setStep(saved.step);
    setHydrated(true);
  }, []);

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

  const slugManuallyEdited = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (slugManuallyEdited.current) return;
    if (form.storeName) {
      const generated = generateSlug(form.storeName);
      setForm((f) => ({ ...f, slug: generated }));
    }
  }, [form.storeName, hydrated]);

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

  const set = useCallback((key: string, value: string | string[]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }, []);

  const togglePaymentMethod = useCallback((method: string) => {
    setForm((f) => {
      const current = f.paymentMethods;
      if (current.includes(method)) {
        if (current.length > 1) {
          return { ...f, paymentMethods: current.filter((m) => m !== method) };
        }
      } else {
        return { ...f, paymentMethods: [...current, method] };
      }
      return f;
    });
    setErrors((e) => ({ ...e, paymentMethods: "" }));
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
        if (form.paymentMethods.length === 0) {
          errs.paymentMethods = "اختر طريقة دفع واحدة على الأقل";
        }
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
      // removed send-welcome-email request
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
          paymentMethods: form.paymentMethods,
          slug: form.slug,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ global: data.error || "حدث خطأ غير متوقع" });
        return;
      }
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

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-dark/30" />
      </div>
    );
  }

  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "mahalli.app";

  return (
    <div dir="rtl" className="min-h-screen bg-white flex flex-col">
      {/* Fixed progress bar */}
      <ProgressBar current={step} total={STEPS.length} />
      {/* ── Static Header ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-[#e5e7eb]">
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
        <StepPills current={step} />
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pt-[100px] pb-16 min-h-screen">
        <div className="w-full px-3 md:px-12 mx-auto">
          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <StepWrapper stepKey={1}>
              <div className="space-y-3">
                <div className="mb-8">
                  <h1
                    className="text-[34px] md:text-[42px] leading-[1.15] text-brand-dark flex items-center justify-center gap-3 "
                    style={{ fontFamily: "Lalezar, cursive" }}
                  >
                    ابدأ متجرك اليوم
                    <Emoji unified="1f440" size={38} />
                  </h1>
                  <p className="text-[#777] text-center font-regular text-sm leading-[1.9]">
                    مع محلي، حوّل فكرتك إلى متجر إلكتروني ناجح بسهولة وثقة.
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
              <div className="space-y-5 mt-12">
                <div className="mb-6">
                  <h2
                    className="text-[28px] text-brand-dark mb-2 leading-tight"
                    style={{ fontFamily: "Lalezar, sans-serif" }}
                  >
                    من تكون؟
                  </h2>
                  <p className="text-sm text-[#888] leading-relaxed">
                    معلوماتك الشخصية تساعدنا نحضّر تجربة مخصصة لك
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
                    <div className="flex items-center gap-1.5 h-12 md:h-14 px-3 rounded-lg md:rounded-2xl border border-[#e8e3db] bg-[#e5e7eb] text-sm text-brand-dark font-medium whitespace-nowrap select-none">
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

          {/* ── Step 3: Store Info + Payment Methods ── */}
          {step === 3 && (
            <StepWrapper stepKey={3}>
              <div className="space-y-5 mt-20">
                <div className="mb-6">
                  <h2
                    className="text-[28px] text-brand-dark mb-2 leading-tight"
                    style={{ fontFamily: "Lalezar, sans-serif" }}
                  >
                    أخبرنا عن متجرك
                  </h2>
                  <p className="text-sm text-[#888] leading-relaxed">
                    كل تفصيل تكتبه يُقرّب زبائنك منك أكثر
                  </p>
                </div>

                {/* Store Name */}
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

                {/* Store Type */}
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
                              : "border border-[#f3ede5] bg-gray-50 text-[#555] hover:border-brand-dark/20 hover:bg-white",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-200",
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

                {/* Payment Methods */}
                <Field
                  label="طرق الدفع المتاحة"
                  hint="اختر واحدة أو أكثر"
                  error={errors.paymentMethods}
                >
                  <div className="space-y-2.5">
                    {PAYMENT_METHODS.map((pm) => {
                      const isSelected = form.paymentMethods.includes(pm.value);
                      const isDisabled =
                        isSelected && form.paymentMethods.length === 1;

                      return (
                        <button
                          key={pm.value}
                          type="button"
                          onClick={() => togglePaymentMethod(pm.value)}
                          disabled={isDisabled}
                          className={[
                            "w-full flex items-start gap-3 px-4 py-3.5 rounded-lg text-right transition-all duration-200 border",
                            isSelected
                              ? "border-brand-dark bg-brand-dark/5 shadow-sm"
                              : "border-[#e8e3db] bg-white hover:border-brand-dark/20 hover:bg-[#f5f0e8]",
                            isDisabled ? "opacity-50 cursor-not-allowed" : "",
                          ].join(" ")}
                        >
                          {/* Checkbox */}
                          <div
                            className={[
                              "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all duration-200",
                              isSelected
                                ? "border-brand-dark bg-brand-dark"
                                : "border-[#ddd] bg-white",
                            ].join(" ")}
                          >
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>

                          {/* Icon + Text */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <Emoji unified={pm.icon} size={18} />
                              <h3 className="font-semibold text-brand-dark">
                                {pm.label}
                              </h3>
                              {pm.default && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-dark/10 text-brand-dark">
                                  افتراضي
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#888]">
                              {pm.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <NavRow onBack={() => setStep(2)} onNext={handleNext} />
              </div>
            </StepWrapper>
          )}

          {/* ── Step 4: Password ── */}
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
                <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb] mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex items-center gap-1.5 px-7 h-12 rounded-2xl text-sm bg-[#e5e7eb] text-[#1a1a1a] hover:bg-[#d1d5db] transition-colors"
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
          )}

          {/* ── Step 5: Slug / Domain ── */}
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
                      "flex items-center h-12 md:h-14 rounded-2xl border bg-[#e5e7eb] overflow-hidden transition-all duration-200",
                      errors.slug
                        ? "border-red-300 focus-within:ring-4 focus-within:ring-red-100"
                        : "border-[#e8e3db] focus-within:border-brand-dark focus-within:ring-4 focus-within:ring-brand-dark/5 focus-within:bg-white",
                    ].join(" ")}
                  >
                    <div className="h-full flex items-center px-3 border-l border-[#e8e3db] bg-[#e5e7eb] text-[#999] text-xs font-medium whitespace-nowrap">
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
                <div className="min-h-[20px]">
                  {slugChecking && (
                    <p className="text-xs text-[#888] flex items-center gap-2 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري
                      التحقق من توفر الرابط...
                    </p>
                  )}
                  {!slugChecking && !errors.slug && slugAvailable === true && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> هذا الرابط متاح
                      ومجاني
                    </p>
                  )}
                </div>
                {errors.global && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errors.global}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb] mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex items-center gap-1.5 px-7 h-12 rounded-lg md:rounded-2xl text-sm bg-[#e5e7eb] text-brand-dark hover:bg-[#d1d5db] transition-colors"
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
