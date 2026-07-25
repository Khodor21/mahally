"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  title: string;
  logo_url: string | null;
}

interface CategoriesSectionProps {
  storeId: string;
  lang: "en" | "ar";
}

export default function CategoriesSection({
  storeId,
  lang,
}: CategoriesSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const content = {
    ar: {
      title: "تشكيلتنا",
      subtitle: "كل ما تحتاجه في مكان واحد",
      shopNow: "تسوق الآن",
    },
    en: {
      title: "Our Collection",
      subtitle: "Everything you need in one place",
      shopNow: "Shop Now",
    },
  };

  const t = content[lang] || content.en;

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(
          `/api/categories?store_id=${storeId}&lang=${lang}`,
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const list = data?.data || data?.categories || data || [];
        setCategories(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [storeId, lang]);

  if (loading) {
    return (
      <section className="w-full py-8 px-2">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-full aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section
      id="categories"
      className="w-full px-2 md:px-10 mx-auto bg-white py-8 md:py-12"
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-2xl md:text-4xl font-bold text-brand-black mb-2">
            {t.title}
          </p>
          <p className="text-sm md:text-base text-brand-black/70 font-medium">
            {t.subtitle}
          </p>
          <div className="w-12 h-[3px] bg-[rgb(var(--color-brand-primary))] mx-auto rounded-full mt-4" />
        </div>

        {/* DESKTOP GRID - 4 columns */}
        <div className="hidden md:grid grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${encodeURIComponent(cat.title)}?lang=${lang}`}
              className="group relative w-full aspect-[1/1.3] rounded-xl overflow-hidden cursor-pointer"
            >
              {/* IMAGE */}
              {cat.logo_url ? (
                <Image
                  src={cat.logo_url}
                  alt={cat.title}
                  fill
                  sizes="25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-brand-black/30">No Image</span>
                </div>
              )}

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/75 transition-colors duration-300" />

              {/* CONTENT WRAPPER */}
              <div className="absolute bottom-4 left-0 right-0 text-center px-3">
                {/* TITLE */}
                <p className="text-white text-base md:text-lg font-semibold transition-colors">
                  {cat.title}
                </p>

                {/* SHOP NOW - appears on hover */}
                <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-300">
                  <p className="text-white text-sm font-medium mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {t.shopNow}
                    <span>{lang === "ar" ? "←" : "→"}</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* MOBILE VIEW - Featured + sidebar */}
        <div className="md:hidden">
          {categories.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {/* First item - featured (large) */}
              <Link
                href={`/category/${encodeURIComponent(categories[0].title)}?lang=${lang}`}
                className="group relative w-full aspect-[3/2] md:aspect-auto rounded-xl overflow-hidden cursor-pointer"
              >
                {categories[0].logo_url ? (
                  <Image
                    src={categories[0].logo_url}
                    alt={categories[0].title}
                    fill
                    sizes="100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-brand-black/30">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300" />
                <div className="absolute bottom-4 left-0 right-0 text-center px-3">
                  <p className="text-white text-lg md:text-xl font-semibold transition-colors">
                    {categories[0].title}
                  </p>
                  <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-300">
                    <p className="text-white text-sm font-medium mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {t.shopNow}
                      <span>{lang === "ar" ? "←" : "→"}</span>
                    </p>
                  </div>
                </div>
              </Link>

              {/* Remaining items - grid below */}
              {categories.length > 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {categories.slice(1).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${encodeURIComponent(cat.title)}?lang=${lang}`}
                      className="group relative w-full aspect-[1/1.3] rounded-lg overflow-hidden cursor-pointer"
                    >
                      {cat.logo_url ? (
                        <Image
                          src={cat.logo_url}
                          alt={cat.title}
                          fill
                          sizes="50vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-brand-black/30 text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/80 transition-colors duration-300" />
                      <div className="absolute bottom-3 left-0 right-0 text-center px-2">
                        <p className="text-white text-sm font-semibold transition-colors">
                          {cat.title}
                        </p>
                        <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-300">
                          <p className="text-white text-xs font-medium mt-1 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {t.shopNow}
                            <span>{lang === "ar" ? "←" : "→"}</span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
