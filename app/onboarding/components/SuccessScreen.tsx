"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Copy, ArrowLeft } from "lucide-react";
import { Emoji } from "emoji-picker-react";

export function SuccessScreen({ slug }: { slug: string }) {
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
          <h1 className="text-3xl md:text-4xl text-green-600 mb-4 flex items-center justify-center gap-3 leading-tight">
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
            يلا نبدأ، تسجيل الدخول
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
