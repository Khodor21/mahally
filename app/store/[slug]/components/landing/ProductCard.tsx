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
  discount_price?: number | null;
  stock?: number;
  rating?: number;
  badge?: keyof typeof BADGE_STYLES;
};

type ProductCardProps = {
  product: Product;
  storeSlug?: string;
  lang: "en" | "ar";
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

function calculateDiscount(original: number, discounted: number): number {
  if (original === 0) return 0;
  return Math.round(((original - discounted) / original) * 100);
}

export default function ProductCard({
  product,
  storeSlug,
  lang,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart, toggleFavorite, isFavorite, cartItems } = useShop();

  // 👉 UPDATED: Use product title slug instead of ID
  const productUrl = `/product/${encodeURIComponent(product.title)}?lang=${lang}`;
  const productId = String(product.id);
  const favorited = isFavorite(productId);
  const [added, setAdded] = useAddedFlash(5000);
  const [progress, setProgress] = useState(100);

  // 👉 Favorite toast state
  const [favToast, setFavToast] = useAddedFlash(3000);
  const [favProgress, setFavProgress] = useState(100);
  const [favAction, setFavAction] = useState<"added" | "removed">("added");

  // 👉 Check if out of stock
  const isOutOfStock = (product.stock ?? 1) === 0;
  const hasDiscount =
    product.discount_price &&
    product.discount_price > 0 &&
    product.discount_price < (product.price ?? 0);

  // 👉 Language Dictionary
  const content = {
    en: {
      addToCart: "Add to Cart",
      toastTitle: "Added to cart",
      viewCart: "View Cart",
      checkout: "Checkout",
      outOfStock: "Out of Stock",
      addedToFav: "Added to favorites",
      removedFromFav: "Removed from favorites",
    },
    ar: {
      addToCart: "إضافـة إلـى السلّـة",
      toastTitle: "تمت الإضافة إلى سلة التسوق",
      viewCart: "عرض السلة",
      checkout: "اتمام الطلب",
      outOfStock: "غير متوفر",
      addedToFav: "تمت الإضافة إلى المفضلة",
      removedFromFav: "تمت الإزالة من المفضلة",
    },
  };

  const t = content[lang] || content.en;

  const normalizedProduct = {
    ...product,
    id: String(product.id),
  };

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(normalizedProduct);
      setAdded(true);
    }
  };

  const handleToggleFavorite = () => {
    const wasFavorited = isFavorite(productId);
    toggleFavorite(normalizedProduct);
    setFavAction(wasFavorited ? "removed" : "added");
    setFavToast(true);
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

  useEffect(() => {
    if (favToast) {
      setFavProgress(100);
      const timer = setTimeout(() => setFavProgress(0), 50);
      return () => clearTimeout(timer);
    } else {
      setFavProgress(100);
    }
  }, [favToast]);

  const originalPrice = formatPrice(product.price ?? 0);
  const displayPrice = hasDiscount
    ? formatPrice(product.discount_price!)
    : originalPrice;
  const discountPercent = hasDiscount
    ? calculateDiscount(product.price ?? 0, product.discount_price!)
    : 0;

  if (!product) return null;

  return (
    <>
      <article
        aria-label={product.title}
        className="flex flex-col w-full h-full relative transition-all duration-300"
      >
        <Link
          href={productUrl}
          className="absolute inset-0 z-10"
          aria-label={`View ${product.title}`}
        />

        {/* IMAGE CONTAINER */}
        <div className="relative w-full aspect-[3/4] sm:h-80 overflow-hidden rounded-xl bg-[rgb(244_242_245)]/[0.7] transition-all duration-300">
          {/* DISCOUNT BADGE */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-30 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-sm">
              -{discountPercent}%
            </div>
          )}

          {/* ICONS - EYE & HEART */}
          <div className="absolute z-20 flex pointer-events-none w-full top-10 px-4 left-0 justify-between items-start md:top-auto md:bottom-4 md:px-0 md:justify-center md:gap-3">
            <a
              href={productUrl}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm hover:scale-110 hover:text-[rgb(var(--color-brand-primary))] transition-all pointer-events-auto"
            >
              <Eye className="w-3 h-3 md:w-4 md:h-4" />
            </a>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition-all pointer-events-auto"
            >
              {favorited ? (
                <Heart className="w-3 h-3 md:w-4 md:h-4 text-rose-500 fill-rose-500" />
              ) : (
                <Heart className="w-3 h-3 md:w-4 md:h-4 text-gray-600 hover:text-[rgb(var(--color-brand-primary))]" />
              )}
            </button>
          </div>

          {/* IMAGE WITH GRAYSCALE ON OUT OF STOCK */}
          <div className="relative w-full h-full overflow-hidden group">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className={`object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-110 ${
                isOutOfStock ? "grayscale" : ""
              }`}
            />
          </div>

          {/* OUT OF STOCK OVERLAY TEXT */}
          {isOutOfStock && (
            <div className="absolute inset-0 z-25 flex items-center justify-center ">
              <div className="text-white px-4 py-2 rounded-sm text-center">
                <p className="text-xs md:text-sm font-bold text-white bg-red-700 rounded-xs px-3 py-1 drop-shadow-md">
                  {t.outOfStock}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BODY */}
        <div className="flex flex-col flex-1 pb-1 px-1">
          <h3 className="text-sm md:text-base font-medium text-gray-800 line-clamp-2 text-center min-h-[2.5rem] md:min-h-[3rem]">
            {product.title}
          </h3>

          <div className="mt-auto flex flex-col items-center w-full">
            {/* PRICING SECTION */}
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <p className="text-base md:text-lg font-medium text-[rgb(var(--color-brand-primary))] text-center">
                {displayPrice}
              </p>
              {hasDiscount && (
                <p className="text-xs md:text-sm font-medium text-gray-400 line-through">
                  {originalPrice}
                </p>
              )}
            </div>

            {/* ADD TO CART BUTTON */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={isOutOfStock}
              className={`relative z-20 w-full mt-4 flex items-center justify-center gap-1 py-2 rounded-sm text-xs md:text-sm font-medium border transition-all duration-300 ${
                isOutOfStock
                  ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "border-[rgb(var(--color-brand-primary))] text-[rgb(var(--color-brand-primary))] bg-white hover:bg-[rgb(var(--color-brand-primary))] hover:text-white"
              }`}
            >
              <ShoppingBag size={16} />
              {isOutOfStock ? t.outOfStock : t.addToCart}
            </button>
          </div>
        </div>
      </article>

      {/* PREMIUM ADD TO CART TOAST */}
      {added && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-2rem)] md:w-[400px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100 transition-all animate-in slide-in-from-top-4 fade-in duration-300"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          {/* PROGRESS BAR */}
          <div
            className="h-1.5 bg-emerald-500 ease-linear"
            style={{
              width: `${progress}%`,
              transitionDuration: added ? "4950ms" : "0ms",
              transitionProperty: "width",
            }}
          />

          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            {lang === "ar" ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-emerald-500" size={18} />
                  <span className="text-sm font-bold text-gray-900">
                    {t.toastTitle}
                  </span>
                </div>
                <button
                  onClick={() => setAdded(false)}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* BODY - PRODUCT INFO + IMAGE */}
          <div className="p-4 flex items-center gap-4">
            {lang === "ar" ? (
              <>
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-[rgb(244_242_245)] border border-gray-100 flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain p-1 mix-blend-multiply"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 text-right">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-end gap-2 mt-1.5">
                    {hasDiscount && (
                      <p className="text-xs font-medium text-gray-400 line-through">
                        {originalPrice}
                      </p>
                    )}
                    <p className="text-sm font-bold text-[rgb(var(--color-brand-primary))]">
                      {displayPrice}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 text-left">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-sm font-bold text-[rgb(var(--color-brand-primary))]">
                      {displayPrice}
                    </p>
                    {hasDiscount && (
                      <p className="text-xs font-medium text-gray-400 line-through">
                        {originalPrice}
                      </p>
                    )}
                  </div>
                </div>
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-[rgb(244_242_245)] border border-gray-100 flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain p-1 mix-blend-multiply"
                  />
                </div>
              </>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="px-4 pb-4 flex gap-3">
            {lang === "ar" ? (
              <>
                <button
                  onClick={() => {
                    setAdded(false);
                    sessionStorage.setItem(
                      "TEMP_BUY_NOW_ITEM",
                      JSON.stringify({
                        product: product,
                        qty: 1, // Or whatever your local state quantity is
                      }),
                    );
                    router.push(`/cart?lang=${lang}`);
                  }}
                  className="flex-1 py-2.5 bg-[rgb(var(--color-brand-primary))] rounded-sm text-xs font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  {t.checkout}
                  <CreditCard size={18} />
                </button>
                <button
                  onClick={() => {
                    setAdded(false);
                    router.push(`/cart?lang=${lang}`);
                  }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-800 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  {t.viewCart}
                  <ShoppingBag size={18} />
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      {/* FAVORITE TOAST */}
      {favToast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-2rem)] md:w-[320px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100 transition-all animate-in slide-in-from-top-4 fade-in duration-300"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          {/* PROGRESS BAR */}
          <div
            className={`h-1 ease-linear ${favAction === "added" ? "bg-rose-500" : "bg-gray-400"}`}
            style={{
              width: `${favProgress}%`,
              transitionDuration: favToast ? "2950ms" : "0ms",
              transitionProperty: "width",
            }}
          />
          <div className="flex items-center justify-between px-4 py-3">
            {lang === "ar" ? (
              <>
                <div className="flex items-center gap-2.5">
                  <Heart
                    className={`flex-shrink-0 ${
                      favAction === "added"
                        ? "text-rose-500 fill-rose-500"
                        : "text-gray-400"
                    }`}
                    size={18}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {favAction === "added" ? t.addedToFav : t.removedFromFav}
                  </span>
                </div>
                <button
                  onClick={() => setFavToast(false)}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setFavToast(false)}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-medium text-gray-900">
                    {favAction === "added" ? t.addedToFav : t.removedFromFav}
                  </span>
                  <Heart
                    className={`flex-shrink-0 ${
                      favAction === "added"
                        ? "text-rose-500 fill-rose-500"
                        : "text-gray-400"
                    }`}
                    size={18}
                  />
                </div>
              </>
            )}
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
