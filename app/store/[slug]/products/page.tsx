"use client";

import {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
  Suspense,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  PackageX,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  ChevronDown,
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
    <div className="relative flex-grow w-full md:max-w-md lg:max-w-lg">
      <div
        className={`absolute inset-y-0 ${
          dir === "rtl" ? "right-0 pr-3.5" : "left-0 pl-3.5"
        } flex items-center pointer-events-none`}
      >
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        className={`block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 md:py-3 ${
          dir === "rtl" ? "pr-10 pl-4" : "pl-10 pr-4"
        } text-sm focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400 text-gray-900 shadow-sm`}
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
  dir,
}: {
  sortOption: SortOption;
  setSortOption: (val: SortOption) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  t: any;
  dir: "rtl" | "ltr";
}) {
  return (
    <div className="w-full md:w-auto flex flex-row items-center justify-between md:justify-end gap-4">
      <div className="relative w-[60%] md:w-48">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className={`w-full text-sm border border-gray-200 rounded-xl py-2.5 md:py-3 bg-white outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 cursor-pointer appearance-none transition-all shadow-sm text-gray-700 ${
            dir === "rtl" ? "pr-3 pl-10" : "pl-3 pr-10"
          }`}
        >
          <option value="default">{t.sortDefault}</option>
          <option value="price-asc">{t.sortPriceAsc}</option>
          <option value="price-desc">{t.sortPriceDesc}</option>
        </select>
        <div
          className={`absolute inset-y-0 ${
            dir === "rtl" ? "left-0 pl-3" : "right-0 pr-3"
          } flex items-center pointer-events-none text-gray-400`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 select-none group">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="peer rounded border-gray-300 text-gray-900 focus:ring-gray-900 w-4 h-4 cursor-pointer transition-colors"
          />
        </div>
        <span className="font-medium group-hover:text-gray-900 transition-colors">
          {t.inStockOnly}
        </span>
      </label>
    </div>
  );
}

// --- Separate Component: Skeleton Grid ---
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse flex flex-col group">
          <div className="aspect-square bg-gray-100 rounded-2xl mb-4 shadow-sm" />
          <div className="h-4 bg-gray-100 rounded-md w-3/4 mb-2.5" />
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

    if (currentPage > 3) pages.push("ellipsis-start");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("ellipsis-end");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  if (totalPages <= 1) return null;

  const pages = getPageNumbers();
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-16 mb-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed bg-white"
        aria-label={lang === "ar" ? "الصفحة السابقة" : "Previous page"}
      >
        <PrevIcon className="w-4 h-4" />
      </button>

      {pages.map((page, idx) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <span
              key={`${page}-${idx}`}
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
            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
              page === currentPage
                ? "bg-gray-900 text-white border-transparent shadow-md"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed bg-white"
        aria-label={lang === "ar" ? "الصفحة التالية" : "Next page"}
      >
        <NextIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- Page Content (Wrapped in Suspense) ---
function ProductsContent() {
  const searchParams = useSearchParams();
  const rawStoreId = searchParams.get("store_id");

  // State initialization for Hydration safety & smart URL fallbacks
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [dir, setDir] = useState<"rtl" | "ltr">("rtl");
  const [isClientReady, setIsClientReady] = useState(false);

  // Data States
  const [allProducts, setAllProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Cache ref
  const productsCache = useRef<BackendProduct[] | null>(null);

  // --- 1. Robust Language Detection ---
  // Fixes the issue where /products doesn't have ?lang=en in the URL
  useEffect(() => {
    let activeLang: "ar" | "en" = "ar";
    const urlLang = searchParams.get("lang");

    if (urlLang === "en" || urlLang === "ar") {
      activeLang = urlLang;
    } else {
      // Fallback 1: Check document layout lang
      const docLang = document.documentElement.lang;
      if (docLang === "en") activeLang = "en";
      else {
        // Fallback 2: Check localStorage if present
        const localLang = window.localStorage.getItem("lang");
        if (localLang === "en") activeLang = "en";
      }
    }

    setLang(activeLang);
    setDir(activeLang === "ar" ? "rtl" : "ltr");
    setIsClientReady(true);
  }, [searchParams]);

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

  // --- 2. Fetch Data ---
  useEffect(() => {
    // Prevent fetching until client determines the correct language
    if (!isClientReady) return;

    productsCache.current = null;

    async function fetchProducts() {
      if (productsCache.current) {
        setAllProducts(productsCache.current);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchUrl = `/api/products?lang=${lang}${rawStoreId ? `&store_id=${rawStoreId}` : ""}`;

        // Cache-busting to ensure we don't fetch stale Arabic data
        const res = await fetch(fetchUrl, { cache: "no-store" });

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
  }, [lang, rawStoreId, isClientReady]);

  // --- Client-side Filtering, Sorting & Pagination ---
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      products = products.filter((p) => p.title.toLowerCase().includes(query));
    }

    if (inStockOnly) {
      products = products.filter((p) => p.stock > 0);
    }

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, inStockOnly, sortOption]);

  const BreadcrumbIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  // --- Render Loading ---
  if (!isClientReady || loading) {
    return (
      <div dir={dir} className="min-h-screen bg-white pb-20">
        <div className="py-5 px-4 md:px-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="h-4 w-48 bg-gray-100 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="h-12 w-full lg:w-[400px] bg-gray-50 rounded-xl animate-pulse" />
            <div className="h-12 w-full lg:w-64 bg-gray-50 rounded-xl animate-pulse ml-auto" />
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
        className="min-h-screen flex flex-col items-center justify-center gap-5 bg-white px-4"
        dir={dir}
      >
        <div className="flex flex-col items-center max-w-md text-center p-8 bg-red-50/50 rounded-3xl border border-red-100">
          <AlertCircle
            className="w-12 h-12 text-red-500 mb-4"
            strokeWidth={1.5}
          />
          <p className="text-gray-900 font-medium leading-relaxed">{error}</p>
        </div>
        <Link
          href={`/?lang=${lang}`}
          className="text-gray-600 font-medium hover:text-gray-900 transition-colors hover:underline underline-offset-4"
        >
          {t.back}
        </Link>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-white pb-20">
      {/* Header & Breadcrumbs */}
      <div className="py-5 px-4 md:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col items-start">
          <p className="text-sm font-medium text-gray-500 flex items-center flex-wrap gap-2">
            <Link
              href={`/?lang=${lang}`}
              className="hover:text-gray-900 transition-colors"
            >
              {t.home}
            </Link>
            <BreadcrumbIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
            <span className="text-gray-900">{t.allProducts}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
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
              dir={dir}
            />
          </div>
        )}

        {/* Results Counter */}
        {!loading && allProducts.length > 0 && filteredProducts.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500">
              {t.showingResults(
                resultsFrom,
                resultsTo,
                filteredProducts.length,
              )}
            </p>
          </div>
        )}

        {/* Products Grid / Empty States */}
        {allProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500 bg-gray-50/50 rounded-3xl border border-gray-100/50">
            <PackageX
              className="w-16 h-16 mb-5 text-gray-300"
              strokeWidth={1.5}
            />
            <p className="text-lg font-medium text-gray-600">{t.emptyState}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500 bg-gray-50/50 rounded-3xl border border-gray-100/50">
            <Search
              className="w-12 h-12 mb-5 text-gray-300"
              strokeWidth={1.5}
            />
            <p className="md:text-lg font-medium text-gray-600 mb-6">
              {t.noSearchResults}
            </p>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all"
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

// --- Main Export with Suspense Boundary (Fixes Next.js 15 Hydration Issue) ---
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
