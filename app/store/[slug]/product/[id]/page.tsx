import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import ProductClientUI from "./ProductClientUI";

// 👉 Notice we added `slug` to the params here
export default async function ProductPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select("*, categories(title)")
    .eq("id", params.id)
    .single();

  if (error || !product) return notFound();

  return (
    <main className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-8">
        {/* Pass the slug down to the UI for the Back buttons */}
        <ProductClientUI product={product} storeSlug={params.slug} />
      </div>
    </main>
  );
}
