import { Suspense } from "react";
import { getStoreBySlug } from "@/lib/store";
import CartClientPage from "./CartClientPage";
import ProductRecommendations from "../components/RecommendationsProducts";

export default async function CartPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await getStoreBySlug(params.slug);
  const lang = (store?.language as "en" | "ar") || "en";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 1. Main Cart Area */}
      <div className="flex-grow">
        <CartClientPage store={store} />
      </div>

      {/* 2. Recommendations Section (Shows up whether cart is empty or not) */}
      {store && (
        <div className="max-w-7xl mx-auto px-4 md:px-10 pb-20 w-full">
          <Suspense
            fallback={
              <div className="h-40 w-full animate-pulse bg-gray-50 rounded-2xl mt-12"></div>
            }
          >
            <ProductRecommendations
              storeId={store.id}
              storeSlug={store.slug}
              currentProductId="" // Leave empty since we aren't on a specific product page
              lang={lang}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
