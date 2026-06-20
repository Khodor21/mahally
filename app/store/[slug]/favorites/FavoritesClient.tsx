"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Heart,
  Loader2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Search,
} from "lucide-react";
import { useShop } from "../../context";
import {
  getStoreLanguage,
  getCurrencySymbol,
  type Store,
} from "@/lib/store-types";

const FAVORITES_TRANSLATIONS = {
  ar: {
    title: "المفضلة",
    subtitle: "منتجاتك المفضلة",
    emptyTitle: "لا توجد منتجات مفضلة",
    emptyDesc: "ابدأ بإضافة منتجاتك المفضلة لحفظها هنا",
    browseProducts: "تصفح المنتجات",
    addToCart: "أضف للعربة",
    removeFromFavorites: "إزالة من المفضلة",
    items: "منتجات",
    price: "السعر",
    inStock: "متاح",
    outOfStock: "غير متاح",
    search: "ابحث عن المنتجات",
    noResults: "لم يتم العثور على نتائج",
    sorting: "الترتيب",
    sortNewest: "الأحدث",
    sortPriceAsc: "الأقل سعراً",
    sortPriceDesc: "الأكثر سعراً",
    filterByStock: "المتاحة فقط",
  },
  en: {
    title: "Favorites",
    subtitle: "Your favorite products",
    emptyTitle: "No favorite products yet",
    emptyDesc: "Start adding your favorite products to save them here",
    browseProducts: "Browse Products",
    addToCart: "Add to Cart",
    removeFromFavorites: "Remove from Favorites",
    items: "items",
    price: "Price",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    search: "Search products",
    noResults: "No results found",
    sorting: "Sort by",
    sortNewest: "Newest",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    filterByStock: "In Stock Only",
  },
};

type Product = {
  id: string;
  title: string;
  price?: number;
  image?: string;
  stock?: number;
  created_at?: string;
};

type SortOption = "newest" | "priceAsc" | "priceDesc";

type Props = {
  store: Store | null;
  slug: string;
};

export default function FavoritesClient({ store, slug }: Props) {
  const router = useRouter();
  const language = getStoreLanguage(store) as "ar" | "en";
  const t = FAVORITES_TRANSLATIONS[language];
  const currencySymbol = getCurrencySymbol(store);
  const isArabic = language === "ar";

  const { favorites, removeFromFavorites, addToCart } = useShop();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let result = [...(favorites || [])];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((product) =>
        product.title.toLowerCase().includes(query),
      );
    }

    if (onlyInStock) {
      result = result.filter((product) => (product.stock || 0) > 0);
    }

    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime(),
        );
        break;
      case "priceAsc":
        result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "priceDesc":
        result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
    }

    return result;
  }, [favorites, searchQuery, sortBy, onlyInStock]);

  const handleAddToCart = (product: Product) => {
    setIsLoading(true);
    setTimeout(() => {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        name: product.title,
      });
      setIsLoading(false);
    }, 300);
  };

  if (!favorites || favorites.length === 0) {
    return (
      <div
        className={`min-h-screen bg-white py-12 px-4 ${
          isArabic ? "rtl" : "ltr"
        }`}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-sm bg-gray-100 flex items-center justify-center mx-auto">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              {t.emptyTitle}
            </h1>
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

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div
      className={`min-h-screen bg-white py-8 px-4 ${isArabic ? "rtl" : "ltr"}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {favorites.length} {t.items}
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full h-11 rounded-xs border border-gray-200 pl-11 pr-4 text-sm outline-none focus:border-gray-400 transition bg-white"
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full h-11 rounded-xs border border-gray-200 px-4 text-sm outline-none focus:border-gray-400 transition bg-white font-medium"
              >
                <option value="newest">{t.sortNewest}</option>
                <option value="priceAsc">{t.sortPriceAsc}</option>
                <option value="priceDesc">{t.sortPriceDesc}</option>
              </select>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-xs">
              <input
                type="checkbox"
                id="inStockOnly"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded-xs border-gray-300 text-gray-900 cursor-pointer"
              />
              <label
                htmlFor="inStockOnly"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                {t.filterByStock}
              </label>
            </div>
          </div>
        </div>

        {searchQuery && (
          <p className="text-sm text-gray-600 mb-6">
            {filteredAndSorted.length} {t.items}
            {filteredAndSorted.length === 0 && ` - ${t.noResults}`}
          </p>
        )}

        {filteredAndSorted.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{t.noResults}</p>
          </div>
        ) : filteredAndSorted.length === 0 && onlyInStock ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {language === "ar"
                ? "لا توجد منتجات متاحة"
                : "No products in stock"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSorted.map((product) => {
              const inStock = (product.stock || 0) > 0;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-gray-300 transition group"
                >
                  <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      {inStock ? (
                        <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-xs">
                          {t.inStock}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-xs">
                          {t.outOfStock}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromFavorites(product.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-xs bg-white flex items-center justify-center shadow-sm hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                      title={t.removeFromFavorites}
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:underline cursor-pointer">
                        {product.title}
                      </h3>
                    </div>

                    <div className="text-lg font-bold text-gray-900">
                      {currencySymbol}
                      {(product.price ?? 0).toLocaleString()}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!inStock || isLoading}
                      className="w-full h-10 rounded-xs bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          {t.addToCart}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        router.push(`/store/${slug}/product/${product.id}`)
                      }
                      className="w-full h-10 rounded-xs border border-gray-300 text-gray-900 font-medium text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                      {language === "ar" ? "عرض التفاصيل" : "View Details"}
                      <ArrowIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredAndSorted.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
              <p>
                {language === "ar"
                  ? "جميع المنتجات المعروضة مختارة من قبلك"
                  : "All displayed products are hand-picked by you"}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSortBy("newest");
                  setOnlyInStock(false);
                }}
                className="text-gray-900 font-medium hover:underline"
              >
                {language === "ar" ? "إعادة تعيين الفلاتر" : "Reset Filters"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
