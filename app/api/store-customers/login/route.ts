import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeId, phone, password } = body;

    if (!storeId || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Fetch customer
    const { data: customer, error } = await supabaseAdmin
      .from("store_customers")
      .select(
        "id, first_name, last_name, phone, governorate, password_hash, store_id",
      )
      .eq("store_id", storeId)
      .eq("phone", phone.trim())
      .maybeSingle();

    if (error || !customer) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(
      password,
      customer.password_hash,
    );

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Remove password_hash from response
    const { password_hash, ...customerData } = customer;

    // Create session cookie
    const sessionData = {
      customerId: customer.id,
      storeId: customer.store_id,
    };

    const response = NextResponse.json({
      success: true,
      customer: customerData,
    });

    // Set HTTP-only cookie
    response.cookies.set(
      "store_customer_session",
      JSON.stringify(sessionData),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      },
    );

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}
