// app/api/notifications/register-token/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireCustomerSession } from "@/lib/customer-auth";

export async function POST(req: NextRequest) {
  try {
    console.log("\n========== 📝 REGISTER TOKEN ==========");

    // 1. Get customer session
    let customer;
    try {
      customer = await requireCustomerSession();
      console.log("✅ Customer session:", {
        customerId: customer.id,
        storeId: customer.store_id,
      });
    } catch (error) {
      console.error("❌ Auth failed:", error);
      return NextResponse.json(
        { success: false, message: "Unauthorized - not logged in" },
        { status: 401 },
      );
    }

    // 2. Validate customer session has store_id
    if (!customer.id || !customer.store_id) {
      console.error("❌ Customer session incomplete:", customer);
      return NextResponse.json(
        { success: false, message: "Customer session incomplete" },
        { status: 400 },
      );
    }

    // 3. Get token from request body
    const body = await req.json();
    const token = body?.token?.trim();

    if (!token) {
      console.error("❌ No token in request");
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 },
      );
    }

    console.log("🎫 Token received (first 50 chars):", token.substring(0, 50));

    // 4. Check if token already exists for this customer
    console.log("🔍 Checking for existing registration...");
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, created_at")
      .eq("customer_id", customer.id)
      .eq("fcm_token", token)
      .eq("store_id", customer.store_id)
      .maybeSingle();

    if (checkError) {
      console.error("❌ Database check error:", checkError);
      throw checkError;
    }

    if (existing) {
      console.log("✅ Token already registered (dedup)");
      return NextResponse.json({
        success: true,
        message: "Token already registered",
      });
    }

    // 5. Insert new token subscription
    console.log("📤 Inserting token into database...");
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("push_subscriptions")
      .insert({
        store_id: customer.store_id,
        customer_id: customer.id,
        fcm_token: token,
        active: true,
      })
      .select("id");

    if (insertError) {
      console.error("❌ Insert error:", insertError);
      throw insertError;
    }

    console.log("✅ Token registered successfully!");
    console.log("   Store:", customer.store_id);
    console.log("   Customer:", customer.id);
    console.log("========== ✅ DONE ==========\n");

    return NextResponse.json({
      success: true,
      message: "Token registered",
    });
  } catch (err: any) {
    console.error("❌ Error in register-token:", err.message);
    console.log("========== ❌ FAILED ==========\n");

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to register token",
      },
      {
        status: err.message === "Unauthorized" ? 401 : 500,
      },
    );
  }
}
