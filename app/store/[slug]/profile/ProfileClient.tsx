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
  const { addToCart, toggleFavorite, isFavorite, setBuyNowItem, cartItems } =
    useShop();
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
      addedToFav: "تمت الإضافة إلى المفضلة",
      removedFromFav: "تمت الإزالة من المفضلة",
      linkCopied: "تم نسخ رابط المنتج!",
      shareFailed: "تعذّر مشاركة الرابط",
      onlyLeftInStock: "الكمية المتوفرة فقط",
      outOfStock: "غير متوفر حاليًا",
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
      addedToFav: "Added to favorites",
      removedFromFav: "Removed from favorites",
      linkCopied: "Product link copied!",
      shareFailed: "Couldn't share this link",
      onlyLeftInStock: "Only",
      outOfStock: "Currently out of stock",
    },
  }[lang];

  const images = product.images?.length ? product.images : ["/placeholder.jpg"];
  const hasMultipleImages = images.length > 1;
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const [copied, setCopied] = useState(false);

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

  // 👉 stock is overridden with activeStock so downstream consumers (cart,
  // checkout) always cap against the stock of the *selected variant*,
  // not the product's base stock.
  const normalizedProduct = {
    ...product,
    id: productId,
    price: activePrice,
    stock: activeStock,
    variantDescription: variantDescription || undefined,
  };

  // --- Stock warning toast (shown when quantity hits the available cap) ---
  const [stockWarning, setStockWarning] = useAddedFlash(2500);

  const triggerStockWarning = () => {
    setStockWarning(true);
  };

  // --- Handlers ---

  const increment = () => {
    if (quantity >= activeStock) {
      triggerStockWarning();
      return;
    }
    setQuantity((q) => Math.min(q + 1, activeStock || 99));
  };
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  useEffect(() => {
    if (quantity > activeStock) {
      setQuantity(Math.max(1, activeStock));
    }
  }, [selectedVariants, activeStock, quantity]);

  const handleAddToCart = () => {
    if (activeStock < 1) return;

    // Respect stock even across multiple add-to-cart clicks: check what's
    // already sitting in the cart for this exact product before adding more.
    const existingQty =
      cartItems.find((i) => String(i.product.id) === productId)?.qty ?? 0;
    if (existingQty + quantity > activeStock) {
      triggerStockWarning();
      return;
    }

    addToCart(normalizedProduct, quantity);
    setAdded(true);
  };

  const handleBuyNow = () => {
    if (activeStock < 1) return;
    // Isolated from the persistent cart — checkout will use only this item.
    setBuyNowItem(normalizedProduct, quantity);
    router.push("/cart?buyNow=1");
  };

  // --- Favorite toast ---
  const [favToast, setFavToast] = useAddedFlash(3000);
  const [favProgress, setFavProgress] = useState(100);
  const [favAction, setFavAction] = useState<"added" | "removed">("added");

  const handleToggleFavorite = () => {
    const wasFavorited = isFavorite(productId);
    toggleFavorite(normalizedProduct);
    setFavAction(wasFavorited ? "removed" : "added");
    setFavToast(true);
  };

  useEffect(() => {
    if (favToast) {
      setFavProgress(100);
      const timer = setTimeout(() => setFavProgress(0), 50);
      return () => clearTimeout(timer);
    } else {
      setFavProgress(100);
    }
  }, [favToast]);

  // --- Share (native share sheet with a proper clipboard fallback) ---
  const [shareStatus, setShareStatus] = useState<
    "idle" | "copied" | "error"
  >("idle");

  const copyLinkFallback = async (url: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-secure contexts / older browsers without the
        // Clipboard API.
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setShareStatus("copied");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      setShareStatus("error");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `${t.shareText} ${product.title}`,
          url,
        });
        return;
      } catch (err: any) {
        // AbortError just means the user closed the native share sheet —
        // that's not a failure, so don't fall back to clipboard for it.
        if (err?.name === "AbortError") return;
      }
    }
    await copyLinkFallback(url);
  };

  useEffect(() => {
    if (shareStatus === "idle") return;
    const timer = setTimeout(() => setShareStatus("idle"), 2500);
    return () => clearTimeout(timer);
  }, [shareStatus]);

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

          {/* PRODUCT DETAILS */}
          <div className="flex flex-col">
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={handleShare}
                className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition ${
                  copied ? "text-emerald-500" : "text-gray-600"
                }`}
                aria-label={copied ? t.copied : "Share product"}
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
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

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={activeStock < 1}
                className="flex items-center justify-center gap-2 bg-brand-primary text-white py-4 rounded-sm font-medium hover:bg-[rgb(244_242_245)] hover:text-brand-primary hover:border hover:border-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="text-black/90 py-10 text-center">
                  {t.noReviews}
                </div>
              )}
            </div>
          </div>
        </div>
        {children}
      </div>

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
                {formattedPrice}
                {quantity > 1 && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({quantity}x)
                  </span>
                )}
              </p>
              {variantDescription && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {variantDescription}
                </p>
              )}
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
              {t.checkout}
            </button>
            <button
              onClick={() => {
                setAdded(false);
                router.push("/cart");
              }}
              className="flex-1 py-2.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-800 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag size={18} />
              {t.cart}
            </button>
          </div>
        </div>
      )}
    </>
  );
}