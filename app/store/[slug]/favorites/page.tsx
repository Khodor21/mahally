import FavoritesClient from "./FavoritesClient";
import { getStoreBySlug } from "@/lib/store";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const store = await getStoreBySlug(params.slug);

  const lang = (store?.language as "en" | "ar") || "en";
  const favoritesTitle = lang === "ar" ? "المفضلة" : "Favorites";
  const storeName = store?.store_name || "";
  const logoUrl = store?.logo_url || "";

  return {
    title: storeName ? `${favoritesTitle} | ${storeName}` : favoritesTitle,
    icons: logoUrl ? { icon: logoUrl, apple: logoUrl } : undefined,
  };
}

export default async function FavoritesPage(props: Props) {
  const params = await props.params;
  const store = await getStoreBySlug(params.slug);

  return <FavoritesClient store={store} slug={params.slug} />;
}
