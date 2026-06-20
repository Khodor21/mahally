"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, ShoppingBag, Menu, X, User } from "lucide-react";

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
}: NavbarProps) {
  // 🔍 DEBUG: Log the received language
  console.log("Navbar received lang prop:", lang);

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const { cartCount, favCount } = useShop();
  const router = useRouter();

  const dir = lang === "ar" ? "rtl" : "ltr";
  const isRTL = lang === "ar";

  console.log("Navbar calculated dir:", dir);
  console.log("Navbar isRTL:", isRTL);

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
    document.body.style.overflow = searchOpen || mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen, mobileMenuOpen]);

  const t = {
    search: isRTL ? "ابحث عن المنتجات..." : "Search products...",
    noResults: isRTL ? "لا توجد نتائج" : "No results",
    favorites: isRTL ? "المفضلة" : "Favorites",
    cart: isRTL ? "السلة" : "Cart",
    allCategories: isRTL ? "كل التصنيفات" : "All Categories",
    shopAll: isRTL ? "تسوق الكل" : "Shop All",
    profile: isRTL ? "الحساب" : "Profile",
    promoText: isRTL
      ? "توصيل مجاني للطلبات أكثر من 300 ريال"
      : "Free delivery for orders over 300 SAR",
  };

  return (
    <>
      {/* TOP PROMO BAR */}
      {promoText && promoText.trim() !== "" && (
        <div
          dir={dir}
          className="w-full bg-brand-primary text-white text-center py-3 text-sm tracking-wide font-medium"
        >
          {promoText}
        </div>
      )}

      {/* HEADER */}
      <header
        dir={dir}
        className="sticky top-0 z-50 w-full bg-white backdrop-blur-md border-b border-gray-100 transition-all duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* 1. START (Logo & Mobile Menu Toggle) */}
            <div className="flex items-center gap-3 flex-1 md:flex-none">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 -ms-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Logo */}
              <Link
                href={"/"}
                className="flex items-center gap-2 group transition-opacity hover:opacity-90"
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={storeName}
                    className="h-8 md:h-10 w-auto max-w-[120px] md:max-w-[160px] object-contain"
                  />
                ) : (
                  <div
                    className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
                    style={{ backgroundColor: primaryColor || "#000" }}
                  >
                    {storeName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            </div>

            {/* 2. CENTER (Desktop Categories) */}
            <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 flex-1 px-4">
              {loadingCategories ? (
                // Skeletons for desktop links
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-16 h-4 bg-gray-100 animate-pulse rounded-md"
                  />
                ))
              ) : (
                <>
                  {/* Display up to 6 categories directly in the header */}
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${encodeURIComponent(cat.title)}?lang=${lang}`}
                      className="font-medium text-black/90 hover:text-brand-primary transition-colors whitespace-nowrap"
                    >
                      {cat.title}
                    </Link>
                  ))}

                  {/* If more than 6, add a generic shop link */}
                  {categories.length > 6 && (
                    <Link
                      href={"/categories"}
                      className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap"
                    >
                      {t.shopAll}
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* 3. END (Icons - Search, Profile, Fav, Cart) */}
            <div className="flex items-center justify-end gap-1 sm:gap-2 flex-1 md:flex-none">
              {/* Profile (Desktop mainly) */}
              <Link
                href={"/profile"}
                className="hidden sm:flex transition-colors text-brand-black"
                aria-label={t.profile}
              >
                <User className="w-[26px] h-[26px] stroke-[1.5]" />
              </Link>

              {/* Favorites */}
              <Link
                href={"/favorites"}
                className="relative transition-colors text-brand-black"
                aria-label={t.favorites}
              >
                <Heart className="w-[26px] h-[26px] stroke-[1.5]" />
                {favCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-black text-white rounded-full ring-2 ring-white">
                    {favCount > 99 ? "99+" : favCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href={"/cart"}
                className="relative transition-colors text-brand-black"
                aria-label={t.cart}
              >
                <ShoppingBag className="w-[26px] h-[26px] stroke-[1.5]" />
                {cartCount > 0 && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white rounded-full ring-2 ring-white"
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
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-zinc-900/40 backdrop-blur-sm transition-opacity"
        >
          {/* Overlay click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setSearchOpen(false)}
          />

          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 stroke-[1.5]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="flex-1 bg-transparent px-4 py-2 text-base md:text-lg outline-none placeholder:text-gray-400 text-gray-900"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Quick Links / Empty State Area */}
            <div className="p-4 bg-gray-50/50 min-h-[150px]">
              {searchQuery.trim() === "" ? (
                <div className="text-sm text-gray-500">
                  {popularSearches.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => setSearchQuery(term)}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs hover:border-black transition-colors shadow-sm"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="flex items-center justify-center h-full pt-8">
                      {t.search}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full pt-8 text-sm text-gray-500">
                  {t.noResults}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MENU - Animated Drawer */}
      <div
        dir={dir}
        className={`fixed inset-0 z-[120] lg:hidden transition-opacity duration-300 ease-in-out ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Clickable Overlay */}
        <div
          className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sliding Panel */}
        <div
          className={`absolute top-0 ${isRTL ? "right-0" : "left-0"} h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
            mobileMenuOpen
              ? "translate-x-0"
              : isRTL
                ? "translate-x-full"
                : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <span className="font-semibold text-lg">{storeName}</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 -me-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto py-4 px-5 flex flex-col gap-1">
            {/* Dynamic Categories in Mobile */}
            <div className="py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">
                {t.allCategories}
              </p>
              <div className="flex flex-col">
                {loadingCategories
                  ? // Mobile Skeletons
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="py-3">
                        <div className="w-24 h-4 bg-gray-100 animate-pulse rounded-md" />
                      </div>
                    ))
                  : categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${encodeURIComponent(cat.title)}?lang=${lang}`}
                        className="py-3 text-base font-medium text-gray-600 hover:text-black transition-colors"
                      >
                        {cat.title}
                      </Link>
                    ))}
              </div>
            </div>

            <Link
              href={"/profile"}
              className="flex items-center gap-3 py-3 mt-4 text-base font-medium text-gray-800 hover:text-black transition-colors border-t border-gray-50"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
              {t.profile}
            </Link>
          </div>

          {/* Drawer Footer - Language Info (Read-Only) */}
          <div className="p-5 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              {lang === "ar" ? "اللغة: العربية" : "Language: English"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
