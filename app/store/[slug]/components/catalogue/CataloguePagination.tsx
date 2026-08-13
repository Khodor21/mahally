"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CataloguePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  t: Record<string, string>;
  isRtl: boolean;
}

export default function CataloguePagination({
  currentPage,
  totalPages,
  onPageChange,
  t,
  isRtl,
}: CataloguePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-6 mt-4 w-full">
      <div
        className="flex items-center justify-center gap-2 flex-wrap"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 rounded border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all "
          aria-label="Previous page"
        >
          {isRtl ? (
            <ChevronRight size={18} className="text-gray-600" />
          ) : (
            <ChevronLeft size={18} className="text-gray-600" />
          )}
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const isActive = page === currentPage;
            const isVisible =
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1;

            if (!isVisible) {
              if (page === 2 || page === totalPages - 1) {
                return (
                  <span
                    key={`ellipsis-${page}`}
                    className="flex items-center justify-center w-8 h-11 text-gray-400 font-medium"
                  >
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded font-medium transition-all duration-200 text-xs ${
                  isActive
                    ? "bg-[rgb(var(--color-brand-primary))] text-white"
                    : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 hover:border-gray-300 "
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-8 h-8 rounded border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all "
          aria-label="Next page"
        >
          {isRtl ? (
            <ChevronLeft size={18} className="text-gray-600" />
          ) : (
            <ChevronRight size={18} className="text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
}
