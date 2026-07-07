import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireStoreSession } from "@/lib/store";

// ==================== SCHEMAS ====================

const CreateCouponSchema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code must be at most 20 characters")
      .toUpperCase()
      .regex(
        /^[A-Z0-9\-]+$/,
        "Code can only contain uppercase letters, numbers, and hyphens",
      ),
    type: z.enum(["percentage", "fixed"]),
    discount: z.number().positive("Discount must be greater than 0"),
    description: z.string().max(500, "Description too long").optional(),
    minPurchase: z.number().nonnegative().default(0),
    maxUses: z
      .number()
      .positive("Max uses must be greater than 0")
      .default(999999),
    maxUsesPerCustomer: z.number().positive().default(1),
    expiryDate: z.string().datetime("Invalid date format"),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.type === "fixed" || data.discount <= 100, {
    message: "Percentage discount cannot exceed 100%",
    path: ["discount"],
  });

const UpdateCouponSchema = CreateCouponSchema.partial({
  code: true,
});

const ValidateCouponSchema = z.object({
  storeId: z.string().uuid(),
  couponCode: z.string(),
  cartTotal: z.number().positive(),
  customerId: z.string().optional(),
});

// Define type with the injected storeId for the database function
type NewCouponData = z.infer<typeof CreateCouponSchema> & { storeId: string };

// ==================== DATABASE INTERACTIONS ====================

async function checkCouponExists(storeId: string, code: string) {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("id")
    .eq("store_id", storeId)
    .eq("code", code)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Database error: ${error.message}`);
  }

  return !!data;
}

async function getCoupon(couponId: string, storeId: string) {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("id", couponId)
    .eq("store_id", storeId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch coupon: ${error.message}`);
  }

  return data;
}

async function getAllCoupons(storeId: string) {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch coupons: ${error.message}`);
  }

  return data || [];
}

async function createNewCoupon(couponData: NewCouponData) {
  const exists = await checkCouponExists(couponData.storeId, couponData.code);
  if (exists) {
    throw new Error("Coupon code already exists");
  }

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .insert({
      store_id: couponData.storeId,
      code: couponData.code,
      type: couponData.type,
      discount: couponData.discount,
      description: couponData.description || null,
      min_purchase: couponData.minPurchase,
      max_uses: couponData.maxUses,
      max_uses_per_customer: couponData.maxUsesPerCustomer,
      expiry_date: couponData.expiryDate,
      is_active: couponData.isActive,
      used_count: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create coupon: ${error.message}`);
  }

  return data;
}

