import { Suspense } from "react";
import { getStoreBySlug } from "@/lib/store";
import GiftCheckoutClientPage from "./GiftCheckoutClientPage";
import { notFound } from "next/navigation";

export default async function GiftCheckoutPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await getStoreBySlug(params.slug);

  if (!store) {
    notFound(); // توجيه لصفحة 404 إذا لم يتم العثور على المتجر
  }

  const lang = (store?.language as "en" | "ar") || "en";

  return (
    <div className="min-h-screen bg-white">
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500">جاري التحميل... / Loading...</p>
          </div>
        }
      >
        <GiftCheckoutClientPage store={store} lang={lang} />
      </Suspense>
    </div>
  );
}
