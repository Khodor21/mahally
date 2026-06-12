import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import ProductClientUI from "./ProductClientUI";

export default async function ProductPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  console.log("🔍 DEBUG - params:", params);
  const { data: store, error: storeError } = await supabaseAdmin
    .from("stores")
    .select("id")
    .eq("slug", params.slug)
    .single();

  console.log("🔍 DEBUG - store lookup:", {
    slug: params.slug,
    store,
    storeError,
  });

  if (storeError || !store) return notFound();

  // 👇 ADD THIS
  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", params.id)
    .eq("store_id", store.id)
    .single();

  console.log("🔍 DEBUG - product lookup:", {
    productId: params.id,
    storeId: store.id,
    product,
    error,
  });

  if (error || !product) return notFound();
  return (
    <main className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-8">
        <ProductClientUI product={product} storeSlug={params.slug} />
      </div>
    </main>
  );
}
