import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, visitorId } = body;

    // Validation
    if (!storeId || !visitorId) {
      return NextResponse.json(
        { error: "Missing storeId or visitorId" },
        { status: 400 },
      );
    }

    // Get today's date in UTC (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // Check if today's record exists for this store
    const { data: existingRecord, error: checkError } = await supabaseAdmin
      .from("visitor_counts")
      .select("id, visitor_count")
      .eq("store_id", storeId)
      .eq("count_date", today)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows found (expected)
      console.error("Error checking visitor:", checkError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (existingRecord) {
      // Record exists, increment visitor_count
      const newCount = (existingRecord.visitor_count || 1) + 1;

      const { error: updateError } = await supabaseAdmin
        .from("visitor_counts")
        .update({
          visitor_count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRecord.id);

      if (updateError) {
        console.error("Error updating visitor count:", updateError);
        return NextResponse.json(
          { error: "Failed to update visitor count" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Visitor count incremented",
          tracked: false,
          count: newCount,
        },
        { status: 200 },
      );
    } else {
      // Create new record for today
      const { error: insertError } = await supabaseAdmin
        .from("visitor_counts")
        .insert({
          store_id: storeId,
          count_date: today,
          visitor_count: 1,
        });

      if (insertError) {
        console.error("Error inserting visitor record:", insertError);
        return NextResponse.json(
          { error: "Failed to track visitor" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Visitor tracked",
          tracked: true,
          count: 1,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Track visitor API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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

    // Get today's count
    const today = new Date().toISOString().split("T")[0];

    const { data: todayData, error: todayError } = await supabaseAdmin
      .from("visitor_counts")
      .select("visitor_count")
      .eq("store_id", storeId)
      .eq("count_date", today)
      .single();

    if (todayError && todayError.code !== "PGRST116") {
      console.error("Error fetching today's count:", todayError);
      return NextResponse.json(
        { error: "Failed to fetch visitor counts" },
        { status: 500 },
      );
    }

    // Get all-time total visitors
    const { data: allVisitors, error: allError } = await supabaseAdmin
      .from("visitor_counts")
      .select("visitor_count")
      .eq("store_id", storeId);

    if (allError) {
      console.error("Error fetching all visitors:", allError);
      return NextResponse.json(
        { error: "Failed to fetch visitor data" },
        { status: 500 },
      );
    }

    // Get last 7 days summary
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

    const { data: sevenDayData, error: sevenDayError } = await supabaseAdmin
      .from("visitor_counts")
      .select("count_date, visitor_count")
      .eq("store_id", storeId)
      .gte("count_date", sevenDaysAgoStr)
      .order("count_date", { ascending: true });

    if (sevenDayError) {
      console.error("Error fetching 7-day data:", sevenDayError);
      return NextResponse.json(
        { error: "Failed to fetch 7-day data" },
        { status: 500 },
      );
    }

    // Format 7-day data
    const sevenDayByDate =
      sevenDayData?.reduce(
        (acc, record) => {
          acc[record.count_date] = record.visitor_count || 0;
          return acc;
        },
        {} as Record<string, number>,
      ) || {};

    // Calculate totals
    const todayCount = todayData?.visitor_count || 0;
    const totalVisitors =
      allVisitors?.reduce(
        (sum, record) => sum + (record.visitor_count || 0),
        0,
      ) || 0;

    return NextResponse.json({
      success: true,
      stats: {
        todayCount,
        totalVisitors,
        sevenDaySummary: sevenDayByDate,
      },
    });
  } catch (error) {
    console.error("GET /api/track-visitor error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
