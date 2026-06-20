// app/[slug]/products/[id]/page.tsx

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import ProductClientUI from "./ProductClientUI";
import ProductRecommendations from "../../components/RecommendationsProducts";

export default async function ProductPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const { data: store, error: storeError } = await supabaseAdmin
    .from("stores")
    .select("id, language")
    .eq("slug", params.slug)
    .single();

  if (storeError || !store) return notFound();

  // 👉 STRICT SELECTION: No more select("*")
  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select(
      `
      id, 
      title, 
      description, 
      price, 
      stock, 
      images, 
      categories(title),
      variants
    `,
    )
    .eq("id", params.id)
    .eq("store_id", store.id)
    .single();

  if (error || !product) return notFound();

  const productWithCategory = {
    ...product,
    categories: product.categories?.[0] ?? { title: "" },
  };

  const currentLang = (store.language as "en" | "ar") || "en";

  return (
    <main className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-8">
        <ProductClientUI
          product={productWithCategory}
          storeSlug={params.slug}
          lang={currentLang}
        >
          <Suspense
            fallback={
              <div className="h-40 w-full animate-pulse bg-gray-50 rounded-2xl mt-24"></div>
            }
          >
            <ProductRecommendations
              storeId={store.id}
              storeSlug={params.slug}
              currentProductId={product.id}
              lang={currentLang} // 👉 UNCOMMENTED AND TYPED
            />
          </Suspense>
        </ProductClientUI>
      </div>
    </main>
  );
}
