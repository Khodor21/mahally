import ProductGrid from "./ProductGrid";
import { getCachedSectionsAndProducts } from "@/lib/store-queries";

interface StorefrontSectionsProps {
  storeId: string;
  storeSlug: string;
  lang: "en" | "ar";
}

export default async function StorefrontSections({
  storeId,
  storeSlug,
  lang,
}: StorefrontSectionsProps) {
  const { sections, products } = await getCachedSectionsAndProducts(storeId);

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-12 md:gap-16 w-full">
      {sections.map((section) => {
        const sectionProducts = section.product_ids?.length
          ? products?.filter((p) => section.product_ids.includes(p.id)) || []
          : products?.filter(
              (p) => p.category_id === section.category_id && p.pin === true,
            ) || [];

        const hasBanner =
          section.banner_url && section.banner_url.trim() !== "";

        return (
          <ProductGrid
            key={section.id}
            title={section.title}
            categoryName={section.category_title}
            bannerSrc={hasBanner ? section.banner_url : undefined}
            bannerType="wide"
            products={sectionProducts}
            storeSlug={storeSlug}
            lang={lang}
            sectionId={section.id}
          />
        );
      })}
    </div>
  );
}
