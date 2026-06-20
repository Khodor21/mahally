"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Eye,
  X,
  ShoppingBag,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import { useShop } from "@/app/store/context";

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
  lang: "en" | "ar"; // 👉 Added lang prop to comply with the backend-driven architecture
};

// 👉 Replaced hardcoded RGB with the new backend-driven CSS variable
const BADGE_STYLES = {
  New: "bg-[rgb(var(--color-brand-primary))] text-white",
  "Best Seller": "bg-[rgb(207_195_223)] text-[rgb(var(--color-brand-primary))]",
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

export default function ProductCard({
  product,
  storeSlug,
  lang,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart, toggleFavorite, isFavorite, cartItems } = useShop();
  const productUrl = `/product/${product.id}?lang=${lang}`; // 👉 Added lang to the URL
  const productId = String(product.id);
  const favorited = isFavorite(productId);

  const [added, setAdded] = useAddedFlash(5000);
  const [progress, setProgress] = useState(100);

  // 👉 Language Dictionary
  const content = {
    en: {
      addToCart: "Add to Cart",
      toastTitle: "Added to cart",
      viewCart: "View Cart",
      checkout: "Checkout",
    },
    ar: {
      addToCart: "إضافـة إلـى السلّـة",
      toastTitle: "تمت الإضافة إلى سلة التسوق",
      viewCart: "عرض السلة",
      checkout: "اتمام الطلب",
    },
  };

  const t = content[lang] || content.en;

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

  useEffect(() => {
    if (added) {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 50);
      return () => clearTimeout(timer);
    } else {
      setProgress(100);
    }
  }, [added]);

  const formattedPrice = formatPrice(product.price ?? 0);

  if (!product) return null;

  return (
    <>
      <article
        aria-label={product.title}
        className="flex flex-col w-full h-full relative"
      >
        <Link
          href={productUrl}
          className="absolute inset-0 z-10"
          aria-label={`View ${product.title}`}
        />

        {/* IMAGE CONTAINER */}
        <div className="relative w-full aspect-[4/5] sm:h-64 overflow-hidden rounded-xl bg-[rgb(244_242_245)]/[0.7] transition-all duration-300">
          <div
            className="absolute z-20 flex pointer-events-none
             w-full top-7 px-3 left-0 justify-between items-start 
             md:top-auto md:bottom-4 md:px-0 md:justify-center md:gap-3"
          >
            <a
              href={productUrl}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm hover:scale-110 hover:text-[rgb(var(--color-brand-primary))] transition-all pointer-events-auto"
            >
              <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </a>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-all pointer-events-auto"
            >
              {favorited ? (
                <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-500 fill-rose-500" />
              ) : (
                <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 hover:text-[rgb(var(--color-brand-primary))]" />
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
            <p className="text-base md:text-lg font-bold text-[rgb(var(--color-brand-primary))] text-center mt-1.5">
              {formattedPrice}
            </p>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              className="relative z-20 w-full mt-4 flex items-center justify-center gap-1 py-2 rounded-sm text-sm font-semibold border transition-all duration-300 border-[rgb(var(--color-brand-primary))] text-[rgb(var(--color-brand-primary))] bg-white hover:bg-[rgb(var(--color-brand-primary))] hover:text-white"
            >
              <ShoppingBag size={16} />
              {t.addToCart}
            </button>
          </div>
        </div>
      </article>

      {/* PREMIUM ADD TO CART TOAST */}
      {added && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-2rem)] md:w-[400px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100 transition-all animate-in slide-in-from-top-4 fade-in duration-300">
          {/* PROGRESS BAR */}
          <div
            className="h-1.5 bg-emerald-500 ease-linear"
            style={{
              width: `${progress}%`,
              transitionDuration: added ? "4950ms" : "0ms",
              transitionProperty: "width",
            }}
          />
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <button
              onClick={() => setAdded(false)}
              className="text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                {t.toastTitle}
              </span>
              <CheckCircle className="text-emerald-500" size={18} />
            </div>
          </div>
          <div className="p-4 flex items-center justify-end gap-4">
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-sm font-bold text-gray-900 line-clamp-2 text-end">
                {product.title}
              </h4>
              <p className="text-sm font-bold text-[rgb(var(--color-brand-primary))] mt-1.5 text-end">
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
                router.push(`/cart?lang=${lang}`);
              }}
              className="flex-1 py-2.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-800 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag size={18} />
              {t.viewCart}
            </button>
            <button
              onClick={() => {
                setAdded(false);
                router.push(`/checkout?lang=${lang}`);
              }}
              className="flex-1 py-2.5 bg-[rgb(var(--color-brand-primary))] rounded-sm text-xs font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <CreditCard size={18} />
              {t.checkout}
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
