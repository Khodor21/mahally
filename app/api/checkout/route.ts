import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { notifyAdminOrderSubmitted } from "@/lib/notifications/notifyAdmin";

// UPDATED: Add gift fields to schema
const CheckoutSchema = z.object({
  storeId: z.string().uuid(),

  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().min(6).max(20),

  city: z.string().max(100).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),

  shipping: z.number().min(0),
  couponCode: z.string().optional().or(z.literal("")),
  paymentMethod: z.string().min(1, "Payment method is required"),

  // GIFT FIELDS
  isGift: z.boolean().optional(),
  senderName: z.string().min(2).max(100).optional(),
  senderPhone: z.string().min(6).max(20).optional(),
  recipientName: z.string().min(2).max(100).optional(),
  recipientPhone: z.string().min(6).max(20).optional(),
  recipientAddress: z.string().max(500).optional(),
  recipientCity: z.string().max(100).optional(),
  giftMessage: z.string().max(1000).optional().or(z.literal("")),
  giftOccasion: z.string().max(50).optional(),
  deliveryDate: z.string().nullable().optional().or(z.literal("")),

  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        qty: z.number().min(1),
        variantSelections: z
          .record(
            z.string(),
            z.object({
              id: z.string(),
              value: z.string(),
              stock: z.number().optional(),
            }),
          )
          .optional(),
      }),
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  try {
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }

    const parsed = CheckoutSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { success: false, message: firstError.message },
        { status: 422 },
      );
    }

    const { data } = parsed;

    // Gift validation
    if (data.isGift) {
      if (!data.senderName?.trim() || !data.senderPhone?.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Sender name and phone are required for gifts",
          },
          { status: 422 },
        );
      }
      if (
        !data.recipientName?.trim() ||
        !data.recipientPhone?.trim() ||
        !data.recipientAddress?.trim() ||
        !data.recipientCity?.trim() ||
        !data.giftOccasion?.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Recipient info and occasion are required for gifts",
          },
          { status: 422 },
        );
      }
    }

    // Payment method validation
    const { data: storeData, error: storeError } = await supabaseAdmin
      .from("stores")
      .select("payment_methods")
      .eq("id", data.storeId)
      .single();

    if (storeError || !storeData) {
      return NextResponse.json(
        { success: false, message: "Store not found" },
        { status: 404 },
      );
    }

    const methods = Array.isArray(storeData.payment_methods)
      ? storeData.payment_methods
      : JSON.parse(storeData.payment_methods || "[]");

    if (!methods.includes(data.paymentMethod)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment method" },
        { status: 400 },
      );
    }

    // 🔥 One call does everything
    const { data: result, error } = await supabaseAdmin.rpc(
      "process_checkout",
      { payload: data },
    );

    if (error || !result?.success) {
      const code = result?.code || error?.message || "";

      if (code.includes("OUT_OF_STOCK")) {
        return NextResponse.json(
          { success: false, message: "One or more items are out of stock" },
          { status: 409 },
        );
      }
      if (code.includes("PRODUCT_NOT_FOUND")) {
        return NextResponse.json(
          { success: false, message: "Product not found" },
          { status: 404 },
        );
      }

      throw new Error(code);
    }

    // Fire-and-forget side effects
    notifyAdminOrderSubmitted(
      data.storeId,
      result.orderId,
      data.customerName,
      0,
    ).catch((err) => console.warn("Notify failed:", err));

    return NextResponse.json(
      { success: true, orderId: result.orderId },
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
    if (!storeId)
      return NextResponse.json(
        { success: false, message: "Store ID required" },
        { status: 400 },
      );

    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (ordersError) throw ordersError;

    if (!orders || orders.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const batchSize = 10;
    const orderIds = orders.map((o: any) => o.id);
    let allOrderItems: any[] = [];

    for (let i = 0; i < orderIds.length; i += batchSize) {
      const batch = orderIds.slice(i, i + batchSize);

      const { data: batchItems, error: itemsError } = await supabaseAdmin
        .from("order_items")
        .select("*")
        .in("order_id", batch);

      if (itemsError) {
        console.warn(
          "Failed to fetch batch items, continuing without items:",
          itemsError,
        );
        continue;
      }

      if (batchItems) {
        allOrderItems = [...allOrderItems, ...batchItems];
      }
    }

    const ordersWithItems = orders.map((order: any) => ({
      ...order,
      order_items: allOrderItems.filter(
        (item: any) => item.order_id === order.id,
      ),
    }));

    return NextResponse.json({ success: true, data: ordersWithItems });
  } catch (err: any) {
    console.error("GET orders error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
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
        { success: false, message: "Invalid request body" },
        { status: 400 },
      );
    }

    const { orderId, status } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID required" },
        { status: 400 },
      );
    }

    const allowedStatuses = ["pending", "processing", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 },
      );
    }

    // Guard: جيب الـ status الحالي قبل التغيير
    const { data: existing } = await supabaseAdmin
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select("id, store_id, status")
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    // Stock restoration — بس إذا مش أصلاً cancelled
    if (status === "cancelled" && existing?.status !== "cancelled") {
      const { data: items } = await supabaseAdmin
        .from("order_items")
        .select("product_id, qty")
        .eq("order_id", orderId);

      if (items?.length) {
        await Promise.all(
          items.map((item) =>
            supabaseAdmin.rpc("increment_product_stock", {
              p_product_id: item.product_id,
              p_qty: item.qty,
            }),
          ),
        );
      }
    }

    // Wholesale fulfillment
    if (status === "completed") {
      fulfillWholesaleOrder(data.store_id, orderId).catch((err) =>
        console.warn("Wholesale fulfill failed:", err),
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// ── Helper ───────────────────────────────────────────────────────
async function fulfillWholesaleOrder(storeId: string, orderId: string) {
  const { data: links } = await supabaseAdmin
    .from("wholesale_retail_links")
    .select("wholesale_store_id")
    .eq("retail_store_id", storeId);

  if (!links?.length) return;

  const wholesaleIds = links.map((l) => l.wholesale_store_id);

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("product_id, qty")
    .eq("order_id", orderId);

  if (!items?.length) return;

  const { data: linkedProducts } = await supabaseAdmin
    .from("store_products")
    .select("wholesale_product_id, allocated_quantity")
    .eq("retail_store_id", storeId)
    .in(
      "wholesale_product_id",
      items.map((i) => i.product_id),
    );

  if (!linkedProducts?.length) return;

  await Promise.all(
    linkedProducts.map(async (lp) => {
      const item = items.find((i) => i.product_id === lp.wholesale_product_id);
      if (!item) return;

      await Promise.all([
        supabaseAdmin.rpc("decrement_stock", {
          p_product_id: lp.wholesale_product_id,
          p_qty: item.qty,
        }),
        supabaseAdmin
          .from("store_products")
          .update({
            allocated_quantity: Math.max(0, lp.allocated_quantity - item.qty),
          })
          .eq("retail_store_id", storeId)
          .eq("wholesale_product_id", lp.wholesale_product_id),
      ]);
    }),
  );
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
