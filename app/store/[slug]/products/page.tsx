"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  PackageX,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
} from "lucide-react";
import ProductCard from "../components/landing/ProductCard";

// --- Types ---
interface BackendProduct {
  id: string;
  title: string;
  price: string | number;
  discount_price?: number | null;
  images: string[];
  stock: number;
}

type SortOption = "default" | "price-asc" | "price-desc";

const PRODUCTS_PER_PAGE = 20;

// --- Utility: Fisher-Yates Shuffle ---
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// --- Separate Component: Search Bar ---
function SearchBar({
  searchQuery,
  setSearchQuery,
  placeholder,
  dir,
}: {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  placeholder: string;
  dir: "rtl" | "ltr";
}) {
  return (
    <div className="relative flex-grow w-full">
      <div
        className={`absolute inset-y-0 ${
          dir === "rtl" ? "right-0 pr-3.5" : "left-0 pl-3.5"
        } flex items-center pointer-events-none`}
      >
        <Search className="h-5 w-5 text-gray-400 drop-shadow-sm" />
      </div>
      <input
        type="text"
        className={`block w-full rounded-xl border border-gray-200 bg-[#fdfdfd] py-2.5 md:py-3 ${
          dir === "rtl" ? "pr-11 pl-4" : "pl-11 pr-4"
        } text-sm focus:border-[#B73034] focus:ring-1 focus:ring-[#B73034] outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]`}
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}

// --- Separate Component: Filter Panel ---
function FilterPanel({
  sortOption,
  setSortOption,
  inStockOnly,
  setInStockOnly,
  t,
}: {
  sortOption: SortOption;
  setSortOption: (val: SortOption) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  t: any;
}) {
  return (
    <div className="w-full flex justify-between gap-3 md:justify-center flex-wrap items-center md:gap-5">
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value as SortOption)}
        className="text-sm border border-gray-200 rounded-xl py-2.5 px-4 bg-white outline-none focus:border-[#B73034] cursor-pointer shadow-sm transition-all"
      >
        <option value="default">{t.sortDefault}</option>
        <option value="price-asc">{t.sortPriceAsc}</option>
        <option value="price-desc">{t.sortPriceDesc}</option>
      </select>

      <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700 select-none">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="rounded border-gray-300 text-[#B73034] focus:ring-[#B73034] w-5 h-5 cursor-pointer transition-colors"
        />
        <span className="font-medium">{t.inStockOnly}</span>
      </label>
    </div>
  );
}

// --- Separate Component: Skeleton Grid ---
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse flex flex-col">
          <div className="aspect-square bg-gray-100/80 rounded-2xl mb-4 shadow-sm" />
          <div className="h-4 bg-gray-100 rounded-md w-3/4 mb-3" />
          <div className="h-4 bg-gray-100 rounded-md w-1/2" />
        </div>
      ))}
    </div>
  );
}

