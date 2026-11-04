import { Suspense } from "react";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import ProductClientUI from "./ProductClientUI";
import ProductRecommendations from "../../components/RecommendationsProducts";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { data: stores } = await supabaseAdmin
    .from("stores")
    .select("slug, id");

  if (!stores) return [];

  const results = await Promise.all(
    stores.map(async (store) => {
      const { data: products } = await supabaseAdmin
        .from("products")
        .select("title")
        .eq("store_id", store.id);

      return (products || []).map((p) => ({
        slug: store.slug,
        title: p.title,
      }));
    }),
  );

  return results.flat();
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; title: string };
}) {
  const decodedTitle = decodeURIComponent(params.title);

  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("id, store_name, logo_url")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!store) return { title: decodedTitle };

  const { data: product } = await supabaseAdmin
    .from("products")
    .select("title, description, images")
    .eq("store_id", store.id)
    .ilike("title", decodedTitle)
    .maybeSingle();

  if (!product) return { title: decodedTitle };

  const storeName = store.store_name || "";
  const logoUrl = store.logo_url || "";
  const pageTitle = storeName
    ? `${product.title} | ${storeName}`
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

export default async function ProductPage({
  params,
}: {
  params: { slug: string; title: string };
}) {
  const { data: store, error: storeError } = await supabaseAdmin
    .from("stores")
    .select("id, language")
    .eq("slug", params.slug)
    .single();

  if (storeError || !store) return notFound();

  const decodedTitle = decodeURIComponent(params.title);

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select(
      `id, title, description, price, discount_price, stock, images,
       categories(title), variantGroups, preorder_enabled, preorder_label, gift, review`,
    )
    .eq("store_id", store.id)
    .ilike("title", decodedTitle)
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
