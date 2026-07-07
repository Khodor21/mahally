"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useShop } from "../../context";
import ProductCard from "./components/ProductCard";
import EmptyState from "./components/EmptyState"; // Adjust path if you saved it elsewhere

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

  // Safely evaluate language with strict fallback
  const language = (store?.language === "en" ? "en" : "ar") as "en" | "ar";
  const t = FAVORITES_TRANSLATIONS[language];
  const isArabic = language === "ar";

  const { favorites } = useShop();

  // Map context favorites to match the exact shape ProductCard expects.
  // We let TypeScript infer the type here to perfectly match ProductCard's requirements.
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
        className="min-h-[70vh] bg-white flex flex-col items-center justify-center py-12 px-4"
      >
        <div className="max-w-2xl mx-auto w-full">
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
      className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300"
    >
      <div className="max-w-6xl mx-auto">
        {/* Premium Header Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              {t.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {t.subtitle}
            </p>
          </div>

          {/* Badge Pill for Item Count */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 self-start sm:self-auto shadow-sm">
            <span className="text-sm font-bold text-brand-primary">
              {mappedFavorites.length} {t.items}
            </span>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {mappedFavorites.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              storeSlug={slug}
              lang={language}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
