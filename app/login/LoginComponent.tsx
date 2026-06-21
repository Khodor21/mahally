"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Emoji } from "emoji-picker-react"; // استيراد مكون الإيموجي

export default function LoginComponent() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("الإيميل أو كلمة المرور غير صحيحة");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center py-10 md:py-16">
        <div className="w-full px-3 md:px-12 mx-auto">
          <div className="px-3 py-6 md:p-8">
            {/* Title */}
            <h1
              className="text-[34px] md:text-[42px] leading-[1.15] text-brand-dark flex items-center justify-center gap-3 mb-3"
              style={{ fontFamily: "Lalezar, cursive" }}
            >
              أهلاً بعودتك
              <Emoji unified="1f44b" size={38} /> {/* استخدام الإيموجي هنا */}
            </h1>

            <p className="text-[#6B6B6B] text-center text-[15px] md:text-[16px] leading-[1.9] mb-8">
              سجّل دخولك وكفّي إدارة متجرك، الطلبات، والزبائن من مكان واحد.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">
                  البريد الإلكتروني
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-[52px] md:h-[58px] rounded border border-[#f3ede5] bg-gray-50 px-5 text-[#1E1E1E] placeholder:text-[#A1A1A1] text-sm outline-none focus:border-[#C8392B] focus:bg-white"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-[#1E1E1E]">
                    كلمة المرور
                  </label>

                  <button
                    type="button"
                    className="text-[13px] text-brand-dark hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    required
                    className="w-full h-[52px] md:h-[58px] rounded border border-[#f3ede5] bg-gray-50 px-5 pl-14 text-[#1E1E1E] placeholder:text-[#A1A1A1] outline-none focus:border-[#C8392B] focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8B8B8B]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[60px] rounded bg-brand-dark text-white font-bold flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    دخول إلى لوحة التحكم
                    <ArrowLeft className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-4 text-sm text-[#8B8B8B]">أو</span>
              </div>
            </div>

            {/* Create account */}
            <div className="p-5 text-center">
              <h3 className="text-[#1E1E1E] font-bold text-lg">
                بعدك ما عندك متجر؟
              </h3>

              <p className="text-[#6B6B6B] mb-4">
                افتح متجرك خلال دقائق وابدأ البيع مباشرة.
              </p>

              <Link
                href="/onboarding"
                className="text-base inline-flex items-center underline justify-center text-brand-dark font-bold"
              >
                أنشئ متجرك مجاناً
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
