// /app/store/[slug]/components/landing/Sections.tsx
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
  // استدعاء البيانات من الكاش (يستغرق 1-2 ملي ثانية فقط!)
  const { sections, products } = await getCachedSectionsAndProducts(storeId);

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-12 md:gap-16 w-full">
      {sections.map((section) => {
        const sectionProducts =
          products?.filter(
            (product) => product.category_id === section.category_id,
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
          />
        );
      })}
    </div>
  );
}
