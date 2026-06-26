// app/store/[slug]/layout.tsx
export const revalidate = 3600;
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Metadata, Viewport } from "next";
import { ShopProvider } from "@/app/store/context";
import Navbar from "./components/landing/Navbar";
import BottomNavbar from "./components/landing/BottomNavbar";
import Footer from "./components/landing/Footer";
import LangDomSetter from "./LangSetter";
import ThemeClient from "./components/ThemeClient";
import VisitorTracker from "./components/VisitorTracker";
import NotificationInitializer from "./components/NotificationInitializer";
import { getCachedStoreData } from "@/lib/store-queries";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getCachedStoreData(params.slug);

  if (!data) {
    return {
      title: "Store Not Found",
      description: "This store does not exist.",
    };
  }

  const { store, settings } = data;
  const lang = (store as { language?: "en" | "ar" }).language || "en";
  const storeName = store.store_name || "Store";
  const description = settings?.description || `Welcome to ${storeName}`;
  const logoUrl = settings?.logo_url || "";

  return {
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description: description,
    openGraph: {
      title: storeName,
      description: description,
      siteName: storeName,
      images: logoUrl ? [{ url: logoUrl, alt: storeName }] : [],
      locale: lang === "ar" ? "ar_AR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: storeName,
      description: description,
      images: logoUrl ? [logoUrl] : [],
    },
  };
}

export async function generateViewport({
  params,
}: {
  params: { slug: string };
}): Promise<Viewport> {
  const data = await getCachedStoreData(params.slug);
  const primaryColor = data?.settings?.primary_color || "#ffffff";

  return {
    themeColor: primaryColor,
  };
}

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

      {/* ✅ Navbar moved to layout */}
      <Navbar
        storeId={store.id}
        storeName={store.store_name}
        storeSlug={store.slug}
        logoUrl={settings?.logo_url}
        primaryColor={primaryColor}
        lang={lang}
        promoText={settings?.promo_text}
      />

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
