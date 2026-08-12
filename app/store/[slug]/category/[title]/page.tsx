"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Loader2,
  PackageX,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import ProductCard from "../../components/landing/ProductCard";

// --- Types ---
interface BackendProduct {
  id: string;
  title: string;
  price: string | number;
  discount_price?: number | null;
  images: string[];
  stock: number;
}

interface CategoryData {
  id: string;
  title: string;
  banner_url: string | null;
  products: BackendProduct[];
}

type SortOption = "default" | "price-asc" | "price-desc";

const ITEMS_PER_PAGE = 8;

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
        className={`absolute inset-y-0 ${dir === "rtl" ? "right-0 pr-3" : "left-0 pl-3"} flex items-center pointer-events-none`}
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
    <div className="w-full flex flex-row items-center justify-between gap-3 md:gap-4 md:items-start md:items-center">
      {/* Sort Dropdown */}
      <div className="w-[50%] md:w-w[75%] relative">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className={`w-full md:w-48 text-sm border border-gray-200 rounded-sm py-1.5 px-1 bg-white outline-none focus:border-brand-black focus:ring-2 focus:ring-brand-black/10 cursor-pointer appearance-none transition-all ${
            dir === "rtl" ? "pr-3" : "pl-3"
          }`}
        >
          <option value="default">{t.sortDefault}</option>
          <option value="price-asc">{t.sortPriceAsc}</option>
          <option value="price-desc">{t.sortPriceDesc}</option>
        </select>
        <div
          className={`absolute inset-y-0 ${dir === "rtl" ? "left-0 pl-3" : "right-0 pr-3"} flex items-center pointer-events-none text-gray-400`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* In Stock Toggle */}
      <label className="flex items-center gap-2 cursor-pointer text-xs md:text-sm text-gray-700">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="rounded border-gray-300 text-brand-black focus:ring-brand-black w-3 h-3 md:w-4 md:h-4 cursor-pointer accent-brand-black"
        />
        {t.inStockOnly}
      </label>
    </div>
  );
}

// --- Pagination Component ---
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  t,
  dir,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  t: any;
  dir: "rtl" | "ltr";
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {dir === "rtl" ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
              page === currentPage
                ? "bg-brand-black text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {dir === "rtl" ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

// --- Main Page Component ---
export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const rawTitle = params.title as string;
  const categoryTitle = decodeURIComponent(rawTitle);

  const rawLang = searchParams.get("lang");
  const lang: "ar" | "en" = rawLang === "en" ? "en" : "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Translations ---
  const translations = {
    ar: {
      home: "الرئيسية",
      back: "العودة للرئيسية",
      emptyState: "لا توجد منتجات في هذا القسم حالياً.",
      searchPlaceholder: "ابحث عن منتج في هذا القسم...",
      filters: "تصفية وترتيب",
      sortDefault: "تصفية وترتيب",
      sortPriceAsc: "السعر: من الأقل للأعلى",
      sortPriceDesc: "السعر: من الأعلى للأقل",
      inStockOnly: "متوفر في المخزون فقط",
      noSearchResults: "لا توجد نتائج مطابقة لبحثك.",
      clearFilters: "مسح التصفية",
    },
    en: {
      home: "Home",
      back: "Back to Home",
      emptyState: "No products available in this category yet.",
      searchPlaceholder: "Search products in this category...",
      filters: "Filter & Sort",
      sortDefault: "Filter & Sort",
      sortPriceAsc: "Price: Low to High",
      sortPriceDesc: "Price: High to Low",
      inStockOnly: "In Stock Only",
      noSearchResults: "No products match your search criteria.",
      clearFilters: "Clear Filters",
    },
  };
  const t = translations[lang];

  // --- Fetch Data ---
  useEffect(() => {
    async function fetchCategoryData() {
      if (!categoryTitle) return;

      try {
        setLoading(true);
        const res = await fetch(
          `/api/categories/by-title/${encodeURIComponent(categoryTitle)}/products?lang=${lang}`,
        );

        if (!res.ok) throw new Error("Failed to fetch category data");
        const json = await res.json();

        if (json.success) {
          setCategoryData(json.data);
          setCurrentPage(1); // Reset to first page on new category
        } else {
          throw new Error(json.message || "Failed to load category");
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

    fetchCategoryData();
  }, [categoryTitle, lang]);

  // --- Active Filtration & Sorting Logic ---
  const filteredProducts = useMemo(() => {
    if (!categoryData?.products) return [];

    let products = [...categoryData.products];

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
  }, [categoryData, searchQuery, inStockOnly, sortOption]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIdx, endIdx);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, inStockOnly, sortOption]);

  // --- Render Loading ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-brand-black" />
      </div>
    );
  }

  // --- Render Error ---
  if (error || !categoryData) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-white gap-4"
        dir={dir}
      >
        <p className="text-red-500 font-medium">
          {error || "Category not found"}
        </p>
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
            <span className="text-brand-black">{categoryData.title}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-1">
        {/* Search & Filter Section - Now Full Width */}
        {categoryData.products.length > 0 && (
          <div className="w-full flex flex-col gap-4 mb-8">
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

        {/* Products Grid / Empty States */}
        {categoryData.products.length === 0 ? (
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
              onClick={() => {
                setSearchQuery("");
                setInStockOnly(false);
                setSortOption("default");
              }}
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

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              t={t}
              dir={dir}
            />
          </>
        )}
      </div>
    </div>
  );
}
