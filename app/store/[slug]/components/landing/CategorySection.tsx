"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface Category {
  id: string;
  title: string;
  logo_url: string | null;
}

// Loosened type to allow Title Case inputs safely without TS errors
type DisplayStyle = "grid" | "circle" | string;

interface CategoriesSectionProps {
  storeId: string;
  lang: "en" | "ar";
  displayStyle?: DisplayStyle;
}

const content = {
  ar: {
    title: "تشكيلتنا",
    subtitle: "كل ما تحتاجه في مكان واحد",
    shopNow: "تسوق الآن",
    seeMore: "عرض المزيد",
  },
  en: {
    title: "Our Collection",
    subtitle: "Everything you need in one place",
    shopNow: "Shop Now",
    seeMore: "See More",
  },
};

export default function CategoriesSection({
  storeId,
  lang,
  displayStyle = "grid",
}: CategoriesSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const gridCarouselRef = useRef<HTMLDivElement>(null);

  const t = content[lang] ?? content.en;
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Safely normalize the display style to handle "Grid" or "Circle" inputs
  const normalizedStyle =
    String(displayStyle).toLowerCase() === "circle" ? "circle" : "grid";

  useEffect(() => {
    // Silently sync the storeId to localStorage to keep URLs clean on navigation
    if (storeId) {
      window.localStorage.setItem("store_id", storeId);
    }

    async function fetchCategories() {
      try {
        const res = await fetch(
          `/api/categories?store_id=${storeId}&lang=${lang}`,
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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

  const isCarousel = categories.length > 4;

  // Auto-scroll logic for the grid carousel
  useEffect(() => {
    if (!isCarousel || normalizedStyle !== "grid") return;

    const gridContainer = gridCarouselRef.current;
    let intervalId: NodeJS.Timeout;
    let isInteracting = false;

    const setInteraction = () => {
      isInteracting = true;
    };
    const clearInteraction = () => {
      isInteracting = false;
    };

    if (gridContainer) {
      intervalId = setInterval(() => {
        if (!isInteracting && gridContainer) {
          const firstChild = gridContainer.firstElementChild as HTMLElement;
          if (firstChild) {
            const itemWidth = firstChild.getBoundingClientRect().width;
            const gap = window.innerWidth < 768 ? 16 : 24; // gap-4 (16px) or gap-6 (24px)
            const scrollAmount = itemWidth + gap;

            const maxScroll =
              gridContainer.scrollWidth - gridContainer.clientWidth;
            const currentScroll = Math.abs(gridContainer.scrollLeft);

            // If reached the end, snap back to start. Otherwise, scroll to next.
            if (currentScroll >= maxScroll - 10) {
              gridContainer.scrollTo({ left: 0, behavior: "smooth" });
            } else {
              gridContainer.scrollBy({
                left: dir === "rtl" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
              });
            }
          }
        }
      }, 3000); // Scrolls every 3 seconds

      // Pause auto-scroll on interaction
      gridContainer.addEventListener("mouseenter", setInteraction);
      gridContainer.addEventListener("mouseleave", clearInteraction);
      gridContainer.addEventListener("touchstart", setInteraction, {
        passive: true,
      });
      gridContainer.addEventListener("touchend", clearInteraction, {
        passive: true,
      });
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (gridContainer) {
        gridContainer.removeEventListener("mouseenter", setInteraction);
        gridContainer.removeEventListener("mouseleave", clearInteraction);
        gridContainer.removeEventListener("touchstart", setInteraction);
        gridContainer.removeEventListener("touchend", clearInteraction);
      }
    };
  }, [isCarousel, normalizedStyle, dir]);

  // ─── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="w-full py-8 md:py-12 px-4 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-8 md:mb-12">
            <div className="h-8 md:h-10 w-48 bg-gray-200 animate-pulse rounded-md mb-3" />
            <div className="h-4 md:h-5 w-64 bg-gray-200 animate-pulse rounded-md" />
            <div className="w-12 h-[3px] bg-gray-300 mx-auto rounded-full mt-4" />
          </div>
          {normalizedStyle === "circle" ? (
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-200 animate-pulse" />
                  <div className="w-16 h-3 rounded bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full aspect-[1/1.3] rounded-xl bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section
      id="categories"
      className="w-full px-4 md:px-10 mx-auto bg-white py-3"
      dir={dir}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-2xl md:text-4xl font-bold text-brand-black mb-2">
            {t.title}
          </p>
          <p className="text-sm md:text-base text-brand-black/70 font-medium">
            {t.subtitle}
          </p>
          <div className="w-12 h-[3px] bg-[rgb(var(--color-brand-primary))] mx-auto rounded-full mt-4" />
        </div>

        {/* Grid style */}
        {normalizedStyle === "grid" && (
          <>
            {isCarousel ? (
              <div
                ref={gridCarouselRef}
                className="flex overflow-x-auto gap-4 md:gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${encodeURIComponent(cat.title)}?lang=${lang}`}
                    className="group relative flex-none w-[calc(50%-8px)] md:w-[calc(25%-18px)] aspect-[1/1.3] rounded-xl overflow-hidden cursor-pointer snap-start"
                  >
                    {cat.logo_url ? (
                      <Image
                        src={cat.logo_url}
                        alt={cat.title}
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
                        {cat.title}
                      </p>
                      <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-300">
                        <p className="text-white/90 text-xs md:text-sm font-medium mt-1.5 md:mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {t.shopNow}
                          <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">
                            {lang === "ar" ? "←" : "→"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${encodeURIComponent(cat.title)}?lang=${lang}`}
                    className="group relative w-full aspect-[1/1.3] rounded-xl overflow-hidden cursor-pointer"
                  >
                    {cat.logo_url ? (
                      <Image
                        src={cat.logo_url}
                        alt={cat.title}
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
                        {cat.title}
                      </p>
                      <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-300">
                        <p className="text-white/90 text-xs md:text-sm font-medium mt-1.5 md:mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {t.shopNow}
                          <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">
                            {lang === "ar" ? "←" : "→"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Circle style */}
        {normalizedStyle === "circle" && (
          <>
            {isCarousel ? (
              <div className="flex overflow-x-auto gap-4 md:gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1 py-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${encodeURIComponent(cat.title)}?lang=${lang}`}
                    className="group flex flex-col items-center gap-3 cursor-pointer flex-none w-[calc(25%-12px)] md:w-auto snap-start"
                  >
                    <div className="relative mx-auto w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[rgb(var(--color-brand-primary))] transition-colors duration-300 shadow-sm">
                      {cat.logo_url ? (
                        <Image
                          src={cat.logo_url}
                          alt={cat.title}
                          fill
                          sizes="(max-width: 768px) 80px, 112px"
                          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-[rgb(var(--color-brand-primary))] transition-colors text-center line-clamp-2 max-w-[90px] md:max-w-[120px] leading-snug">
                      {cat.title}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${encodeURIComponent(cat.title)}?lang=${lang}`}
                    className="group flex flex-col items-center gap-3 cursor-pointer"
                  >
                    <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[rgb(var(--color-brand-primary))] transition-colors duration-300 shadow-sm">
                      {cat.logo_url ? (
                        <Image
                          src={cat.logo_url}
                          alt={cat.title}
                          fill
                          sizes="(max-width: 768px) 80px, 112px"
                          className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-[rgb(var(--color-brand-primary))] transition-colors text-center line-clamp-2 max-w-[90px] md:max-w-[120px] leading-snug">
                      {cat.title}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* See More Button - Removed store_id from href */}
        {categories.length > 0 && (
          <div className="mt-8 md:mt-12 flex justify-center">
            <Link
              href={`/categories?lang=${lang}`}
              className="inline-flex items-center justify-center px-6 py-2.5 md:px-8 md:py-3 rounded-full border-2 border-[rgb(var(--color-brand-primary))] text-[rgb(var(--color-brand-primary))] hover:bg-[rgb(var(--color-brand-primary))] hover:text-white font-semibold text-sm md:text-base transition-colors duration-300 shadow-sm"
            >
              {t.seeMore}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
