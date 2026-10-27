import { notFound } from "next/navigation";
import CustomerAuth from "./CustomerAuth";
import { supabaseAdmin } from "@/lib/supabase/server";

type Props = {
  params:
    | Promise<{
        slug: string;
      }>
    | { slug: string };
};

export async function generateMetadata(props: Props) {
  const params = await props.params;

  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("store_name, logo_url, language")
    .eq("slug", params.slug)
    .maybeSingle();

  const lang = (store?.language as "en" | "ar") || "en";
  const authTitle = lang === "ar" ? "تسجيل الدخول" : "Authentication";
  const storeName = store?.store_name || "";
  const logoUrl = store?.logo_url || "";

  return {
    title: storeName ? `${authTitle} | ${storeName}` : authTitle,
    icons: logoUrl ? { icon: logoUrl, apple: logoUrl } : undefined,
  };
}

export default async function AuthPage(props: Props) {
  const params = await props.params;

  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("id, language")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!store) notFound();

  const lang = store.language === "en" ? "en" : "ar";

  return <CustomerAuth storeId={store.id} lang={lang} />;
}
