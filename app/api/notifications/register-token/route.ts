import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireCustomerSession } from "@/lib/customer-auth";

export async function POST(req: NextRequest) {
  try {
    const customer = await requireCustomerSession();

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

    const { data: existing } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id")
      .eq("customer_id", customer.id)
      .eq("fcm_token", token)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
      });
    }

    const { error } = await supabaseAdmin.from("push_subscriptions").insert({
      store_id: customer.store_id,
      customer_id: customer.id,
      fcm_token: token,
      active: true,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
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
