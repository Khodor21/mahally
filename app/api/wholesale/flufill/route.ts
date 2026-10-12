// app/api/wholesale/fulfill/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const FulfillSchema = z.object({
  order_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = (session.user as any).id;

  try {
    const { order_id } = FulfillSchema.parse(await request.json());

    // 1. تأكد إن الأوردر تابع لهيدا الـ retail store
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("id", order_id)
      .eq("store_id", storeId)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "delivered") {
      return NextResponse.json(
        { error: "Order not delivered yet" },
        { status: 422 }
      );
    }

    // 2. جيب الـ wholesale المرتبط بهيدا الـ retail
    const { data: link } = await supabaseAdmin
      .from("wholesale_retail_links")
      .select("wholesale_store_id")
      .eq("retail_store_id", storeId)
      .maybeSingle();

    if (!link) return NextResponse.json({ success: true, updated: 0 });

    // 3. جيب order items
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("product_id, qty")
      .eq("order_id", order_id);

    if (!items?.length) return NextResponse.json({ success: true, updated: 0 });

    const productIds = items.map((i) => i.product_id);

    // 4. شوف أي منهم فعلاً من الـ wholesale (موجودين بـ store_products)
    const { data: linkedProducts } = await supabaseAdmin
      .from("store_products")
      .select("wholesale_product_id, allocated_quantity")
      .eq("retail_store_id", storeId)
      .in("wholesale_product_id", productIds);

    if (!linkedProducts?.length) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    // 5. لكل منتج wholesale — نقّص الكمية
    const updates = linkedProducts.map(async (lp) => {
      const item = items.find((i) => i.product_id === lp.wholesale_product_id);
      if (!item) return;

      const qty = item.qty;

      // نقص من stock الأصلي عند الـ wholesale
      await supabaseAdmin.rpc("decrement_stock", {
        p_product_id: lp.wholesale_product_id,
        p_qty: qty,
      });

      // نقص من allocated_quantity عند الـ retail
      await supabaseAdmin
        .from("store_products")
        .update({
          allocated_quantity: Math.max(0, lp.allocated_quantity - qty),
        })
        .eq("retail_store_id", storeId)
        .eq("wholesale_product_id", lp.wholesale_product_id);
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true, updated: linkedProducts.length });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}