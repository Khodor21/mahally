import { notFound } from "next/navigation";
import CustomerAuth from "./CustomerAuth";
import { supabaseAdmin } from "@/lib/supabase/server";

type Props = {
  params: {
    slug: string;
  };
  searchParams: {
    lang?: "en" | "ar";
  };
};

export default async function AuthPage({ params, searchParams }: Props) {
  const lang = searchParams.lang === "en" ? "en" : "ar";

  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("id")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!store) {
    notFound();
  }

  return <CustomerAuth storeId={store.id} lang={lang} />;
}
