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
  products: Product[];
  bannerSrc?: string;
  bannerType?: "wide" | "mono";
};

type MappedProduct = {
  id: string;
  title: string;
  image: string;
  price: number;
  rating: number;
  badge: "New" | "Best Seller" | "Hot" | "Sale";
};

export default function ProductGrid({
  title,
  products,
  bannerSrc,
  bannerType = "wide",
}: ProductGridProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isMono = bannerType === "mono";

  const mappedProducts: MappedProduct[] = useMemo(() => {
    return products.map((product) => ({
      id: String(product.id),
      title: product.title,
      image:
        product.images?.[0] || "https://placehold.co/600x600/png?text=Product",
      price: product.price,
      rating: 5,
      badge: product.stock ? (product.stock > 0 ? "New" : "Sale") : "Hot",
    }));
  }, [products]);

  return (
    <section className="w-full space-y-5">
      {isMono && bannerSrc && (
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="lg:w-[28%] w-full rounded-2xl overflow-hidden border border-[rgb(244_242_245)]">
            <img
              src={bannerSrc}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[rgb(60_28_84)]">
                {title}
              </h2>

              <button className="flex items-center gap-1 text-sm font-semibold text-[rgb(60_28_84)]/60">
                View All
                <MdOutlineKeyboardArrowRight size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2">
              {mappedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-none w-[50vw] sm:w-[45vw] md:w-[31vw] lg:w-[20%]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isMono && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[rgb(60_28_84)]">{title}</h2>

            <button className="text-sm font-semibold text-[rgb(60_28_84)]/60">
              View All
            </button>
          </div>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2">
            {mappedProducts.map((product) => (
              <div
                key={product.id}
                className="flex-none w-[72vw] sm:w-[45vw] md:w-[31vw] lg:w-[260px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
