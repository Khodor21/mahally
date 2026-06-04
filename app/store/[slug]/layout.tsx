import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { ShopProvider } from "@/app/store/context";
import Navbar from "./components/landing/Navbar";
import LangDomSetter from "./LangSetter"; // Import your new component

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  // 1. Read the cookie
  const cookieStore = cookies();
  const lang = cookieStore.get("lang")?.value === "ar" ? "ar" : "en";

  // 2. Fetch the store
  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!store) return notFound();

  return (
    <ShopProvider>
      {/* 3. This will force your global CSS to trigger */}
      <LangDomSetter lang={lang} />

      <Navbar storeName={store.name} storeSlug={store.slug} lang={lang} />
      {children}
    </ShopProvider>
  );
}
