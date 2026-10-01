import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";

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
      couponCode,
      paymentMethod,
      items,
      isGift,
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      recipientAddress,
      recipientCity,
      giftMessage,
      giftOccasion,
      deliveryDate,
    } = parsed.data;

    // GIFT VALIDATION
    if (isGift) {
      if (!senderName?.trim() || !senderPhone?.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Sender name and phone are required for gifts",
          },
          { status: 422 },
        );
      }
      if (
        !recipientName?.trim() ||
        !recipientPhone?.trim() ||
        !recipientAddress?.trim() ||
        !recipientCity?.trim() ||
        !giftOccasion?.trim()
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

    // Validate payment method against store's allowed methods
    const { data: storeData, error: storeError } = await supabaseAdmin
      .from("stores")
      .select("payment_methods")
      .eq("id", storeId)
      .single();

    if (storeError || !storeData) {
      return NextResponse.json(
        { success: false, message: "Store not found" },
        { status: 404 },
      );
    }

    let storePaymentMethods: string[] = [];
    if (storeData.payment_methods) {
      try {
        const parsedMethods =
          typeof storeData.payment_methods === "string"
            ? JSON.parse(storeData.payment_methods)
            : storeData.payment_methods;

        if (Array.isArray(parsedMethods)) {
          storePaymentMethods = parsedMethods;
        }
      } catch (e) {
        console.error("Failed to parse store payment methods:", e);
      }
    }

    if (!storePaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or unsupported payment method for this store",
        },
        { status: 400 },
      );
    }

    const productIds = items.map((i) => i.productId);

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select(
        "id, title, price, discount_price, images, stock, store_id, preorder_enabled",
      )
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

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Product not found");

      const isPreorder =
        product.stock === 0 && Boolean(product.preorder_enabled);
      const effectivePrice = product.discount_price
        ? Number(product.discount_price)
        : Number(product.price);

      const itemTotal = effectivePrice * item.qty;
      subtotal += itemTotal;

      return {
        product_id: product.id,
        title: product.title,
        image: product.images?.[0] || null,
        price: effectivePrice,
        original_price: Number(product.price),
        qty: item.qty,
        total: itemTotal,
        is_preorder: isPreorder,
        variant_json: item.variantSelections
          ? JSON.stringify(item.variantSelections)
          : null,
      };
    });

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

      if (!couponError && coupon) {
        if (
          coupon.is_active &&
          new Date() <= new Date(coupon.expiry_date) &&
          coupon.used_count < coupon.max_uses &&
          subtotal >= coupon.min_purchase
        ) {
          discountAmount =
            coupon.type === "percentage"
              ? (subtotal * coupon.discount) / 100
              : Math.min(coupon.discount, subtotal);
          appliedCouponCode = coupon.code;
          couponId = coupon.id;
          currentCouponUsage = coupon.used_count;
        }
      }
    }

    const total = Math.max(0, subtotal - discountAmount) + shipping;
    const hasPreorder = items.some((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product && product.stock === 0 && product.preorder_enabled;
    });

    // INSERT ORDER WITH GIFT FIELDS

    // 1. تجهيز البيانات في متغير أولاً لتنظيفها وفحصها
    const orderPayload = {
      store_id: storeId,
      customer_name: customerName,
      customer_email: customerEmail || null,
      customer_phone: customerPhone,
      city: isGift ? null : city?.trim() || null,
      address: isGift ? null : address?.trim() || null,
      notes: notes?.trim() || null,
      subtotal,
      discount_amount: discountAmount,
      coupon_code: appliedCouponCode,
      shipping,
      total,
      payment_method: paymentMethod,
      status: "pending",
      has_preorder: hasPreorder,
      // GIFT FIELDS
      is_gift: isGift || false,
      sender_name: isGift ? senderName?.trim() || null : null,
      sender_phone: isGift ? senderPhone?.trim() || null : null,
      recipient_name: isGift ? recipientName?.trim() || null : null,
      recipient_phone: isGift ? recipientPhone?.trim() || null : null,
      recipient_address: isGift ? recipientAddress?.trim() || null : null,
      recipient_city: isGift ? recipientCity?.trim() || null : null,
      gift_message: isGift ? giftMessage?.trim() || null : null,
      gift_occasion: isGift ? giftOccasion?.trim() || null : null,
      // تأكدنا هنا من استخدام trim() لحذف أي مسافات فارغة قد تسبب Invalid Input
      delivery_date:
        isGift && deliveryDate && deliveryDate.trim()
          ? deliveryDate.trim()
          : null,
    };

    // 2. طباعة البيانات في الـ Terminal الخاص بالـ Server لمعرفة ما الذي يتم إرساله بالضبط
    console.log("=== DATA SENT TO SUPABASE ===", orderPayload);

    // 3. إرسال البيانات إلى قاعدة البيانات
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      throw new Error(orderError?.message || "Failed to create order");
    }

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems.map((item) => ({ order_id: order.id, ...item })));

    if (itemsError) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      console.error("Order items creation error:", itemsError);
      throw new Error(itemsError?.message || "Failed to create order items");
    }

    const regularItems = items.filter((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product && (product.stock > 0 || !product.preorder_enabled);
    });

    const preorderItems = items.filter((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product && product.stock === 0 && product.preorder_enabled;
    });

    if (regularItems.length > 0) {
      const { error: stockError } = await supabaseAdmin.rpc(
        "reduce_stock_securely",
        {
          items: regularItems.map((item) => ({
            product_id: item.productId,
            qty: item.qty,
            variant_selections: item.variantSelections || null,
          })),
        },
      );

      if (stockError) {
        await supabaseAdmin
          .from("order_items")
          .delete()
          .eq("order_id", order.id);
        await supabaseAdmin.from("orders").delete().eq("id", order.id);
        throw new Error(
          stockError?.message || "Failed to secure product stock.",
        );
      }
    }

    // Sales count increment (fire-and-forget)
    items.forEach(async (item) => {
      try {
        const { error: incrementError } = await supabaseAdmin.rpc(
          "increment_product_sales",
          {
            product_id: item.productId,
            qty: item.qty,
          },
        );

        if (incrementError) {
          console.warn("Failed to increment sales count:", incrementError);
        }
      } catch (err) {
        console.warn("Failed to increment sales count:", err);
      }
    });

    if (couponId) {
      await supabaseAdmin
        .from("coupons")
        .update({
          used_count: currentCouponUsage + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", couponId);
    }

    return NextResponse.json(
      { success: true, orderId: order.id },
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
      .limit(50);

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
