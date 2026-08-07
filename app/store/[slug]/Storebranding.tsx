"use client";

import Image from "next/image";

type StoreBrandingProps = {
  logo_url?: string;
  store_name: string;
  description?: string;
  lang?: "ar" | "en";
};

export default function StoreBranding({
  logo_url,
  store_name,
  description,
  lang = "en",
}: StoreBrandingProps) {
  const isRtl = lang === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="w-full flex flex-col items-center gap-6 py-8 md:py-12 px-4"
    >
      {/* Logo */}
      {logo_url && (
        <div className="relative w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-lg bg-gray-50 border border-gray-200">
          <Image
            src={logo_url}
            alt={store_name}
            fill
            className="object-contain p-2"
            priority
          />
        </div>
      )}

      {/* Store Name */}
      <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-900 tracking-tight">
        {store_name}
      </h1>

      {/* Description */}
      {description && (
        <p className="max-w-2xl text-sm md:text-base text-gray-600 text-center leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
