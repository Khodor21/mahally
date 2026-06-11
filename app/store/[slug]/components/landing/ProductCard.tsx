"use client";

import Image from "next/image";
import Link from "next/link"; // 👉 Added Link for SEO-friendly navigation
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineEye,
  AiOutlineClose,
} from "react-icons/ai";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { BsCheckCircleFill, BsCreditCard } from "react-icons/bs";
import { useShop } from "@/app/store/context";
import { RiShoppingBag2Line } from "react-icons/ri";

type Product = {
  id: string | number;
  title: string;
  image: string;
  price?: number;
  rating?: number;
  badge?: keyof typeof BADGE_STYLES;
};

type ProductCardProps = {
  product: Product;
  storeSlug?: string;
};

const BADGE_STYLES = {
  New: "bg-[rgb(60_28_84)] text-white",
  "Best Seller": "bg-[rgb(207_195_223)] text-[rgb(60_28_84)]",
  Hot: "bg-rose-100 text-rose-700",
  Sale: "bg-emerald-100 text-emerald-700",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProductCard({ product, storeSlug }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, toggleFavorite, isFavorite, cartItems } = useShop();
  const productUrl = storeSlug
    ? `/${storeSlug}/product/${product.id}`
    : `/product/${product.id}`;
  const productId = String(product.id);
  const favorited = isFavorite(productId);

  const [added, setAdded] = useAddedFlash(5000);

  const normalizedProduct = {
    ...product,
    id: String(product.id),
  };

  const handleAddToCart = () => {
    addToCart(normalizedProduct);
    setAdded(true);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(normalizedProduct);
  };

  const formattedPrice = formatPrice(product.price ?? 0);

  if (!product) return null;

  return (
    <>
      {/* 👉 Make article relative so absolute children position themselves to it */}
      <article
        aria-label={product.title}
        className="group flex flex-col w-full h-full relative"
      >
        {/* 👉 1. THE INVISIBLE STRETCHED LINK */}
        {/* It has z-10 so it covers the image and text, but sits under z-20 buttons */}
        <Link
          href={productUrl}
          className="absolute inset-0 z-10"
          aria-label={`View ${product.title}`}
        />

        {/* IMAGE CONTAINER */}
        <div className="relative w-full aspect-[4/5] sm:h-64 overflow-hidden rounded-xl bg-[rgb(244_242_245)]/[0.7] transition-all duration-300">
          {/* ICONS LAYER 👉 Strict w-full left-0 positioning to force them perfectly over the image edges on mobile */}
          <div
            className="absolute z-20 flex pointer-events-none
                       w-full top-3 px-3 left-0 justify-between items-start 
                       md:top-auto md:bottom-4 md:px-0 md:justify-center md:gap-3"
          >
            <button
              onClick={(e) => {
                e.preventDefault(); // Safety to prevent link navigation
                e.stopPropagation();
                // Add quick view logic here if needed
              }}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm hover:scale-110 hover:text-[rgb(60_28_84)] transition-all pointer-events-auto"
            >
              <AiOutlineEye size={16} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault(); // Safety to prevent link navigation
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-all pointer-events-auto"
            >
              {favorited ? (
                <AiFillHeart size={16} className="text-rose-500" />
              ) : (
                <AiOutlineHeart
                  size={16}
                  className="text-gray-600 hover:text-[rgb(60_28_84)]"
                />
              )}
            </button>
          </div>

          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* BODY */}
        <div className="flex flex-col flex-1 pt-4 pb-1 px-1">
          <h3 className="text-sm md:text-base font-medium text-gray-800 line-clamp-2 text-center min-h-[2.5rem] md:min-h-[3rem]">
            {product.title}
          </h3>

          <div className="mt-auto flex flex-col items-center w-full">
            <p className="text-base md:text-lg font-bold text-[rgb(60_28_84)] text-center mt-1.5">
              {formattedPrice}
            </p>

            {/* 👉 Added relative and z-20 so it sits ABOVE the stretched link */}
            <button
              onClick={(e) => {
                e.preventDefault(); // Safety to prevent link navigation
                e.stopPropagation();
                handleAddToCart();
              }}
              className="relative z-20 w-full mt-4 flex items-center justify-center gap-1 py-2 rounded-sm text-sm font-semibold border transition-all duration-300 border-[rgb(60_28_84)] text-[rgb(60_28_84)] bg-white hover:bg-[rgb(60_28_84)] hover:text-white"
            >
              <RiShoppingBag2Line size={16} />
              إضافـة إلـى السلّـة
            </button>
          </div>
        </div>
      </article>

      {/* PREMIUM ADD TO CART TOAST */}
      {added && (
        <div className="fixed top-4 start-1/2 -translate-x-1/2 md:start-auto md:-translate-x-0 md:end-4 z-[100] w-[calc(100vw-2rem)] md:w-[400px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100 transition-all animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="h-1.5 w-full bg-emerald-500" />
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <button
              onClick={() => setAdded(false)}
              className="text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close"
            >
              <AiOutlineClose size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                تمت الإضافة إلى سلة التسوق
              </span>
              <BsCheckCircleFill className="text-emerald-500" size={18} />
            </div>
          </div>
          <div className="p-4 flex items-center justify-end gap-4">
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-sm font-bold text-gray-900 line-clamp-2 text-end">
                {product.title}
              </h4>
              <p className="text-sm font-bold text-[rgb(60_28_84)] mt-1.5 text-end">
                {formattedPrice}
              </p>
            </div>
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-[rgb(244_242_245)] border border-gray-100 flex-shrink-0">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-1 mix-blend-multiply"
              />
            </div>
          </div>
          <div className="px-4 pb-4 flex gap-3">
            <button
              onClick={() => {
                setAdded(false);
                router.push("/cart");
              }}
              className="flex-1 py-2.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-800 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <HiOutlineShoppingBag size={18} />
              عرض السلة
            </button>
            <button
              onClick={() => {
                setAdded(false);
                router.push("/checkout");
              }}
              className="flex-1 py-2.5 bg-[rgb(60_28_84)] rounded-sm text-xs font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <BsCreditCard size={18} />
              اتمام الطلب
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// unchanged hook
function useAddedFlash(duration = 5000): [boolean, (val: boolean) => void] {
  const [added, setAddedRaw] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setAdded = (val: boolean) => {
    if (val) {
      setAddedRaw(true);
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setAddedRaw(false);
      }, duration);
    } else {
      setAddedRaw(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return [added, setAdded];
}
