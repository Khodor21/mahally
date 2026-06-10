"use client";

import { useMemo, useState } from "react";
import { Lock, MapPin, Phone, User } from "lucide-react";
import Toast from "../components/Toast";
import { authTranslations } from "../i18n";
import { useRouter } from "next/navigation";

const governorates = [
  "Beirut",
  "Mount Lebanon",
  "North",
  "Akkar",
  "Bekaa",
  "Baalbek-Hermel",
  "South",
  "Nabatieh",
];

type Props = {
  storeId: string;
  lang?: "en" | "ar";
};

export default function CustomerAuth({ storeId, lang = "ar" }: Props) {
  const router = useRouter();
  const tr = authTranslations[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+961",
    governorate: "",
    password: "",
  });

  const title = useMemo(() => {
    return mode === "signup" ? tr.signup : tr.welcomeBack;
  }, [mode, tr]);

  async function handleSubmit() {
    try {
      if (!form.phone || form.phone === "+961" || !form.password) {
        setToast({ message: tr.missingFields, type: "error" });
        return;
      }

      if (
        mode === "signup" &&
        (!form.firstName.trim() || !form.lastName.trim() || !form.governorate)
      ) {
        setToast({ message: tr.missingFields, type: "error" });
        return;
      }

      setLoading(true);

      const endpoint =
        mode === "signup"
          ? "/api/store-customers"
          : "/api/store-customers/login";

      const payload =
        mode === "signup"
          ? {
              storeId,
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              phone: form.phone.trim(),
              governorate: form.governorate,
              password: form.password,
            }
          : {
              storeId,
              phone: form.phone.trim(),
              password: form.password,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        setToast({
          message:
            data.message === "Phone already exists"
              ? tr.alreadyExists
              : data.message || tr.invalidCredentials,
          type: "error",
        });
        return;
      }

      // IMPORTANT: keep cookie logic ONLY in backend (you already do that)

      localStorage.setItem("store_customer", JSON.stringify(data.customer));

      setToast({
        message: mode === "signup" ? tr.successSignup : tr.successLogin,
        type: "success",
      });

      setTimeout(() => {
        // ✅ FIXED: correct tenant redirect instead of /profile
        router.push(`/store/${storeId}`);
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error("Auth error:", error);
      setToast({
        message: tr.invalidCredentials,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        dir={dir}
        className="relative overflow-hidden bg-brand-white border border-brand-light rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-6 md:p-8 max-w-xl mx-auto mb-24"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(60,28,84,0.03),transparent_50%)]" />

        <div className="relative mb-8 text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-brand-light text-brand-dark text-xs font-medium mb-5">
            {title}
          </div>

          <h2
            className="text-[30px] md:text-[42px] leading-[1.1] text-brand-dark mb-4"
            style={{ fontFamily: "Lalezar, cursive" }}
          >
            {mode === "signup" ? tr.createAccount : tr.login}
          </h2>

          <p className="text-brand-dark/60 text-sm leading-7 max-w-md mx-auto">
            {tr.authSubtitle}
          </p>
        </div>

        <div className="flex bg-brand-light rounded-2xl p-1 mb-7">
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-all ${
              mode === "signup"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-brand-dark"
            }`}
          >
            {tr.signup}
          </button>

          <button
            onClick={() => setMode("login")}
            className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-all ${
              mode === "login"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-brand-dark"
            }`}
          >
            {tr.login}
          </button>
        </div>

        <div className="space-y-5">
          {mode === "signup" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                icon={<User className="w-4 h-4" />}
                label={tr.firstName}
                value={form.firstName}
                onChange={(v) => setForm({ ...form, firstName: v })}
              />
              <InputField
                icon={<User className="w-4 h-4" />}
                label={tr.lastName}
                value={form.lastName}
                onChange={(v) => setForm({ ...form, lastName: v })}
              />
            </div>
          )}

          <InputField
            icon={<Phone className="w-4 h-4" />}
            label={tr.phone}
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
            placeholder="+96170123456"
          />

          {mode === "signup" && (
            <div>
              <label className="text-sm font-semibold text-brand-dark mb-2 block">
                {tr.governorate}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-4 text-brand-dark/40" />
                <select
                  value={form.governorate}
                  onChange={(e) =>
                    setForm({ ...form, governorate: e.target.value })
                  }
                  className="w-full h-12 rounded-2xl bg-brand-grey border border-brand-light px-12 text-sm outline-none focus:border-brand-dark transition-all"
                >
                  <option value="">{tr.selectGovernorate}</option>
                  {governorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <InputField
            type="password"
            icon={<Lock className="w-4 h-4" />}
            label={tr.password}
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-brand-dark hover:opacity-95 text-white text-sm font-semibold transition-all disabled:opacity-50"
          >
            {loading
              ? mode === "signup"
                ? tr.creating
                : tr.logging
              : mode === "signup"
                ? tr.createAccount
                : tr.loginNow}
          </button>
        </div>
      </div>
    </>
  );
}

// --- InputField Subcomponent ---
type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  type?: string;
  placeholder?: string;
};

function InputField({
  label,
  value,
  onChange,
  icon,
  type = "text",
  placeholder,
}: InputFieldProps) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-dark mb-2 block">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 rounded-2xl bg-brand-grey border border-brand-light px-12 text-sm outline-none focus:border-brand-dark transition-all text-brand-dark placeholder:text-brand-dark/40"
        />
      </div>
    </div>
  );
}
