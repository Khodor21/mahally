import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "Missing storeId parameter" },
        { status: 400 },
      );
    }

    // Fetch all visitor records for this store
    const { data, error } = await supabaseAdmin
      .from("visitor_counts")
      .select("id, store_id, count_date, visitor_count, updated_at")
      .eq("store_id", storeId)
      .order("count_date", { ascending: false });

    if (error) {
      console.error("Error fetching visitors:", error);
      return NextResponse.json(
        { error: "Failed to fetch visitor data" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: data ?? [],
    });
  } catch (error) {
    console.error("GET /api/visitors error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
