import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";

export const getCachedStoreData = unstable_cache(
  async (slug: string) => {
    // 1. جلب بيانات المتجر
    const { data: store, error: storeError } = await supabaseAdmin
      .from("stores")
      .select(
        "id, store_name, slug, phone, admin_email, language, payment_methods",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (storeError || !store) return null;

    // SAFE PARSING: Prevent React crashes by ensuring payment_methods is ALWAYS a valid array
    let parsedPaymentMethods: string[] = [];
    if (store.payment_methods) {
      try {
        parsedPaymentMethods =
          typeof store.payment_methods === "string"
            ? JSON.parse(store.payment_methods)
            : store.payment_methods;
      } catch (e) {
        console.error("Failed to parse payment_methods:", e);
        parsedPaymentMethods = [];
      }
    }

    // Assign the cleanly parsed array back to the store object
    store.payment_methods = Array.isArray(parsedPaymentMethods)
      ? parsedPaymentMethods
      : [];

    // 2. جلب إعدادات المتجر
    const { data: settings } = await supabaseAdmin
      .from("store_settings")
      .select(
        "logo_url, primary_color, promo_text, description, whatsapp_number, instagram_url",
      )
      .eq("store_id", store.id)
      .maybeSingle();

    return { store, settings };
  },
  ["store-data-by-slug"], // مفتاح التخزين المؤقت
  {
    revalidate: 60, // تحديث الكاش كل 60 ثانية
    tags: ["stores"], // مفتاح مفيد لاحقاً إذا أردت مسح الكاش برمجياً
  },
);

export const getCachedSectionsAndProducts = unstable_cache(
  async (storeId: string) => {
    // 1. جلب الأقسام
    const { data: sections, error: sectionsError } = await supabaseAdmin
      .from("storefront_sections")
      .select("*")
      .eq("store_id", storeId)
      .eq("status", "active")
      .order("section_order", { ascending: true });

    if (sectionsError || !sections || sections.length === 0) {
      return { sections: [], products: [] };
    }

    const categoryIds = sections.map((section) => section.category_id);

    // 2. جلب المنتجات
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .in("category_id", categoryIds);

    if (productsError) {
      console.error("Failed to fetch section products:", productsError);
      return { sections, products: [] };
    }

    return { sections, products };
  },
  ["store-sections-products"], // المفتاح الأساسي للكاش
  {
    revalidate: 60, // تحديث الكاش كل 60 ثانية
    tags: ["sections", "products"],
  },
);
