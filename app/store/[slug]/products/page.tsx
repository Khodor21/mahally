import { getStoreBySlug } from "@/lib/store";
import ProductsClient from "./ProductsClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const store = await getStoreBySlug(params.slug);

  const lang = (store?.language as "en" | "ar") || "en";
  const productsTitle = lang === "ar" ? "جميع المنتجات" : "All Products";
  const storeName = store?.store_name || "";
  const logoUrl = store?.logo_url || "";

  return {
    title: storeName ? `${productsTitle} | ${storeName}` : productsTitle,
    icons: logoUrl ? { icon: logoUrl, apple: logoUrl } : undefined,
  };
}

export default async function ProductsPage() {
  return <ProductsClient />;
}
