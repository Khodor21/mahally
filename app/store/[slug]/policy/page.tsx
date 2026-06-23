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
      storeData?.description ||
      "سياسة الإسترجاع والاستبدال - Returns & Exchange Policy - ضمان رضاك 100%";

    return {
      title: `سياسة الإسترجاع | Returns & Exchange - ${storeName}`,
      description,
      robots: "index, follow",
      openGraph: {
        type: "website",
        title: `سياسة الإسترجاع | Returns & Exchange - ${storeName}`,
        description,
        siteName: storeName,
      },
      alternates: {
        canonical: `https://${host}/return-policy`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "سياسة الإسترجاع | Returns & Exchange",
      description: "سياسة الإسترجاع والاستبدال الخاصة بنا",
    };
  }
}

// ================================================================
// HELPER: GET STORE BY DOMAIN
// ================================================================
async function getStoreByDomain(domain: string | null) {
  if (!domain) return null;

  // Extract subdomain (e.g., "storename.mahally.app" -> "storename")
  const subdomain = domain.split(".")[0];

  try {
    const { data: store, error } = await supabaseAdmin
      .from("stores")
      .select("id, store_name, language, description")
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
      .select("return_policy, primary_color, logo_url, description, updated_at")
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
export default async function ReturnPolicyPage() {
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
    console.error("Error in ReturnPolicyPage:", error);
  }

  // Gracefully fallback to defaults if database fails
  const storeName = storeData?.store_name || "متجرك";
  const language = (storeData?.language as "en" | "ar") || "ar";
  const primaryColor = storeSettings?.primary_color || "#131944";
  const returnContent = storeSettings?.return_policy || null;

  return (
    <PolicyPage
      type="return-policy"
      lang={language}
      storeName={storeName}
      primaryColor={primaryColor}
      dbContent={returnContent}
    />
  );
}
