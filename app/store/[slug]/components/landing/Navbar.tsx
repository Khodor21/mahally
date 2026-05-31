"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { BsSearch } from "react-icons/bs";
import { AiOutlineHeart } from "react-icons/ai";
import { LuShoppingBag } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { Globe } from "lucide-react";

import { setLanguage } from "@/lib/setLanguage";
import { useShop } from "@/app/store/context";
import { authTranslations } from "../../i18n";

const popularSearches = [
  "Shoes",
  "Perfumes",
  "T-Shirts",
  "Bags",
  "Accessories",
];

const SearchModal = ({
  searchOpen,
  setSearchOpen,
  searchQuery,
  setSearchQuery,
}) => (
  <div
    className={`fixed inset-0 z-[100] transition-all duration-300 ${
      searchOpen
        ? "opacity-100 pointer-events-auto"
        : "opacity-0 pointer-events-none"
    }`}
  >
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={() => {
        setSearchOpen(false);
        setSearchQuery("");
      }}
    />

    {/* Modal */}
    <div
      className={`relative w-full max-w-2xl mx-auto mt-20 px-4 transition-all duration-300 ${
        searchOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <BsSearch size={18} className="text-gray-400 shrink-0" />

          <input
            id="search-input"
            type="text"
            placeholder="Search for products, brands, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchOpen(false);
                setSearchQuery("");
              }
            }}
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            autoFocus
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <IoClose size={14} className="text-gray-400" />
            </button>
          )}

          <button
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <IoClose size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Suggestions */}
        <div className="px-5 py-4">
          {searchQuery === "" ? (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Popular Searches
              </p>

              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="text-xs text-gray-600 bg-[#D0DCFF]/50 hover:bg-[#D0DCFF] px-3 py-1.5 rounded-lg transition-colors duration-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Results for &ldquo;{searchQuery}&rdquo;
              </p>

              <div className="flex items-center justify-center py-8 text-gray-400">
                <p className="text-sm">No products found.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function Navbar({
  lang = "en",
  storeName = "Store",
  storeSlug = "",
}: {
  lang?: "en" | "ar";
  storeName?: string;
  storeSlug?: string;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { cartCount, favCount } = useShop();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tr = authTranslations[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const router = useRouter();

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
    if (searchOpen || mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen, mobileMenuOpen]);

  return (
    <>
      <header
        dir={dir}
        className="sticky top-0 z-50 bg-brand-white border-b border-brand-light"
      >
        {/* TOP BAR */}
        <div className="w-full px-4 md:px-10">
          <div className="flex items-center justify-between h-14">
            {/* LEFT */}
            <div className="flex items-center gap-3">
              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-brand-grey transition-colors"
              >
                <HiOutlineMenuAlt3
                  size={22}
                  className="text-brand-dark"
                />
              </button>

              {/* STORE NAME */}
              <Link href={buildUrl("")} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-dark text-white flex items-center justify-center font-bold text-sm">
                  {storeName?.[0] || "S"}
                </div>

                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-bold text-brand-dark">
                    {storeName}
                  </span>

                  <span className="text-[11px] text-brand-dark/50">
                    {lang === "ar" ? "متجر إلكتروني" : "Online Store"}
                  </span>
                </div>
              </Link>
            </div>

            {/* SEARCH */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 bg-brand-grey px-4 h-9 rounded-xl flex-1 max-w-md mx-6"
            >
              <BsSearch className="text-brand-dark/40" />

              <span className="text-sm text-brand-dark/40">
                {lang === "ar"
                  ? "ابحث عن منتجات..."
                  : "Search products..."}
              </span>
            </button>

            {/* ACTIONS */}
            <div className="flex items-center gap-3">
              {/* LANGUAGE */}
              <button
                onClick={toggleLang}
                className="hidden sm:flex items-center gap-1 px-3 h-9 rounded-xl bg-brand-grey text-sm text-brand-dark"
              >
                <Globe size={14} />
                {lang.toUpperCase()}
              </button>

              {/* FAVORITES */}
              <Link href={buildUrl("/favorites")} className="relative">
                <AiOutlineHeart size={22} className="text-brand-dark" />

                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {favCount > 9 ? "9+" : favCount}
                  </span>
                )}
              </Link>

              {/* CART */}
              <Link href={buildUrl("/cart")} className="relative">
                <LuShoppingBag size={22} className="text-brand-dark" />

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-dark text-white text-[10px] rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* MOBILE SEARCH */}
        <div className="md:hidden px-4 pb-3">
          <div
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-brand-grey h-10 rounded-xl px-3"
          >
            <BsSearch className="text-brand-dark/40" />

            <span className="text-sm text-brand-dark/40">
              {lang === "ar" ? "ابحث..." : "Search..."}
            </span>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-[90] transition-all duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* BACKDROP */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* PANEL */}
        <div
          className={`absolute top-0 ${
            dir === "rtl" ? "right-0" : "left-0"
          } h-full w-[82%] max-w-sm bg-white shadow-2xl transition-all duration-300 ${
            mobileMenuOpen
              ? "translate-x-0"
              : dir === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
          }`}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-brand-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold">
                {storeName?.[0] || "S"}
              </div>

              <div>
                <p className="text-sm font-bold text-brand-dark">
                  {storeName}
                </p>

                <p className="text-xs text-brand-dark/50">
                  {lang === "ar" ? "متجر إلكتروني" : "Online Store"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 rounded-xl hover:bg-brand-grey flex items-center justify-center transition-colors"
            >
              <IoClose size={22} className="text-brand-dark" />
            </button>
          </div>

          {/* LINKS */}
          <div className="p-5 flex flex-col gap-2">
            <Link
              href={buildUrl("")}
              onClick={() => setMobileMenuOpen(false)}
              className="h-11 px-4 rounded-xl hover:bg-brand-grey flex items-center text-sm font-medium text-brand-dark transition-colors"
            >
              {lang === "ar" ? "الرئيسية" : "Home"}
            </Link>

            <Link
              href={buildUrl("/favorites")}
              onClick={() => setMobileMenuOpen(false)}
              className="h-11 px-4 rounded-xl hover:bg-brand-grey flex items-center justify-between text-sm font-medium text-brand-dark transition-colors"
            >
              <span>
                {lang === "ar" ? "المفضلة" : "Favorites"}
              </span>

              {favCount > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </Link>

            <Link
              href={buildUrl("/cart")}
              onClick={() => setMobileMenuOpen(false)}
              className="h-11 px-4 rounded-xl hover:bg-brand-grey flex items-center justify-between text-sm font-medium text-brand-dark transition-colors"
            >
              <span>{lang === "ar" ? "السلة" : "Cart"}</span>

              {cartCount > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-brand-dark text-white text-[10px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => {
                toggleLang();
                setMobileMenuOpen(false);
              }}
              className="mt-2 h-11 px-4 rounded-xl bg-brand-grey flex items-center justify-between text-sm font-medium text-brand-dark transition-colors"
            >
              <span>
                {lang === "ar" ? "تغيير اللغة" : "Change Language"}
              </span>

              <div className="flex items-center gap-2">
                <Globe size={15} />
                {lang.toUpperCase()}
              </div>
            </button>
          </div>
        </div>
      </div>

      <SearchModal
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </>
  );
}