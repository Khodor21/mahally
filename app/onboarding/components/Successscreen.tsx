"use client";

import Link from "next/link";
import { CheckCircle, Copy, ArrowUpLeft } from "lucide-react";
import { useState } from "react";

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
      className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-5"
    >
      {/* Background texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #1a1a1a 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="w-full max-w-md relative">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#c8a97e]/20 blur-3xl pointer-events-none" />

        <div className="relative bg-white border border-[#e8e3db] rounded-3xl p-8 md:p-10 shadow-[0_4px_40px_rgba(0,0,0,0.06)] text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#f5f0e8] border border-[#e8e3db] flex items-center justify-center mx-auto mb-6 rotate-3">
            <CheckCircle className="w-8 h-8 text-[#1a1a1a]" strokeWidth={1.5} />
          </div>

          {/* Headline */}
          <h1
            className="text-4xl md:text-5xl text-[#1a1a1a] mb-3 leading-tight"
            style={{ fontFamily: "Lalezar, sans-serif" }}
          >
            متجرك صار حقيقي 🎉
          </h1>

          <p className="text-[#777] leading-relaxed text-sm mb-8 max-w-xs mx-auto">
            خلال دقائق، أنشأت حضورًا رقميًا كاملًا لنشاطك التجاري. ما راح ينتظر زبائنك كتير.
          </p>

          {/* URL Card */}
          <div className="bg-[#f5f0e8] border border-[#e8e3db] rounded-2xl p-5 mb-8 text-right">
            <p className="text-xs font-semibold text-[#aaa] uppercase tracking-widest mb-2">
              رابط متجرك
            </p>
            <p className="text-[#1a1a1a] font-bold text-lg break-all leading-snug">
              {slug}
              <span className="text-[#c8a97e]">.{domain}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCopy}
              className={`
                h-12 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300
                ${copied
                  ? "border-green-300 bg-green-50 text-green-700"
                  : "border-[#e8e3db] text-[#1a1a1a] hover:border-[#1a1a1a] hover:bg-[#f5f0e8]"
                }
              `}
            >
              <Copy className="w-4 h-4" />
              {copied ? "تم النسخ ✓" : "انسخ الرابط"}
            </button>

            <Link
              href="/login"
              className="h-12 rounded-2xl bg-[#1a1a1a] text-[#f5f0e8] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#333] transition-all duration-300 group"
            >
              ادخل للوحة التحكم
              <ArrowUpLeft className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}