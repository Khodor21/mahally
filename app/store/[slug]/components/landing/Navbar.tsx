"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";

import { setLanguage } from "@/lib/setLanguage";
import { useShop } from "@/app/store/context";

type NavbarProps = {
  lang?: "en" | "ar";
  storeName?: string;
  storeSlug?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  popularSearches?: string[];
};

export default function Navbar({
  lang = "ar",
  storeName = "Store",
  storeSlug = "",
  logoUrl,
  primaryColor,
  popularSearches = [],
}: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { cartCount, favCount } = useShop();
  const router = useRouter();

  const dir = lang === "ar" ? "rtl" : "ltr";

  const toggleLang = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLanguage(newLang);
    router.refresh();
  };

  const buildUrl = (path: string) => {
    if (!storeSlug) return `${path}?lang=${lang}`;
    return `/store/${storeSlug}${path}?lang=${lang}`;
  };

  useEffect(() => {
    document.body.style.overflow = searchOpen || mobileMenuOpen ? "hidden" : "";
  }, [searchOpen, mobileMenuOpen]);

  const t = {
    search: lang === "ar" ? "ابحث عن المنتجات..." : "Search products...",
    noResults: lang === "ar" ? "لا توجد نتائج" : "No results",
    favorites: lang === "ar" ? "المفضلة" : "Favorites",
    cart: lang === "ar" ? "السلة" : "Cart",
    home: lang === "ar" ? "الرئيسية" : "Home",
  };

  return (
    <>
      {/* TOP SLUG BAR */}
      <div
        dir={dir}
        className="w-full bg-brand-dark text-white text-center py-2 text-xs md:text-sm font-medium"
      >
        توصيل مجاني للطلبات أكثر من 300 ريال
      </div>

      {/* HEADER */}
      <header
        dir={dir}
        className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 px-3 md:px-10 py-0 md:py-2"
      >
        <div className="flex flex-row-reverse items-center justify-between h-[78px] md:h-[86px]">
          {" "}
          {/* LEFT ICONS */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link href={buildUrl("/cart")} className="relative">
              <ShoppingBag className="w-[22px] md:w-[26px] h-[22px] md:h-[26px] text-black stroke-[1.4]" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-[10px] w-4 h-4 flex items-center justify-center text-white rounded-full"
                  style={{ backgroundColor: primaryColor || "#000" }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href={buildUrl("/favorites")} className="relative">
              <Heart className="w-[22px] md:w-[26px] h-[22px] md:h-[26px] text-black stroke-[1.4]" />
              {favCount > 0 && (
                <span className="absolute -top-2 -right-2 text-[10px] w-4 h-4 flex items-center justify-center bg-black text-white rounded-full">
                  {favCount}
                </span>
              )}
            </Link>
          </div>
          {/* CENTER (LOGO + NAME) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center h-full">
            <Link
              href={buildUrl("")}
              className="flex flex-col items-center justify-center"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-xl object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: primaryColor || "#000" }}
                >
                  {storeName[0]}
                </div>
              )}

              {/* Added hidden md:block to hide text on mobile screens */}
              <span
                className="hidden md:block text-xs md:text-base font-medium mt-1 leading-none"
                style={{ color: primaryColor || "#000" }}
              >
                {storeName}
              </span>
            </Link>
          </div>
          {/* RIGHT ICONS */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Swapped order: Menu is now rendered first, then Search */}
            <button onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-[22px] md:w-[26px] h-[22px] md:h-[26px] text-black stroke-[1.4]" />
            </button>

            <button onClick={() => setSearchOpen(true)}>
              <Search className="w-[22px] md:w-[26px] h-[22px] md:h-[26px] text-black stroke-[1.4]" />
            </button>
          </div>
        </div>
      </header>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-[92%] max-w-xl rounded-2xl p-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <Search className="w-4 h-4 text-black stroke-[1.5]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="flex-1 outline-none text-sm"
              />
              <button onClick={() => setSearchOpen(false)}>
                <X className="w-4 h-4 text-black stroke-[1.5]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MENU - Animated Drawer */}
      <div
        className={`fixed inset-0 z-[120] transition-opacity duration-300 ease-in-out ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Clickable Overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sliding Panel from Right */}
        <div
          className={`absolute top-0 right-0 h-full w-[80%] max-w-sm bg-white p-5 shadow-2xl transition-transform duration-300 ease-in-out transform ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold">{storeName}</span>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <Link href={buildUrl("")} className="block py-3">
              {t.home}
            </Link>

            <Link href={buildUrl("/favorites")} className="block py-3">
              {t.favorites}
            </Link>

            <Link href={buildUrl("/cart")} className="block py-3">
              {t.cart}
            </Link>
          </div>

          <button onClick={toggleLang} className="mt-4 underline text-sm">
            {lang === "ar" ? "English" : "العربية"}
          </button>
        </div>
      </div>
    </>
  );
}
