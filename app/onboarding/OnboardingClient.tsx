"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Copy,
} from "lucide-react";

// ===============================
// CONSTANTS
// ===============================

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
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(DEFAULT_FORM);

  const [loading, setLoading] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [errors, setErrors] = useState({});

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

  function validate(step) {
    const e = {};

    if (step === 1 && !form.email.includes("@")) e.email = "Invalid email";
    if (step === 2 && !form.firstName) e.firstName = "Required";
    if (step === 3 && !form.storeName) e.storeName = "Required";
    if (step === 4 && !form.slug) e.slug = "Required";
    if (step === 5 && form.password.length < 8) e.password = "Weak password";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ===============================
  // SUBMIT (CREATE + AUTO LOGIN)
  // ===============================

  const handleSubmit = async () => {
    if (!validate(5)) return;

    setLoading(true);

    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ global: data.error });
        return;
      }

      // AUTO LOGIN
      const login = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!login?.ok) {
        setErrors({ global: "Login failed after signup" });
        return;
      }

      localStorage.removeItem(STORAGE_KEY);
      window.location.href = "/dashboard";
    } catch (err) {
      setErrors({ global: "Server error" });
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UI (minimal placeholder structure)
  // ===============================

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1>Onboarding Step {step}</h1>

        {errors.global && <p>{errors.global}</p>}

        {step === 5 && (
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Loading..." : "Create Account"}
          </button>
        )}
      </div>
    </div>
  );
}
