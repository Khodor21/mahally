"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react"; // ← ADD THIS
import { useRouter } from "next/navigation";

const STORAGE_KEY = "mahalli_onboarding";

const STORE_TYPES = [
  { value: "fashion", label: "ملابس وأزياء", emoji: "👗" },
  { value: "electronics", label: "إلكترونيات", emoji: "📱" },
  { value: "food", label: "مأكولات ومشروبات", emoji: "🍔" },
  { value: "beauty", label: "تجميل وعناية", emoji: "💄" },
  { value: "home", label: "منزل وأثاث", emoji: "🏠" },
  { value: "sports", label: "رياضة وهوايات", emoji: "⚽" },
  { value: "books", label: "كتب وتعليم", emoji: "📚" },
  { value: "jewelry", label: "مجوهرات وإكسسوارات", emoji: "💍" },
  { value: "toys", label: "ألعاب أطفال", emoji: "🧸" },
  { value: "other", label: "متجر متنوع", emoji: "🏪" },
];

const STEPS = [
  { id: 1, label: "البريد" },
  { id: 2, label: "معلوماتك" },
  { id: 3, label: "متجرك" },
  { id: 4, label: "رابطك" },
  { id: 5, label: "كلمة المرور" },
];

// ===============================
// TYPES
// ===============================

type Errors = {
  email?: string;
  firstName?: string;
  storeName?: string;
  slug?: string;
  password?: string;
  global?: string;
};

// ===============================
// HELPERS
// ===============================

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);
}

const DEFAULT_FORM = {
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

// ===============================
// CLIENT COMPONENT
// ===============================

export default function OnboardingClient() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [form, setForm] = useState(DEFAULT_FORM);

  const [loading, setLoading] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const slugManuallyEdited = useRef(false);

  // ===============================
  // LOAD / SAVE LOCAL STORAGE
  // ===============================

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setForm(parsed.form || DEFAULT_FORM);
      setStep(parsed.step || 1);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step }));
  }, [form, step]);

  // ===============================
  // AUTO SLUG
  // ===============================

  useEffect(() => {
    if (slugManuallyEdited.current) return;
    if (!form.storeName) return;

    setForm((f) => ({
      ...f,
      slug: generateSlug(f.storeName),
    }));
  }, [form.storeName]);

  // ===============================
  // SLUG CHECK (debounced)
  // ===============================

  useEffect(() => {
    if (!form.slug || form.slug.length < 2) return;

    setSlugChecking(true);

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
    }, 500);

    return () => clearTimeout(t);
  }, [form.slug]);

  // ===============================
  // VALIDATION
  // ===============================

  function validate(step: number): boolean {
    const e: Errors = {};

    if (step === 1 && !form.email.includes("@")) e.email = "Invalid email";
    if (step === 2 && !form.firstName) e.firstName = "Required";
    if (step === 3 && !form.storeName) e.storeName = "Required";
    if (step === 4 && !form.slug) e.slug = "Required";
    if (step === 5 && form.password.length < 8) e.password = "Weak password";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ===============================
  // SUBMIT - NOW USES NextAuth signIn()
  // ===============================

  const handleSubmit = async () => {
    if (!validate(5)) return;

    setLoading(true);
    setErrors({});

    try {
      // ========================================
      // STEP 1: Create the store in database
      // ========================================
      const storeRes = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const storeData = await storeRes.json();

      if (!storeRes.ok) {
        // Store creation failed
        setErrors({ global: storeData.error || "Failed to create store" });
        setLoading(false);
        return;
      }

      // ========================================
      // STEP 2: Sign in with NextAuth
      // Use the same credentials provider as login page
      // ========================================
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false, // We handle redirect manually
      });

      if (signInResult?.error) {
        // SignIn failed - this shouldn't happen if store was created
        // but can occur if there's a timing issue
        console.error("SignIn error:", signInResult.error);
        setErrors({
          global:
            "متجرك تم إنشاؤه بنجاح، لكن حدث خطأ في تسجيل الدخول. يرجى تسجيل الدخول يدويًا.",
        });
        setLoading(false);
        return;
      }

      // ========================================
      // STEP 3: Success - Clean up and redirect
      // NextAuth's signIn() has established the session
      // ========================================
      localStorage.removeItem(STORAGE_KEY);

      // Redirect to dashboard
      // The user is now authenticated (session cookie is set)
      router.push("/dashboard");

      // Optional: wait a bit to ensure session is established
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Onboarding error:", error);
      setErrors({ global: "حدث خطأ في الخادم، يرجى المحاولة مجددًا" });
      setLoading(false);
    }
  };

  // ===============================
  // UI (Placeholder - your existing UI)
  // ===============================

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1>Onboarding Step {step}</h1>

        {errors?.global && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
            {errors.global}
          </div>
        )}

        {step === 5 && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2 bg-brand-dark text-white rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء متجري"}
          </button>
        )}
      </div>
    </div>
  );
}
