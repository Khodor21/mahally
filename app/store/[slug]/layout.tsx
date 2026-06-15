// app/store/[slug]/layout.tsx
export const revalidate = 3600;
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ShopProvider } from "@/app/store/context";
import Navbar from "./components/landing/Navbar";
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
  const cookieStore = cookies();
  // const lang = cookieStore.get("lang")?.value === "ar" ? "ar" : "en";

  const data = await getCachedStoreData(params.slug);

  if (!data) return notFound();
  const { store, settings } = data;

  return (
    <ShopProvider>
      <VisitorTracker storeId={store.id} />
      <ThemeClient primaryColor={settings?.primary_color} />
      <LangDomSetter lang={"ar"} />
      <NotificationInitializer />
      <Navbar
        storeName={store.store_name}
        storeSlug={store.slug}
        logoUrl={settings?.logo_url}
        primaryColor={settings?.primary_color}
        lang={"ar"}
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
          whatsappNumber={settings?.whatsapp_number}
          description={settings?.description}
          lang={"ar"}
        />
      </div>
    </ShopProvider>
  );
}
