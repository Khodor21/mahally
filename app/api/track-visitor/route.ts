import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Try to increment existing counter
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("visitor_counts")
      .select("visitor_count")
      .eq("store_id", storeId)
      .eq("count_date", today)
      .single();

    if (existing) {
      // Increment counter
      const { error: updateError } = await supabaseAdmin
        .from("visitor_counts")
        .update({
          visitor_count: existing.visitor_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("store_id", storeId)
        .eq("count_date", today);

      if (updateError) throw updateError;
    } else {
      // Create new counter for today
      const { error: insertError } = await supabaseAdmin
        .from("visitor_counts")
        .insert({
          store_id: storeId,
          count_date: today,
          visitor_count: 1,
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visitor tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track visitor" },
      { status: 500 },
    );
  }
}
