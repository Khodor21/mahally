import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireStoreSession } from "@/lib/store";

const LEBANON_GOVERNORATES = [
  "Beirut",
  "Mount Lebanon",
  "North",
  "Akkar",
  "Bekaa",
  "Baalbek-Hermel",
  "South",
  "Nabatieh",
];

// GET - For store admins to view all their customers in dashboard
export async function GET() {
  try {
    const user = await requireStoreSession();

    const { data, error } = await supabaseAdmin
      .from("store_customers")
      .select(
        `
        id,
        first_name,
        last_name,
        phone,
        governorate,
        created_at
      `,
      )
      .eq("store_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    const isAuth = err.message === "Unauthorized";

    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      {
        status: isAuth ? 401 : 500,
      },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { storeId, firstName, lastName, phone, governorate, password } = body;

    if (
      !storeId ||
      !firstName ||
      !lastName ||
      !phone ||
      !governorate ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        {
          status: 400,
        },
      );
    }

    if (!LEBANON_GOVERNORATES.includes(governorate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid governorate",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedPhone = phone.trim();

    const { data: existingCustomer } = await supabaseAdmin
      .from("store_customers")
      .select("id")
      .eq("store_id", storeId)
      .eq("phone", normalizedPhone)
      .maybeSingle();

    if (existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone already exists",
        },
        {
          status: 409,
        },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: customer, error } = await supabaseAdmin
      .from("store_customers")
      .insert({
        store_id: storeId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: normalizedPhone,
        governorate,
        password_hash: passwordHash,
      })
      .select(
        `
        id,
        first_name,
        last_name,
        phone,
        governorate,
        store_id
      `,
      )
      .single();

    if (error) {
      throw error;
    }

    const sessionData = {
      customerId: customer.id,
      storeId: customer.store_id,
    };

    const response = NextResponse.json({
      success: true,
      customer,
    });

    response.cookies.set(
      "store_customer_session",
      JSON.stringify(sessionData),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      },
    );

    return response;
  } catch (err: any) {
    console.error("Signup error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      {
        status: 500,
      },
    );
  }
}
