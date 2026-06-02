import { supabaseAdmin } from "@/lib/supabase/server";
import ProductGrid from "./components/landing/ProductGrid";
import { notFound } from "next/navigation";

export default async function StorePage({
  params,
}: {
  params: { slug: string };
}) {
  // 1. Get store
  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!store) return notFound();

  // 2. Get products (DIRECT SERVER FETCH)
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-brand-light">
      <ProductGrid title={store.name} products={products || []} />
    </main>
  );
}
