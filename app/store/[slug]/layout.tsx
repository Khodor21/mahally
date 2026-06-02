import { supabaseAdmin } from "@/lib/supabase/server";
import ProductGrid from "./components/landing/ProductGrid";
import { notFound } from "next/navigation";
import { ShopProvider } from "@/app/store/context"; // <-- Make sure this path matches your folder structure

export default async function StorePage({
  params,
}: {
  params: { slug: string };
}) {
  // 1. Load store using supabaseAdmin directly
  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!store) return notFound();

  // 2. Load products for this store
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("store_id", store.id);

  return (
    <main className="min-h-screen bg-brand-light">
      {/* Wrap the components that need access to useShop() inside the ShopProvider */}
      <ShopProvider>
        <ProductGrid products={products || []} store={store} />
      </ShopProvider>
    </main>
  );
}
