"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useShop } from "../../context";
import ProductCard from "./components/ProductCard";
import EmptyState from "./components/EmptyState";

const FAVORITES_TRANSLATIONS = {
  ar: {
    title: "المفضلة",
    subtitle: "منتجاتك المفضلة",
    emptyTitle: "لا توجد منتجات مفضلة",
    emptyDesc: "ابدأ بإضافة منتجاتك المفضلة لحفظها هنا",
    browseProducts: "تصفح المنتجات",
    items: "منتجات",
  },
  en: {
    title: "Favorites",
    subtitle: "Your favorite products",
    emptyTitle: "No favorite products yet",
    emptyDesc: "Start adding your favorite products to save them here",
    browseProducts: "Browse Products",
    items: "items",
  },
};

type Props = {
  store: any;
  slug: string;
};

export default function FavoritesClient({ store, slug }: Props) {
  const router = useRouter();

  // Safely evaluate language directly from the fetched store (exactly like the Cart page)
  const language = (store?.language === "en" ? "en" : "ar") as "en" | "ar";
  const t = FAVORITES_TRANSLATIONS[language];
  const isArabic = language === "ar";

  const { favorites } = useShop();

  // Map context favorites to match the exact shape ProductCard expects.
  const mappedFavorites = (favorites || []).map((item: any) => ({
    id: item.id,
    title: item.title || "Untitled Product",
    image:
      item.image ||
      item.images?.[0] ||
      "https://placehold.co/600x600/png?text=No+Image",
    price: item.price ?? 0,
    discount_price: item.discount_price ?? null,
    stock: item.stock ?? 1,
  }));

  // ── Unified Empty State ─────────────────────────────────────
  if (!mappedFavorites || mappedFavorites.length === 0) {
    return (
      <div
        dir={isArabic ? "rtl" : "ltr"}
        className="min-h-[70vh] bg-gray-50/30 flex flex-col items-center justify-center py-12 px-4 sm:px-6 animate-in fade-in duration-500"
      >
        <div className="max-w-2xl mx-auto w-full bg-white p-8 sm:p-12 rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            title={t.emptyTitle}
            description={t.emptyDesc}
            onContinueShopping={() => router.push("/")}
            isArabic={isArabic}
            continueShoppingLabel={t.browseProducts}
          />
        </div>
      </div>
    );
  }

  // ── Populated State ─────────────────────────────────────────
  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both"
    >
      <div className="max-w-6xl mx-auto">
        {/* Premium Header Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8 pb-6 border-b border-gray-100">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {t.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              {t.subtitle}
            </p>
          </div>

          {/* Badge Pill for Item Count */}
          <div className="inline-flex items-center justify-center self-start sm:self-auto transition-colors hover:bg-brand-primary/10 cursor-default">
            <span className="text-xs font-nedium text-brand-primary tracking-wide">
              {mappedFavorites.length} {t.items}
            </span>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-7">
          {mappedFavorites.map((product: any, index: number) => (
            <div
              key={product.id}
              className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <ProductCard product={product} storeSlug={slug} lang={language} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
