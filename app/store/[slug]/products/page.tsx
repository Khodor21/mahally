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
          dir === "rtl" ? "right-0 pr-3" : "left-0 pl-3"
        } flex items-center pointer-events-none`}
      >
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className={`block w-full rounded-lg border border-gray-100 bg-[#fdfdfd] py-1.5 md:py-2.5 ${
          dir === "rtl" ? "pr-10 pl-3" : "pl-10 pr-3"
        } text-sm focus:border-brand-black focus:ring-brand-black outline-none transition-colors`}
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
    <div className="w-full flex justify-between gap-0 md:justify-center flex-wrap items-center md:gap-4">
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value as SortOption)}
        className="text-sm border border-gray-200 rounded-md py-2 px-3 bg-white outline-none focus:border-brand-black cursor-pointer"
      >
        <option value="default">{t.sortDefault}</option>
        <option value="price-asc">{t.sortPriceAsc}</option>
        <option value="price-desc">{t.sortPriceDesc}</option>
      </select>

      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="rounded border-gray-300 text-brand-black focus:ring-brand-black w-4 h-4 cursor-pointer"
        />
        {t.inStockOnly}
      </label>
    </div>
  );
}

// --- Separate Component: Skeleton Grid ---
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-lg mb-3" />
          <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
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
    <div className="flex items-center justify-center gap-1.5 mt-10 mb-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label={lang === "ar" ? "الصفحة السابقة" : "Previous page"}
      >
        <PrevIcon className="w-4 h-4" />
      </button>

      {pages.map((page, idx) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <span
              key={page}
              className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-brand-black text-white border border-brand-black"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label={lang === "ar" ? "الصفحة التالية" : "Next page"}
      >
        <NextIcon className="w-4 h-4" />
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
    async function fetchProducts() {
      // Return cached if available
      if (productsCache.current) {
        setAllProducts(productsCache.current);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/products?lang=${lang}`);

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
  }, [lang]);

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
      <div dir={dir} className="min-h-screen bg-white pb-16">
        <div className="py-4 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-1">
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-10 w-48 bg-gray-100 rounded-md animate-pulse" />
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
        className="min-h-screen flex flex-col items-center justify-center bg-white gap-4"
        dir={dir}
      >
        <p className="text-red-500 font-medium">{error}</p>
        <Link
          href={`/?lang=${lang}`}
          className="text-brand-black hover:underline"
        >
          {t.back}
        </Link>
      </div>
    );
  }

  const BreadcrumbIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div dir={dir} className="min-h-screen bg-white pb-16">
      {/* Header & Breadcrumbs */}
      <div className="py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-start gap-2">
          <p className="font-medium text-gray-400 flex items-center flex-wrap gap-2">
            <Link
              href={`/?lang=${lang}`}
              className="hover:text-brand-black transition-colors"
            >
              {t.home}
            </Link>
            <BreadcrumbIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-brand-black">{t.allProducts}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-1">
        {/* Search & Filter Section */}
        {allProducts.length > 0 && (
          <div className="flex flex-col w-full lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
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
          <p className="text-xs text-gray-400 mb-4">
            {t.showingResults(resultsFrom, resultsTo, filteredProducts.length)}
          </p>
        )}

        {/* Products Grid / Empty States */}
        {allProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <PackageX
              className="w-20 h-20 mb-4 text-gray-300"
              strokeWidth={1.5}
            />
            <p className="text-lg font-medium">{t.emptyState}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Search className="w-12 h-12 mb-4 text-gray-300" />
            <p className="md:text-lg font-medium">{t.noSearchResults}</p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 text-sm bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
            >
              {t.clearFilters}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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
                    className="animate-in fade-in duration-500"
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
