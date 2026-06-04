import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { supabaseAdmin } from "./supabase/server";
import type { Session } from "next-auth";

type StoreSessionUser = Session["user"] & {
  id: string;
};

export async function requireStoreSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = session.user as StoreSessionUser;

  if (!user.id) {
    throw new Error("Unauthorized");
  }

  return user; 
}

export async function getCurrentStore() {
  const storeId = await requireStoreSession()
    .then((u) => u.id)
    .catch(() => null);

  if (!storeId) return null;

  const { data, error } = await supabaseAdmin
    .from("stores")
    .select(
      `
      id, admin_name, admin_email, store_name,
      slug, location, phone, store_type, created_at, is_active
    `,
    )
    .eq("id", storeId)
    .maybeSingle();

  if (error) {
    console.error("Get store error:", error);
    return null;
  }

  return data ?? null;
}
export async function getStoreBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("stores")
    .select(
      `
      id,
      admin_name,
      admin_email,
      store_name,
      slug,
      location,
      phone,
      store_type,
      created_at,
      is_active
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Get store by slug error:", error);
    return null;
  }

  return data ?? null;
}
