import { NextRequest, NextResponse } from "next/server";

// Mock data - Replace with Supabase queries
const MOCK_HEROES = {
  store1: [
    {
      id: "1",
      title_en: "Summer Sale",
      title_ar: "تخفيضات الصيف",
      subtitle_en: "Up to 50% off on selected items",
      subtitle_ar: "خصم يصل إلى 50٪ على المنتجات المختارة",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=500&fit=crop",
      cta_text_en: "Shop Now",
      cta_text_ar: "تسوق الآن",
      cta_link: "/products",
      bg_color: "#F3E5F5",
      text_color: "#4A148C",
      active: true,
      order: 1,
    },
    {
      id: "2",
      title_en: "New Arrivals",
      title_ar: "وصل حديثاً",
      subtitle_en: "Check out our latest collection",
      subtitle_ar: "اكتشف أحدث مجموعاتنا",
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=500&fit=crop",
      cta_text_en: "Explore",
      cta_text_ar: "استكشف",
      cta_link: "/new-arrivals",
      bg_color: "#E8F5E9",
      text_color: "#1B5E20",
      active: true,
      order: 2,
    },
    {
      id: "3",
      title_en: "Free Shipping",
      title_ar: "شحن مجاني",
      subtitle_en: "On orders over $50",
      subtitle_ar: "للطلبات فوق 50 دولار",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=500&fit=crop",
      cta_text_en: "Start Shopping",
      cta_text_ar: "ابدأ التسوق",
      cta_link: "/products",
      bg_color: "#FFF3E0",
      text_color: "#E65100",
      active: true,
      order: 3,
    },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "Store ID is required" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Supabase query
    // const { data, error } = await supabase
    //   .from("hero_banners")
    //   .select("*")
    //   .eq("store_id", storeId)
    //   .eq("active", true)
    //   .order("order", { ascending: true });

    const heroes = MOCK_HEROES.store1.filter((h) => h.active);

    return NextResponse.json({
      success: true,
      data: heroes,
    });
  } catch (error) {
    console.error("Hero banners error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST endpoint for creating hero banners (admin use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeId,
      title_en,
      title_ar,
      subtitle_en,
      subtitle_ar,
      image,
      cta_text_en,
      cta_text_ar,
      cta_link,
      bg_color,
      text_color,
      order,
    } = body;

    // TODO: Add to Supabase
    // const { data, error } = await supabase
    //   .from("hero_banners")
    //   .insert([{ store_id: storeId, ...rest }])
    //   .select();

    return NextResponse.json({
      success: true,
      message: "Hero banner created successfully",
      data: { id: Date.now().toString(), ...body },
    });
  } catch (error) {
    console.error("Create hero error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create hero banner" },
      { status: 500 }
    );
  }
}