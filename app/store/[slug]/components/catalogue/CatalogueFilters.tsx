"use client";
import { useState } from "react";
import { Search, ChevronDown, Filter } from "lucide-react";

interface Category {
  id: string;
  title: string;
}

interface CatalogueFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  categories: Category[];
  t: Record<string, string>;
  isRtl: boolean;
}

export default function CatalogueFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  onCategoryChange,
  categories,
  t,
  isRtl,
}: CatalogueFiltersProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fallback to "All Products" instead of "All Categories"
  const defaultTitle = isRtl ? "جميع المنتجات" : "All Products";

  // Helper to find the title of the currently selected category
  const currentCategoryTitle = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.title || defaultTitle
    : defaultTitle;

  // Handle selection on mobile and auto-close the dropdown
  const handleMobileSelect = (id: string | null) => {
    onCategoryChange(id);
    setIsDropdownOpen(false);
  };

  return (
    <div
      className="mb-4 md:mb-8 flex flex-col gap-3 md:gap-4"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Premium Search Bar - Full Width */}
      <div className="relative w-full group z-10">
        <Search
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-[rgb(var(--color-brand-primary))] pointer-events-none ${
            isRtl ? "right-4" : "left-4"
          }`}
        />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full h-11 sm:h-12 py-2.5 px-12 rounded border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brand-primary))]/20 focus:border-[rgb(var(--color-brand-primary))] transition-all text-sm md:text-base shadow-sm hover:border-gray-300 placeholder:text-gray-400 font-medium ${
            isRtl ? "text-right" : "text-left"
          }`}
        />
      </div>

      {/* MOBILE VIEW: Title & Filter Button Row (< 768px) */}
      <div className="md:hidden flex items-center justify-between w-full pt-2 pb-1">
        <h2 className="text-lg font-bold text-main tracking-tight capitalize truncate pr-4">
          {currentCategoryTitle}
        </h2>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-800 hover:bg-gray-100 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brand-primary))]/20 shrink-0"
        >
          <Filter className="w-3 h-3 text-gray-600" />
          <span className="text-sm">
            {t.filters || (isRtl ? "تصفية" : "Filters")}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-gray-500 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] ${
              isDropdownOpen
                ? "rotate-180 text-[rgb(var(--color-brand-primary))]"
                : ""
            }`}
          />
        </button>
      </div>

      {categories.length > 0 && (
        <div className="relative w-full z-20">
          {/* MOBILE VIEW: Animated Dropdown Menu (< 768px) */}
          <div className="md:hidden relative w-full">
            {/* 
              Smooth Animation Wrapper using CSS Grid
              This transitions height from 0 to auto flawlessly 
            */}
            <div
              className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] ${
                isDropdownOpen
                  ? "grid-rows-[1fr] opacity-100 mb-4"
                  : "grid-rows-[0fr] opacity-0 mb-0"
              }`}
            >
              <div className="overflow-hidden">
                {/* Dropdown Menu Box */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col p-1.5 gap-0.5 mt-1">
                  <button
                    onClick={() => handleMobileSelect(null)}
                    className={`w-full text-sm font-semibold px-4 py-3 rounded-lg transition-all duration-200 ${
                      selectedCategory === null
                        ? "bg-[rgb(var(--color-brand-primary))] text-white shadow-md shadow-brand/20"
                        : "text-gray-700 hover:bg-gray-50 active:bg-gray-100 bg-transparent"
                    } ${isRtl ? "text-right" : "text-left"}`}
                  >
                    {defaultTitle}
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleMobileSelect(category.id)}
                      className={`w-full text-sm font-medium px-4 py-3 rounded-lg transition-all duration-200 ${
                        selectedCategory === category.id
                          ? "bg-[rgb(var(--color-brand-primary))] text-white"
                          : "text-gray-700 hover:bg-gray-50 active:bg-gray-100 bg-transparent"
                      } ${isRtl ? "text-right" : "text-left"}`}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP VIEW: Native Horizontal Scroll/Pills (>= 768px) */}
          <div className="hidden md:flex relative w-full">
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 -mb-2 hide-scrollbar snap-x scroll-smooth">
              <button
                onClick={() => onCategoryChange(null)}
                className={`snap-start whitespace-nowrap min-h-[40px] px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                  selectedCategory === null
                    ? "bg-[rgb(var(--color-brand-primary))] border-[rgb(var(--color-brand-primary))] text-white shadow-md shadow-brand/20"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                }`}
              >
                {t.allCategories}
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`snap-start whitespace-nowrap min-h-[40px] px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    selectedCategory === category.id
                      ? "bg-[rgb(var(--color-brand-primary))] border-[rgb(var(--color-brand-primary))] text-white shadow-md shadow-brand/20"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hide scrollbar for desktop pills view */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `,
        }}
      />
    </div>
  );
}
