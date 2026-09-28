import { notFound } from "next/navigation";
import SectionPageClient, { SectionData } from "./SectionPageClient";

// استيراد supabaseAdmin من مسار السيرفر الصحيح الخاص بك
import { supabaseAdmin } from "@/lib/supabase/server";

// ----------------------------------------------------------------------
// DATA FETCHING: Supabase Logic
// ----------------------------------------------------------------------
async function getSectionData(title: string): Promise<SectionData | null> {
  try {
    // 1. جلب القسم بناءً على العنوان
    // ملاحظة: إذا كانت المنصة متعددة المتاجر (Multi-store)، يفضل أن تضيف .eq("store_id", storeId)
    const { data: section, error: sectionError } = await supabaseAdmin
      .from("storefront_sections")
      .select("*")
      .eq("title", title)
      .eq("status", "active")
      .single();

    if (sectionError || !section) {
      console.error("Section not found:", sectionError);
      return null;
    }

    let rawProducts: any[] = [];

    // 2. تطبيق نفس المنطق الخاص بك: جلب المنتجات المحددة أو منتجات التصنيف
    if (section.product_ids && section.product_ids.length > 0) {
      // إذا كان القسم يحتوي على منتجات محددة يدوياً
      const { data } = await supabaseAdmin
        .from("products")
        .select("*")
        .in("id", section.product_ids);

      rawProducts = data || [];
    } else if (section.category_id) {
      // إذا كان القسم يعتمد على تصنيف معين
      const { data } = await supabaseAdmin
        .from("products")
        .select("*")
        .eq("category_id", section.category_id);
      // .eq("pin", true) // <-- يمكنك تفعيل هذا السطر إذا كنت تريد عرض المنتجات المثبتة فقط في هذه الصفحة أيضاً

      rawProducts = data || [];
    }

    // 3. تنسيق البيانات لتتطابق مع الـ Client Component
    const mappedData: SectionData = {
      id: section.id,
      title: section.title,
      banner_url: section.banner_url || null,
      products: rawProducts.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        discount_price: p.discount_price,
        images: p.images || [],
        stock: p.stock ?? 1,
        preorder_enabled: p.preorder_enabled ?? false,
        preorder_label: p.preorder_label ?? null,
      })),
    };

    return mappedData;
  } catch (error) {
    console.error("Error fetching section data from Supabase:", error);
    return null;
  }
}

// ----------------------------------------------------------------------
// SERVER COMPONENT
// Next.js 15 requires awaiting params and searchParams as Promises
// ----------------------------------------------------------------------
export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ title: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  // 1. Await Next.js 15+ promise parameters
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // 2. Safely decode the dynamic URL segment (e.g., handles Arabic strings and spaces)
  const decodedTitle = decodeURIComponent(resolvedParams.title);

  // 3. Fallback language handling
  const lang = (resolvedSearchParams.lang === "en" ? "en" : "ar") as
    | "ar"
    | "en";

  // 4. Fetch the data securely on the server from Supabase
  const sectionData = await getSectionData(decodedTitle);

  // 5. Trigger 404 page if section does not exist in DB
  if (!sectionData) {
    notFound();
  }

  // 6. Pass serialized data safely to the Interactive Client Component
  return (
    <SectionPageClient
      initialData={sectionData}
      slug={decodedTitle}
      title={sectionData.title}
      lang={lang}
    />
  );
}
