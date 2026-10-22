"use client";

import { useRouter } from "next/navigation";
import { useShop } from "../../context";
import ProductCard from "./components/ProductCard";
import EmptyState from "../components/EmptyState";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
const FAVORITES_TRANSLATIONS = {
  ar: {
    title: "المفضلة",
    home: "الرئيسية",
    subtitle: "منتجاتك المفضلة",
    emptyTitle: "قائمة المفضلة فارغة",
    emptyDesc: "لم تضف أي منتج للمفضلة بعد",
    browseProducts: "تصفح المتجر",
    items: "منتجات",
  },
  en: {
    title: "Favorites",
    home: "Home",
    subtitle: "Your favorite products",
    emptyTitle: "Your wishlist is empty",
    emptyDesc: "You haven’t saved any products yet",
    browseProducts: "Browse Store",
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
  const BreadcrumbIcon = isArabic ? ChevronLeft : ChevronRight;

  // ── Unified Empty State ─────────────────────────────────────
  if (!mappedFavorites || mappedFavorites.length === 0) {
    return (
      <div className="min-h-screen bg-white px-2 py-6 sm:px-4 lg:px-8 mx-w-6xl mx-auto">
        <p className="font-medium text-gray-400 flex items-center flex-wrap gap-1">
          <Link href={`/`} className="hover:text-brand-black transition-colors">
            {t.home}
          </Link>
          <BreadcrumbIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-brand-black">{t.title}</span>
        </p>

        <EmptyState
          variant="wishlist"
          title={t.emptyTitle}
          description={t.emptyDesc}
          ctaLabel={t.browseProducts}
          onCta={() => router.push("/")}
          isArabic={isArabic}
        />
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
        <div className="flex justify-between">
          <p className="font-medium text-gray-400 flex items-center flex-wrap gap-1">
            <Link
              href={`/`}
              className="hover:text-brand-black transition-colors"
            >
              {t.home}
            </Link>
            <BreadcrumbIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-brand-black">{t.title}</span>
          </p>

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
