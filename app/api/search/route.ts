import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  normalizeArabicText,
  parseVariantGroups,
  isValidSearchQuery,
} from "@/lib/arabicSearchEngine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const storeId = searchParams.get("store_id");

    if (!isValidSearchQuery(q)) {
      return NextResponse.json({ success: true, data: [] });
    }

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "store_id is required" },
        { status: 400 },
      );
    }

    const normalizedQ = normalizeArabicText(q);

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, title, price, discount_price, images, variantGroups")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .ilike("title_normalized", `%${normalizedQ}%`)
      .limit(15);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, message: "Search failed" },
        { status: 500 },
      );
    }

    const finalResults = (data || []).map((product: any) => ({
      ...product,
      variantGroups: parseVariantGroups(product.variantGroups),
    }));

    return NextResponse.json({
      success: true,
      data: finalResults,
      count: finalResults.length,
    });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 },
    );
  }
}
