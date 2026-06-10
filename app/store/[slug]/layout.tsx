// app/store/[slug]/layout.tsx

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { ShopProvider } from "@/app/store/context";
import Navbar from "./components/landing/Navbar";
import Footer from "./components/landing/Footer";
import LangDomSetter from "./LangSetter";
import ThemeClient from "./components/ThemeClient";
import VisitorTracker from "./components/VisitorTracker";
import NotificationInitializer from "./components/NotificationInitializer"; // ADD THIS

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const cookieStore = cookies();
  const lang = cookieStore.get("lang")?.value === "ar" ? "ar" : "en";

  const { data: store, error: storeError } = await supabaseAdmin
    .from("stores")
    .select("id, store_name, slug, phone, admin_email")
    .eq("slug", params.slug)
    .single();

  if (storeError || !store) return notFound();

  const { data: settings } = await supabaseAdmin
    .from("store_settings")
    .select("logo_url, primary_color, whatsapp_number, instagram_url")
    .eq("store_id", store.id)
    .maybeSingle();

  return (
    <ShopProvider>
      <VisitorTracker storeId={store.id} />
      <ThemeClient primaryColor={settings?.primary_color} />
      <LangDomSetter lang={lang} />
      <NotificationInitializer /> {/* ADD THIS LINE */}
      <Navbar
        storeName={store.store_name}
        storeSlug={store.slug}
        logoUrl={settings?.logo_url}
        primaryColor={settings?.primary_color}
        lang={lang}
      />
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
