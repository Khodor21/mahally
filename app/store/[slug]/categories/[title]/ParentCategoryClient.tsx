"use client";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Child {
  id: string;
  title: string;
  logo_url: string | null;
}

interface ParentCategoryData {
  id: string;
  title: string;
  banner_url: string | null;
  children: Child[];
}

export default function ParentCategoryClient({
  initialData,
  slug,
  lang,
}: {
  initialData: ParentCategoryData;
  slug: string;
  lang: "ar" | "en";
}) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const BreadcrumbIcon = dir === "rtl" ? ChevronLeft : ChevronRight;
  const t = {
    ar: { home: "الرئيسية", empty: "لا توجد أقسام فرعية حالياً" },
    en: { home: "Home", empty: "No subcategories yet" },
  }[lang];

  return (
    <div dir={dir} className="min-h-screen bg-white pb-16">
      {/* Breadcrumb */}
      <div className="py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="font-medium text-gray-400 flex items-center flex-wrap gap-2">
            <Link
              href={`/?lang=${lang}`}
              className="hover:text-brand-black transition-colors"
            >
              {t.home}
            </Link>
            <BreadcrumbIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-brand-black">{initialData.title}</span>
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="max-w-7xl mx-auto px-4 mt-4 mb-8 text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-brand-black">
          {initialData.title}
        </h1>
        <div className="w-12 h-[3px] bg-[rgb(var(--color-brand-primary))] mx-auto rounded-full mt-4" />
      </div>

      {/* Children Grid */}
      <div className="max-w-7xl mx-auto px-4">
        {initialData.children.length === 0 ? (
          <p className="text-center text-gray-400 py-20">{t.empty}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {initialData.children.map((child) => (
              <Link
                key={child.id}
                href={
                  (child as any).has_children
                    ? `/categories/${encodeURIComponent(child.title)}?lang=${lang}`
                    : `/category/${encodeURIComponent(child.title)}?lang=${lang}`
                }
                prefetch={false}
                className="group relative w-full aspect-[1/1.3] rounded-xl overflow-hidden cursor-pointer"
              >
                {child.logo_url ? (
                  <Image
                    src={child.logo_url}
                    alt={child.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-brand-black/30 text-xs md:text-sm font-medium">
                      No Image
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300" />
                <div className="absolute bottom-3 md:bottom-5 left-0 right-0 text-center px-2 md:px-4">
                  <p className="text-white text-sm md:text-lg font-semibold line-clamp-2 leading-tight">
                    {child.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
