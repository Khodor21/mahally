import { supabaseAdmin } from "@/lib/supabase/server";
import ProductGrid from "./ProductGrid";

interface StorefrontSectionsProps {
  storeId: string;
  storeSlug: string;
}

export default async function StorefrontSections({
  storeId,
  storeSlug,
}: StorefrontSectionsProps) {
  const { data: sections, error: sectionsError } = await supabaseAdmin
    .from("storefront_sections")
    .select("*")
    .eq("store_id", storeId)
    .eq("status", "active")
    .order("section_order", { ascending: true });

  if (sectionsError || !sections || sections.length === 0) {
    return null;
  }

  const categoryIds = sections.map((section) => section.category_id);

  const { data: products, error: productsError } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .in("category_id", categoryIds);

  if (productsError) {
    console.error("Failed to fetch section products:", productsError);
    return null;
  }

  return (
    <div className="flex flex-col gap-12 md:gap-16 w-full">
      {sections.map((section) => {
        // Strict ID Match
        // Inside StorefrontSections component map function

        const sectionProducts =
          products?.filter(
            (product) => product.category_id === section.category_id,
          ) || [];

        // 👇 Comment this out to force the section to show even without products
        // if (sectionProducts.length === 0) return null;

        const hasBanner =
          section.banner_url && section.banner_url.trim() !== "";

        return (
          <ProductGrid
            key={section.id}
            title={section.title}
            bannerSrc={hasBanner ? section.banner_url : undefined}
            bannerType="wide"
            products={sectionProducts}
            storeSlug={storeSlug}
          />
        );
      })}
    </div>
  );
}
