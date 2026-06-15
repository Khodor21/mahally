"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  X,
  CheckCircle,
} from "lucide-react";
import { useShop } from "@/app/store/context";

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

type ProductClientUIProps = {
  product: any;
  storeSlug: string;
};

export default function ProductClientUI({
  product,
  storeSlug,
}: ProductClientUIProps) {
  const router = useRouter();
  const { addToCart, toggleFavorite, isFavorite } = useShop();

  const images = product.images?.length ? product.images : ["/placeholder.jpg"];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");

  // Cart Toast States
  const [added, setAdded] = useAddedFlash(5000);
  const [progress, setProgress] = useState(100);

  const productId = String(product.id);
  const favorited = isFavorite(productId);

  const normalizedProduct = {
    ...product,
    id: productId,
    quantity: quantity,
  };

  // --- Handlers ---

  const increment = () =>
    setQuantity((q) => Math.min(q + 1, product.stock || 99));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

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
          text: `تفقد هذا المنتج: ${product.title}`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("تم نسخ رابط المنتج!");
    }
  };

  const handleThumbnailClick = (idx: number) => {
    setCurrentImgIndex(idx);
  };

  // --- Effects ---

  // Handle the Toast progress bar animation
  useEffect(() => {
    if (added) {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 50);
      return () => clearTimeout(timer);
    } else {
      setProgress(100);
    }
  }, [added]);

  // Handle auto-rotating images every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  const formattedPrice = formatPrice(product.price ?? 0);
  const totalPrice = formatPrice((product.price ?? 0) * quantity);

  return (
    <>
      <div dir="rtl" className="animate-in fade-in duration-500 relative">
        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-8 font-medium">
          <Link
            href={`/${storeSlug}`}
            className="hover:text-[rgb(60_28_84)] transition-colors"
          >
            الرئيسية
          </Link>
          <ChevronLeft className="w-3 h-3" />
          <Link
            href={`/${storeSlug}/products`}
            className="hover:text-[rgb(60_28_84)] transition-colors"
          >
            جميع المنتجات
          </Link>
          <ChevronLeft className="w-3 h-3" />
          <span className="text-gray-900">
            {product.categories?.title || "تصنيف المنتج"}
          </span>
        </nav>

        {/* MAIN TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* RIGHT SIDE: IMAGE GALLERY */}
          <div className="flex flex-col-reverse md:flex-row gap-4 h-auto md:h-[600px]">
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto hidden-scrollbar w-full md:w-24 shrink-0 pb-2 md:pb-0">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleThumbnailClick(idx)}
                  className={`relative aspect-square w-20 md:w-full rounded-xl overflow-hidden border-2 transition-all ${
                    currentImgIndex === idx
                      ? "border-[rgb(60_28_84)] shadow-md"
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

            {/* 👉 Smooth Crossfade Container */}
            <div className="relative flex-1 bg-[rgb(244_242_24 rounded-2xl overflow-hidden aspect-square md:aspect-auto">
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

            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {product.title}
            </h3>

            <div className="flex flex-col gap-3 mb-8">
              <div className="text-3xl font-bold text-[rgb(60_28_84)]">
                {formattedPrice}
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                متوفر في المخزون
              </div>
            </div>

            {/* Quantity & Price Summary Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <span className="text-gray-900 font-bold">الكمية</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-10 w-32 bg-white">
                  <button
                    onClick={increment}
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 h-full flex items-center justify-center font-bold text-gray-900 border-x border-gray-200">
                    {quantity}
                  </div>
                  <button
                    onClick={decrement}
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <span className="text-gray-500 font-medium">الإجمالي</span>
                <div className="text-[rgb(60_28_84)] font-bold text-xl">
                  {totalPrice}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 bg-[rgb(60_28_84)] text-white py-4 rounded-xl font-medium hover:bg-[rgb(75_35_105)] transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                إضافة للسلة
              </button>
              <button
                onClick={() => {
                  addToCart(normalizedProduct);
                  router.push("/checkout");
                }}
                className="flex items-center justify-center gap-2 bg-white border-2 border-[rgb(60_28_84)] text-[rgb(60_28_84)] py-4 rounded-xl font-medium hover:bg-[rgb(244_242_245)] transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                اشتري الآن
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
                className={`text-center md:text-right py-3 px-4 rounded-lg font-bold transition-colors ${
                  activeTab === "details"
                    ? "text-[rgb(60_28_84)] bg-[rgb(244_242_245)]"
                    : "text-gray-500"
                }`}
              >
                تفاصيل المنتج
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`text-center md:text-right py-3 px-4 rounded-lg font-bold transition-colors ${
                  activeTab === "reviews"
                    ? "text-[rgb(60_28_84)] bg-[rgb(244_242_245)]"
                    : "text-gray-500"
                }`}
              >
                تقييمات المنتج
              </button>
            </div>

            <div className="flex-1">
              {activeTab === "details" ? (
                <div className="prose prose-lg max-w-none text-gray-600">
                  <p className="whitespace-pre-wrap">
                    {product.description || "لا يوجد وصف متاح."}
                  </p>
                </div>
              ) : (
                <div className="text-gray-500 py-10 text-center bg-gray-50 rounded-2xl">
                  لا توجد تقييمات حتى الآن.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PREMIUM ADD TO CART TOAST */}
      {added && (
        <div
          dir="rtl"
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
                تمت الإضافة إلى سلة التسوق
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
              <p className="text-sm font-bold text-[rgb(60_28_84)] mt-1.5">
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
              className="flex-1 py-2.5 bg-[rgb(60_28_84)] rounded-sm text-xs font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <CreditCard size={18} />
              اتمام الطلب
            </button>
            <button
              onClick={() => {
                setAdded(false);
                router.push("/cart");
              }}
              className="flex-1 py-2.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-800 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag size={18} />
              عرض السلة
            </button>
          </div>
        </div>
      )}
    </>
  );
}
