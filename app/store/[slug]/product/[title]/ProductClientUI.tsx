"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
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
import ShareIcons from "./components/ShareIcons";
import FavoriteToast from "./components/FavoriteToast";

// --- Types & Interfaces ---

export interface VariantOption {
  id: string;
  value: string;
  price?: number;
  stock?: number;
}

export interface VariantGroup {
  id: string;
  title: string;
  type: "select" | "text";
  allowPrice: boolean;
  allowStock: boolean;
  options: VariantOption[];
}

export interface SelectedVariants {
  [groupId: string]: VariantOption;
}

export interface Product {
  id: string | number;
  title: string;
  description?: string;
  price?: number | string;
  stock?: number;
  images?: string[];
  categories?: { title: string };
  variantGroups?: string | VariantGroup[];
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
  const { addToCart, toggleFavorite, isFavorite, cartItems } = useShop();
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
      options: "الخيارات المتاحة",
      selectOption: "اختر الخيار",
      maxStockReached: "تم الوصول للحد الأقصى للمخزون المتوفر",
      addedToFav: "تمت الإضافة للمفضلة",
      removedFromFav: "تم الإزالة من المفضلة",
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
      options: "Available Options",
      selectOption: "Select option",
      maxStockReached: "Max available stock reached",
      addedToFav: "Added to favorites",
      removedFromFav: "Removed from favorites",
    },
  }[lang];

  const images = product.images?.length ? product.images : ["/placeholder.jpg"];
  const hasMultipleImages = images.length > 1;
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details");

  // --- Variant Groups Logic ---
  const variantGroups: VariantGroup[] = useMemo(() => {
    if (!product.variantGroups) return [];
    if (typeof product.variantGroups === "string") {
      try {
        return JSON.parse(product.variantGroups) as VariantGroup[];
      } catch (err) {
        console.error("Failed to parse variantGroups JSON", err);
        return [];
      }
    }
    return product.variantGroups as VariantGroup[];
  }, [product.variantGroups]);

  // Track selected option for each variant group
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariants>(
    {},
  );

  // Initialize selected variants
  useEffect(() => {
    const initialSelected: SelectedVariants = {};
    variantGroups.forEach((group) => {
      if (group.options.length > 0) {
        initialSelected[group.id] = group.options[0];
      }
    });
    setSelectedVariants(initialSelected);
  }, [variantGroups]);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useAddedFlash(5000);
  const [progress, setProgress] = useState(100);

  // 👉 Stock Warning state
  const [stockWarning, setStockWarning] = useAddedFlash(4000);
  const [stockWarningProgress, setStockWarningProgress] = useState(100);

  // 👉 Favorite Toast state
  const [favToast, setFavToast] = useState(false);
  const [favAction, setFavAction] = useState<"added" | "removed">("added");
  const [favProgress, setFavProgress] = useState(100);

  const productId = String(product.id);
  const favorited = isFavorite(productId);

  // Calculate active price based on selected variant options
  const calculatePrice = (): number => {
    let totalPrice = Number(product.price || 0);

    variantGroups.forEach((group) => {
      const variantPrice = selectedVariants[group.id]?.price;
      if (group.allowPrice && variantPrice !== undefined) {
        totalPrice = variantPrice;
      }
    });

    return totalPrice;
  };

  // Calculate active stock based on selected variant options
  const calculateStock = (): number => {
    const stockTrackingGroups = variantGroups.filter((g) => g.allowStock);
    if (stockTrackingGroups.length === 0) return product.stock || 0;

    let minStock = 99999;
    stockTrackingGroups.forEach((group) => {
      const stock = selectedVariants[group.id]?.stock ?? 0;
      minStock = Math.min(minStock, stock);
    });

    return minStock === 99999 ? 0 : minStock;
  };

  const activePrice = calculatePrice();
  const activeStock = calculateStock();

  // Build variant description for cart
  const variantDescription = variantGroups
    .map(
      (group) =>
        `${group.title}: ${selectedVariants[group.id]?.value || "N/A"}`,
    )
    .join(", ");

  const normalizedProduct = {
    ...product,
    id: productId,
    quantity: quantity,
    price: activePrice,
    variantDescription: variantDescription || undefined,
  };

  // --- Handlers ---

  const increment = () =>
    setQuantity((q) => Math.min(q + 1, activeStock || 99));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  useEffect(() => {
    if (quantity > activeStock) {
      setQuantity(Math.max(1, activeStock));
    }
  }, [selectedVariants, activeStock, quantity]);

  // ✅ VALIDATION HELPER: Check cart contents against active stock
  const isStockLimitReached = () => {
    const existingCartQty = cartItems
      .filter((item: any) => String(item.product.id) === productId)
      .reduce((sum: number, item: any) => sum + item.qty, 0);

    return existingCartQty + quantity > activeStock;
  };

  const handleAddToCart = () => {
    if (activeStock < 1) return;

    if (isStockLimitReached()) {
      setStockWarning(true);
      return;
    }

    addToCart(normalizedProduct);
    setAdded(true);
  };

  const handleBuyNow = () => {
    if (activeStock < 1) return;

    if (isStockLimitReached()) {
      setStockWarning(true);
      return;
    }

    addToCart(normalizedProduct);
    router.push("/cart");
  };

  const handleToggleFavorite = () => {
    const currentlyFav = isFavorite(productId);
    toggleFavorite(normalizedProduct);
    setFavAction(currentlyFav ? "removed" : "added");
    setFavToast(true);
  };

  const handleThumbnailClick = (idx: number) => {
    setCurrentImgIndex(idx);
  };

  const handleVariantOptionChange = (
    groupId: string,
    option: VariantOption,
  ) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [groupId]: option,
    }));
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
    if (stockWarning) {
      setStockWarningProgress(100);
      const timer = setTimeout(() => setStockWarningProgress(0), 50);
      return () => clearTimeout(timer);
    } else {
      setStockWarningProgress(100);
    }
  }, [stockWarning]);

  // Handle Favorite Toast animation and timing
  useEffect(() => {
    if (favToast) {
      setFavProgress(100);
      const timer1 = setTimeout(() => setFavProgress(0), 50);
      const timer2 = setTimeout(() => setFavToast(false), 3000); // Hide after 3s
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setFavProgress(100);
    }
  }, [favToast]);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8">
          {/* IMAGE GALLERY */}
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

            {/* Changed from bg-grey & mix-blend to transparent, natural dimensions */}
            <div className="relative flex-1 rounded-2xl overflow-hidden aspect-square md:aspect-auto flex items-center justify-center">
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
                    className="object-contain object-center rounded"
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="flex flex-col">
            <div className="flex justify-end gap-2 mb-4">
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

            {/* Variant Groups Selector */}
            {variantGroups.length > 0 && (
              <div className="mb-6 space-y-5">
                <h4 className="text-sm font-bold text-gray-900">{t.options}</h4>
                {variantGroups.map((group) => (
                  <div key={group.id}>
                    <label className="text-sm font-semibold text-gray-800 mb-2.5 block">
                      {group.title}
                    </label>

                    {/* Select Type (Dropdown Buttons) */}
                    {group.type === "select" ? (
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() =>
                              handleVariantOptionChange(group.id, option)
                            }
                            className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedVariants[group.id]?.id === option.id
                                ? "border-brand-primary bg-[rgb(244_242_245)] text-brand-primary"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {option.value}
                            {group.allowPrice && option.price && (
                              <span className="text-xs ml-1.5 opacity-70">
                                (+${option.price.toFixed(2)})
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      /* Text Type (Free Input) */
                      <input
                        type="text"
                        placeholder={`${t.selectOption}: ${group.title}`}
                        defaultValue={selectedVariants[group.id]?.value || ""}
                        onChange={(e) => {
                          handleVariantOptionChange(group.id, {
                            id: `custom-${group.id}`,
                            value: e.target.value,
                          });
                        }}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quantity & Price Summary */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 py-4 border-t border-gray-100">
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

            {/* Share Buttons (Moved after Quantity/Pricing, before Action Buttons) */}
            <div className="my-6">
              <ShareIcons
                productTitle={product.title}
                productUrl={
                  typeof window !== "undefined" ? window.location.href : ""
                }
                lang={lang}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={activeStock < 1}
                className="flex items-center justify-center gap-2 bg-brand-primary text-white py-2 rounded-sm font-medium hover:bg-[rgb(244_242_245)] hover:text-brand-primary hover:border hover:border-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                {t.addToCart}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={activeStock < 1}
                className="flex items-center justify-center gap-2 bg-white border-2 border-brand-primary text-brand-primary py-2 rounded-sm font-medium hover:bg-[rgb(244_242_245)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="text-black/90 py-10 text-center">
                  {t.noReviews}
                </div>
              )}
            </div>
          </div>
        </div>
        {children}
      </div>

      {/* FAVORITE TOAST (NEW COMPONENT) */}
      <FavoriteToast
        favToast={favToast}
        setFavToast={setFavToast}
        favAction={favAction}
        favProgress={favProgress}
        lang={lang}
        t={{ addedToFav: t.addedToFav, removedFromFav: t.removedFromFav }}
      />

      {/* ADD TO CART TOAST */}
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
            {lang === "ar" ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-emerald-500" size={18} />
                  <span className="text-sm font-bold text-gray-900">
                    {t.addedToCart}
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
                    {t.addedToCart}
                  </span>
                  <CheckCircle className="text-emerald-500" size={18} />
                </div>
              </>
            )}
          </div>
          <div className="p-4 flex items-center gap-4">
            {lang === "ar" ? (
              <>
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-[rgb(244_242_245)] border border-gray-100 flex-shrink-0">
                  <Image
                    src={images[0]}
                    alt={product.title}
                    fill
                    className="object-contain p-1 mix-blend-multiply"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-2 text-right">
                    {product.title}
                  </h4>
                  <p className="text-sm font-bold text-brand-primary mt-1.5 text-right flex items-center justify-end gap-2">
                    {quantity > 1 && (
                      <span className="text-xs text-gray-500">
                        ({quantity}x)
                      </span>
                    )}
                    {formattedPrice}
                  </p>
                  {variantDescription && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 text-right">
                      {variantDescription}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-2 text-left">
                    {product.title}
                  </h4>
                  <p className="text-sm font-bold text-brand-primary mt-1.5 text-left flex items-center justify-start gap-2">
                    {formattedPrice}
                    {quantity > 1 && (
                      <span className="text-xs text-gray-500">
                        ({quantity}x)
                      </span>
                    )}
                  </p>
                  {variantDescription && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 text-left">
                      {variantDescription}
                    </p>
                  )}
                </div>
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-[rgb(244_242_245)] border border-gray-100 flex-shrink-0">
                  <Image
                    src={images[0]}
                    alt={product.title}
                    fill
                    className="object-contain p-1 mix-blend-multiply"
                  />
                </div>
              </>
            )}
          </div>
          <div className="px-4 pb-4 flex gap-3">
            {lang === "ar" ? (
              <>
                <button
                  onClick={() => {
                    setAdded(false);
                    router.push("/cart");
                  }}
                  className="flex-1 py-1.5 bg-brand-primary rounded-sm text-xs font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  {t.checkout}
                  <CreditCard size={18} />
                </button>
                <button
                  onClick={() => {
                    setAdded(false);
                    router.push("/cart");
                  }}
                  className="flex-1 py-1.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-800 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  {t.cart}
                  <ShoppingBag size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAdded(false);
                    router.push("/cart");
                  }}
                  className="flex-1 py-1.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-800 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag size={18} />
                  {t.cart}
                </button>
                <button
                  onClick={() => {
                    setAdded(false);
                    router.push("/cart");
                  }}
                  className="flex-1 py-1.5 bg-brand-primary rounded-sm text-xs font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <CreditCard size={18} />
                  {t.checkout}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* STOCK LIMIT WARNING TOAST */}
      {stockWarning && (
        <div
          dir={dir}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-2rem)] md:w-[320px] bg-white rounded-lg shadow-2xl overflow-hidden border border-red-100 transition-all animate-in slide-in-from-top-4 fade-in duration-300"
        >
          {/* PROGRESS BAR */}
          <div
            className="h-1 ease-linear bg-red-500"
            style={{
              width: `${stockWarningProgress}%`,
              transitionDuration: stockWarning ? "3950ms" : "0ms",
              transitionProperty: "width",
            }}
          />
          <div className="flex items-center justify-between px-4 py-3">
            {lang === "ar" ? (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-red-600">
                    {t.maxStockReached}
                  </span>
                </div>
                <button
                  onClick={() => setStockWarning(false)}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStockWarning(false)}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-red-600">
                    {t.maxStockReached}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
