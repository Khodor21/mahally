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
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  PackageX,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

// --- Types ---
interface BackendCategory {
  id: string;
  title: string;
  logo_url: string | null;
}

type SortOption = "default" | "name-asc" | "name-desc";

const CATEGORIES_PER_PAGE = 20;

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
  t,
  dir,
}: {
  sortOption: SortOption;
  setSortOption: (val: SortOption) => void;
  t: any;
  dir: "rtl" | "ltr";
}) {
  return (
    <div className="w-full md:w-auto flex flex-row items-center justify-between md:justify-end gap-4">
      <div className="relative w-full md:w-48">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className={`w-full text-sm border border-gray-200 rounded-xl py-2.5 md:py-3 bg-white outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 cursor-pointer appearance-none transition-all shadow-sm text-gray-700 ${
            dir === "rtl" ? "pr-3 pl-10" : "pl-3 pr-10"
          }`}
        >
          <option value="default">{t.sortDefault}</option>
          <option value="name-asc">{t.sortNameAsc}</option>
          <option value="name-desc">{t.sortNameDesc}</option>
        </select>
        <div
          className={`absolute inset-y-0 ${
            dir === "rtl" ? "left-0 pl-3" : "right-0 pr-3"
          } flex items-center pointer-events-none text-gray-400`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

// --- Separate Component: Skeleton Grid ---
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse flex flex-col group">
          <div className="aspect-[1/1.3] bg-gray-100 rounded-2xl mb-4 shadow-sm" />
        </div>
      ))}
    </div>
  );
}

