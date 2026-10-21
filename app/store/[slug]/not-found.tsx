// app/store/[slug]/not-found.tsx
"use client";

import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
      dir="rtl"
    >
      <p className="text-6xl md:text-7xl text-brand-primary font-medium leading-none tracking-tighter">
        4<span className="text-brand-primary/60">0</span>4
      </p>

      <h3 className="mt-4 text-xl text-black mb-2">
        عذراً، الصفحة غير موجودة!
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        قد يكون الرابط الذي اتبعته غير صحيح، أو تم نقل الصفحة أو إزالتها نهائياً
        من الموقع.
      </p>

      <Link
        href="/"
        className="px-4 py-2 bg-brand-primary rounded-sm text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
}
