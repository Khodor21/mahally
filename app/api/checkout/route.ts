import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";

// 1. Add couponCode to your schema
const CheckoutSchema = z.object({
  storeId: z.string().uuid(),

  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().min(6).max(20),

  city: z.string().max(100).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),

  shipping: z.number().min(0),
  couponCode: z.string().optional().or(z.literal("")), // NEW: Accept coupon code

  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        qty: z.number().min(1),
      }),
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  try {
    // ── Parse body ─────────────────────────────────────
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }

    // ── Validate ───────────────────────────────────────
    const parsed = CheckoutSchema.safeParse(rawBody);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          message: firstError.message,
          field:
            typeof firstError.path[0] === "string"
              ? firstError.path[0]
              : undefined,
        },
        { status: 422 },
      );
    }

    const {
      storeId,
      customerName,
      customerEmail,
      customerPhone,
      city,
      address,
      notes,
      shipping,
      couponCode, // Extract coupon code
      items,
    } = parsed.data;

    // ── Fetch products securely ────────────────────────
    const productIds = items.map((i) => i.productId);

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, title, price, images, stock, store_id")
      .in("id", productIds);

    if (productsError || !products || products.length === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to load products" },
        { status: 404 },
      );
    }

    const invalidStoreProduct = products.find((p) => p.store_id !== storeId);
    if (invalidStoreProduct) {
      return NextResponse.json(
        { success: false, message: "Invalid product store relation" },
        { status: 400 },
      );
    }

    // ── Build order items & calculate subtotal ─────────
    let subtotal = 0;

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Product not found");
      if (product.stock < item.qty)
        throw new Error(`${product.title} out of stock`);

      const itemTotal = Number(product.price) * item.qty;
      subtotal += itemTotal;

      return {
        product_id: product.id,
        title: product.title,
        image: product.images?.[0] || null,
        price: product.price,
        qty: item.qty,
        total: itemTotal,
      };
    });

    // ── Apply Coupon Logic ─────────────────────────────
    let discountAmount = 0;
    let appliedCouponCode = null;
    let couponId = null;
    let currentCouponUsage = 0;

    if (couponCode && couponCode.trim() !== "") {
      const { data: coupon, error: couponError } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("store_id", storeId)
        .eq("code", couponCode.toUpperCase())
        .single();

      if (couponError || !coupon) {
        return NextResponse.json(
          { success: false, message: "Invalid coupon code" },
          { status: 400 },
        );
      }

      // Validations
      if (!coupon.is_active) {
        return NextResponse.json(
          { success: false, message: "Coupon is no longer active" },
          { status: 400 },
        );
      }
      if (new Date() > new Date(coupon.expiry_date)) {
        return NextResponse.json(
          { success: false, message: "Coupon has expired" },
          { status: 400 },
        );
      }
      if (coupon.used_count >= coupon.max_uses) {
        return NextResponse.json(
          { success: false, message: "Coupon usage limit reached" },
          { status: 400 },
        );
      }
      if (subtotal < coupon.min_purchase) {
        return NextResponse.json(
          {
            success: false,
            message: `Minimum purchase of $${coupon.min_purchase} required`,
          },
          { status: 400 },
        );
      }

      // Calculate discount
      if (coupon.type === "percentage") {
        discountAmount = (subtotal * coupon.discount) / 100;
      } else {
        discountAmount = Math.min(coupon.discount, subtotal); // Prevent negative totals
      }

      appliedCouponCode = coupon.code;
      couponId = coupon.id;
      currentCouponUsage = coupon.used_count;
    }

    // Apply discount to subtotal, then add shipping
    const finalSubtotal = Math.max(0, subtotal - discountAmount);
    const total = finalSubtotal + shipping;

    // ── Create order ───────────────────────────────────
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        store_id: storeId,

        customer_name: customerName,
        customer_email: customerEmail || null,
        customer_phone: customerPhone,

        city: city || null,
        address: address || null,
        notes: notes || null,

        subtotal,
        discount_amount: discountAmount, // NEW
        coupon_code: appliedCouponCode, // NEW
        shipping,
        total,

        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Create order error:", orderError);
      return NextResponse.json(
        { success: false, message: "Failed to create order" },
        { status: 500 },
      );
    }

    // ── Insert order items ─────────────────────────────
    const itemsPayload = orderItems.map((item) => ({
      order_id: order.id,
      ...item,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(itemsPayload);

    if (itemsError) {
      console.error("Insert order items error:", itemsError);
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { success: false, message: "Failed to create order items" },
        { status: 500 },
      );
    }

    // ── Reduce stock and Record Coupon Usage ───────────

    // 1. Reduce Stock
    await Promise.all(
      items.map(async (item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return;
        await supabaseAdmin
          .from("products")
          .update({ stock: product.stock - item.qty })
          .eq("id", product.id);
      }),
    );

    // 2. Increment Coupon Usage
    if (couponId) {
      await supabaseAdmin
        .from("coupons")
        .update({
          used_count: currentCouponUsage + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", couponId);
    }

    // ── Success ────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Store ID required",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items (*)
      `,
      )
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET orders error:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: any) {
    console.error("GET checkout catch error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
        },
        { status: 400 },
      );
    }

    const { orderId, status } = body;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID required",
        },
        { status: 400 },
      );
    }

    const allowedStatuses = ["pending", "processing", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        status,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("PATCH order error:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error("PATCH checkout catch error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID required",
        },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.error("DELETE order error:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE checkout catch error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
