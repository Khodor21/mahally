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
    },
    en: {
      title: "Our Collection",
      subtitle: "Everything you need in one place",
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
      <section className="w-full py-4 px-2">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:flex md:justify-between w-full gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-[90%] md:w-full mx-auto aspect-[3/4] rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section id="categories" className="w-full px-2 md:px-10 mx-auto bg-white">
      <div className="w-full mx-auto">
        {/* HEADER */}
        <div className="text-center mb-4">
          <p className="text-2xl md:text-4xl font-bold text-brand-black mb-2">
            {t.title}
          </p>
          <p className="text-sm md:text-base text-brand-black/90 font-medium">
            {t.subtitle}
          </p>
          <div className="w-12 h-[3px] bg-[rgb(var(--color-brand-primary))] mx-auto rounded-full mt-3" />
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${encodeURIComponent(cat.title)}?lang=${lang}`}
              className="group flex flex-col justify-between h-full gap-3"
            >
              {/* IMAGE WRAPPER */}
              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-[rgb(244_242_245)] border border-[rgb(207_195_223)]">
                {cat.logo_url ? (
                  <Image
                    src={cat.logo_url}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-brand-black/30">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
              </div>

              {/* TITLE */}
              <p className="text-sm md:text-base font-medium text-brand-black group-hover:text-[rgb(var(--color-brand-primary))] transition-colors text-center">
                {cat.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
