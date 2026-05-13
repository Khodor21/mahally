"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye, EyeOff, MapPin, Phone, Loader2, AlertCircle,
  CheckCircle, ArrowLeft, ArrowRight, Copy, User, Store,
  Link2, Check,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORE_TYPES = [
  { value: "fashion",     label: "ملابس وأزياء",       emoji: "👗" },
  { value: "electronics", label: "إلكترونيات",          emoji: "📱" },
  { value: "food",        label: "مأكولات ومشروبات",    emoji: "🍔" },
  { value: "beauty",      label: "تجميل وعناية",        emoji: "💄" },
  { value: "home",        label: "منزل وأثاث",          emoji: "🏠" },
  { value: "sports",      label: "رياضة وهوايات",       emoji: "⚽" },
  { value: "books",       label: "كتب وتعليم",          emoji: "📚" },
  { value: "jewelry",     label: "مجوهرات وإكسسوارات", emoji: "💍" },
  { value: "toys",        label: "ألعاب أطفال",         emoji: "🧸" },
  { value: "other",       label: "متجر متنوع",          emoji: "🏪" },
];

const STEPS = [
  { id: 1, label: "حسابك",  sublabel: "معلوماتك الشخصية", icon: User  },
  { id: 2, label: "متجرك",  sublabel: "بيانات النشاط",    icon: Store },
  { id: 3, label: "رابطك",  sublabel: "هويتك الرقمية",    icon: Link2 },
];

const STEP_COPY = [
  { title: "أهلاً، من نكون؟",    sub: "ابدأ بإنشاء حسابك — هو بوابتك لإدارة كل شيء." },
  { title: "أخبرنا عن متجرك",    sub: "كل تفصيل تكتبه الآن يُقرّب زبائنك منك أكثر." },
  { title: "اختر هويتك الرقمية", sub: "الرابط هو عنوانك على الإنترنت — اجعله بسيطًا ولا يُنسى." },
];