// --- Separate Component: Pagination ---
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  dir,
  lang,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  dir: "rtl" | "ltr";
  lang: "ar" | "en";
}) {
  const getPageNumbers = (): (number | "ellipsis-start" | "ellipsis-end")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [1];

    if (currentPage > 3) {
      pages.push("ellipsis-start");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis-end");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pages = getPageNumbers();
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm bg-white"
        aria-label={lang === "ar" ? "الصفحة السابقة" : "Previous page"}
      >
        <PrevIcon className="w-5 h-5" />
      </button>

      {pages.map((page, idx) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <span
              key={page}
              className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm select-none"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              page === currentPage
                ? "bg-gradient-to-b from-[#cf3c40] to-[#B73034] text-white border-transparent shadow-[0_4px_10px_rgba(183,48,52,0.3)] transform scale-105"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm bg-white"
        aria-label={lang === "ar" ? "الصفحة التالية" : "Next page"}
      >
        <NextIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

// --- Main Page Component ---
export default function ProductsPage() {
  const searchParams = useSearchParams();

  const rawLang = searchParams.get("lang");
  const lang: "ar" | "en" = rawLang === "en" ? "en" : "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const rawStoreId = searchParams.get("store_id");

  const [allProducts, setAllProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Cache ref to avoid re-fetching
  const productsCache = useRef<BackendProduct[] | null>(null);

  // --- Translations ---
  const translations = {
    ar: {
      home: "الرئيسية",
      allProducts: "جميع المنتجات",
      back: "العودة للرئيسية",
      emptyState: "لا توجد منتجات حالياً.",
      searchPlaceholder: "ابحث عن منتج...",
      filters: "تصفية وترتيب",
      sortDefault: "تصفية وترتيب",
      sortPriceAsc: "السعر: من الأقل للأعلى",
      sortPriceDesc: "السعر: من الأعلى للأقل",
      inStockOnly: "متوفر في المخزون فقط",
      noSearchResults: "لا توجد نتائج مطابقة لبحثك.",
      clearFilters: "مسح التصفية",
      showingResults: (from: number, to: number, total: number) =>
        `عرض ${from}–${to} من ${total} منتج`,
      page: "صفحة",
    },
    en: {
      home: "Home",
      allProducts: "All Products",
      back: "Back to Home",
      emptyState: "No products available yet.",
      searchPlaceholder: "Search products...",
      filters: "Filter & Sort",
      sortDefault: "Filter & Sort",
      sortPriceAsc: "Price: Low to High",
      sortPriceDesc: "Price: High to Low",
      inStockOnly: "In Stock Only",
      noSearchResults: "No products match your search criteria.",
      clearFilters: "Clear Filters",
      showingResults: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} of ${total} products`,
      page: "Page",
    },
  };
  const t = translations[lang];

  // --- Fetch Data (once, then cache) ---
  useEffect(() => {
    // Invalidate cache when store context or language changes
    productsCache.current = null;

    async function fetchProducts() {
      // Return cached if available
      if (productsCache.current) {
        setAllProducts(productsCache.current);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchUrl = `/api/products?lang=${lang}${rawStoreId ? `&store_id=${rawStoreId}` : ""}`;
        const res = await fetch(fetchUrl);

        if (!res.ok) throw new Error("Failed to fetch products");
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const products = json.data as BackendProduct[];
          const shuffled = shuffleArray(products);
          productsCache.current = shuffled;
          setAllProducts(shuffled);
        } else {
          throw new Error(json.message || "Failed to load products");
        }
      } catch (err) {
        console.error(err);
        setError(
          lang === "ar"
            ? "حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى."
            : "Error loading products. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [lang, rawStoreId]);

  // --- Client-side Filtering, Sorting & Pagination ---
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // 1. Search Filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      products = products.filter((p) => p.title.toLowerCase().includes(query));
    }

    // 2. Stock Filter
    if (inStockOnly) {
      products = products.filter((p) => p.stock > 0);
    }

    // 3. Sorting
    if (sortOption === "price-asc") {
      products.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === "price-desc") {
      products.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return products;
  }, [allProducts, searchQuery, inStockOnly, sortOption]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );

  // Auto-correct page when filters shrink results
  const safePage = useMemo(() => {
    if (currentPage > totalPages) return totalPages;
    return currentPage;
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, safePage]);

  const resultsFrom = (safePage - 1) * PRODUCTS_PER_PAGE + 1;
  const resultsTo = Math.min(
    safePage * PRODUCTS_PER_PAGE,
    filteredProducts.length,
  );

  // --- Handlers ---
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages],
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setInStockOnly(false);
    setSortOption("default");
    setCurrentPage(1);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, inStockOnly, sortOption]);

  // --- Render Loading ---
  if (loading) {
    return (
      <div dir={dir} className="min-h-screen pb-8">
        <div className="py-6 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="h-4 w-28 bg-gray-200/60 rounded-md animate-pulse mb-3" />
            <div className="h-5 w-48 bg-gray-200/60 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-2">
          <div className="flex flex-col lg:flex-row gap-5 mb-10">
            <div className="h-12 w-full bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse" />
            <div className="h-12 w-full lg:w-64 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse" />
          </div>
          <SkeletonGrid />
        </div>
      </div>
    );
  }

  // --- Render Error ---
  if (error) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-5"
        dir={dir}
      >
        <div className="flex flex-col items-center max-w-md text-center px-6 py-8 bg-white rounded-2xl border border-red-100 shadow-sm">
          <AlertCircle className="w-12 h-12 text-[#B73034] mb-4 opacity-80" />
          <p className="text-gray-800 font-medium leading-relaxed">{error}</p>
        </div>
        <Link
          href={`/?lang=${lang}`}
          className="text-[#B73034] font-semibold hover:text-[#912529] transition-colors hover:underline underline-offset-4"
        >
          {t.back}
        </Link>
      </div>
    );
  }

  const BreadcrumbIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div dir={dir} className="min-h-screen bg-white pb-20">
      {/* Header & Breadcrumbs */}
      <div className="py-6 px-4 md:px-8 border-b border-gray-100 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto flex flex-col items-start gap-2">
          <p className="text-sm font-medium text-gray-400 flex items-center flex-wrap gap-2.5">
            <Link
              href={`/?lang=${lang}`}
              className="hover:text-[#B73034] transition-colors"
            >
              {t.home}
            </Link>
            <BreadcrumbIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
            <span className="text-gray-900 font-semibold">{t.allProducts}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Search & Filter Section */}
        {allProducts.length > 0 && (
          <div className="flex flex-col w-full lg:flex-row justify-between items-start lg:items-center gap-5 mb-8">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder={t.searchPlaceholder}
              dir={dir}
            />
            <FilterPanel
              sortOption={sortOption}
              setSortOption={setSortOption}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              t={t}
            />
          </div>
        )}

        {/* Results Counter */}
        {!loading && allProducts.length > 0 && filteredProducts.length > 0 && (
          <p className="text-sm font-medium text-gray-500 mb-6 bg-white px-4 py-2 rounded-lg inline-block shadow-sm border border-gray-100">
            {t.showingResults(resultsFrom, resultsTo, filteredProducts.length)}
          </p>
        )}

        {/* Products Grid / Empty States */}
        {allProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <PackageX
              className="w-24 h-24 mb-6 text-gray-200 drop-shadow-sm"
              strokeWidth={1.5}
            />
            <p className="text-xl font-medium text-gray-600">{t.emptyState}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Search
              className="w-20 h-20 mb-6 text-gray-200 drop-shadow-sm"
              strokeWidth={1.5}
            />
            <p className="md:text-lg font-medium text-gray-600 mb-6">
              {t.noSearchResults}
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 text-sm font-semibold bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm hover:bg-gray-50 hover:text-[#B73034] transition-all"
            >
              {t.clearFilters}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedProducts.map((product) => {
                const badge: "New" | "Sale" | "Hot" =
                  product.stock === undefined
                    ? "Hot"
                    : product.stock > 0
                      ? "New"
                      : "Sale";

                const mappedProduct = {
                  id: product.id,
                  title: product.title,
                  price: Number(product.price),
                  image:
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : "https://placehold.co/600x600/png?text=No+Image",
                  discount_price: product.discount_price || null,
                  stock: product.stock ?? 1,
                  rating: 5,
                  badge,
                };

                return (
                  <div
                    key={product.id}
                    className="animate-in fade-in zoom-in-95 duration-500"
                  >
                    <ProductCard lang={lang} product={mappedProduct} />
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              dir={dir}
              lang={lang}
            />
          </>
        )}
      </div>
    </div>
  );
}
