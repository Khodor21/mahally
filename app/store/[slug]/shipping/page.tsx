import { Metadata } from "next";
import { headers } from "next/headers";
import PolicyPage from "../components/PolicyPage";
import { supabaseAdmin } from "@/lib/supabase/server";

// ================================================================
// DYNAMIC METADATA GENERATION
// ================================================================
export async function generateMetadata(): Promise<Metadata> {
  try {
    const headersList = headers();
    const host = headersList.get("host");
    const storeData = await getStoreByDomain(host);

    const storeName = storeData?.store_name || "متجرك";
    const description =
      "سياسة الشحن والتوصيل - Shipping & Delivery - توصيل سريع وآمن";

    return {
      title: `الشحن والتوصيل | Shipping & Delivery - ${storeName}`,
      description,
      robots: "index, follow",
      openGraph: {
        type: "website",
        title: `الشحن والتوصيل | Shipping & Delivery - ${storeName}`,
        description,
        siteName: storeName,
      },
      alternates: {
        canonical: `https://${host}/shipping`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "الشحن والتوصيل | Shipping & Delivery",
      description: "سياسة الشحن والتوصيل الخاصة بنا",
    };
  }
}

// ================================================================
// HELPER: GET STORE BY DOMAIN
// ================================================================
async function getStoreByDomain(domain: string | null) {
  if (!domain) return null;

  const subdomain = domain.split(".")[0];

  try {
    const { data: store, error } = await supabaseAdmin
      .from("stores")
      .select("id, store_name, language, slug")
      .eq("slug", subdomain)
      .maybeSingle();

    if (error) {
      console.error("Error fetching store:", error);
      return null;
    }

    return store;
  } catch (err) {
    console.error("Exception fetching store:", err);
    return null;
  }
}

// ================================================================
// HELPER: GET STORE SETTINGS
// ================================================================
async function getStoreSettings(storeId: string) {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from("store_settings")
      .select("shipping_policy, primary_color")
      .eq("store_id", storeId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings:", error);
      return null;
    }

    return settings;
  } catch (err) {
    console.error("Exception fetching settings:", err);
    return null;
  }
}

// ================================================================
// PAGE COMPONENT
// ================================================================
export default async function ShippingPage() {
  const headersList = headers();
  const host = headersList.get("host");

  let storeData = null;
  let storeSettings = null;

  try {
    storeData = await getStoreByDomain(host);

    if (storeData?.id) {
      storeSettings = await getStoreSettings(storeData.id);
    }
  } catch (error) {
    console.error("Error in ShippingPage:", error);
  }

  const storeName = storeData?.store_name || "متجرك";
  const language = (storeData?.language as "en" | "ar") || "ar";
  const primaryColor = storeSettings?.primary_color || "#1F2937";
  const shippingContent = storeSettings?.shipping_policy || null;

  console.log("🔍 ShippingPage Debug:", {
    storeId: storeData?.id,
    storeName,
    shippingContent: shippingContent
      ? `✅ ${shippingContent.substring(0, 50)}...`
      : "❌ null",
  });

  return (
    <PolicyPage
      type="shipping"
      lang={language}
      storeName={storeName}
      primaryColor={primaryColor}
      dbContent={shippingContent}
    />
  );
}
