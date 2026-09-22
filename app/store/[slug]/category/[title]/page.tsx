import { supabaseAdmin } from "@/lib/supabase/server";
import CategoryPageClient from "./CategoryPageClient";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string; title: string };
  searchParams: { lang?: string };
}) {
  const slug = params.slug;
  const categoryTitle = decodeURIComponent(params.title).trim();
  const lang = searchParams.lang === "en" ? "en" : "ar";

  // fetch الـ store
  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!store) return <div>Store not found</div>;

  // fetch الـ category
  const { data: category } = await supabaseAdmin
    .from("categories")
    .select("id, title, logo_url")
    .ilike("title", categoryTitle)
    .eq("store_id", store.id)
    .maybeSingle();

  if (!category) return <div>Category not found</div>;

  // fetch الـ products
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("category_id", category.id)
    .eq("is_active", true);

  const initialData = {
    id: category.id,
    title: category.title,
    banner_url: category.logo_url,
    products: products || [],
  };

  return (
    <CategoryPageClient
      initialData={initialData}
      slug={slug}
      title={categoryTitle}
      lang={lang}
    />
  );
}
