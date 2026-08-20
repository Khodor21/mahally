export const revalidate = 0;

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCachedStoreData } from "@/lib/store-queries";
import { supabaseAdmin } from "@/lib/supabase/server";

// Starter Plan Components
import HeroSection from "./components/landing/Hero";
import CategorySection from "./components/landing/CategorySection";
import Testimonial from "./components/landing/Testimonial";
import Sections from "./components/landing/Sections";
import Features from "./components/landing/Features";

// Mini Plan Components
import MiniCatalogue from "./Minicatalogue";

export default async function StorePage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getCachedStoreData(params.slug);
  if (!data) return notFound();

  const { store, settings } = data;

  // Defensive check: Unwrap array if Supabase returned multiple rows
  const actualStore = Array.isArray(store) ? store[0] : store || {};
  const actualSettings = Array.isArray(settings) ? settings[0] : settings || {};

  const lang = (actualStore as { language?: "en" | "ar" }).language || "en";
  const planType = (actualStore as { plan_type?: string }).plan_type;

  // Default to Starter if undefined, but preserve original for debugging
  const activePlan = planType || "Starter";

  // Cast settings to any to bypass the restricted type inference
  const storeSettings = actualSettings as any;

  // ===== MINI PLAN =====
  // Use case-insensitive check to prevent mismatch errors
  if (String(activePlan).toLowerCase() === "mini") {
    // 🔍 FETCH PRODUCTS FOR MINI PLAN
    console.log(
      "🔍 [page.tsx] Fetching products for Mini plan, storeId:",
      (actualStore as any).id,
    );

    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("store_id", (actualStore as any).id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ [page.tsx] Error fetching products:", error);
    }

    console.log("✅ [page.tsx] Fetched products count:", products?.length || 0);

    return (
      <MiniCatalogue
        storeId={(actualStore as any).id}
        storeSlug={params.slug}
        storeName={(actualStore as any).store_name || "Store"}
        storeDescription={storeSettings?.description}
        logoUrl={storeSettings?.logo_url}
        coverImage={
          storeSettings?.cover_image_url ||
          storeSettings?.cover_url ||
          storeSettings?.banner_url ||
          storeSettings?.image_url
        }
        instagram={storeSettings?.instagram_url}
        facebook={storeSettings?.facebook_url}
        tiktok={storeSettings?.tiktok_url}
        whatsapp={storeSettings?.whatsapp_number}
        twitter={storeSettings?.twitter_url}
        snapchat={storeSettings?.snapchat_url}
        lang={lang}
        products={products || []}
      />
    );
  }

  // ===== STARTER PLAN (DEFAULT) =====
  return (
    <main className="min-h-screen bg-brand-white flex flex-col gap-10 pb-16 relative">
      <div className="w-full">
        <HeroSection storeId={(actualStore as any).id} lang={lang} />
      </div>

      <CategorySection storeId={(actualStore as any).id} lang={lang} />

      <div className="w-full flex flex-col gap-10">
        <Suspense
          fallback={
            <div className="h-64 w-full animate-pulse bg-gray-100 rounded-lg" />
          }
        >
          <Sections
            storeId={(actualStore as any).id}
            storeSlug={params.slug}
            lang={lang}
          />
        </Suspense>
        <Features storeSlug={params.slug} lang={lang} />
        <Testimonial lang={lang} storeSlug={params.slug} />
      </div>
    </main>
  );
}
