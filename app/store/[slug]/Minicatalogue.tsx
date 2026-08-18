"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { Search, ArrowUp } from "lucide-react";
import ProductCard from "./components/landing/ProductCard";
import HeroSection from "./components/landing/Hero";
import SocialMediaIcons from "./Socialmediaicons";

// Refactored Components
import CatalogueFilters from "./components/catalogue/CatalogueFilters";
import CataloguePagination from "./components/catalogue/CataloguePagination";

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

  // ✅ Explicitly accepting all variations to prevent prop-dropping
  instagram?: string;
  instagram_url?: string;
  facebook?: string;
  facebook_url?: string;
  tiktok?: string;
  tiktok_url?: string;
  whatsapp?: string;
  whatsapp_number?: string;
  twitter?: string;
  twitter_url?: string;
  snapchat?: string;
  snapchat_url?: string;

  storeEmail?: string;
  storePhone?: string;
  storeLocation?: string;
  storeHours?: string;
  primaryColor?: string;
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
    filters: "Categories",
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
    filters: "الأصناف",
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
  coverImage,
  products,
  categories = [],
  lang,

  // Destructure all social props
  instagram,
  instagram_url,
  facebook,
  facebook_url,
  tiktok,
  tiktok_url,
  whatsapp,
  whatsapp_number,
  twitter,
  twitter_url,
  snapchat,
  snapchat_url,
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
    if (categories && categories.length > 0) {
      setFetchedCategories(categories);
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/categories?store_id=${storeId}`);
        if (response.ok) {
          const data = await response.json();
          setFetchedCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, [categories?.length, storeId]);

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

    // Safely format fallback IDs so massive UUIDs don't break the UI
    return uniqueIds.map((id) => {
      const stringId = id as string;
      const displayTitle =
        stringId.length > 15
          ? `Category ${stringId.substring(0, 4).toUpperCase()}`
          : stringId;

      return {
        id: stringId,
        title: displayTitle,
        store_id: storeId,
      };
    });
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    <div
      className="min-h-screen bg-white flex flex-col selection:bg-[rgb(var(--color-brand-primary))] selection:text-white"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* HERO & LOGO SECTION */}
      <div className="relative w-full border-b border-gray-100">
        <div className="w-full">
          <HeroSection storeId={storeId} lang={lang} coverImage={coverImage} />
        </div>

        {/* Overlapping Logo */}
        {logoUrl && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-20">
            <div className="relative border border-gray-100 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 overflow-hidden rounded-2xl bg-white shadow-sm transition-transform duration-500 hover:scale-105 hover:shadow-md">
              <Image
                src={logoUrl}
                alt={storeName}
                fill
                className="object-contain p-2 sm:p-3"
                priority
              />
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT BODY */}
      <main
        className={`flex-grow px-4 sm:px-6 md:px-10 pb-8 md:pb-12 max-w-7xl mx-auto w-full ${
          logoUrl ? "pt-16 sm:pt-20 md:pt-24" : "pt-10"
        }`}
      >
        {/* Store Header */}
        <div className="w-full flex flex-col items-center gap-3 mb-10 md:mb-14">
          <h3 className="text-2xl md:text-4xl font-extrabold text-center text-gray-900 tracking-tight">
            {storeName}
          </h3>
          {storeDescription && (
            <p className="max-w-2xl w-full text-[13px] leading-[1.45] sm:text-sm md:text-base text-gray-500 text-center px-4">
              {storeDescription}
            </p>
          )}

          <div className="mt-2">
            {/* ✅ Passing down ALL variations to guarantee the child receives the data */}
            <SocialMediaIcons
              instagram={instagram}
              instagram_url={instagram_url}
              facebook={facebook}
              facebook_url={facebook_url}
              tiktok={tiktok}
              tiktok_url={tiktok_url}
              whatsapp={whatsapp}
              whatsapp_number={whatsapp_number}
              twitter={twitter}
              twitter_url={twitter_url}
              snapchat={snapchat}
              snapchat_url={snapchat_url}
              lang={lang}
            />
          </div>
        </div>

        {/* Search + Filters Section */}
        <div id="catalogue-filters" className="scroll-mt-24 px-2">
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
        <div className="hidden md:flex items-center justify-between mb-8 border-b border-gray-100 pb-5 mt-10">
          <h3 className="text-lg font-medium text-gray-900 capitalize tracking-tight">
            <bdi>{selectedCategoryTitle}</bdi>
          </h3>
          <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-100 shadow-sm">
            {filteredProducts.length} {t.products}
          </span>
        </div>

        {/* Products Grid */}
        <div className="mb-8 md:mb-14">
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
              {mappedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col h-full transform transition-all duration-300 hover:-translate-y-1.5"
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
            <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center mt-8 mx-2 sm:mx-0 bg-gray-50/30 rounded-3xl border border-gray-200/60 border-dashed shadow-sm">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Search className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5 tracking-tight">
                {t.noResults}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-sm px-6 leading-relaxed">
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

      {/* Floating Scroll to Top (Uses logical 'end-6' for LTR/RTL support) */}
      <div
        className={`fixed bottom-6 end-6 z-40 transition-all duration-300 ${
          showScrollTop
            ? "translate-y-0 opacity-100 visible"
            : "translate-y-10 opacity-0 invisible"
        }`}
      >
        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-brand-primary text-white shadow-xl hover:bg-white hover:text-brand-primary hover:scale-105 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          aria-label="Scroll to top"
        >
          <ArrowUp size={22} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
