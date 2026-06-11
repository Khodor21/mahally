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
  lang?: "en" | "ar";
}

export default function CategoriesSection({
  storeId,
  lang = "en",
}: CategoriesSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const dir = lang === "ar" ? "rtl" : "ltr";

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

  const t = content[lang];
  useEffect(() => {
    async function fetchCategories() {
      try {
        // 👇 FIX: Changed storeId= to store_id= in the URL string
        const res = await fetch(`/api/categories?store_id=${storeId}`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // The backend returns an array directly, but keeping your fallbacks is safe
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
  }, [storeId]);
  if (loading) {
    return (
      <section className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section dir={dir} className="w-full bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-extrabold text-brand-black mb-2">
            {t.title}
          </h2>
          <p className="text-sm md:text-base text-brand-black/50 font-medium">
            {t.subtitle}
          </p>

          <div className="w-12 h-[3px] bg-[rgb(60_28_84)] mx-auto rounded-full mt-3" />
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="group flex flex-col items-center gap-3"
            >
              {/* IMAGE */}
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[rgb(244_242_245)] border border-[rgb(207_195_223)]">
                {cat.logo_url ? (
                  <Image
                    src={cat.logo_url}
                    alt={cat.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-brand-black/30">
                    No Image
                  </div>
                )}

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
              </div>

              {/* TITLE */}
              <p className="text-sm md:text-base font-bold text-brand-black group-hover:text-[rgb(60_28_84)] transition-colors text-center">
                {cat.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
