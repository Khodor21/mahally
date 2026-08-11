import FavoritesClient from "./FavoritesClient";
import { getStoreBySlug } from "@/lib/store";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function FavoritesPage(props: Props) {
  // Await params for Next.js 15+ compatibility
  const params = await props.params;

  // 🚨 THE FIX: Actually fetch the store data instead of hardcoding to null!
  const store = await getStoreBySlug(params.slug);

  return <FavoritesClient store={store} slug={params.slug} />;
}
