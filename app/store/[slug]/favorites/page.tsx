import FavoritesClient from "./FavoritesClient";
import { Store } from "@/lib/store-types";

type Props = {
  params: {
    slug: string;
  };
};

export default async function FavoritesPage({ params }: Props) {
  const store: Store | null = null;

  return <FavoritesClient store={store} slug={params.slug} />;
}
