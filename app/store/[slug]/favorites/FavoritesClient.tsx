"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useShop } from "../../context";
import ProductCard from "./components/ProductCard";

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

  if (!mappedFavorites || mappedFavorites.length === 0) {
    return (
      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        className="min-h-screen bg-white py-12 px-4"
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-sm bg-gray-100 flex items-center justify-center mx-auto">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-gray-900">
              {t.emptyTitle}
            </h3>
            <p className="mt-2 text-sm text-gray-500">{t.emptyDesc}</p>
            <button
              onClick={() => router.push(`/store/${slug}`)}
              className="mt-8 h-11 px-8 rounded-xs bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              {t.browseProducts}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-white py-8 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{t.title}</h3>
          <p className="text-sm text-brand-primary">
            {mappedFavorites.length} {t.items}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