const INPUT_BASE =
  "w-full h-14 px-4 rounded-2xl border border-[#e8e3db] bg-[#faf8f5] " +
  "text-[#1a1a1a] placeholder:text-[#bbb] text-sm outline-none " +
  "transition-all duration-200 focus:border-[#1a1a1a] focus:bg-white " +
  "focus:ring-4 focus:ring-[#1a1a1a]/5";

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

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, hint, error, children,
}: {
  label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-sm font-semibold text-[#1a1a1a] tracking-wide">{label}</label>
        {hint && !error && <span className="text-xs text-[#aaa]">{hint}</span>}
      </div>
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

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {STEPS.map((s, i) => {
        const Icon     = s.icon;
        const isDone   = s.id < current;
        const isActive = s.id === current;

        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={[
                "relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500",
                isDone   ? "bg-[#1a1a1a]" :
                isActive ? "bg-[#1a1a1a] ring-4 ring-[#1a1a1a]/10" :
                           "bg-[#f0ede8] border border-[#ddd9d2]",
              ].join(" ")}>
                {isDone
                  ? <Check className="w-4 h-4 text-[#f5f0e8]" strokeWidth={2.5} />
                  : <Icon  className={`w-4 h-4 ${isActive ? "text-[#f5f0e8]" : "text-[#999]"}`} strokeWidth={1.8} />
                }
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#c8a97e] border-2 border-white" />
                )}
              </div>
              <div className="text-center">
                <p className={[
                  "text-xs font-bold tracking-wide transition-colors duration-300",
                  isActive ? "text-[#1a1a1a]" : isDone ? "text-[#1a1a1a]/60" : "text-[#bbb]",
                ].join(" ")}>{s.label}</p>
                <p className={[
                  "text-[10px] tracking-wide transition-all duration-300",
                  isActive ? "text-[#c8a97e]" : "text-transparent select-none",
                ].join(" ")}>{s.sublabel}</p>
              </div>
            </div>

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

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ slug }: { slug: string }) {
  const domain   = process.env.NEXT_PUBLIC_APP_DOMAIN || "mahalli.lb";
  const storeUrl = `${slug}.${domain}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-5">
      <div
        className="fixed inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #1a1a1a 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />
      <div className="w-full max-w-md relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#c8a97e]/20 blur-3xl pointer-events-none" />
        <div className="relative bg-white border border-[#e8e3db] rounded-3xl p-8 md:p-10 shadow-[0_4px_40px_rgba(0,0,0,0.06)] text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#f5f0e8] border border-[#e8e3db] flex items-center justify-center mx-auto mb-6 rotate-3">
            <CheckCircle className="w-8 h-8 text-[#1a1a1a]" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl text-[#1a1a1a] mb-3 leading-tight" style={{ fontFamily: "Lalezar, sans-serif" }}>
            متجرك صار حقيقي 🎉
          </h1>
          <p className="text-[#777] text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            خلال دقائق، أنشأت حضورًا رقميًا كاملًا لنشاطك. ما راح ينتظر زبائنك كتير.
          </p>
          <div className="bg-[#f5f0e8] border border-[#e8e3db] rounded-2xl p-5 mb-8 text-right">
            <p className="text-xs font-semibold text-[#aaa] uppercase tracking-widest mb-2">رابط متجرك</p>
            <p className="text-[#1a1a1a] font-bold text-lg break-all leading-snug" dir="ltr">
              {slug}<span className="text-[#c8a97e]">.{domain}</span>
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCopy}
              className={[
                "h-12 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300",
                copied
                  ? "border-green-300 bg-green-50 text-green-700"
                  : "border-[#e8e3db] text-[#1a1a1a] hover:border-[#1a1a1a] hover:bg-[#f5f0e8]",
              ].join(" ")}
            >
              <Copy className="w-4 h-4" />
              {copied ? "تم النسخ ✓" : "انسخ الرابط"}
            </button>
            <Link
              href="/login"
              className="h-12 rounded-2xl bg-[#1a1a1a] text-[#f5f0e8] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#333] transition-all duration-300"
            >
              ادخل للوحة التحكم
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step,          setStep]          = useState(1);
  const [loading,       setLoading]       = useState(false);
  const [slugChecking,  setSlugChecking]  = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [showPassword,  setShowPassword]  = useState(false);
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [success,       setSuccess]       = useState(false);

  const [form, setForm] = useState({
    adminName: "", adminEmail: "", password: "",
    storeName: "", slug: "", location: "", phone: "", storeType: "",
  });

  useEffect(() => {
    if (form.storeName && step === 2) {
      setForm((f) => ({ ...f, slug: generateSlug(form.storeName) }));
    }
  }, [form.storeName]);

  useEffect(() => {
    if (!form.slug || form.slug.length < 2) { setSlugAvailable(null); return; }
    setSlugChecking(true);
    const t = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/check-slug?slug=${form.slug}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch { setSlugAvailable(null); }
      finally  { setSlugChecking(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [form.slug]);

  const set = (key: string, value: string) => {
    setForm((f)  => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: ""   }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!form.adminName.trim())                 errs.adminName  = "الاسم الكامل مطلوب";
      if (!/\S+@\S+\.\S+/.test(form.adminEmail)) errs.adminEmail = "بريد إلكتروني غير صالح";
      if (form.password.length < 8)               errs.password   = "8 أحرف على الأقل";
    }
    if (step === 2) {
      if (!form.storeName.trim()) errs.storeName = "اسم المتجر مطلوب";
      if (!form.location.trim())  errs.location  = "المدينة مطلوبة";
      if (!form.phone.trim())     errs.phone     = "رقم الهاتف مطلوب";
      if (!form.storeType)        errs.storeType = "اختر نوع المتجر";
    }
    if (step === 3) {
      if (!form.slug || form.slug.length < 2) errs.slug = "اختر رابطًا للمتجر";
      if (slugAvailable === false)             errs.slug = "هذا الرابط محجوز، جرّب آخر";
      if (slugChecking)                        errs.slug = "يرجى الانتظار…";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext   = () => { if (validate()) setStep((s) => s + 1); };
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ global: data.error || "حدث خطأ غير متوقع" }); return; }
      setSuccess(true);
    } catch {
      setErrors({ global: "تعذّر الاتصال بالخادم، تحقق من اتصالك وحاول مجددًا." });
    } finally { setLoading(false); }
  };

  if (success) return <SuccessScreen slug={form.slug} />;

  const copy   = STEP_COPY[step - 1];
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "mahalli.lb";

  return (
    <div dir="rtl" className="min-h-screen bg-[#f5f0e8] flex flex-col">
      {/* Dot grid */}
      <div
        className="fixed inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #1a1a1a 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />
      {/* Warm glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-72 rounded-full bg-[#c8a97e]/15 blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="relative flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#e8e3db] bg-[#f5f0e8]/80 backdrop-blur-sm">
        <Link href="/" className="text-3xl text-[#1a1a1a] leading-none hover:opacity-70 transition-opacity" style={{ fontFamily: "Lalezar, sans-serif" }}>
          محلي
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#aaa] font-medium tracking-wide">{step} / 3</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className={["h-1 rounded-full transition-all duration-500", n <= step ? "bg-[#1a1a1a] w-6" : "bg-[#ddd9d2] w-3"].join(" ")} />
            ))}
          </div>
        </div>
      </nav>

      {/* Body */}
      <div className="relative flex-1 flex items-start justify-center px-5 py-10 md:py-16">
        <div className="w-full max-w-[540px]">
          <StepIndicator current={step} />

          {/* Card */}
          <div className="bg-white border border-[#e8e3db] rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="h-1 bg-gradient-to-l from-[#c8a97e] via-[#1a1a1a] to-[#1a1a1a]" />

            <div className="p-6 md:p-8">
              {/* Headline */}
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl text-[#1a1a1a] mb-2 leading-tight" style={{ fontFamily: "Lalezar, sans-serif" }}>
                  {copy.title}
                </h2>
                <p className="text-sm text-[#888] leading-relaxed">{copy.sub}</p>
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  <Field label="الاسم الكامل" error={errors.adminName}>
                    <input type="text" placeholder="مثلاً: سارة العلي" value={form.adminName}
                      onChange={(e) => set("adminName", e.target.value)} className={INPUT_BASE} />
                  </Field>

                  <Field label="البريد الإلكتروني" hint="ستستخدمه لتسجيل الدخول" error={errors.adminEmail}>
                    <input type="email" placeholder="name@example.com" value={form.adminEmail} dir="ltr"
                      onChange={(e) => set("adminEmail", e.target.value)} className={INPUT_BASE} />
                  </Field>

                  <Field label="كلمة المرور" hint="8 أحرف على الأقل" error={errors.password}>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="اختر كلمة مرور قوية"
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        className={INPUT_BASE + " pl-12"}
                      />
                      <button type="button" tabIndex={-1}
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#1a1a1a] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>

                  <p className="text-xs text-[#aaa] pt-1">
                    بإنشاء الحساب، أنت توافق على{" "}
                    <Link href="/terms" className="text-[#1a1a1a] underline underline-offset-2">شروط الاستخدام</Link>.
                  </p>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-5">
                  <Field label="اسم المتجر" hint="يظهر للزبائن على متجرك" error={errors.storeName}>
                    <input type="text" placeholder="مثلاً: بوتيك نور" value={form.storeName}
                      onChange={(e) => set("storeName", e.target.value)} className={INPUT_BASE} />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="المدينة" error={errors.location}>
                      <div className="relative">
                        <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc]" />
                        <input type="text" placeholder="بيروت" value={form.location}
                          onChange={(e) => set("location", e.target.value)} className={INPUT_BASE + " pr-10"} />
                      </div>
                    </Field>
                    <Field label="رقم الهاتف" error={errors.phone}>
                      <div className="relative">
                        <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc]" />
                        <input type="tel" placeholder="+961 70 …" value={form.phone} dir="ltr"
                          onChange={(e) => set("phone", e.target.value)} className={INPUT_BASE + " pr-10"} />
                      </div>
                    </Field>
                  </div>

                  <Field label="ما الذي تبيعه؟" error={errors.storeType}>
                    <div className="grid grid-cols-2 gap-2.5 mt-1">
                      {STORE_TYPES.map((t) => (
                        <button key={t.value} type="button" onClick={() => set("storeType", t.value)}
                          className={[
                            "flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm text-right transition-all duration-200",
                            form.storeType === t.value
                              ? "border-[#1a1a1a] bg-[#1a1a1a] text-white font-semibold shadow-md"
                              : "border-[#e8e3db] bg-[#faf8f5] text-[#555] hover:border-[#1a1a1a]/30 hover:bg-[#f5f0e8]",
                          ].join(" ")}
                        >
                          <span className="text-lg leading-none">{t.emoji}</span>
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-5">
                  <Field label="رابط المتجر" hint="حروف إنجليزية وأرقام وشرطات فقط" error={errors.slug}>
                    <div className={[
                      "flex items-center h-14 rounded-2xl border bg-[#faf8f5] overflow-hidden transition-all duration-200",
                      errors.slug
                        ? "border-red-300 focus-within:ring-4 focus-within:ring-red-100"
                        : "border-[#e8e3db] focus-within:border-[#1a1a1a] focus-within:ring-4 focus-within:ring-[#1a1a1a]/5 focus-within:bg-white",
                    ].join(" ")}>
                      <input
                        type="text" dir="ltr" value={form.slug} placeholder="my-store"
                        onChange={(e) => set("slug", generateSlug(e.target.value))}
                        className="flex-1 h-full px-4 bg-transparent text-[#1a1a1a] text-sm outline-none placeholder:text-[#bbb]"
                      />
                      <div className="h-full flex items-center px-3 border-r border-[#e8e3db] bg-[#f0ede8] text-[#999] text-xs font-medium whitespace-nowrap">
                        .{domain}
                      </div>
                      <div className="w-10 flex items-center justify-center">
                        {slugChecking                             && <Loader2      className="w-4 h-4 animate-spin text-[#bbb]" />}
                        {!slugChecking && slugAvailable === true  && <CheckCircle  className="w-4 h-4 text-emerald-500"         />}
                        {!slugChecking && slugAvailable === false && <AlertCircle  className="w-4 h-4 text-red-400"             />}
                      </div>
                    </div>
                  </Field>

                  {form.slug && (
                    <div className="rounded-2xl border border-[#e8e3db] bg-[#f5f0e8] p-5">
                      <p className="text-xs font-semibold text-[#aaa] uppercase tracking-widest mb-2">هكذا سيبدو رابطك</p>
                      <p className="font-bold text-[#1a1a1a] break-all" dir="ltr">
                        <span className="text-[#c8a97e]">https://</span>{form.slug}<span className="text-[#c8a97e]">.{domain}</span>
                      </p>
                    </div>
                  )}

                  {!errors.slug && slugAvailable === true && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> هذا الرابط متاح ومجاني
                    </p>
                  )}

                  {errors.global && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{errors.global}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#f0ede8]">
                {step > 1 ? (
                  <button onClick={() => setStep((s) => s - 1)}
                    className="flex items-center gap-2 text-sm text-[#888] hover:text-[#1a1a1a] transition-colors group">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    رجوع
                  </button>
                ) : (
                  <Link href="/"
                    className="flex items-center gap-2 text-sm text-[#888] hover:text-[#1a1a1a] transition-colors group">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    الرئيسية
                  </Link>
                )}

                {step < 3 ? (
                  <button onClick={handleNext}
                    className="h-12 px-7 rounded-2xl bg-[#1a1a1a] text-[#f5f0e8] text-sm font-bold flex items-center gap-2.5 hover:bg-[#333] transition-all duration-200 group">
                    التالي
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  </button>
                ) : (
                  <button onClick={handleSubmit}
                    disabled={loading || slugAvailable === false || slugChecking || !form.slug}
                    className="h-12 px-7 rounded-2xl bg-[#1a1a1a] text-[#f5f0e8] text-sm font-bold flex items-center gap-2.5 hover:bg-[#333] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الإنشاء…</>
                      : <>أنشئ متجري الآن <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /></>
                    }
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-[#aaa] mt-6">
            عندك حساب سابق؟{" "}
            <Link href="/login" className="text-[#1a1a1a] font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity">
              سجّل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}