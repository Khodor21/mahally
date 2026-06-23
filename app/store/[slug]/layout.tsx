// app/store/[slug]/layout.tsx
export const revalidate = 3600;
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ShopProvider } from "@/app/store/context";
// ❌ Navbar import removed from here
import BottomNavbar from "./components/landing/BottomNavbar";
import Footer from "./components/landing/Footer";
import LangDomSetter from "./LangSetter";
import ThemeClient from "./components/ThemeClient";
import VisitorTracker from "./components/VisitorTracker";
import NotificationInitializer from "./components/NotificationInitializer";
import { getCachedStoreData } from "@/lib/store-queries";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const data = await getCachedStoreData(params.slug);

  if (!data) return notFound();
  const { store, settings } = data;

  const lang = (store as { language?: "en" | "ar" }).language || "en";
  const primaryColor = settings?.primary_color;

  return (
    <ShopProvider>
      <VisitorTracker storeId={store.id} />
      {/* ✅ PRIMARY COLOR from backend */}
      <ThemeClient primaryColor={primaryColor} />
      {/* ✅ LANGUAGE from backend (READ-ONLY) */}
      <LangDomSetter lang={lang} />
      {/* <NotificationInitializer /> */}

      {/* ❌ Navbar component removed from here */}

      <BottomNavbar lang={lang} storeSlug={store.slug} />

      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">{children}</main>
        <Footer
          storeName={store.store_name}
          storeSlug={store.slug}
          storeId={store.id.substring(0, 8).toUpperCase()}
          logoUrl={settings?.logo_url}
          primaryColor={primaryColor}
          phone={settings?.whatsapp_number || store.phone}
          email={store.admin_email}
          instagramUrl={settings?.instagram_url}
          whatsappNumber={settings?.whatsapp_number}
          description={settings?.description}
          lang={lang}
          payment_methods={store.payment_methods}
        />
      </div>
    </ShopProvider>
  );
}
