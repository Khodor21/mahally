import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getCachedStoreData } from "@/lib/store-queries";
import ParentCategoryClient from "./ParentCategoryClient";

export default async function ParentCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string; title: string };
  searchParams: { lang?: string };
}) {
  const slug = params.slug;
  const categoryTitle = decodeURIComponent(params.title).trim();
  const lang = searchParams.lang === "en" ? "en" : "ar";

  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!store) return <div>Store not found</div>;

  // fetch الـ parent category
  const { data: parentCategory } = await supabaseAdmin
    .from("categories")
    .select("id, title, logo_url, parent_id")
    .ilike("title", categoryTitle)
    .eq("store_id", store.id)
    .is("parent_id", null) // parent فقط
    .maybeSingle();

  if (!parentCategory) return <div>Category not found</div>;

  // إذا كانت child بالغلط، redirect
  if (parentCategory.parent_id) {
    redirect(
      `/${slug}/category/${encodeURIComponent(parentCategory.title)}?lang=${lang}`,
    );
  }

  // fetch الـ children
  const { data: children } = await supabaseAdmin
    .from("categories")
    .select("id, title, logo_url")
    .eq("parent_id", parentCategory.id)
    .eq("store_id", store.id)
    .order("display_order", { ascending: true });

  const initialData = {
    id: parentCategory.id,
    title: parentCategory.title,
    banner_url: parentCategory.logo_url,
    children: children || [],
  };

  return (
    <ParentCategoryClient initialData={initialData} slug={slug} lang={lang} />
  );
}
