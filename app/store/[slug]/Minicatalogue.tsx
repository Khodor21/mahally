"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowUp, ShoppingBag, Heart, Globe } from "lucide-react";
import ProductCard from "./components/landing/ProductCard";
import HeroSection from "./components/landing/Hero";
import SocialMediaIcons from "./Socialmediaicons";

// Refactored Components
import CatalogueFilters from "./components/catalogue/CatalogueFilters";
import CataloguePagination from "./components/catalogue/CataloguePagination";
import CatalogueFooter from "./components/catalogue/CatalogueFooter";

// Store Context for Cart Badge
import { useShop } from "@/app/store/context";

export interface Product {
  id: string | number;
  title: string;
  description?: string;
  price: number;
  discount_price?: number | null;
  stock?: number;
  images?: string[];
  image?: string;
  rating?: number;
  badge?: "New" | "Sale" | "Hot" | "Best Seller";
  created_at?: string;
  category_id?: string;
  variantGroups?: string;
}

export interface Category {
  id: string;
  store_id: string;
  title: string;
  logo_url?: string;
  created_at?: string;
  display_order?: number;
}

export interface MiniCatalogueProps {
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeDescription?: string;
  logoUrl?: string;
  coverImage?: string;
  products: Product[];
  categories?: Category[];
  lang: "en" | "ar";
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
  twitter?: string;
  snapchat?: string;
  storeEmail?: string;
  storePhone?: string;
  storeLocation?: string;
  storeHours?: string;
}

const ITEMS_PER_PAGE = 12;

// Centralized Translation Dictionary
const CONTENT_DICTIONARY = {
  en: {
    searchPlaceholder: "Search products...",
    noResults: "No products found",
    tryDifferentSearch: "Try a different search term",
    pagination: "Page",
    of: "of",
    products: "Products",
    allCategories: "All Categories",
    filters: "Filters",
    storeHours: "Store Hours",
    location: "Location",
    contact: "Contact",
    email: "Email",
    phone: "Phone",
    followUs: "Follow Us",
    switchLang: "العربية",
  },
  ar: {
    searchPlaceholder: "ابحث عن المنتجات...",
    noResults: "لا توجد منتجات",
    tryDifferentSearch: "جرب كلمة بحث مختلفة",
    pagination: "صفحة",
    of: "من",
    products: "منتجات",
    allCategories: "جميع الفئات",
    filters: "المرشحات",
    storeHours: "ساعات العمل",
    location: "الموقع",
    contact: "الاتصال",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    followUs: "تابعنا",
    switchLang: "English",
  },
};

