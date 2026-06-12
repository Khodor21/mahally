"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Share2,
  CheckCircle2,
  Flame,
  ShoppingBag,
  CreditCard,
  Minus,
  Plus,
  ChevronLeft,
  Barcode,
  Scale,
} from "lucide-react";

type ProductClientUIProps = {
  product: any;
  storeSlug: string;
};

export default function ProductClientUI({
  product,
  storeSlug,
}: ProductClientUIProps) {
  const images = product.images?.length ? product.images : ["/placeholder.jpg"];
  const [activeImage, setActiveImage] = useState(images[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");

  const increment = () =>
    setQuantity((q) => Math.min(q + 1, product.stock || 99));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  return (
    <div dir="rtl" className="animate-in fade-in duration-500">
      {/* BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
        <Link
          href={`/${storeSlug}`}
          className="hover:text-[rgb(60_28_84)] transition-colors"
        >
          الرئيسية
        </Link>
        <ChevronLeft className="w-4 h-4" />
        <Link
          href={`/${storeSlug}/products`}
          className="hover:text-[rgb(60_28_84)] transition-colors"
        >
          جميع المنتجات
        </Link>
        <ChevronLeft className="w-4 h-4" />
        <span className="text-gray-900">
          {product.categories?.title || "تصنيف المنتج"}
        </span>
      </nav>

      {/* MAIN TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* RIGHT SIDE: IMAGE GALLERY */}
        <div className="flex flex-col-reverse md:flex-row gap-4 h-auto md:h-[600px]">
          {/* Thumbnails (Vertical Strip) */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto hidden-scrollbar w-full md:w-24 shrink-0 pb-2 md:pb-0">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative aspect-square w-20 md:w-full rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === img
                    ? "border-[rgb(60_28_84)] shadow-md"
                    : "border-gray-100 hover:border-gray-300 opacity-70 hover:opacity-100"
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

          {/* Large Main Image */}
          <div className="relative flex-1 bg-[rgb(244_242_245)] rounded-2xl overflow-hidden aspect-square md:aspect-auto">
            <Image
              src={activeImage}
              alt={product.title}
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        </div>

        {/* LEFT SIDE: PRODUCT DETAILS */}
        <div className="flex flex-col pt-2">
          {/* Top Actions (Heart / Share) */}
          <div className="flex justify-end gap-3 mb-4">
            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition hover:text-red-500">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Title & Pricing */}
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-3">
            {product.title}
          </h1>
          <div className="text-3xl font-bold text-[rgb(60_28_84)] mb-4">
            {product.price} <span className="text-xl font-medium">ر.س</span>
          </div>

          {/* Badges */}
          <div className="flex flex-col gap-2 mb-8">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              متوفر
            </div>
            <div className="flex items-center gap-1.5 text-red-500 font-bold text-sm">
              <Flame className="w-4 h-4 fill-red-500/20" />
              تم شراءه ١١ مرة
            </div>
          </div>

          {/* Specs Table */}
          <div className="border-t border-b border-gray-100 py-5 space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600 font-semibold">
                <Barcode className="w-5 h-5 text-gray-400" />
                رقم الموديل
              </div>
              <span className="text-gray-900 font-medium tracking-wide text-left dir-ltr">
                {product.id.split("-")[0].toUpperCase()}{" "}
                {/* Generated mockup model number */}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600 font-semibold">
                <Scale className="w-5 h-5 text-gray-400" />
                الوزن
              </div>
              <span className="text-gray-900 font-medium">0.1 كجم</span>
            </div>
          </div>

          {/* Quantity & Price Summary Row */}
          <div className="flex items-center justify-between mb-8">
            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-gray-900 font-bold">الكمية</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-11 w-32">
                <button
                  onClick={increment}
                  className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="flex-1 h-full flex items-center justify-center font-bold text-gray-900 border-x border-gray-200 bg-white">
                  {quantity}
                </div>
                <button
                  onClick={decrement}
                  className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total Price Box */}
            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium">السعر</span>
              <div className="bg-[rgb(60_28_84)] text-white px-4 py-2 rounded-lg font-bold text-lg">
                {(product.price * quantity).toFixed(2)} ر.س
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-auto">
            <button className="flex items-center justify-center gap-2 bg-[rgb(60_28_84)] text-white py-4 rounded-xl font-medium hover:bg-[rgb(75_35_105)] transition-colors">
              <ShoppingBag className="w-5 h-5" />
              إضافة للسلة
            </button>
            <button className="flex items-center justify-center gap-2 bg-white border-2 border-[rgb(60_28_84)] text-[rgb(60_28_84)] py-4 rounded-xl font-medium hover:bg-[rgb(244_242_245)] transition-colors">
              <CreditCard className="w-5 h-5" />
              اشتري الآن
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: TABS */}
      <div className="mt-20 border-t-2 border-[rgb(60_28_84)]/10 pt-10">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-20">
          {/* Tab Menu (Right Side) */}
          <div className="w-full md:w-64 border-l-2 border-gray-100 pl-8 flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("details")}
              className={`text-right py-3 px-4 rounded-lg font-bold text-lg transition-colors ${
                activeTab === "details"
                  ? "text-[rgb(60_28_84)] bg-[rgb(244_242_245)] border-r-4 border-[rgb(60_28_84)]"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              تفاصيل المنتج
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`text-right py-3 px-4 rounded-lg font-bold text-lg transition-colors ${
                activeTab === "reviews"
                  ? "text-[rgb(60_28_84)] bg-[rgb(244_242_245)] border-r-4 border-[rgb(60_28_84)]"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              تقييمات المنتج
            </button>
          </div>

          {/* Tab Content (Left Side) */}
          <div className="flex-1 pr-0 md:pr-4">
            {activeTab === "details" ? (
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  {product.title}
                </h3>
                <p className="whitespace-pre-wrap font-medium">
                  {product.description ||
                    "لا يوجد وصف متاح لهذا المنتج حالياً."}
                </p>
              </div>
            ) : (
              <div className="text-gray-500 py-10 text-center bg-gray-50 rounded-2xl">
                لا توجد تقييمات حتى الآن. كن أول من يقيّم هذا المنتج!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
