"use client";

import { useMemo, useRef } from "react";
import {
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowLeft,
} from "react-icons/md";
import ProductCard from "./ProductCard";

type Product = {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock?: number;
  images?: string[];
  created_at?: string;
  storeSlug: string;
};

type ProductGridProps = {
  title: string;
  products: Product[];
  bannerSrc?: string;
  bannerType?: "wide" | "mono";
  storeSlug: string;
  lang?: "en" | "ar";
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
  lang = "ar", // Defaults to Arabic based on global system pref
}: ProductGridProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isMono = bannerType === "mono";

  // Dynamic RTL/LTR text and icons
  const viewAllText = lang === "ar" ? "عرض الكل" : "View All";
  const ArrowIcon =
    lang === "ar" ? MdOutlineKeyboardArrowLeft : MdOutlineKeyboardArrowRight;

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

  return (
    <section
      dir={lang === "ar" ? "rtl" : "ltr"}
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
              <p className="text-lg md:text-xl font-black text-[#111827] tracking-tight">
                {title}
              </p>
              <button className="flex items-center gap-1.5 text-sm font-bold text-brand-black/90 hover:text-[#111827] transition-colors duration-200 group">
                {viewAllText}
                <ArrowIcon
                  size={20}
                  className="transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 md:px-0 items-stretch snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {mappedProducts.map((product) => (
                <div
                  key={product.id}
                  // 👉 Changed w-[80vw] to w-[42vw] for perfectly calculated 2.25 cards on mobile
                  className="flex-none h-auto w-[42vw] sm:w-[35vw] md:w-[32vw] lg:w-[calc(28.5%-1rem)] snap-start"
                >
                  <ProductCard product={product} storeSlug={storeSlug} />
                </div>
              ))}
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

          <div className="flex items-center justify-between mb-2 md:mb-4 px-2 md:px-0">
            <p className="text-lg md:text-xl font-black text-[#111827] tracking-tight">
              {title}
            </p>
            <button className="flex items-center gap-1.5 text-sm font-bold text-brand-black/90 hover:text-[#111827] transition-colors duration-200 group">
              {viewAllText}
              <ArrowIcon
                size={20}
                className="transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
              />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto pb-4 px-2 md:px-0 items-stretch snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {mappedProducts.map((product) => (
              <div
                key={product.id}
                // 👉 Changed w-[80vw] to w-[42vw] for perfectly calculated 2.25 cards on mobile
                className="flex-none h-auto w-[42vw] sm:w-[35vw] md:w-[31vw] lg:w-[calc(22.22%-1rem)] snap-start"
              >
                <ProductCard product={product} storeSlug={storeSlug} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
