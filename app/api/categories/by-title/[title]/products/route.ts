import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { title: string } },
) {
  try {
    // 1. Decode the title from the URL (e.g., "smart-watches" or "ساعات")
    const decodedTitle = decodeURIComponent(params.title).trim();

    // 2. Fetch the category by its exact title
    const { data: category, error: categoryError } = await supabaseAdmin
      .from("categories")
      .select("id, title, logo_url")
      // Use ilike for case-insensitive matching if needed, or eq for exact
      .ilike("title", decodedTitle)
      .maybeSingle();

    if (categoryError) throw categoryError;

    // If no category is found with that title, return a 404
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 },
      );
    }

    // 3. Fetch the products that belong to this category's ID
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("category_id", category.id)
      .eq("is_active", true); // Optional: only fetch active products

    if (productsError) throw productsError;

    // 4. Return the formatted data expected by your frontend
    return NextResponse.json({
      success: true,
      data: {
        id: category.id,
        title: category.title,
        banner_url: category.logo_url, // Mapping your DB schema to frontend type
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
