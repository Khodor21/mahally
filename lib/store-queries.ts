import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";

export const getCachedStoreData = (slug: string) =>
  unstable_cache(
    async () => {
      // 1. جلب بيانات المتجر
      const { data: store, error: storeError } = await supabaseAdmin
        .from("stores")
        .select(
          "id, store_name, slug, phone, admin_email, language, payment_methods, plan_type",
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
          "logo_url, primary_color, promo_text, description, whatsapp_number, instagram_url, twitter_url, category_display_style",
        )
        .eq("store_id", store.id)
        .maybeSingle();

      // MERGE: Attach settings properties directly to the store object
      const enrichedStore = {
        ...store,
        category_display_style: settings?.category_display_style || "grid",
        logo_url: settings?.logo_url || null,
        primary_color: settings?.primary_color || null,
        promo_text: settings?.promo_text || "",
        description: settings?.description || null,
        whatsapp_number: settings?.whatsapp_number || null,
        instagram_url: settings?.instagram_url || null,
        twitter_url: settings?.twitter_url || null,
      };

      return { store: enrichedStore, settings };
    },
    // slug is in scope here via the outer function closure
    ["store-data-by-slug", slug],
    {
      revalidate: 60,
      tags: [`store-${slug}`],
    },
  )();

export const getCachedSectionsAndProducts = (storeId: string) =>
  unstable_cache(
    async () => {
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

      // 2. جلب بيانات الفئات (للحصول على أسماء الفئات)
      const { data: categories, error: categoriesError } = await supabaseAdmin
        .from("categories")
        .select("id, title")
        .in("id", categoryIds);

      if (categoriesError) {
        console.error("Failed to fetch categories:", categoriesError);
      }

      // 3. دمج أسماء الفئات مع الأقسام
      const categoryMap = new Map(
        categories?.map((cat) => [cat.id, cat.title]) || [],
      );
      const sectionsWithCategoryNames = sections.map((section) => ({
        ...section,
        category_title: categoryMap.get(section.category_id) || section.title,
      }));

      // 4. جلب المنتجات
      const { data: products, error: productsError } = await supabaseAdmin
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .in("category_id", categoryIds);

      if (productsError) {
        console.error("Failed to fetch section products:", productsError);
        return { sections: sectionsWithCategoryNames, products: [] };
      }

      return { sections: sectionsWithCategoryNames, products };
    },
    // storeId is in scope here via the outer function closure
    ["store-sections-products", storeId],
    {
      revalidate: 60,
      tags: [`store-sections-${storeId}`, `store-products-${storeId}`],
    },
  )();
