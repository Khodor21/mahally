import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Missing storeId parameter", data: [] },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("visitor_counts")
      .select("id, store_id, count_date, visitor_count, updated_at")
      .eq("store_id", storeId)
      .order("count_date", { ascending: false });

    if (error) {
      console.error("Visitor API error:", error);

      return NextResponse.json(
        { error: "Failed to fetch visitor counts", data: [] },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: data ?? [],
    });
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Internal server error", data: [] },
      { status: 500 },
    );
  }
}
