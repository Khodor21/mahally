"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, PackageX, ChevronLeft, ChevronRight } from "lucide-react";
// 👉 Import your ProductCard component (adjust the path if needed)
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

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const categoryId = params.id as string;
  const lang = searchParams.get("lang") || "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Translations ---
  const t = {
    ar: {
      home: " الرئيسية",
      back: "العودة للرئيسية",
      emptyState: "لا توجد منتجات في هذا القسم حالياً.",
    },
    en: {
      home: "Home",
      back: "Back to Home",
      emptyState: "No products available in this category yet.",
    },
  }[lang as "ar" | "en"];

  // --- Fetch Data ---
  useEffect(() => {
    async function fetchCategoryData() {
      if (!categoryId) return;

      try {
        setLoading(true);
        const res = await fetch(
          `/api/categories/${categoryId}/products?lang=${lang}`,
        );

        if (!res.ok) {
          throw new Error("Failed to fetch category data");
        }

        const json = await res.json();

        if (json.success) {
          setCategoryData(json.data);
        } else {
          throw new Error(json.message || "Failed to load category");
        }
      } catch (err) {
        console.error(err);
        setError("حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryData();
  }, [categoryId, lang]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-brand-black" />
      </div>
    );
  }

  // --- Error State ---
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

  // Determine which arrow icon to use based on language direction
  const BreadcrumbIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div dir={dir} className="min-h-screen bg-white pb-16">
      {/* HEADER SECTION - Removed white bg, aligned to start */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-start">
          {/* Breadcrumb Title format: Home < Category */}
          <p className="text-lg md:text-xl font-bold text-gray-800 flex items-center flex-wrap">
            <Link
              href={`/?lang=${lang}`}
              className="hover:text-brand-black transition-colors"
            >
              {t.home}
            </Link>
            <BreadcrumbIcon className="w-6 h-6 text-gray-400 mt-1" />
            <span className="text-brand-black">{categoryData.title}</span>
          </p>
        </div>
      </div>

      {/* PRODUCTS GRID SECTION */}
      <div className="max-w-7xl mx-auto px-4">
        {categoryData.products.length === 0 ? (
          // EMPTY STATE WITH ICON
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <PackageX
              className="w-20 h-20 mb-4 text-gray-300"
              strokeWidth={1.5}
            />
            <p className="text-lg font-medium">{t.emptyState}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {categoryData.products.map((product) => {
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
                <div key={product.id}>
                  <ProductCard product={mappedProduct} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