export default function MiniCatalogue({
  storeId,
  storeName,
  storeSlug,
  storeDescription,
  logoUrl,
  products,
  categories = [],
  lang,
  instagram,
  facebook,
  tiktok,
  whatsapp,
  twitter,
  snapchat,
  storeEmail,
  storePhone,
  storeLocation,
  storeHours,
}: MiniCatalogueProps) {
  const isRtl = lang === "ar";
  const t = CONTENT_DICTIONARY[lang] || CONTENT_DICTIONARY.en;

  // Global Context for Cart Badge
  const { cartItems } = useShop();
  const cartCount =
    cartItems?.reduce(
      (total: number, item: any) => total + (item.qty || 1),
      0,
    ) || 0;

  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Data States
  const [fetchedCategories, setFetchedCategories] =
    useState<Category[]>(categories);

  // Business Logic: Fetch categories from API if not provided via props
  useEffect(() => {
    if (!categories || categories.length === 0) {
      const fetchCategories = async () => {
        try {
          const response = await fetch(`/api/categories?store_id=${storeId}`);
          if (response.ok) {
            const data = await response.json();
            setFetchedCategories(data);
          }
        } catch (error) {
          console.error("Failed to fetch categories:", error);
        }
      };
      fetchCategories();
    } else {
      setFetchedCategories(categories);
    }
  }, [categories, storeId]);

  // Business Logic: Process and sort categories
  const displayCategories = useMemo(() => {
    if (fetchedCategories && fetchedCategories.length > 0) {
      return [...fetchedCategories].sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0),
      );
    }
    const uniqueIds = Array.from(
      new Set(products.map((p) => p.category_id).filter(Boolean)),
    );
    return uniqueIds.map((id) => ({
      id: id as string,
      title: id as string,
      store_id: storeId,
    }));
  }, [fetchedCategories, products, storeId]);

  // Business Logic: Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    if (!searchQuery.trim()) {
      return filtered;
    }

    const query = searchQuery.toLowerCase().trim();
    return filtered.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        (product.description?.toLowerCase().includes(query) ?? false),
    );
  }, [products, searchQuery, selectedCategory]);

  // Business Logic: Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  const paginatedProducts = useMemo(() => {
    const startIdx = (validPage - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIdx, endIdx);
  }, [filteredProducts, validPage]);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    const catalogueSection = document.getElementById("catalogue-filters");
    if (catalogueSection) {
      catalogueSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Scroll to Top Logic
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Data Mapping for Cards
  const mappedProducts = paginatedProducts.map((product) => ({
    id: String(product.id),
    title: product.title || "Untitled Product",
    image:
      product.images?.[0] || "https://placehold.co/600x600/png?text=No+Image",
    price: product.price || 0,
    discount_price: product.discount_price || null,
    stock: product.stock ?? 1,
    rating: 5,
    badge: (product.stock !== undefined
      ? product.stock > 0
        ? "New"
        : "Sale"
      : "Hot") as Product["badge"],
    variantGroups: product.variantGroups,
  }));

  // Resolve the display title for the currently selected category
  const selectedCategoryTitle = useMemo(() => {
    if (!selectedCategory) return t.allCategories;
    const category = displayCategories.find((c) => c.id === selectedCategory);
    return category ? category.title : t.allCategories;
  }, [selectedCategory, displayCategories, t]);

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[rgb(var(--color-brand-primary))] selection:text-white">
      {/* PREMIUM STICKY NAVBAR */}
      <nav className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-lg border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 h-14 md:h-16 flex items-center justify-between"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-2.5">
            {logoUrl && (
              <div className="relative w-8 h-8 md:w-10 md:h-10 rounded overflow-hidden border border-gray-100 shadow-sm bg-white flex-shrink-0">
                <Image
                  src={logoUrl}
                  alt={storeName}
                  fill
                  className="object-contain p-0.5"
                />
              </div>
            )}
            <span className="font-medium text-gray-900 text-sm md:text-base">
              {storeName}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Language Switcher */}

            {/* Favorites */}
            <Link
              href={`/favorites?lang=${lang}`}
              className="relative text-gray-600 hover:text-[rgb(var(--color-brand-primary))] transition-colors rounded-full hover:bg-gray-50"
            >
              <Heart size={24} strokeWidth={1.5} />
            </Link>

            {/* Cart with Dynamic Badge */}
            <Link
              href={`/cart?lang=${lang}`}
              className="relative p-2 text-gray-600 hover:text-[rgb(var(--color-brand-primary))] transition-colors rounded-full hover:bg-gray-50"
            >
              <ShoppingBag size={24} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. HERO & LOGO SECTION */}
      <div className="relative w-full bg-gray-50 border-b border-gray-100">
        {/* Render HeroSection without bottom padding in the wrapper */}
        <div className="w-full">
          <HeroSection storeId={storeId} lang={lang} />
        </div>

        {/* Overlapping Logo: translate-y-1/2 centers it exactly on the bottom edge */}
        {logoUrl && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-20">
            <div className="relative border border-[0.5px] border-brand-primary w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 overflow-hidden rounded-2xl bg-white shadow-sm">
              <Image
                src={logoUrl}
                alt={storeName}
                fill
                className="object-contain p-2"
                priority
              />
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT BODY */}
      <main
        className={`flex-grow px-4 sm:px-6 md:px-10 pb-8 md:pb-12 max-w-7xl mx-auto w-full ${
          // 2. Adjust top padding based on the overflowing logo height
          logoUrl ? "pt-16 sm:pt-20 md:pt-24" : "pt-8"
        }`}
      >
        {/* Store Header: Removed massive Y-padding to bring title closer */}
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="w-full flex flex-col items-center gap-2 mb-8 md:mb-12"
        >
          <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-center text-gray-900 tracking-tight">
            {storeName}
          </h1>
          {storeDescription && (
            <p className="max-w-5xl text-xs sm:text-sm md:text-base text-gray-500 text-center leading-relaxed px-2">
              {storeDescription}
            </p>
          )}

          {/* 3. Moved Social Icons BELOW the text for a cleaner top-down hierarchy */}
          <div className="mt-3">
            <SocialMediaIcons
              {...({
                instagram,
                facebook,
                tiktok,
                whatsapp,
                twitter,
                snapchat,
                lang,
              } as any)}
            />
          </div>
        </div>

        <div id="catalogue-filters" className="scroll-mt-24">
          <CatalogueFilters
            searchQuery={searchQuery}
            setSearchQuery={handleSearch}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={displayCategories}
            t={t}
            isRtl={isRtl}
          />
        </div>

        {/* Product Count indicator */}
        <div
          className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4 mt-8"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {selectedCategoryTitle}
          </h2>
          <span className="text-xs font-medium text-gray-500">
            {filteredProducts.length} {t.products}
          </span>
        </div>

        {/* Products Grid */}
        <div className="mb-12 min-h-[400px]">
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {mappedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col h-full transform transition duration-300 hover:-translate-y-1"
                >
                  <ProductCard
                    product={product}
                    storeSlug={storeSlug}
                    lang={lang}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed mt-8 mx-2 sm:mx-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {t.noResults}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-sm px-4">
                {t.tryDifferentSearch}
              </p>
            </div>
          )}
        </div>

        <CataloguePagination
          currentPage={validPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          t={t}
          isRtl={isRtl}
        />
      </main>

      <CatalogueFooter
        storeName={storeName}
        storeDescription={storeDescription}
        storeHours={storeHours}
        storeLocation={storeLocation}
        storeEmail={storeEmail}
        storePhone={storePhone}
        instagram={instagram}
        facebook={facebook}
        tiktok={tiktok}
        twitter={twitter}
        lang={lang}
        t={t}
        isRtl={isRtl}
      />

      {/* Floating Scroll to Top */}
      <div
        className={`fixed bottom-6 ${isRtl ? "left-6" : "right-6"} z-40 transition-all duration-300 ${showScrollTop ? "translate-y-0 opacity-100 visible" : "translate-y-10 opacity-0 invisible"}`}
      >
        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-[rgb(var(--color-brand-primary))] text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white/20"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
