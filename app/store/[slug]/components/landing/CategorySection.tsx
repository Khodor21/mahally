"use client";

import { useEffect, useState } from "react";
import ProductGrid from "./ProductGrid";
import { Loader2 } from "lucide-react";

interface CategorySection {
  id: string;
  title: string;
  banner_url?: string;
  products: Array<{
    id: string;
    title: string;
    price: number;
    images?: string[];
    stock?: number;
  }>;
}

export default function CategorySection({
  categoryId,
}: {
  categoryId: string;
}) {
  const [section, setSection] = useState<CategorySection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        // Fetch category with products
        const res = await fetch(`/api/categories/${categoryId}/products`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success) {
          setSection(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch category:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryId]);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!section || section.products.length === 0) return null;

  return (
    <ProductGrid
      title={section.title}
      products={section.products}
      bannerSrc={section.banner_url}
      bannerType="mono"
    />
  );
}
