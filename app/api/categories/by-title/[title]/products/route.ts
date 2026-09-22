import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { title: string } },
) {
  try {
    const decodedTitle = decodeURIComponent(params.title).trim();

    // ✅ استقبل الـ subdomain من الـ query
    const { searchParams } = new URL(req.url);
    const storeSubdomain = searchParams.get("store");

    if (!storeSubdomain) {
      return NextResponse.json(
        { success: false, message: "Store not specified" },
        { status: 400 },
      );
    }

    const { data: store, error: storeError } = await supabaseAdmin
      .from("stores")
      .select("id")
      .eq("slug", storeSubdomain)
      .maybeSingle();

    if (storeError) throw storeError;
    if (!store) {
      return NextResponse.json(
        { success: false, message: "Store not found" },
        { status: 404 },
      );
    }

    // ✅ دور على الـ category مربوطة بالـ store تحديداً
    const { data: category, error: categoryError } = await supabaseAdmin
      .from("categories")
      .select("id, title, logo_url")
      .ilike("title", decodedTitle)
      .eq("store_id", store.id) // ← هنا الإصلاح
      .maybeSingle();

    if (categoryError) throw categoryError;
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("category_id", category.id)
      .eq("is_active", true);

    if (productsError) throw productsError;

    return NextResponse.json({
      success: true,
      data: {
        id: category.id,
        title: category.title,
        banner_url: category.logo_url,
        products: products || [],
      },
    });
  } catch (error: any) {
    console.error("GET Category by Title Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load category products" },
      { status: 500 },
    );
  }
}
