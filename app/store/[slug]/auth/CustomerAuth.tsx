"use client";

import { useState } from "react";
import { Eye, EyeOff, MapPin, Phone, User } from "lucide-react";
import Toast from "../components/Toast";
import { authTranslations } from "../i18n";
import { useRouter } from "next/navigation";

const governorates = [
  { en: "Beirut", ar: "بيروت" },
  { en: "Mount Lebanon", ar: "جبل لبنان" },
  { en: "North", ar: "الشمال" },
  { en: "Akkar", ar: "عكار" },
  { en: "Bekaa", ar: "البقاع" },
  { en: "Baalbek-Hermel", ar: "بعلبك - الهرمل" },
  { en: "South", ar: "الجنوب" },
  { en: "Nabatieh", ar: "النبطية" },
];

const countries = [
  {
    code: "LB",
    dial: "+961",
    flag: "🇱🇧",
    name: { en: "Lebanon", ar: "لبنان" },
  },
  { code: "SY", dial: "+963", flag: "🇸🇾", name: { en: "Syria", ar: "سوريا" } },
  {
    code: "JO",
    dial: "+962",
    flag: "🇯🇴",
    name: { en: "Jordan", ar: "الأردن" },
  },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: { en: "UAE", ar: "الإمارات" } },
  {
    code: "SA",
    dial: "+966",
    flag: "🇸🇦",
    name: { en: "Saudi Arabia", ar: "السعودية" },
  },
  {
    code: "KW",
    dial: "+965",
    flag: "🇰🇼",
    name: { en: "Kuwait", ar: "الكويت" },
  },
  { code: "QA", dial: "+974", flag: "🇶🇦", name: { en: "Qatar", ar: "قطر" } },
  {
    code: "BH",
    dial: "+973",
    flag: "🇧🇭",
    name: { en: "Bahrain", ar: "البحرين" },
  },
  { code: "OM", dial: "+968", flag: "🇴🇲", name: { en: "Oman", ar: "عمان" } },
  { code: "EG", dial: "+20", flag: "🇪🇬", name: { en: "Egypt", ar: "مصر" } },
  { code: "IQ", dial: "+964", flag: "🇮🇶", name: { en: "Iraq", ar: "العراق" } },
  { code: "US", dial: "+1", flag: "🇺🇸", name: { en: "USA", ar: "أمريكا" } },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: { en: "France", ar: "فرنسا" } },
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

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+961",
    governorate: "",
    password: "",
  });

  async function handleSubmit() {
    try {
      const fullPhone = `${selectedCountry.dial}${phoneNumber}`;
      if (!fullPhone || fullPhone === selectedCountry.dial || !form.password) {
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
              phone: fullPhone,
              governorate: form.governorate,
              password: form.password,
            }
          : { storeId, phone: fullPhone, password: form.password };

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

      localStorage.setItem("store_customer", JSON.stringify(data.customer));
      setToast({
        message: mode === "signup" ? tr.successSignup : tr.successLogin,
        type: "success",
      });
      setTimeout(() => {
        router.push(``);
        router.refresh();
      }, 1200);
    } catch (error) {
      setToast({ message: tr.invalidCredentials, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir={dir}
      className="w-full mx-auto bg-white py-12 px-6 lg:px-12 min-h-screen"
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-10 text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-3">
          {mode === "signup" ? tr.createAccount : tr.login}
        </h3>
        <p className="text-gray-500 text-sm">
          {mode === "signup"
            ? tr.authSubtitle
            : lang === "ar"
              ? "سجّل دخولك لمتابعة التسوق بسهولة وأمان"
              : "Log in to continue shopping easily and securely"}
        </p>
      </div>

      <div className="flex p-1 bg-gray-100 rounded-lg mb-8 max-w-sm mx-auto">
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === "signup" ? "bg-white text-[rgb(var(--color-brand-primary))] shadow-sm" : "text-gray-500"}`}
        >
          {tr.signup}
        </button>
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === "login" ? "bg-white text-[rgb(var(--color-brand-primary))] shadow-sm" : "text-gray-500"}`}
        >
          {tr.login}
        </button>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tr.phone}
          </label>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[rgb(var(--color-brand-primary))] focus-within:border-transparent transition-all">
            <div className="relative shrink-0">
              <select
                value={selectedCountry.code}
                onChange={(e) => {
                  const country = countries.find(
                    (c) => c.code === e.target.value,
                  );
                  if (country) setSelectedCountry(country);
                }}
                className="h-full py-2.5 pl-2 pr-1 bg-gray-50 border-r border-gray-300 appearance-none cursor-pointer focus:outline-none text-sm"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.dial} {country.name[lang]}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 min-w-0 px-4 py-2.5 outline-none bg-white text-black"
              placeholder="XX XXX XXX"
            />
          </div>
        </div>

        {mode === "signup" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tr.governorate}
            </label>
            <div className="relative">
              <MapPin
                className={`absolute top-3 w-4 h-4 text-gray-400 pointer-events-none ${
                  dir === "rtl" ? "right-3" : "left-3"
                }`}
              />
              <select
                value={form.governorate}
                onChange={(e) =>
                  setForm({ ...form, governorate: e.target.value })
                }
                className={`w-full bg-white text-black border border-gray-300 rounded-lg py-2.5 focus:ring-2 focus:ring-[rgb(var(--color-brand-primary))] outline-none transition-all appearance-none ${
                  dir === "rtl" ? "pr-10 pl-8" : "pl-10 pr-8"
                }`}
              >
                <option value="">{tr.selectGovernorate}</option>
                {governorates.map((gov) => (
                  <option key={gov.en} value={gov.en}>
                    {gov[lang]}
                  </option>
                ))}
              </select>
              <div
                className={`absolute top-3 pointer-events-none text-gray-400 ${
                  dir === "rtl" ? "left-3" : "right-3"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        <InputField
          type="password"
          icon={<User className="w-4 h-4" />}
          label={tr.password}
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 bg-[rgb(var(--color-brand-primary))] hover:opacity-90 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
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
  );
}

function InputField({
  label,
  value,
  onChange,
  icon,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  type?: string;
  placeholder?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {!isPassword && (
          <div className="absolute left-3 top-3 text-gray-400">{icon}</div>
        )}
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[rgb(var(--color-brand-primary))] outline-none transition-all ${
            isPassword ? "px-4 pr-10" : "pl-10 pr-4"
          } py-2.5`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
