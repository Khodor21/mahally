import { getStoreBySlug } from "@/lib/store";
import CategoriesClient from "./CategoriesClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const store = await getStoreBySlug(params.slug);

  const lang = (store?.language as "en" | "ar") || "en";
  const categoriesTitle = lang === "ar" ? "جميع الأقسام" : "All Categories";
  const storeName = store?.store_name || "";
  const logoUrl = store?.logo_url || "";

  return {
    title: storeName ? `${categoriesTitle} | ${storeName}` : categoriesTitle,
    icons: logoUrl ? { icon: logoUrl, apple: logoUrl } : undefined,
  };
}

export default async function CategoriesPage() {
  return <CategoriesClient />;
}
