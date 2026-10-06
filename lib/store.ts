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
      slug, location, phone, store_type, created_at, is_active, payment_methods, plan_type,
      store_settings (
        category_display_style
      )
    `,
    )
    .eq("id", storeId)
    .maybeSingle();

  if (error) {
    console.error("Get store error:", error);
    return null;
  }

  if (!data) return null;

  // Flatten store_settings into the store object
  const settings = Array.isArray(data.store_settings)
    ? data.store_settings[0]
    : data.store_settings;

  return {
    ...data,
    category_display_style: settings?.category_display_style ?? "grid",
  };
}

export async function getCurrentStoreMeta() {
  const storeId = await requireStoreSession()
    .then((u) => u.id)
    .catch(() => null);

  if (!storeId) return null;

  const { data, error } = await supabaseAdmin
    .from("stores")
    .select(
      "store_name, store_type, location, language, slug, is_active, plan_type",
    )
    .eq("id", storeId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Get current store meta error:", error);
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
      language, currency, currency_symbol,
      delivery_cost,
      store_type,
      payment_methods,
      plan_type,
      created_at,
      is_active,
      store_settings (
        primary_color,
        logo_url,
        description,
        promo_text,
        order_success_message,
        whatsapp_number,
        instagram_url,
        facebook_url,
        category_display_style
      )
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Get store by slug error:", error);
    return null;
  }

  if (!data) return null;

  // Flatten settings into store object
  const settings = Array.isArray(data.store_settings)
    ? data.store_settings[0]
    : data.store_settings;

  return {
    ...data,
    store_settings: undefined,
    primary_color: settings?.primary_color || null,
    logo_url: settings?.logo_url || null,
    description: settings?.description || null,
    promo_text: settings?.promo_text || "",
    order_success_message: settings?.order_success_message || "",
    whatsapp_number: settings?.whatsapp_number || null,
    instagram_url: settings?.instagram_url || null,
    facebook_url: settings?.facebook_url || null,
    category_display_style: settings?.category_display_style ?? "grid",
  };
}
