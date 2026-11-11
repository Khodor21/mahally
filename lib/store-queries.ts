import { unstable_cache } from "next/cache";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/server";

const _getCachedStoreData = (slug: string) =>
  unstable_cache(
    async () => {
      const { data: store, error: storeError } = await supabaseAdmin
        .from("stores")
        .select(
          "id, store_name, slug, phone, admin_email, language, payment_methods, plan_type",
        )
        .eq("slug", slug)
        .maybeSingle();

      if (storeError || !store) return null;

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

      store.payment_methods = Array.isArray(parsedPaymentMethods)
        ? parsedPaymentMethods
        : [];

      const { data: settings } = await supabaseAdmin
        .from("store_settings")
        .select(
          "logo_url, primary_color, promo_text, description, whatsapp_number, instagram_url, twitter_url, category_display_style",
        )
        .eq("store_id", store.id)
        .maybeSingle();

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
    ["store-data-by-slug", slug],
    {
      revalidate: 3600,
      tags: [`store-${slug}`],
    },
  )();

export const getCachedStoreData = cache(_getCachedStoreData);

export const getCachedSectionsAndProducts = (storeId: string) =>
  unstable_cache(
    async () => {
      const { data: sections, error: sectionsError } = await supabaseAdmin
        .from("storefront_sections")
        .select("*")
        .eq("store_id", storeId)
        .eq("status", "active")
        .order("section_order", { ascending: true });

      if (sectionsError || !sections || sections.length === 0) {
        return { sections: [], products: [] };
      }

      const categoryIds = sections.map((s) => s.category_id);

      const { data: categories } = await supabaseAdmin
        .from("categories")
        .select("id, title")
        .in("id", categoryIds);

      const categoryMap = new Map(
        categories?.map((cat) => [cat.id, cat.title]) || [],
      );

      const sectionsWithCategoryNames = sections.map((section) => ({
        ...section,
        category_title: categoryMap.get(section.category_id) || section.title,
      }));

      const specificProductIds = sections
        .flatMap((s) => s.product_ids ?? [])
        .filter(Boolean);

      const sectionsWithoutSpecific = sections.filter(
        (s) => !s.product_ids?.length,
      );
      const fallbackCategoryIds = sectionsWithoutSpecific.map(
        (s) => s.category_id,
      );

      const [specificResult, fallbackResult] = await Promise.all([
        specificProductIds.length
          ? supabaseAdmin
              .from("products")
              .select("*")
              .in("id", specificProductIds)
          : Promise.resolve({ data: [] }),

        fallbackCategoryIds.length
          ? supabaseAdmin
              .from("products")
              .select("*")
              .eq("store_id", storeId)
              .in("category_id", fallbackCategoryIds)
              .eq("pin", true)
          : Promise.resolve({ data: [] }),
      ]);

      const products = [
        ...(specificResult.data ?? []),
        ...(fallbackResult.data ?? []),
      ];

      return { sections: sectionsWithCategoryNames, products };
    },
    ["store-sections-products", storeId],
    {
      revalidate: 3600,
      tags: [`store-sections-${storeId}`, `store-products-${storeId}`],
    },
  )();
