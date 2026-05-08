"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Store,
  MapPin,
  Phone,
  Tag,
  Link2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

const STORE_TYPES = [
  { value: "fashion", label: "👗 Fashion & Clothing" },
  { value: "electronics", label: "📱 Electronics" },
  { value: "food", label: "🍔 Food & Beverages" },
  { value: "beauty", label: "💄 Beauty & Cosmetics" },
  { value: "home", label: "🏠 Home & Furniture" },
  { value: "sports", label: "⚽ Sports & Outdoors" },
  { value: "books", label: "📚 Books & Education" },
  { value: "jewelry", label: "💍 Jewelry & Accessories" },
  { value: "toys", label: "🧸 Toys & Games" },
  { value: "other", label: "🏪 Other" },
];

const STEPS = [
  { id: 1, label: "Admin Info", icon: User },
  { id: 2, label: "Store Info", icon: Store },
  { id: 3, label: "Your Link", icon: Link2 },
];

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");

  const [form, setForm] = useState({
    adminName: "",
    adminEmail: "",
    password: "",
    storeName: "",
    slug: "",
    location: "",
    phone: "",
    storeType: "",
  });

  // Auto-generate slug from store name
  useEffect(() => {
    if (form.storeName && step === 2) {
      const generated = generateSlug(form.storeName);
      setForm((f) => ({ ...f, slug: generated }));
    }
  }, [form.storeName]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!form.slug || form.slug.length < 2) {
      setSlugAvailable(null);
      return;
    }
    setSlugChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-slug?slug=${form.slug}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.slug]);

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!form.adminName.trim()) errs.adminName = "Name is required";
      if (!form.adminEmail.trim() || !/\S+@\S+\.\S+/.test(form.adminEmail))
        errs.adminEmail = "Valid email required";
      if (!form.password || form.password.length < 8)
        errs.password = "Password must be at least 8 characters";
    }
    if (step === 2) {
      if (!form.storeName.trim()) errs.storeName = "Store name is required";
      if (!form.location.trim()) errs.location = "Location is required";
      if (!form.phone.trim()) errs.phone = "Phone number is required";
      if (!form.storeType) errs.storeType = "Please select a store type";
    }
    if (step === 3) {
      if (!form.slug || form.slug.length < 2)
        errs.slug = "Choose a store handle";
      if (slugAvailable === false) errs.slug = "This handle is already taken";
      if (slugChecking) errs.slug = "Please wait, checking availability...";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ global: data.error || "Something went wrong" });
        return;
      }
      setCreatedSlug(form.slug);
      setSuccess(true);
    } catch {
      setErrors({ global: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const storeUrl = `${form.slug}.${process.env.NEXT_PUBLIC_APP_DOMAIN || "yoursaas.com"}`;
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center animate-fade-up">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-3">
            Your store is <span className="text-accent">live!</span>
          </h1>
          <p className="text-muted mb-8">
            Congratulations {form.adminName}! Your store is ready to go.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8">
            <p className="text-xs font-mono text-muted mb-2 uppercase tracking-wider">
              Your store link
            </p>
            <div className="font-mono text-lg text-accent font-medium break-all">
              {storeUrl}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigator.clipboard.writeText(storeUrl)}
              className="w-full py-3 border border-white/10 rounded-lg text-sm font-mono hover:border-white/30 transition-all hover:bg-white/5"
            >
              Copy link
            </button>
            <Link
              href="/login"
              className="w-full py-3 bg-accent text-paper rounded-lg text-sm font-semibold hover:bg-accent/90 transition-all text-center"
            >
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/5">
        <Link href="/" className="font-display text-xl font-bold">
          Store<span className="text-accent">Forge</span>
        </Link>
        <span className="text-muted text-sm font-mono">
          Step {step} of {STEPS.length}
        </span>
      </nav>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${(step / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isDone = s.id < step;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                      isActive
                        ? "bg-accent text-paper"
                        : isDone
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/5 text-muted"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-px w-4 ${isDone ? "bg-accent/50" : "bg-white/10"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* STEP 1: Admin Info */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h2 className="font-display text-3xl font-bold mb-1">
                Who are you?
              </h2>
              <p className="text-muted mb-8">
                This is your admin account to manage the store.
              </p>

              <div className="space-y-4">
                <Field label="Full Name" error={errors.adminName}>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.adminName}
                    onChange={(e) => set("adminName", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-paper placeholder-muted/50 focus:border-accent/50 focus:bg-white/8 transition-all font-body"
                  />
                </Field>

                <Field label="Email Address" error={errors.adminEmail}>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={form.adminEmail}
                    onChange={(e) => set("adminEmail", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-paper placeholder-muted/50 focus:border-accent/50 focus:bg-white/8 transition-all font-body"
                  />
                </Field>

                <Field label="Password" error={errors.password}>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-paper placeholder-muted/50 focus:border-accent/50 focus:bg-white/8 transition-all font-body"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-paper transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* STEP 2: Store Info */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h2 className="font-display text-3xl font-bold mb-1">
                About your store
              </h2>
              <p className="text-muted mb-8">
                Tell us about what you're selling.
              </p>

              <div className="space-y-4">
                <Field label="Store Name" error={errors.storeName}>
                  <input
                    type="text"
                    placeholder="Nike Lebanon"
                    value={form.storeName}
                    onChange={(e) => set("storeName", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-paper placeholder-muted/50 focus:border-accent/50 transition-all font-body"
                  />
                </Field>

                <Field label="Location" error={errors.location}>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="Beirut, Lebanon"
                      value={form.location}
                      onChange={(e) => set("location", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-11 text-paper placeholder-muted/50 focus:border-accent/50 transition-all font-body"
                    />
                  </div>
                </Field>

                <Field label="Phone Number" error={errors.phone}>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="tel"
                      placeholder="+961 70 000 000"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-11 text-paper placeholder-muted/50 focus:border-accent/50 transition-all font-body"
                    />
                  </div>
                </Field>

                <Field label="Type of Store" error={errors.storeType}>
                  <div className="grid grid-cols-2 gap-2">
                    {STORE_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => set("storeType", t.value)}
                        className={`px-3 py-2.5 rounded-lg border text-sm text-left transition-all ${
                          form.storeType === t.value
                            ? "border-accent bg-accent/10 text-paper"
                            : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-paper"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* STEP 3: Store handle / slug */}
          {step === 3 && (
            <div className="animate-fade-up">
              <h2 className="font-display text-3xl font-bold mb-1">
                Choose your link
              </h2>
              <p className="text-muted mb-8">
                This is the unique address for your store.
              </p>

              <Field label="Store Handle" error={errors.slug}>
                <div className="flex items-center border border-white/10 bg-white/5 rounded-lg overflow-hidden focus-within:border-accent/50 transition-all">
                  <span className="px-4 py-3 text-muted font-mono text-sm border-r border-white/10 whitespace-nowrap bg-white/5">
                    storename.
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => set("slug", generateSlug(e.target.value))}
                    placeholder="yourstore"
                    className="flex-1 px-4 py-3 bg-transparent text-paper placeholder-muted/50 font-mono text-sm"
                  />
                  <div className="px-3">
                    {slugChecking && (
                      <Loader2 className="w-4 h-4 text-muted animate-spin" />
                    )}
                    {!slugChecking && slugAvailable === true && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    {!slugChecking && slugAvailable === false && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              </Field>

              {form.slug && (
                <div className="mt-4 p-4 rounded-lg bg-white/3 border border-white/5">
                  <p className="text-xs font-mono text-muted mb-1 uppercase tracking-wider">
                    Your store link will be:
                  </p>
                  <p className="font-mono text-accent text-sm">
                    {form.slug}.
                    {process.env.NEXT_PUBLIC_APP_DOMAIN || "yoursaas.com"}
                  </p>
                </div>
              )}

              {slugAvailable === false && (
                <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  This handle is taken. Try adding your city or a number.
                </p>
              )}
              {slugAvailable === true && (
                <p className="mt-3 text-sm text-green-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  This handle is available!
                </p>
              )}

              {errors.global && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.global}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 text-muted hover:text-paper transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 text-muted hover:text-paper transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-3 px-6 py-3 bg-accent text-paper rounded-lg font-semibold hover:bg-accent/90 transition-all"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  slugAvailable === false ||
                  slugChecking ||
                  !form.slug
                }
                className="flex items-center gap-3 px-6 py-3 bg-accent text-paper rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Launch Store
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-paper/80 mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
