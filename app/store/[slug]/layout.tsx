import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { ShopProvider } from "@/app/store/context";
import Navbar from "./components/landing/Navbar";
import Footer from "./components/landing/Footer";
import LangDomSetter from "./LangSetter";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const cookieStore = cookies();
  const lang = cookieStore.get("lang")?.value === "ar" ? "ar" : "en";

  // 1. Fetch the store (Now including phone and admin_email)
  const { data: store, error: storeError } = await supabaseAdmin
    .from("stores")
    .select("id, store_name, slug, phone, admin_email")
    .eq("slug", params.slug)
    .single();

  if (storeError || !store) return notFound();

  // 2. Fetch the store settings (Now including whatsapp & instagram)
  const { data: settings } = await supabaseAdmin
    .from("store_settings")
    .select("logo_url, primary_color, whatsapp_number, instagram_url")
    .eq("store_id", store.id)
    .maybeSingle();

  return (
    <ShopProvider>
      <LangDomSetter lang={lang} />

      <Navbar
        storeName={store.store_name}
        storeSlug={store.slug}
        logoUrl={settings?.logo_url}
        primaryColor={settings?.primary_color}
        lang={lang}
      />

      {/* Main content wrapper to ensure footer pushes to bottom */}
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">{children}</main>

        <Footer
          storeName={store.store_name}
          storeSlug={store.slug}
          storeId={store.id.substring(0, 8).toUpperCase()}
          logoUrl={settings?.logo_url}
          primaryColor={settings?.primary_color}
          phone={settings?.whatsapp_number || store.phone}
          email={store.admin_email}
          instagramUrl={settings?.instagram_url}
          lang={lang}
        />
      </div>
    </ShopProvider>
  );
}
