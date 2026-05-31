import { getStoreBySlug } from "@/lib/store";
import CartClientPage from "./CartClientPage";

export default async function CartPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await getStoreBySlug(params.slug);

  return <CartClientPage store={store} />;
}
