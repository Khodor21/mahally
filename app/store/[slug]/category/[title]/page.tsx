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
} from "lucide-react";
import ProductCard from "../../components/landing/ProductCard";

// --- Types ---
interface BackendProduct {
  id: string;
  title: string;
  price: string | number;
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
}: {
  sortOption: SortOption;
  setSortOption: (val: SortOption) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  t: any;
}) {
  return (
    <div className="w-full flex justify-between gap-0 md:justify-center flex-wrap items-center md:gap-4">
      {/* Sort Dropdown */}
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value as SortOption)}
        className="text-sm border border-gray-200 rounded-md py-2 px-3 bg-white outline-none focus:border-brand-black cursor-pointer"
      >
        <option value="default">{t.sortDefault}</option>
        <option value="price-asc">{t.sortPriceAsc}</option>
        <option value="price-desc">{t.sortPriceDesc}</option>
      </select>

      {/* In Stock Toggle */}
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
        {/* Search & Filter Section */}
        {categoryData.products.length > 0 && (
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
              {lang === "ar" ? "مسح التصفية" : "Clear Filters"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map((product) => {
              const mappedProduct = {
                id: product.id,
                title: product.title,
                price: Number(product.price),
                image:
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : "",
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
        )}
      </div>
    </div>
  );
}
