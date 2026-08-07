"use client";

import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./components/landing/ProductCard";

type Product = {
  id: string | number;
  title: string;
  description?: string;
  price: number;
  discount_price?: number | null;
  stock?: number;
  images?: string[];
  created_at?: string;
  variantGroups?: string;
};

type MappedProduct = {
  id: string;
  title: string;
  image: string;
  price: number;
  discount_price?: number | null;
  stock?: number;
  rating: number;
  badge?: "New" | "Best Seller" | "Hot" | "Sale";
};

type MiniCatalogueClientProps = {
  products: Product[];
  storeSlug: string;
  lang: "en" | "ar";
  primaryColor?: string;
};

const ITEMS_PER_PAGE = 12;

export default function MiniCatalogueClient({
  products,
  storeSlug,
  lang,
  primaryColor = "#000000",
}: MiniCatalogueClientProps) {
  const isRtl = lang === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Translations
  const t = {
    en: {
      search: "Search products...",
      noResults: "No products found",
      pagination: "Page",
      of: "of",
      loadMore: "Load More",
      trySearching: "Try adjusting your search",
    },
    ar: {
      search: "ابحث عن المنتجات...",
      noResults: "لم يتم العثور على منتجات",
      pagination: "الصفحة",
      of: "من",
      loadMore: "تحميل المزيد",
      trySearching: "حاول تعديل بحثك",
    },
  };

  const labels = t[lang] || t.en;

  // Map products to card format
  const mappedProducts: MappedProduct[] = useMemo(() => {
    return (products || []).map((product) => ({
      id: String(product.id),
      title: product.title || "Untitled Product",
      image:
        product.images?.[0] || "https://placehold.co/600x600/png?text=No+Image",
      price: product.price || 0,
      discount_price: product.discount_price || null,
      stock: product.stock ?? 1,
      rating: 5,
      badge:
        product.stock !== undefined
          ? product.stock > 0
            ? "New"
            : "Sale"
          : "Hot",
    }));
  }, [products]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return mappedProducts;
    }

    const query = searchQuery.toLowerCase();
    return mappedProducts.filter((product) => {
      const title = product.title.toLowerCase();
      return title.includes(query);
    });
  }, [mappedProducts, searchQuery]);

  // Reset to page 1 when search changes
  const displayedProducts = useMemo(() => {
    if (searchQuery !== "") {
      setCurrentPage(1);
    }
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIdx, endIdx);
  }, [filteredProducts, searchQuery, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12"
    >
      {/* SEARCH BAR */}
      <div className="mb-10 md:mb-12">
        <div className="relative w-full max-w-2xl mx-auto">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder={labels.search}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brand-primary))] focus:border-transparent text-sm md:text-base"
            aria-label={labels.search}
          />
        </div>
      </div>

      {/* PRODUCT COUNT */}
      {filteredProducts.length > 0 && (
        <p className="text-sm text-gray-600 mb-6">
          {filteredProducts.length} {lang === "ar" ? "منتج" : "product"}
          {filteredProducts.length !== 1 && (lang === "en" ? "s" : "")}
        </p>
      )}

      {/* PRODUCT GRID */}
      {displayedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-12">
            {displayedProducts.map((product) => (
              <div key={product.id}>
                <ProductCard
                  product={product}
                  storeSlug={storeSlug}
                  lang={lang}
                />
              </div>
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 mt-10">
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={!hasPrevPage}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label={`Go to previous page`}
              >
                {isRtl ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
                {lang === "ar" ? "السابق" : "Previous"}
              </button>

              {/* Page Info */}
              <span className="text-sm text-gray-600 font-medium">
                {labels.pagination} {currentPage} {labels.of} {totalPages}
              </span>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={!hasNextPage}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label={`Go to next page`}
              >
                {lang === "ar" ? "التالي" : "Next"}
                {isRtl ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        // EMPTY STATE
        <div className="py-20 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {labels.noResults}
          </h3>
          <p className="text-gray-600 text-sm">{labels.trySearching}</p>
        </div>
      )}
    </div>
  );
}
