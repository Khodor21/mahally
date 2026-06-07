import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function getStoreBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from("stores") // Your stores table name
      .select("*")
      .eq("slug", slug) // ← Using slug instead of subdomain
      .single();

    if (error) {
      console.error("Store lookup error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching store:", error);
    return null;
  }
}
