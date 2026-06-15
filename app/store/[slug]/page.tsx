export const revalidate = 3600;
import { Suspense } from "react";
import HeroSection from "./components/landing/Hero";
import CategorySection from "./components/landing/CategorySection";
import Testimonial from "./components/landing/Testimonial";
import Sections from "./components/landing/Sections";
import { notFound } from "next/navigation";
import { getCachedStoreData } from "@/lib/store-queries";

export default async function StorePage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getCachedStoreData(params.slug);
  if (!data) return notFound();
  const { store } = data;

  return (
    <main className="min-h-screen bg-brand-white flex flex-col gap-10 pb-16">
      <div className="px-2 md:px-10 pt-3 mx-auto w-full">
        <HeroSection storeId={store.id} lang="en" />
      </div>

      <CategorySection storeId={store.id} />

      <div className="px-2 md:px-10 mx-auto w-full flex flex-col gap-10">
        {/* هنا يكمن السحر: سنقوم ببث الأقسام لاحقاً */}
        <Suspense
          fallback={
            <div className="h-64 w-full animate-pulse bg-gray-100 rounded-lg" />
          }
        >
          <Sections storeId={store.id} storeSlug={params.slug} />
        </Suspense>

        <Testimonial />
      </div>
    </main>
  );
}
