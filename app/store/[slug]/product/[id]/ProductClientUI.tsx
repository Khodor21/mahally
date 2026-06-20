// app/components/ProductClientUI.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Share2,
  CheckCircle2,
  ShoppingBag,
  CreditCard,
  Minus,
  Plus,
  ChevronRight,
  X,
  CheckCircle,
} from "lucide-react";
import { useShop } from "@/app/store/context";

// --- Types & Interfaces ---

export interface Variant {
  id: string;
  name: string;
  stock: number;
  attributes?: Record<string, string>;
  price_override?: string | number;
}

export interface Product {
  id: string | number;
  title: string;
  description?: string;
  price?: number | string;
  stock?: number;
  images?: string[];
  categories?: { title: string };
  variants?: string | Variant[];
}

export type ProductClientUIProps = {
  product: Product;
  storeSlug: string;
  lang?: "ar" | "en";
  children?: React.ReactNode;
};

// --- Utility Functions & Hooks ---

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

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

// --- Main Component ---

export default function ProductClientUI({
  product,
  storeSlug,
  lang = "ar",
  children,
}: ProductClientUIProps) {
  const router = useRouter();
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const t = {
    ar: {
      home: "الرئيسية",
      products: "جميع المنتجات",
      category: "تصنيف المنتج",
      stock: "متوفر في المخزون",
      quantity: "الكمية",
      total: "الإجمالي",
      addToCart: "إضافة للسلة",
      buyNow: "اشتري الآن",
      details: "تفاصيل المنتج",
      reviews: "تقييمات المنتج",
      noDescription: "لا يوجد وصف متاح.",
      noReviews: "لا توجد تقييمات حتى الآن.",
      shareText: "تفقد هذا المنتج:",
      copied: "تم نسخ رابط المنتج!",
      addedToCart: "تمت الإضافة إلى سلة التسوق",
      checkout: "اتمام الطلب",
      cart: "عرض السلة",
      variants: "الأنواع المتاحة",
    },
    en: {
      home: "Home",
      products: "Products",
      category: "Product Category",
      stock: "In Stock",
      quantity: "Quantity",
      total: "Total",
      addToCart: "Add To Cart",
      buyNow: "Buy Now",
      details: "Product Details",
      reviews: "Product Reviews",
      noDescription: "No description available.",
      noReviews: "No reviews yet.",
      shareText: "Check out this product:",
      copied: "Product URL copied!",
      addedToCart: "Added to cart",
      checkout: "Checkout",
      cart: "View Cart",
      variants: "Available Variants",
    },
  }[lang];

  const images = product.images?.length ? product.images : ["/placeholder.jpg"];
  const hasMultipleImages = images.length > 1;
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details");

  // --- Variants Logic ---
  const parsedVariants: Variant[] = useMemo(() => {
    if (!product.variants) return [];
    if (typeof product.variants === "string") {
      try {
        return JSON.parse(product.variants) as Variant[];
      } catch (err) {
        console.error("Failed to parse variants JSON", err);
        return [];
      }
    }
    return product.variants as Variant[];
  }, [product.variants]);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    parsedVariants.length > 0 ? parsedVariants[0] : null,
  );

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useAddedFlash(5000);
  const [progress, setProgress] = useState(100);

  const productId = String(product.id);
  const favorited = isFavorite(productId);

  // Derive active price and stock based on variant selection
  const activePrice = selectedVariant?.price_override
    ? Number(selectedVariant.price_override)
    : Number(product.price || 0);

  const activeStock = selectedVariant
    ? selectedVariant.stock
    : product.stock || 0;

  const normalizedProduct = {
    ...product,
    id: productId,
    quantity: quantity,
    price: activePrice,
    variant: selectedVariant || undefined,
  };

  // --- Handlers ---

  const increment = () =>
    setQuantity((q) => Math.min(q + 1, activeStock || 99));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  // Reset quantity if variant changes to prevent exceeding new variant stock
  useEffect(() => {
    if (quantity > activeStock) {
      setQuantity(Math.max(1, activeStock));
    }
  }, [selectedVariant, activeStock, quantity]);

  const handleAddToCart = () => {
    addToCart(normalizedProduct);
    setAdded(true);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(normalizedProduct);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `${t.shareText} ${product.title}`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleThumbnailClick = (idx: number) => {
    setCurrentImgIndex(idx);
  };

  // --- Effects ---

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
    if (!hasMultipleImages) return;
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length, hasMultipleImages]);

  const formattedPrice = formatPrice(activePrice);
  const totalPrice = formatPrice(activePrice * quantity);

  return (
    <>
      <div dir={dir} className="animate-in fade-in duration-500 relative">
        <nav className="flex items-center md:gap-2 text-sm text-gray-500 mb-8 font-medium">
          <Link
            href={`/`}
            className="hover:text-brand-primary transition-colors flex-shrink-0"
          >
            {t.home}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 flex-shrink-0" />
          <Link
            href={`/products`}
            className="hover:text-brand-primary transition-colors flex-shrink-0"
          >
            {t.products}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 flex-shrink-0" />
          <span className="text-gray-900 truncate max-w-[150px] sm:max-w-xs md:max-w-sm">
            {product.title}
          </span>
        </nav>

        {/* MAIN TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* RIGHT SIDE: IMAGE GALLERY */}
          <div className="flex flex-col-reverse md:flex-row gap-4 h-auto md:h-[600px]">
            {hasMultipleImages && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto hidden-scrollbar w-full md:w-24 shrink-0 pb-2 md:pb-0">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleThumbnailClick(idx)}
                    className={`relative aspect-square w-20 md:w-full rounded overflow-hidden border-2 transition-all ${
                      currentImgIndex === idx
                        ? "border-brand-primary shadow-md"
                        : "border-gray-100 hover:border-gray-300 opacity-70"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex-1 bg-[rgb(244_242_245)] rounded-2xl overflow-hidden aspect-square md:aspect-auto">
              {images.map((img: string, idx: number) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    currentImgIndex === idx
                      ? "opacity-100 scale-100 z-10 pointer-events-auto"
                      : "opacity-0 scale-95 z-0 pointer-events-none"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} - image ${idx + 1}`}
                    fill
                    className="object-cover object-center"
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* LEFT SIDE: PRODUCT DETAILS */}
          <div className="flex flex-col">
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleToggleFavorite}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition"
                aria-label="Toggle Favorite"
              >
                {favorited ? (
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                ) : (
                  <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                )}
              </button>
            </div>

            <h3 className="text-xl md:text-2xl font-medium text-black leading-tight mb-4">
              {product.title}
            </h3>

            {/* Price & Stock Row */}
            <div className="flex justify-between items-end mb-6">
              <div className="text-2xl font-bold text-brand-primary">
                {formattedPrice}
              </div>
              {activeStock > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs px-3 py-1.5 rounded-md">
                  <CheckCircle2 className="w-4 h-4" />
                  {t.stock}
                </div>
              )}
            </div>

            {/* Variants Selector */}
            {parsedVariants.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  {t.variants}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {parsedVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 border-2 rounded-xl text-sm font-medium transition-colors ${
                        selectedVariant?.id === variant.id
                          ? "border-brand-primary bg-[rgb(244_242_245)] text-brand-primary"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Price Summary Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 py-4">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <span className="text-black font-medium">{t.quantity}</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-12 w-36 bg-white">
                  <button
                    onClick={increment}
                    disabled={quantity >= activeStock}
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-sm h-full flex items-center justify-center font-bold text-gray-900 border-x border-gray-200">
                    {quantity}
                  </div>
                  <button
                    onClick={decrement}
                    disabled={quantity <= 1}
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 justify-between sm:justify-start">
                <span className="text-black/80 font-medium">{t.total}:</span>
                <div className="text-brand-primary font-medium text-xl">
                  {totalPrice}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={activeStock < 1}
                className="flex items-center justify-center gap-2 bg-brand-primary text-white py-4 rounded-sm font-medium hover:bg-[rgb(244_242_245)] hover:text-brand-primary hover:border hover:border-brand-primary  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                {t.addToCart}
              </button>
              <button
                onClick={() => {
                  if (activeStock < 1) return;
                  addToCart(normalizedProduct);
                  router.push("/checkout");
                }}
                disabled={activeStock < 1}
                className="flex items-center justify-center gap-2 bg-white border-2 border-brand-primary text-brand-primary py-4 rounded-sm font-medium hover:bg-[rgb(244_242_245)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-5 h-5" />
                {t.buyNow}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: TABS */}
        <div className="mt-20 border-t-2 border-gray-100 pt-10">
          <div className="flex flex-col md:flex-row gap-10 lg:gap-20">
            <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("details")}
                className={`text-center md:text-start py-3 px-4 rounded-lg font-regular transition-colors ${
                  activeTab === "details"
                    ? "text-brand-primary bg-[rgb(244_242_245)]"
                    : "text-gray-500"
                }`}
              >
                {t.details}
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`text-center md:text-start py-3 px-4 rounded-lg font-regular transition-colors ${
                  activeTab === "reviews"
                    ? "text-brand-primary bg-[rgb(244_242_245)]"
                    : "text-gray-500"
                }`}
              >
                {t.reviews}
              </button>
            </div>

            <div className="flex-1">
              {activeTab === "details" ? (
                <div className="prose prose-lg max-w-none text-black/90 font-regular">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {product.description || t.noDescription}
                  </p>
                </div>
              ) : (
                <div className="text-black/90 py-10 text-center ">
                  {t.noReviews}
                </div>
              )}
            </div>
          </div>
        </div>
        {children}
      </div>

      {/* PREMIUM ADD TO CART TOAST */}
      {added && (
        <div
          dir={dir}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-2rem)] md:w-[400px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100 transition-all animate-in slide-in-from-top-4 fade-in duration-300"
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
                {t.addedToCart}{" "}
              </span>
              <CheckCircle className="text-emerald-500" size={18} />
            </div>
          </div>
          <div className="p-4 flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-[rgb(244_242_245)] border border-gray-100 flex-shrink-0">
              <Image
                src={images[0]}
                alt={product.title}
                fill
                className="object-contain p-1 mix-blend-multiply"
              />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-sm font-bold text-gray-900 line-clamp-2">
                {product.title}
              </h4>
              <p className="text-sm font-bold text-brand-primary mt-1.5">
                {formattedPrice}{" "}
                {quantity > 1 && (
                  <span className="text-xs text-gray-500">({quantity}x)</span>
                )}
              </p>
            </div>
          </div>
          <div className="px-4 pb-4 flex gap-3">
            <button
              onClick={() => {
                setAdded(false);
                router.push("/checkout");
              }}
              className="flex-1 py-2.5 bg-brand-primary rounded-sm text-xs font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <CreditCard size={18} />
              {t.checkout}{" "}
            </button>
            <button
              onClick={() => {
                setAdded(false);
                router.push("/cart");
              }}
              className="flex-1 py-2.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-800 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag size={18} />
              {t.cart}{" "}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
