// app/store/[slug]/layout.tsx
export const revalidate = 60; // Changed from 3600 - revalidate every 60 seconds instead of 1 hour

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
import FaviconInitializer from "./components/FaviconInitializer";
import {
  getCachedRecommendations,
  RecommendationRecord,
} from "./components/RecommendationsProducts";
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

  // Defensive array unwrapping
  const store = Array.isArray(data.store) ? data.store[0] : data.store || {};
  const settings = Array.isArray(data.settings)
    ? data.settings[0]
    : data.settings || {};

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
  const settings = Array.isArray(data?.settings)
    ? data.settings[0]
    : data?.settings || {};
  const primaryColor = settings?.primary_color || "#ffffff";

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

  // Defensive array unwrapping
  const store = Array.isArray(data.store) ? data.store[0] : data.store || {};
  const settings = Array.isArray(data.settings)
    ? data.settings[0]
    : data.settings || {};

  const lang = (store as { language?: "en" | "ar" }).language || "en";
  const planType = (store as { plan_type?: string }).plan_type || "Starter";
  const isMini = String(planType).toLowerCase() === "mini";
  const primaryColor = settings?.primary_color;

  // Recommendations logic
  const recommendationsRaw = await getCachedRecommendations(store.id);
  const recommendedTitles = recommendationsRaw
    .slice(0, 5)
    .map((rec: RecommendationRecord) => {
      const product = Array.isArray(rec.products)
        ? rec.products[0]
        : rec.products;
      return product ? { id: product.id, title: product.title } : null;
    })
    .filter((item): item is { id: string; title: string } => item !== null);

  return (
    <ShopProvider>
      <VisitorTracker storeId={store.id} />
      <FaviconInitializer logoUrl={settings?.logo_url} />
      <ThemeClient primaryColor={primaryColor} />
      <LangDomSetter lang={lang} />
      <NotificationInitializer />

      {/* Conditionally hide Starter Plan components if plan is Mini */}
      {!isMini && (
        <Navbar
          storeId={store.id}
          storeName={store.store_name}
          storeSlug={store.slug}
          recommendedProducts={recommendedTitles}
          logoUrl={settings?.logo_url}
          primaryColor={primaryColor}
          lang={lang}
          promoText={settings?.promo_text}
        />
      )}

      {!isMini && <BottomNavbar lang={lang} storeSlug={store.slug} />}

      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">{children}</main>

        {!isMini && (
          <Footer
            storeName={store.store_name}
            storeSlug={store.slug}
            storeId={store.id?.substring(0, 8).toUpperCase()}
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
        )}
      </div>
    </ShopProvider>
  );
}
