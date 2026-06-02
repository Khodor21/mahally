"use client";

import { useMemo, useRef } from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

import ProductCard from "./ProductCard";

type Product = {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock?: number;
  images?: string[];
  created_at?: string;
};

type ProductGridProps = {
  title: string;
  products: Product[]; // ✅ FIXED (was broken)
  bannerSrc?: string;
  bannerType?: "wide" | "mono";
};

export default function ProductGrid({
  title,
  products,
  bannerSrc,
  bannerType = "wide",
}: ProductGridProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isMono = bannerType === "mono";

  const mappedProducts = useMemo(() => {
    return products.map((product) => ({
      id: product.id,
      title: product.title,
      image:
        product.images?.[0] || "https://placehold.co/600x600/png?text=Product",
      price: product.price,
      rating: 5,
      badge: product.stock && product.stock > 0 ? "Available" : "Out of stock",
    }));
  }, [products]);

  const isLoading = !products;

  return (
    <section className="w-full space-y-5">
      {/* MONO BANNER */}
      {isMono && bannerSrc && (
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="lg:w-[28%] w-full rounded-2xl overflow-hidden border border-[rgb(244_242_245)]">
            <img
              src={bannerSrc}
              alt=""
              className="w-full h-full object-cover"
              style={{ aspectRatio: "1.25 / 1.5" }}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-[rgb(60_28_84)]">
                {title}
              </h2>

              <button className="flex items-center gap-1 text-sm font-semibold text-[rgb(60_28_84)]/60 hover:text-[rgb(60_28_84)] transition-colors">
                View All
                <MdOutlineKeyboardArrowRight
                  className="hidden md:block"
                  size={18}
                />
              </button>
            </div>

            {mappedProducts.length === 0 ? (
              <div className="py-10 text-sm text-[rgb(60_28_84)]/50">
                No products found
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {mappedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex-none w-[50vw] sm:w-[45vw] md:w-[31vw] lg:w-[20%]"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WIDE BANNER */}
      {!isMono && bannerSrc && (
        <div className="rounded-2xl overflow-hidden border border-[rgb(244_242_245)]">
          <img
            src={bannerSrc}
            alt=""
            className="w-full h-full object-cover"
            style={{ aspectRatio: "4 / 1.8" }}
          />
        </div>
      )}

      {/* TITLE */}
      {!(isMono && bannerSrc) && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-[rgb(60_28_84)]">
            {title}
          </h2>

          <button className="flex items-center gap-1 text-sm font-semibold text-[rgb(60_28_84)]/60 hover:text-[rgb(60_28_84)] transition-colors">
            View All
            <MdOutlineKeyboardArrowRight
              className="hidden md:block"
              size={18}
            />
          </button>
        </div>
      )}

      {/* PRODUCTS (NORMAL MODE) */}
      {!(isMono && bannerSrc) && (
        <>
          {mappedProducts.length === 0 ? (
            <div className="py-10 text-sm text-[rgb(60_28_84)]/50">
              No products found
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {mappedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-none w-[72vw] sm:w-[45vw] md:w-[31vw] lg:w-[260px]"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
