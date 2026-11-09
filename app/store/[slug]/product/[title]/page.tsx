import { Suspense } from "react";
import { cache } from "react";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import ProductClientUI from "./ProductClientUI";
import ProductRecommendations from "../../components/RecommendationsProducts";

export const revalidate = 3600;
export const dynamicParams = true;

// --- Shared cached fetcher (runs once per request even if called from metadata + page) ---
const getStoreAndProduct = cache(async (slug: string, encodedTitle: string) => {
  const decodedTitle = decodeURIComponent(encodedTitle);

  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("id, language, store_name, store_settings(logo_url)")
    .eq("slug", slug)
    .maybeSingle();

  if (!store) return null;

  const { data: product } = await supabaseAdmin
    .from("products")
    .select(
      `id, title, description, price, discount_price, stock, images,
         categories(title), variantGroups, preorder_enabled, preorder_label, gift, review`,
    )
    .eq("store_id", store.id)
    .ilike("title", decodedTitle)
    .maybeSingle();

  if (!product) return null;

  return { store, product };
});

// --- Static Params ---
export async function generateStaticParams() {
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("title, stores(slug)");

  return (products || []).map((p) => ({
    slug: (p.stores as any).slug,
    title: p.title,
  }));
}

// --- Metadata ---
export async function generateMetadata({
  params,
}: {
  params: { slug: string; title: string };
}) {
  const data = await getStoreAndProduct(params.slug, params.title);

  if (!data) return { title: decodeURIComponent(params.title) };

  const { store, product } = data;

  const logoUrl = Array.isArray(store.store_settings)
    ? store.store_settings[0]?.logo_url || ""
    : (store.store_settings as any)?.logo_url || "";

  const pageTitle = store.store_name
    ? `${product.title} | ${store.store_name}`
    : product.title;

  const primaryImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : null;

  return {
    title: pageTitle,
    description: product.description || undefined,
    icons: logoUrl ? { icon: logoUrl, apple: logoUrl } : undefined,
    openGraph: {
      title: pageTitle,
      description: product.description || undefined,
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

// --- Page ---
export default async function ProductPage({
  params,
}: {
  params: { slug: string; title: string };
}) {
  const data = await getStoreAndProduct(params.slug, params.title);

  if (!data) return notFound();

  const { store, product } = data;

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
              <div className="h-40 w-full animate-pulse bg-gray-50 rounded-2xl mt-24" />
            }
          >
            <ProductRecommendations
              storeId={store.id}
              storeSlug={params.slug}
              currentProductId={product.id}
              lang={currentLang}
            />
          </Suspense>
        </ProductClientUI>
      </div>
    </main>
  );
}
