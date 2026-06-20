// app/components/ProductGrid.tsx
"use client";

import { useMemo, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import ProductCard from "./ProductCard";

type Product = {
  id: string | number;
  title: string;
  description?: string;
  price: number;
  stock?: number;
  images?: string[];
  created_at?: string;
  storeSlug?: string;
};

type ProductGridProps = {
  title: string;
  products: Product[];
  bannerSrc?: string;
  bannerType?: "wide" | "mono";
  storeSlug: string;
  lang: "en" | "ar";
};

type MappedProduct = {
  id: string;
  title: string;
  image: string;
  price: number;
  rating: number;
  badge?: "New" | "Best Seller" | "Hot" | "Sale";
};

export default function ProductGrid({
  title,
  products,
  storeSlug,
  bannerSrc,
  bannerType = "wide",
  lang,
}: ProductGridProps) {
  const scrollRefMono = useRef<HTMLDivElement | null>(null);
  const scrollRefWide = useRef<HTMLDivElement | null>(null);
  const isMono = bannerType === "mono";
  const isRtl = lang === "ar";

  const viewAllText = isRtl ? "عرض الكل" : "View All";

  const mappedProducts: MappedProduct[] = useMemo(() => {
    return (products || []).map((product) => ({
      id: String(product.id),
      title: product.title || "Untitled Product",
      image:
        product.images?.[0] || "https://placehold.co/600x600/png?text=No+Image",
      price: product.price || 0,
      rating: 5,
      badge:
        product.stock !== undefined
          ? product.stock > 0
            ? "New"
            : "Sale"
          : "Hot",
    }));
  }, [products]);

  // 👉 Robust Programmatic Scrolling with Boundary Loop Reset
  const scroll = (direction: "prev" | "next") => {
    const currentRef = isMono ? scrollRefMono.current : scrollRefWide.current;

    if (currentRef) {
      const scrollAmount = currentRef.clientWidth * 0.8;
      const { scrollLeft, scrollWidth, clientWidth } = currentRef;

      // Handle cyclic loop logic when clicking manual buttons
      if (direction === "next") {
        const isEnd = isRtl
          ? Math.abs(scrollLeft) >= scrollWidth - clientWidth - 15
          : scrollLeft + clientWidth >= scrollWidth - 15;
        if (isEnd) {
          currentRef.scrollTo({ left: 0, behavior: "smooth" });
          return;
        }
      } else {
        const isStart = isRtl ? scrollLeft >= 0 : scrollLeft <= 15;
        if (isStart) {
          currentRef.scrollTo({
            left: isRtl
              ? -(scrollWidth - clientWidth)
              : scrollWidth - clientWidth,
            behavior: "smooth",
          });
          return;
        }
      }

      let moveBy = direction === "next" ? scrollAmount : -scrollAmount;
      if (isRtl) {
        moveBy = -moveBy; // Invert movement axis for RTL
      }

      currentRef.scrollBy({ left: moveBy, behavior: "smooth" });
    }
  };

  // 👉 Dynamic 3-Second Auto-Scrolling (Active on all devices)
  useEffect(() => {
    if (!mappedProducts.length) return;

    const interval = setInterval(() => {
      const currentRef = isMono ? scrollRefMono.current : scrollRefWide.current;
      if (!currentRef) return;

      const { scrollLeft, scrollWidth, clientWidth } = currentRef;

      const isEnd = isRtl
        ? Math.abs(scrollLeft) >= scrollWidth - clientWidth - 15
        : scrollLeft + clientWidth >= scrollWidth - 15;

      if (isEnd) {
        currentRef.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const scrollAmount = clientWidth * 0.8;
        let moveBy = isRtl ? -scrollAmount : scrollAmount;
        currentRef.scrollBy({ left: moveBy, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [mappedProducts, isMono, isRtl]);

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      className="w-full py-6 md:py-10 mx-auto overflow-hidden"
    >
      {/* MONO LAYOUT (Side-by-Side) */}
      {isMono && bannerSrc && (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <div className="lg:w-[28%] w-full rounded-sm overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 shadow-sm">
            <img
              src={bannerSrc}
              alt={`${title} banner`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="flex items-center justify-between mb-6 px-2 md:px-0">
              <p className="text-xl md:text-2xl font-bold text-brand-primary tracking-tight">
                {title}
              </p>
              <button className="flex items-center underline text-xs font-medium text-brand-black/80 hover:text-[#111827] transition-colors duration-200">
                {viewAllText}
              </button>
            </div>

            {/* Carousel Container with Absolute Overlay Controls */}
            <div className="relative group/carousel w-full">
              {/* Left Edge Button: Previous in LTR, Next in RTL */}
              <button
                onClick={() => scroll(isRtl ? "next" : "prev")}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 transition-all hover:scale-105"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div
                ref={scrollRefMono}
                className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 md:px-0 items-stretch snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {mappedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex-none h-auto w-[42vw] sm:w-[35vw] md:w-[32vw] lg:w-[calc(28.5%-1rem)] snap-start"
                  >
                    <ProductCard
                      product={product}
                      storeSlug={storeSlug}
                      lang={lang}
                    />
                  </div>
                ))}
              </div>

              {/* Right Edge Button: Next in LTR, Previous in RTL */}
              <button
                onClick={() => scroll(isRtl ? "prev" : "next")}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 transition-all hover:scale-105"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WIDE LAYOUT */}
      {!isMono && (
        <div className="flex flex-col w-full min-w-0">
          {bannerSrc && (
            <div className="w-full aspect-[21/9] md:aspect-[3/1] rounded-xs overflow-hidden mb-8 md:mb-12 bg-gray-50 border border-gray-100 shadow-sm">
              <img
                src={bannerSrc}
                alt={`${title} banner`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between mb-4 px-2 md:px-0">
            <p className="text-xl md:text-2xl font-black text-[#111827] tracking-tight">
              {title}
            </p>
            <button className="flex items-center underline text-xs font-medium text-brand-black/80 hover:text-[#111827] transition-colors duration-200">
              {viewAllText}
            </button>
          </div>

          {/* Carousel Container with Absolute Overlay Controls */}
          <div className="relative group/carousel w-full">
            {/* Left Edge Button: Previous in LTR, Next in RTL */}
            <button
              onClick={() => scroll(isRtl ? "next" : "prev")}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 transition-all hover:scale-105"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={scrollRefWide}
              className="flex gap-2 md:gap-3 overflow-x-auto pb-4 px-2 md:px-0 items-stretch snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {mappedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-none h-auto w-[42vw] sm:w-[35vw] md:w-[31vw] lg:w-[calc(22.22%-1rem)] snap-start"
                >
                  <ProductCard
                    product={product}
                    storeSlug={storeSlug}
                    lang={lang}
                  />
                </div>
              ))}
            </div>

            {/* Right Edge Button: Next in LTR, Previous in RTL */}
            <button
              onClick={() => scroll(isRtl ? "prev" : "next")}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 transition-all hover:scale-105"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
