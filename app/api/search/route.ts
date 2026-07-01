import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const storeId = searchParams.get("store_id");

    if (!q) {
      return NextResponse.json({ success: true, data: [] });
    }

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "store_id is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, title, price, discount_price, images")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .ilike("title", `%${q}%`)
      .limit(10);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
