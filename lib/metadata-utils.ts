import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Fetch store data by store ID
 */
export async function getStoreData(storeId: string) {
  try {
    const { data: store, error } = await supabaseAdmin
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .single();

    if (error || !store) {
      console.error("Failed to fetch store:", error);
      return null;
    }

    return store;
  } catch (err) {
    console.error("Error fetching store data:", err);
    return null;
  }
}

/**
 * Generate metadata for the dashboard
 */
export async function generateDashboardMetadata(
  storeId: string,
): Promise<Metadata> {
  const store = await getStoreData(storeId);

  if (!store) {
    return {
      title: "Dashboard",
      description: "Store Dashboard",
    };
  }

  const storeName = store.store_name || "Dashboard";
  const storeType = store.store_type || "";
  const description = `Manage your ${storeType} store - ${storeName}`;

  return {
    title: `${storeName} - Dashboard`,
    description: description,
    openGraph: {
      title: `${storeName} Dashboard`,
      description: description,
      type: "website",
      siteName: storeName,
    },
    twitter: {
      title: `${storeName} Dashboard`,
      description: description,
      card: "summary_large_image",
    },
    icons: {
      icon: store.logo_url || "/favicon.ico",
    },
  };
}
