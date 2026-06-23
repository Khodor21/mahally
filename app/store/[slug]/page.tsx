// app/store/[slug]/page.tsx
export const revalidate = 3600;
import { Suspense } from "react";
import Navbar from "./components/landing/Navbar"; // ✅ Added Navbar import
import HeroSection from "./components/landing/Hero";
import CategorySection from "./components/landing/CategorySection";
import Testimonial from "./components/landing/Testimonial";
import Sections from "./components/landing/Sections";
import Features from "./components/landing/Features";

import { notFound } from "next/navigation";
import { getCachedStoreData } from "@/lib/store-queries";

export default async function StorePage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getCachedStoreData(params.slug);
  if (!data) return notFound();

  // ✅ Extract settings to pass into the Navbar
  const { store, settings } = data;

  const lang = (store as { language?: "en" | "ar" }).language || "ar";
  const primaryColor = settings?.primary_color; // ✅ Grab primary color

  return (
    <main className="min-h-screen bg-brand-white flex flex-col gap-10 pb-16">
      {/* ✅ Navbar moved to the top of the page */}
      <Navbar
        storeId={store.id}
        storeName={store.store_name}
        storeSlug={store.slug}
        logoUrl={settings?.logo_url}
        primaryColor={primaryColor}
        lang={lang}
        promoText={settings?.promo_text}
      />

      <div className="px-2 md:px-10 pt-3 mx-auto w-full">
        <HeroSection storeId={store.id} lang={lang} />
      </div>

      <CategorySection storeId={store.id} lang={lang} />

      <div className="px-2 md:px-10 mx-auto w-full flex flex-col gap-10">
        <Suspense
          fallback={
            <div className="h-64 w-full animate-pulse bg-gray-100 rounded-lg" />
          }
        >
          <Sections storeId={store.id} storeSlug={params.slug} lang={lang} />
        </Suspense>
        <Features storeSlug={params.slug} />
        <Testimonial lang={lang} storeSlug={params.slug} />{" "}
      </div>
    </main>
  );
}
