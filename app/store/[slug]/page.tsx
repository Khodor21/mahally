import { supabaseAdmin } from "@/lib/supabase/server";
import ProductGrid from "./components/landing/ProductGrid";
import HeroSection from "./components/landing/Hero";
import Footer from "./components/landing/Footer";
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

  // 2. Get products
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-brand-[#fefefe] flex flex-col gap-10 pb-16">
      <div className="px-4 md:px-10 pt-6 max-w-7xl mx-auto w-full">
        {/* Pass the actual store ID to your Client Component */}
        <HeroSection storeId={store.id} lang="en" />
      </div>

      <div className="px-4 md:px-10 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">
            Latest Arrivals
          </h2>
        </div>

        <ProductGrid title={store.name} products={products || []} />
        <Footer />
      </div>
    </main>
  );
}