async function updateCoupon(
  couponId: string,
  storeId: string,
  updates: z.infer<typeof UpdateCouponSchema>,
) {
  if (updates.code) {
    const exists = await checkCouponExists(storeId, updates.code);
    if (exists) {
      throw new Error("Coupon code already exists");
    }
  }

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .update({
      ...(updates.code && { code: updates.code }),
      ...(updates.type && { type: updates.type }),
      ...(updates.discount && { discount: updates.discount }),
      ...(updates.description !== undefined && {
        description: updates.description,
      }),
      ...(updates.minPurchase !== undefined && {
        min_purchase: updates.minPurchase,
      }),
      ...(updates.maxUses && { max_uses: updates.maxUses }),
      ...(updates.maxUsesPerCustomer && {
        max_uses_per_customer: updates.maxUsesPerCustomer,
      }),
      ...(updates.expiryDate && { expiry_date: updates.expiryDate }),
      ...(updates.isActive !== undefined && { is_active: updates.isActive }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", couponId)
    .eq("store_id", storeId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update coupon: ${error.message}`);
  }

  return data;
}

async function deleteCoupon(couponId: string, storeId: string) {
  const { error } = await supabaseAdmin
    .from("coupons")
    .delete()
    .eq("id", couponId)
    .eq("store_id", storeId);

  if (error) {
    throw new Error(`Failed to delete coupon: ${error.message}`);
  }
}

async function validateAndApplyCoupon(
  storeId: string,
  code: string,
  cartTotal: number,
  customerId?: string,
) {
  const { data: coupon, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("store_id", storeId)
    .eq("code", code)
    .single();

  if (error || !coupon) {
    throw new Error("Coupon not found");
  }

  if (!coupon.is_active) throw new Error("Coupon is not active");

  const now = new Date();
  const expiryDate = new Date(coupon.expiry_date);
  if (now > expiryDate) throw new Error("Coupon has expired");

  if (coupon.used_count >= coupon.max_uses) {
    throw new Error("Coupon usage limit reached");
  }

  if (cartTotal < coupon.min_purchase) {
    throw new Error(`Minimum purchase of $${coupon.min_purchase} required`);
  }

  if (customerId && coupon.max_uses_per_customer > 0) {
    const { data: usage, error: usageError } = await supabaseAdmin
      .from("coupon_usage")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("customer_id", customerId);

    if (usageError) throw new Error("Failed to check coupon usage");

    if ((usage || []).length >= coupon.max_uses_per_customer) {
      throw new Error("You have already used this coupon maximum times");
    }
  }

  const discount =
    coupon.type === "percentage"
      ? (cartTotal * coupon.discount) / 100
      : Math.min(coupon.discount, cartTotal);

  const finalTotal = Math.max(0, cartTotal - discount);

  return {
    coupon,
    discount,
    finalTotal,
    discountPercent:
      coupon.type === "percentage"
        ? coupon.discount
        : (discount / cartTotal) * 100,
  };
}

async function recordCouponUsage(
  couponId: string,
  customerId: string | undefined,
  orderId: string,
) {
  // Fetch current used_count first (Supabase-safe way)
  const { data: couponData, error: fetchError } = await supabaseAdmin
    .from("coupons")
    .select("used_count")
    .eq("id", couponId)
    .single();

  if (fetchError) {
    console.error("Failed to fetch coupon count:", fetchError);
  }

  const nextCount = (couponData?.used_count ?? 0) + 1;

  // Increment usage counter safely (no .raw)
  const { error: updateError } = await supabaseAdmin
    .from("coupons")
    .update({
      used_count: nextCount,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", couponId);

  if (updateError) {
    console.error("Failed to update coupon usage count:", updateError);
  }

  // Record usage if customer provided
  if (customerId) {
    const { error: insertError } = await supabaseAdmin
      .from("coupon_usage")
      .insert({
        coupon_id: couponId,
        customer_id: customerId,
        order_id: orderId,
      });

    if (insertError) {
      console.error("Failed to record coupon usage:", insertError);
    }
  }
}

// ==================== API HANDLERS ====================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "validate") {
      const storeId = searchParams.get("storeId");
      const code = searchParams.get("code");
      const cartTotal = searchParams.get("cartTotal");
      const customerId = searchParams.get("customerId");

      if (!storeId || !code || !cartTotal) {
        return NextResponse.json(
          {
            success: false,
            message: "Store ID, code, and cart total required",
          },
          { status: 400 },
        );
      }

      const result = await validateAndApplyCoupon(
        storeId,
        code,
        parseFloat(cartTotal),
        customerId || undefined,
      );

      return NextResponse.json({ success: true, data: result });
    }

    const user = await requireStoreSession();
    const coupons = await getAllCoupons(user.id);

    return NextResponse.json({ success: true, data: coupons });
  } catch (err: any) {
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: isAuth ? 401 : 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireStoreSession();
    const body = await req.json();

    const parsed = CreateCouponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 422 },
      );
    }

    const coupon = await createNewCoupon({ storeId: user.id, ...parsed.data });

    return NextResponse.json(
      { success: true, message: "Coupon created successfully", data: coupon },
      { status: 201 },
    );
  } catch (err: any) {
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: isAuth ? 401 : 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireStoreSession();
    const body = await req.json();
    const { couponId, ...updates } = body;

    if (!couponId) {
      return NextResponse.json(
        { success: false, message: "Coupon ID required" },
        { status: 400 },
      );
    }

    const parsed = UpdateCouponSchema.safeParse(updates);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 422 },
      );
    }

    const coupon = await updateCoupon(couponId, user.id, parsed.data);

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (err: any) {
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: isAuth ? 401 : 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireStoreSession();
    const { searchParams } = new URL(req.url);
    const couponId = searchParams.get("couponId");

    if (!couponId) {
      return NextResponse.json(
        { success: false, message: "Coupon ID required" },
        { status: 400 },
      );
    }

    await deleteCoupon(couponId, user.id);

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (err: any) {
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: isAuth ? 401 : 500 },
    );
  }
}
