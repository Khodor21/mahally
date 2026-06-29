// app/api/notifications/register-token/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireCustomerSession } from "@/lib/customer-auth";

export async function POST(req: NextRequest) {
  try {
    const customer = await requireCustomerSession();

    // IMPORTANT: customer.store_id should come from the customer's session
    // which is tied to the storefront they're viewing
    console.log("📊 Customer session:", {
      customer_id: customer.id,
      store_id: customer.store_id,
    });

    const body = await req.json();
    const token = body?.token?.trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token is required",
        },
        { status: 400 },
      );
    }

    if (!customer.store_id) {
      console.error("❌ customer.store_id is missing!");
      return NextResponse.json(
        {
          success: false,
          message: "Store context not found",
        },
        { status: 400 },
      );
    }

    // Check if token already exists for this customer
    const { data: existing } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id")
      .eq("customer_id", customer.id)
      .eq("fcm_token", token)
      .eq("store_id", customer.store_id)
      .maybeSingle();

    if (existing) {
      console.log("✅ Token already registered");
      return NextResponse.json({
        success: true,
      });
    }

    // Insert new subscription
    const { error } = await supabaseAdmin.from("push_subscriptions").insert({
      store_id: customer.store_id,
      customer_id: customer.id,
      fcm_token: token,
      active: true,
    });

    if (error) {
      console.error("❌ Insert error:", error);
      throw error;
    }

    console.log("✅ Token registered for store:", customer.store_id);

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    console.error("❌ Error in register-token:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      {
        status: err.message === "Unauthorized" ? 401 : 500,
      },
    );
  }
}
