import { supabaseAdmin } from "@/lib/supabase/server";
import HeroSection from "./components/landing/Hero";
import CategorySection from "./components/landing/CategorySection";
import Testimonial from "./components/landing/Testimonial";
import Sections from "./components/landing/Sections";
import { notFound } from "next/navigation";

export default async function StorePage({
  params,
}: {
  params: { slug: string };
}) {
  // 1. Get store securely by slug
  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!store) return notFound();

  return (
    <main className="min-h-screen bg-brand-white flex flex-col gap-10 pb-16">
      <div className="px-2 md:px-10 pt-3 mx-auto w-full">
        <HeroSection storeId={store.id} lang="en" />
      </div>
      <CategorySection storeId={store.id} />
      <div className="px-2 md:px-10 mx-auto w-full flex flex-col gap-10">
        <Sections storeId={store.id} storeSlug={params.slug} />

        <Testimonial lang="en" />
      </div>
    </main>
  );
}
