import { supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ShopProvider } from "@/app/store/context";
import Navbar from "./components/landing/Navbar";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  // 1. Load store using supabaseAdmin
  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!store) return notFound();

  return (
    // The ShopProvider wraps the Navbar (so it can read cart/fav counts)
    // and the children (so pages can add to cart)
    <ShopProvider>
      <Navbar
        storeName={store.name}
        storeSlug={store.slug}
        lang="en" // You can make this dynamic later based on params/cookies
      />
      {/* children will represent page.tsx, cart/page.tsx, etc. */}
      {children}
    </ShopProvider>
  );
}
