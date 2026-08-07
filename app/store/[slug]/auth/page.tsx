import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import CustomerAuth from "./CustomerAuth";
import { supabaseAdmin } from "@/lib/supabase/server";

type Props = {
  params: {
    slug: string;
  };
};

export default async function AuthPage({ params }: Props) {
  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("id, language")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!store) notFound();

  const lang = store.language === "en" ? "en" : "ar";

  return <CustomerAuth storeId={store.id} lang={lang} />;
}
