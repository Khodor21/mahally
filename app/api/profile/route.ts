import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireCustomerSession } from "@/lib/customer-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

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

// GET - Fetch customer profile
export async function GET() {
  try {
    const customer = await requireCustomerSession();

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: err.message === "Unauthorized" ? 401 : 500 },
    );
  }
}

// PUT - Update customer profile
export async function PUT(req: Request) {
  try {
    const customer = await requireCustomerSession();
    const body = await req.json();

    const {
      firstName,
      lastName,
      phone,
      governorate,
      currentPassword,
      newPassword,
    } = body;

    // Build update object
    const updates: any = {};

    if (firstName) updates.first_name = firstName.trim();
    if (lastName) updates.last_name = lastName.trim();
    if (governorate) {
      if (!LEBANON_GOVERNORATES.includes(governorate)) {
        return NextResponse.json(
          { success: false, message: "Invalid governorate" },
          { status: 400 },
        );
      }
      updates.governorate = governorate;
    }

    // Handle phone update
    if (phone && phone !== customer.phone) {
      const normalizedPhone = phone.trim();

      // Check if new phone already exists
      const { data: existingCustomer } = await supabaseAdmin
        .from("store_customers")
        .select("id")
        .eq("store_id", customer.store_id)
        .eq("phone", normalizedPhone)
        .neq("id", customer.id)
        .maybeSingle();

      if (existingCustomer) {
        return NextResponse.json(
          { success: false, message: "Phone number already in use" },
          { status: 409 },
        );
      }

      updates.phone = normalizedPhone;
    }

    // Handle password update
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: "Current password is required" },
          { status: 400 },
        );
      }

      // Fetch current password hash
      const { data: customerData, error: fetchError } = await supabaseAdmin
        .from("store_customers")
        .select("password_hash")
        .eq("id", customer.id)
        .single();

      if (fetchError || !customerData) {
        return NextResponse.json(
          { success: false, message: "Customer not found" },
          { status: 404 },
        );
      }

      // Verify current password
      const passwordValid = await bcrypt.compare(
        currentPassword,
        customerData.password_hash,
      );

      if (!passwordValid) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 401 },
        );
      }

      // Hash new password
      updates.password_hash = await bcrypt.hash(newPassword, 12);
    }

    // If no updates, return early
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes to update",
        data: customer,
      });
    }

    // Update customer
    const { data, error } = await supabaseAdmin
      .from("store_customers")
      .update(updates)
      .eq("id", customer.id)
      .select("id, first_name, last_name, phone, governorate, store_id")
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data,
    });
  } catch (err: any) {
    console.error("Profile update error:", err);

    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: err.message === "Unauthorized" ? 401 : 500 },
    );
  }
}

// DELETE - Delete customer account
export async function DELETE() {
  try {
    const customer = await requireCustomerSession();

    // Delete customer
    const { error } = await supabaseAdmin
      .from("store_customers")
      .delete()
      .eq("id", customer.id);

    if (error) throw error;

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });

    response.cookies.delete("store_customer_session");

    return response;
  } catch (err: any) {
    console.error("Account deletion error:", err);

    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: err.message === "Unauthorized" ? 401 : 500 },
    );
  }
}
