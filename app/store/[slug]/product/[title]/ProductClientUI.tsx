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
  AlertTriangle,
  ArrowRight,
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
  discount_price?: number | string | null;
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

function calculateDiscount(original: number, discounted: number): number {
  if (original === 0) return 0;
  return Math.round(((original - discounted) / original) * 100);
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
  const {
    addToCart,
    toggleFavorite,
    isFavorite,
    cartItems,
    updateCartQty,
    removeFromCart,
  } = useShop();

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
      sale: "خصم",
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
      sale: "Sale",
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

  // --- SAFE PRICING LOGIC ---
  const basePriceNum = Number(product.price || 0);
  const discountPriceNum = Number(product.discount_price || 0);

  // Safely check if there is a valid discount (must be > 0 and less than normal price)
  const hasBaseDiscount = 
    discountPriceNum > 0 && 
    discountPriceNum < basePriceNum;

  // Calculate active price based on selected variant options & discounts
  const calculatePrice = (): number => {
    let totalPrice = hasBaseDiscount ? discountPriceNum : basePriceNum;

    variantGroups.forEach((group) => {
      const variantPrice = selectedVariants[group.id]?.price;
      if (group.allowPrice && variantPrice !== undefined) {
        totalPrice = Number(variantPrice);
      }
    });
    return totalPrice;
  };

  const calculateStock = (): number => {
    const stockTrackingGroups = variantGroups.filter((g) => g.allowStock);

    if (stockTrackingGroups.length === 0) {
      return Number(product.stock || 0);
    }

    let minStock = Number(product.stock) || 99999;

    stockTrackingGroups.forEach((group) => {
      const selectedOption = selectedVariants[group.id];
      if (selectedOption?.stock !== undefined) {
        minStock = Math.min(minStock, Number(selectedOption.stock));
      }
    });

    return minStock === 99999 ? Number(product.stock || 0) : minStock;
  };

  const activePrice = calculatePrice();
  const activeStock = calculateStock();
  
  // Determine if a variant is actively overriding the price
  const hasVariantPriceOverride = useMemo(() => {
    return variantGroups.some(
      (group) => group.allowPrice && selectedVariants[group.id]?.price !== undefined
    );
  }, [variantGroups, selectedVariants]);

  // Show discount UI only if product has discount and no variant overrides it
  const showDiscountUI = hasBaseDiscount && !hasVariantPriceOverride;
  const discountPercent = showDiscountUI 
    ? calculateDiscount(basePriceNum, discountPriceNum)
    : 0;

  // Safely calculate exactly how many of this product are already in the cart
  const existingCartQty = useMemo(() => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    return cartItems
      .filter(
        (item: any) =>
          item?.product && String(item.product.id) === String(productId),
      )
      .reduce(
        (sum: number, item: any) =>
          sum + Number(item.qty || item.quantity || 0),
        0,
      );
  }, [cartItems, productId]);

  useEffect(() => {
    if (existingCartQty > 0) {
      setQuantity(existingCartQty);
    } else {
      setQuantity(1);
    }
  }, [existingCartQty]);

  const variantDescription = variantGroups
    .map(
      (group) =>
        `${group.title}: ${selectedVariants[group.id]?.value || "N/A"}`,
    )
    .join(", ");

  const variantSelectionsForCart = useMemo(() => {
    if (Object.keys(selectedVariants).length === 0) return undefined;

    return Object.entries(selectedVariants).reduce(
      (acc, [groupId, option]) => {
        acc[groupId] = {
          id: option.id,
          value: option.value,
          stock: option.stock,
        };
        return acc;
      },
      {} as Record<string, any>,
    );
  }, [selectedVariants]);

  const normalizedProduct = {
    ...product,
    id: productId,
    quantity: quantity,
    price: activePrice,
    variantDescription: variantDescription || undefined,
  };

  // --- Handlers ---
  const increment = () => {
    setQuantity((prev) => {
      const newQty = Math.min(prev + 1, activeStock);
      if (existingCartQty > 0) {
        updateCartQty(productId, newQty);
      }
      return newQty;
    });
  };

  const decrement = () => {
    setQuantity((prev) => {
      const newQty = Math.max(prev - 1, 0);
      if (existingCartQty > 0) {
        if (newQty === 0) {
          removeFromCart(productId);
        } else {
          updateCartQty(productId, newQty);
        }
      }
      return newQty;
    });
  };

  useEffect(() => {
    if (existingCartQty === 0 && quantity > activeStock && activeStock > 0) {
      setQuantity(Math.max(1, activeStock));
    }
  }, [activeStock, existingCartQty, quantity]);

  const isStockLimitReached = () => {
    if (existingCartQty === 0) {
      return quantity > activeStock;
    }
    return false;
  };

  const isActionDisabled = activeStock < 1 || isStockLimitReached();

  const handleAddToCart = () => {
    if (isActionDisabled) {
      setStockWarning(true);
      return;
    }

    if (existingCartQty > 0) {
      setAdded(true);
    } else {
      addToCart(normalizedProduct, quantity, variantSelectionsForCart);
      setAdded(true);
    }
  };

  const handleBuyNow = () => {
    if (isActionDisabled) {
      setStockWarning(true);
      return;
    }

    if (existingCartQty > 0) {
      addToCart(normalizedProduct, quantity, variantSelectionsForCart);
    } else {
      addToCart(normalizedProduct, quantity, variantSelectionsForCart);
    }
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

  useEffect(() => {
    if (favToast) {
      setFavProgress(100);
      const timer1 = setTimeout(() => setFavProgress(0), 50);
      const timer2 = setTimeout(() => setFavToast(false), 3000);
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
      <div
        dir={dir}
        className="animate-in fade-in duration-500 relative pb-36 md:pb-0"
      >
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
            <div className="relative flex-1 rounded-2xl overflow-hidden aspect-square md:aspect-auto flex items-center justify-center">
              {showDiscountUI && (
                <div className="absolute top-4 left-4 z-20 bg-rose-500 text-white text-sm font-bold px-3 py-1.5 rounded-sm shadow-sm">
                  -{discountPercent}%
                </div>
              )}
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
              <div className="flex flex-col">
                {showDiscountUI && (
                  <span className="text-sm font-medium text-gray-400 line-through mb-1">
                    {formatPrice(basePriceNum)}
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-2xl md:text-3xl font-bold text-brand-primary">
                    {formattedPrice}
                  </span>
                  {showDiscountUI && (
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-rose-100 text-rose-700">
                      {t.sale} -{discountPercent}%
                    </span>
                  )}
                </div>
              </div>
              {activeStock > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs py-1.5 rounded-md">
                  <CheckCircle2 className="w-4 h-4" />
                  {t.stock}
                </div>
              )}
            </div>

            {/* Variant Groups Selector */}
            {variantGroups.length > 0 && (
              <div className="mb-6 space-y-5">
                {variantGroups.map((group) => {
                  const isSingleOption = group.options.length === 1;
                  const singleOption = group.options[0];

                  return (
                    <div key={group.id}>
                      {isSingleOption ? (
                        <div className="flex items-center justify-between ">
                          <span className="font-medium text-gray-800">
                            {group.title}
                          </span>
                          <span className="text-sm text-gray-600">
                            {singleOption.value}
                            {group.allowPrice &&
                              singleOption.price !== undefined && (
                                <span className="text-xs ml-1.5 opacity-70">
                                  ({singleOption.price!.toFixed(2)})
                                </span>
                              )}
                          </span>
                        </div>
                      ) : (
                        <>
                          <label className="font-medium text-gray-800 mb-2.5 block">
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
                                  className={`px-2 py-1 border-2 rounded text-sm font-medium transition-colors ${
                                    selectedVariants[group.id]?.id === option.id
                                      ? "border-brand-primary bg-[rgb(244_242_245)] text-brand-primary"
                                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                                  }`}
                                >
                                  {option.value}
                                  {group.allowPrice && option.price && (
                                    <span className="text-xs mx-1.5 opacity-70">
                                      - ({option.price.toFixed(2)})
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
                              defaultValue={
                                selectedVariants[group.id]?.value || ""
                              }
                              onChange={(e) => {
                                handleVariantOptionChange(group.id, {
                                  id: `custom-${group.id}`,
                                  value: e.target.value,
                                });
                              }}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none transition-all"
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quantity & Price Summary (DESKTOP ONLY Quantity) */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 py-4 border-t border-gray-100">
              {/* Desktop Quantity (Hidden on mobile) */}
              <div className="hidden md:flex flex-col gap-2">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-black font-medium">{t.quantity}</span>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8 w-28 bg-white">
                    <button
                      onClick={increment}
                      disabled={quantity >= activeStock}
                      className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <div className="flex-1 text-sm h-full flex items-center justify-center font-bold text-gray-900 border-x border-gray-200">
                      {quantity}
                    </div>
                    <button
                      onClick={decrement}
                      disabled={quantity <= (existingCartQty > 0 ? 0 : 1)}
                      className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {/* INLINE WARNING */}
                {isActionDisabled && existingCartQty === 0 && (
                  <p className="text-xs text-red-500 font-bold mt-1.5 animate-in slide-in-from-top-1 fade-in duration-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {lang === "ar"
                      ? "تم الوصول للحد الأقصى للمخزون المتوفر"
                      : "Max available stock reached"}
                  </p>
                )}
              </div>

              {/* Price Total (Kept visible on mobile for context) */}
              <div className="flex items-start gap-2 justify-between sm:justify-start">
                <span className="text-black/80 font-medium sm:mt-1">
                  {t.total}:
                </span>
                <div className="text-brand-primary font-medium text-lg sm:mt-0.5">
                  {totalPrice}
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="my-6">
              <ShareIcons
                productTitle={product.title}
                productUrl={
                  typeof window !== "undefined" ? window.location.href : ""
                }
                lang={lang}
              />
            </div>

            {/* Action Buttons (DESKTOP ONLY) */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isActionDisabled}
                  className="flex items-center justify-center gap-2 bg-brand-primary text-white py-2 rounded-sm font-medium hover:bg-[rgb(244_242_245)] hover:text-brand-primary hover:border hover:border-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {t.addToCart}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isActionDisabled}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-brand-primary text-brand-primary py-2 rounded-sm font-medium hover:bg-[rgb(244_242_245)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-5 h-5" />
                  {t.buyNow}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: TABS */}
        <div className="mt-2 border-t-2 border-gray-100 pt-6">
          <div className="flex flex-col md:flex-row gap-10 lg:gap-20">
            <div className="w-full md:w-64 flex flex-row  md:flex-col gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("details")}
                className={`text-center md:text-start text-sm py-2 px-4 rounded-lg font-regular transition-colors ${
                  activeTab === "details"
                    ? "text-brand-primary bg-[rgb(244_242_245)]"
                    : "text-gray-500"
                }`}
              >
                {t.details}
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`text-center md:text-start text-sm py-2 px-4 rounded-lg font-regular transition-colors ${
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
                <div className="prose prose-lg max-w-none text-black/90 font-medium">
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

      <div
        dir={dir}
        className="md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-gray-200 px-4 py-3 "
      >
        <div className="flex flex-col gap-3">
          {/* Mobile Quantity Selector (Full Width) */}
          <div className="flex items-center w-full border border-gray-200 rounded-sm overflow-hidden h-10 bg-white">
            <button
              onClick={increment}
              disabled={quantity >= activeStock}
              className="w-16 h-full flex items-center justify-center hover:bg-gray-50 text-gray-900 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
            <div className="flex-1 text-base h-full flex items-center justify-center font-medium text-gray-900 border-x border-gray-200">
              {quantity}
            </div>
            <button
              onClick={decrement}
              disabled={quantity <= (existingCartQty > 0 ? 0 : 1)}
              className="w-16 h-full flex items-center justify-center hover:bg-gray-50 text-gray-900 disabled:opacity-50 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Add to Cart Button (Black style per image) */}
          <button
            onClick={handleAddToCart}
            disabled={isActionDisabled}
            className="w-full h-10 flex items-center justify-center gap-2 bg-brand-primary text-white rounded-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t.addToCart}
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
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
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100vw-2rem)] md:w-[400px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100 transition-all animate-in slide-in-from-top-4 fade-in duration-300"
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
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 text-right">
                    {product.title}
                  </h3>
                  <p className="text-sm font-bold text-brand-primary mt-1.5 text-right flex items-center justify-end gap-2">
                    {quantity > 1 && (
                      <span className="text-xs text-gray-500">
                        ({quantity}x)
                      </span>
                    )}
                    {formattedPrice}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 text-left">
                    {product.title}
                  </h3>
                  <p className="text-sm font-bold text-brand-primary mt-1.5 text-left flex items-center justify-start gap-2">
                    {formattedPrice}
                    {quantity > 1 && (
                      <span className="text-xs text-gray-500">
                        ({quantity}x)
                      </span>
                    )}
                  </p>
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
            <button
              onClick={() => {
                setAdded(false);
                router.push("/cart");
              }}
              className="w-full py-2.5 text-[rgb(var(--color-brand-primary))] border-2 border-[rgb(var(--color-brand-primary))] rounded-sm text-xs font-medium bg-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
            >
              <ArrowRight size={18} />
              {t.cart}
            </button>
          </div>
        </div>
      )}

      {/* STOCK LIMIT WARNING TOAST */}
      {stockWarning && (
        <div
          dir={dir}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100vw-2rem)] md:w-[320px] bg-white rounded-lg shadow-2xl overflow-hidden border border-red-100 transition-all animate-in slide-in-from-top-4 fade-in duration-300"
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