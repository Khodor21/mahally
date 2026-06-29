"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, ShoppingBag, X, User } from "lucide-react";
import { useShop } from "@/app/store/context";

interface Category {
  id: string;
  title: string;
  logo_url: string | null;
}

type NavbarProps = {
  lang?: "en" | "ar";
  storeId?: string;
  storeName?: string;
  storeSlug?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  promoText?: string | null;
  popularSearches?: string[];
  recommendedProducts?: { id: string; title: string }[];
};

export default function Navbar({
  lang = "ar",
  storeId,
  storeName = "Store",
  storeSlug = "",
  logoUrl,
  primaryColor,
  popularSearches = [],
  promoText = "",
  recommendedProducts,
}: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { cartCount, favCount } = useShop();
  const router = useRouter();

  const dir = lang === "ar" ? "rtl" : "ltr";
  const isRTL = lang === "ar";

  // Listen for the custom event emitted by BottomNavbar to open the search modal
  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    window.addEventListener("open-search-modal", handleOpenSearch);
    return () =>
      window.removeEventListener("open-search-modal", handleOpenSearch);
  }, []);

  // Fetch Categories
  useEffect(() => {
    async function fetchNavbarCategories() {
      if (!storeId) {
        setLoadingCategories(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/categories?store_id=${storeId}&lang=${lang}`,
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const list = data?.data || data?.categories || data || [];
        setCategories(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Failed to fetch categories for navbar:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchNavbarCategories();
  }, [storeId, lang]);

  // Prevent scroll when modals open
  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  const t = {
    search: isRTL ? "ابحث عن المنتجات..." : "Search products...",
    noResults: isRTL ? "لا توجد نتائج" : "No results",
    favorites: isRTL ? "المفضلة" : "Favorites",
    cart: isRTL ? "السلة" : "Cart",
    shopAll: isRTL ? "تسوق الكل" : "Shop All",
    profile: isRTL ? "الحساب" : "Profile",
    popularSearches: isRTL ? "عمليات بحث شائعة" : "Popular Searches",
    recommended: isRTL ? "مقترحات لك" : "Recommended",
  };

  const hasPopularSearches = popularSearches.length > 0;
  const hasRecommended = recommendedProducts && recommendedProducts.length > 0;
  const hasEmptyStateContent = hasPopularSearches || hasRecommended;

  return (
    <>
      {/* TOP PROMO BAR */}
      {promoText && promoText.trim() !== "" && (
        <div
          dir={dir}
          className="w-full bg-brand-primary text-white text-center py-2.5 px-4 text-[13px] sm:text-sm tracking-wide font-medium"
        >
          {promoText}
        </div>
      )}

      {/* HEADER - Relative on Mobile (scrolls away), Sticky on Desktop */}
      <header
        dir={dir}
        className="relative md:sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto py-auto">
          <div className="flex items-center justify-between h-14 md:h-14 my-auto gap-3 md:gap-8">
            {/* 1. START (Logo) */}
            <Link
              href={"/"}
              className="flex items-center gap-2 group transition-opacity hover:opacity-90 flex-shrink-0"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="h-8 md:h-10 w-auto max-w-[100px] md:max-w-[160px] object-contain"
                />
              ) : (
                <div
                  className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{ backgroundColor: primaryColor || "#111827" }}
                >
                  {storeName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>

            {/* 2. DESKTOP CENTER (Categories) */}
            <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 flex-1 px-4">
              {loadingCategories ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-16 h-4 bg-gray-100 animate-pulse rounded-md"
                  />
                ))
              ) : (
                <>
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${encodeURIComponent(cat.title)}?lang=${lang}`}
                      className="text-[18px] font-medium text-gray-800 hover:text-brand-primary transition-colors whitespace-nowrap"
                    >
                      {cat.title}
                    </Link>
                  ))}

                  {categories.length > 6 && (
                    <Link
                      href={"/categories"}
                      className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap"
                    >
                      {t.shopAll}
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* 3. END (Icons) */}
            <div className="flex items-center justify-end gap-3 sm:gap-3 flex-shrink-0">
              {/* Search Icon (Mobile & Desktop) */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex transition-colors text-gray-700 hover:text-brand-primary"
                aria-label={t.search}
              >
                <Search className="w-[23px] h-[23px] md:w-[26px] md:h-[26px] stroke-[1.5]" />
              </button>

              {/* Profile (Desktop Only) */}
              <Link
                href={"/profile"}
                className="hidden md:flex transition-colors text-gray-700 hover:text-brand-primary"
                aria-label={t.profile}
              >
                <User className="w-[26px] h-[26px] stroke-[1.5]" />
              </Link>

              {/* Favorites (Mobile & Desktop) */}
              <Link
                href={"/favorites"}
                className="relative transition-colors text-gray-700 hover:text-brand-primary"
                aria-label={t.favorites}
              >
                <Heart className="w-[23px] h-[23px] md:w-[26px] md:h-[26px] stroke-[1.5]" />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-brand-primary text-white rounded-full ring-2 ring-white">
                    {favCount > 99 ? "99+" : favCount}
                  </span>
                )}
              </Link>

              {/* Cart (Desktop Only) */}
              <Link
                href={"/cart"}
                className="hidden md:flex relative transition-colors text-gray-700 hover:text-brand-primary"
                aria-label={t.cart}
              >
                <ShoppingBag className="w-[25px] h-[25px] stroke-[1.5]" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white rounded-full ring-2 ring-white"
                    style={{ backgroundColor: primaryColor || "#000" }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH MODAL (Command Palette Style) */}
      {searchOpen && (
        <div
          dir={dir}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[5vh] md:pt-[10vh] px-4 bg-zinc-900/60 backdrop-blur-sm transition-opacity"
        >
          {/* Overlay click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 stroke-[2]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="flex-1 bg-transparent px-4 py-2.5 text-base md:text-lg outline-none placeholder:text-gray-400 text-gray-900"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Quick Links / Empty State Area */}
            <div className="p-4 bg-gray-50/50 min-h-[200px]">
              {searchQuery.trim() === "" ? (
                hasEmptyStateContent ? (
                  <div className="space-y-4">
                    {/* Popular Searches */}
                    {hasPopularSearches && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                          {t.popularSearches}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {popularSearches.map((term, i) => (
                            <button
                              key={i}
                              onClick={() => setSearchQuery(term)}
                              className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-[13px] hover:border-gray-400 text-gray-700 transition-colors shadow-sm"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Products */}
                    {hasRecommended && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                          {t.recommended}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recommendedProducts!.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => setSearchQuery(product.title)}
                              className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-[13px] hover:border-gray-400 text-gray-700 transition-colors shadow-sm"
                            >
                              {product.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[120px] gap-2 opacity-60">
                    <Search className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                    <span>{t.search}</span>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-[120px] text-sm text-gray-500">
                  {t.noResults}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