// --- Separate Component: Full Page Skeleton (Hydration Safe) ---
function PageSkeleton({ dir = "rtl" }: { dir?: "rtl" | "ltr" }) {
  return (
    <main dir={dir} className="min-h-screen bg-white pb-20">
      <div className="py-5 px-4 md:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="h-4 w-48 bg-gray-100 rounded-md animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="h-12 w-full lg:w-[400px] bg-gray-50 rounded-xl animate-pulse" />
          <div className="h-12 w-full lg:w-64 bg-gray-50 rounded-xl animate-pulse lg:ml-auto rtl:lg:mr-auto rtl:lg:ml-0" />
        </div>
        <SkeletonGrid />
      </div>
    </main>
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
function CategoriesContent() {
  const searchParams = useSearchParams();

  // State initialization for browser-safe APIs
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [dir, setDir] = useState<"rtl" | "ltr">("rtl");
  const [activeStoreId, setActiveStoreId] = useState<string>("");
  const [isClientReady, setIsClientReady] = useState(false);

  // Data States
  const [allCategories, setAllCategories] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [currentPage, setCurrentPage] = useState(1);

  // Cache ref
  const categoriesCache = useRef<BackendCategory[] | null>(null);

  // --- 1. Robust Initialization (Lang & Invisible Store ID extraction) ---
  useEffect(() => {
    // Determine language
    let resolvedLang: "ar" | "en" = "ar";
    const urlLang = searchParams.get("lang");
    if (urlLang === "en" || urlLang === "ar") {
      resolvedLang = urlLang;
    } else {
      const docLang = document.documentElement.lang;
      if (docLang === "en") resolvedLang = "en";
      else {
        const localLang = window.localStorage.getItem("lang");
        if (localLang === "en") resolvedLang = "en";
      }
    }

    // Determine store ID without exposing it in the URL
    const urlStoreId = searchParams.get("store_id");
    let resolvedStoreId = urlStoreId;
    if (!resolvedStoreId) {
      resolvedStoreId = window.localStorage.getItem("store_id") || "";
    }

    // Self-healing: if found in URL, save it to local storage to clean URL later
    if (resolvedStoreId) {
      window.localStorage.setItem("store_id", resolvedStoreId);
    }

    setLang(resolvedLang);
    setDir(resolvedLang === "ar" ? "rtl" : "ltr");
    setActiveStoreId(resolvedStoreId || "");
    setIsClientReady(true);
  }, [searchParams]);

  // --- Translations ---
  const translations = {
    ar: {
      home: "الرئيسية",
      allCategories: "جميع الأقسام",
      back: "العودة للرئيسية",
      emptyState: "لا توجد أقسام حالياً.",
      searchPlaceholder: "ابحث عن قسم...",
      filters: "تصفية وترتيب",
      sortDefault: "تصفية وترتيب",
      sortNameAsc: "الاسم: أ إلى ي",
      sortNameDesc: "الاسم: ي إلى أ",
      noSearchResults: "لا توجد نتائج مطابقة لبحثك.",
      clearFilters: "مسح التصفية",
      shopNow: "تسوق الآن",
      showingResults: (from: number, to: number, total: number) =>
        `عرض ${from}–${to} من ${total} قسم`,
      page: "صفحة",
    },
    en: {
      home: "Home",
      allCategories: "All Categories",
      back: "Back to Home",
      emptyState: "No categories available yet.",
      searchPlaceholder: "Search categories...",
      filters: "Filter & Sort",
      sortDefault: "Filter & Sort",
      sortNameAsc: "Name: A to Z",
      sortNameDesc: "Name: Z to A",
      noSearchResults: "No categories match your search criteria.",
      clearFilters: "Clear Filters",
      shopNow: "Shop Now",
      showingResults: (from: number, to: number, total: number) =>
        `Showing ${from}–${to} of ${total} categories`,
      page: "Page",
    },
  };
  const t = translations[lang];

  // --- 2. Fetch Data ---
  useEffect(() => {
    if (!isClientReady || !activeStoreId) {
      if (isClientReady && !activeStoreId) setLoading(false);
      return;
    }

    categoriesCache.current = null;

    async function fetchCategories() {
      if (categoriesCache.current) {
        setAllCategories(categoriesCache.current);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchUrl = `/api/categories?lang=${lang}&store_id=${activeStoreId}`;

        const res = await fetch(fetchUrl, { cache: "no-store" });

        if (!res.ok) throw new Error("Failed to fetch categories");
        const json = await res.json();

        const list = json?.data || json?.categories || json || [];

        if (Array.isArray(list)) {
          const categories = list as BackendCategory[];
          const shuffled = shuffleArray(categories);
          categoriesCache.current = shuffled;
          setAllCategories(shuffled);
        } else {
          throw new Error("Failed to load categories format");
        }
      } catch (err) {
        console.error(err);
        setError(
          lang === "ar"
            ? "حدث خطأ أثناء تحميل الأقسام. يرجى المحاولة مرة أخرى."
            : "Error loading categories. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [lang, activeStoreId, isClientReady]);

  // --- Client-side Filtering, Sorting & Pagination ---
  const filteredCategories = useMemo(() => {
    let categories = [...allCategories];

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      categories = categories.filter((c) =>
        c.title.toLowerCase().includes(query),
      );
    }

    if (sortOption === "name-asc") {
      categories.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "name-desc") {
      categories.sort((a, b) => b.title.localeCompare(a.title));
    }

    return categories;
  }, [allCategories, searchQuery, sortOption]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / CATEGORIES_PER_PAGE),
  );

  const safePage = useMemo(() => {
    if (currentPage > totalPages) return totalPages;
    return currentPage;
  }, [currentPage, totalPages]);

  const paginatedCategories = useMemo(() => {
    const start = (safePage - 1) * CATEGORIES_PER_PAGE;
    return filteredCategories.slice(start, start + CATEGORIES_PER_PAGE);
  }, [filteredCategories, safePage]);

  const resultsFrom = (safePage - 1) * CATEGORIES_PER_PAGE + 1;
  const resultsTo = Math.min(
    safePage * CATEGORIES_PER_PAGE,
    filteredCategories.length,
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
    setSortOption("default");
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOption]);

  const BreadcrumbIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  // --- Render Loading (Returns perfectly matched Skeleton) ---
  if (!isClientReady || loading) {
    return <PageSkeleton dir={dir} />;
  }

  // --- Render Error ---
  if (error) {
    return (
      <main
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
      </main>
    );
  }

  return (
    <main dir={dir} className="min-h-screen bg-white pb-20">
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
            <span className="text-gray-900">{t.allCategories}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Search & Filter Section */}
        {allCategories.length > 0 && (
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
              t={t}
              dir={dir}
            />
          </div>
        )}

        {/* Results Counter */}
        {!loading &&
          allCategories.length > 0 &&
          filteredCategories.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500">
                {t.showingResults(
                  resultsFrom,
                  resultsTo,
                  filteredCategories.length,
                )}
              </p>
            </div>
          )}

        {/* Categories Grid / Empty States */}
        {allCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500 bg-gray-50/50 rounded-3xl border border-gray-100/50">
            <PackageX
              className="w-16 h-16 mb-5 text-gray-300"
              strokeWidth={1.5}
            />
            <p className="text-lg font-medium text-gray-600">{t.emptyState}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${encodeURIComponent(cat.title)}?lang=${lang}`}
                  className="group relative w-full aspect-[1/1.3] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 bg-white block animate-in fade-in zoom-in-95 duration-500"
                >
                  {cat.logo_url ? (
                    <Image
                      src={cat.logo_url}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm md:text-base font-medium">
                        No Image
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors duration-300" />
                  <div className="absolute bottom-4 md:bottom-6 left-0 right-0 text-center px-3 md:px-6">
                    <p className="text-white text-base md:text-xl font-semibold line-clamp-2 leading-tight">
                      {cat.title}
                    </p>
                    <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-300">
                      <p className="text-white/90 text-sm md:text-base font-medium mt-2 md:mt-3 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {t.shopNow}
                        <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">
                          {lang === "ar" ? "←" : "→"}
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
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
    </main>
  );
}

// --- Main Export with Safe Hydration Mounting ---
export default function CategoriesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Guarantee that Server HTML and First-Pass Client HTML are identical
  if (!mounted) {
    return <PageSkeleton />;
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoriesContent />
    </Suspense>
  );
}
