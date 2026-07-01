import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const raw = req.cookies.get("store_customer_session")?.value;

    if (!raw) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const { customerId, storeId } = JSON.parse(raw);

    if (!customerId || !storeId) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 },
      );
    }

    const { data: customer, error } = await supabaseAdmin
      .from("store_customers")
      .select("id, first_name, last_name, phone, governorate, store_id")
      .eq("id", customerId)
      .eq("store_id", storeId)
      .single();

    if (error || !customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (err: any) {
    console.error("Get customer error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}
