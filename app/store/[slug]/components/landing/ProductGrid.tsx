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
    <section className="w-full py-8 md:py-16 px-4 md:px-8 mx-auto overflow-hidden">
      {isMono && bannerSrc && (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <div className="lg:w-[28%] w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
            <img
              src={bannerSrc}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <button className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-black transition-colors">
                View All
                <MdOutlineKeyboardArrowRight size={20} />
              </button>
            </div>

            <div
              ref={scrollRef}
              // items-stretch ensures all flex children match the height of the tallest item
              className="flex gap-2 overflow-x-auto pb-4 pt-2 px-1 items-stretch snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {mappedProducts.map((product) => (
                <div
                  key={product.id}
                  // Added h-full to make the wrapper fill the stretched height
                  className="flex-none h-auto w-[75vw] sm:w-[45vw] md:w-[32vw] lg:w-[calc(28.5%-1rem)] snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isMono && (
        <div className="flex flex-col w-full min-w-0">
          {/* Centered Title */}
          <div className="flex justify-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
              {title}
            </h2>
          </div>

          {/* Product Carousel / Grid */}
          <div
            ref={scrollRef}
            // Reduced gap slightly, added items-stretch for uniform card heights
            className="flex gap-3 md:gap-4 overflow-x-auto pb-6 pt-2 px-1 items-stretch snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {mappedProducts.map((product) => (
              <div
                key={product.id}
                // Added h-full so the wrapper matches the stretched row height
                className="flex-none h-auto w-[75vw] sm:w-[45vw] md:w-[31vw] lg:w-[calc(22.22%-1rem)] snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
