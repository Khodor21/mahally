import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";
import ProductCard from "./landing/ProductCard";

// --- Types & Interfaces ---

export interface RecommendedProduct {
  id: string;
  title: string;
  images: string[];
  price: number;
  stock?: number;
  discount_price?: number | null;
}

export interface RecommendationRecord {
  id: string;
  product_id: string;
  products: RecommendedProduct | RecommendedProduct[];
}

type Props = {
  storeId: string;
  storeSlug: string;
  currentProductId: string;
  lang: "en" | "ar";
};

export const getCachedRecommendations = async (storeId: string) => {
  const fetchCached = unstable_cache(
    async () => {
      const { data } = await supabaseAdmin
        .from("product_recommendations")
        .select(
          `
          id,
          product_id,
          products!inner(id, title, images, price, stock, discount_price) 
        `,
        )
        .eq("store_id", storeId)
        .order("priority", { ascending: false })
        .limit(5);

      return (data || []) as unknown as RecommendationRecord[];
    },
    ["store-recommendations", storeId], // ✅ storeId is now successfully in scope
    { revalidate: 3600, tags: ["recommendations"] },
  );

  // Execute the cached function
  return fetchCached();
};

export default async function ProductRecommendations({
  storeId,
  storeSlug,
  currentProductId,
  lang,
}: Props) {
  const recommendationsData = await getCachedRecommendations(storeId);

  // Safely map the data to extract the core product details
  const recommendations = recommendationsData
    .filter((rec) => rec.product_id !== currentProductId)
    .slice(0, 4)
    .map((rec) => {
      const product = Array.isArray(rec.products)
        ? rec.products[0]
        : rec.products;
      return product;
    })
    .filter(Boolean);

  if (recommendations.length === 0) return null;

  // 👉 Dynamic Translations & Layout
  const isRtl = lang === "ar";
  const title = isRtl ? "قد يعجبك أيضاً" : "You might also like";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="mt-4 pt-4 border-t border-gray-100 w-full"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg md:text-xl font-medium text-black/90">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {recommendations.map((rec) => {
          // 👉 Data Mapping: Transform 'images[]' into 'image' and pass new fields for ProductCard
          const mappedProduct = {
            id: rec.id,
            title: rec.title,
            image: rec.images?.[0] || "/placeholder.jpg",
            price: rec.price,
            stock: rec.stock,
            discount_price: rec.discount_price,
          };

          return (
            <ProductCard
              key={rec.id}
              product={mappedProduct}
              storeSlug={storeSlug}
              lang={lang}
            />
          );
        })}
      </div>
    </div>
  );
}
