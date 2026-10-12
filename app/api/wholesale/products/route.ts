// app/api/wholesale/products/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = (session.user as any).id;

  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("store_tier")
    .eq("id", storeId)
    .single();

  if (store?.store_tier !== "retail") {
    return NextResponse.json({ error: "Not a retail store" }, { status: 403 });
  }

  // كل الـ wholesale المرتبطين
  const { data: links } = await supabaseAdmin
    .from("wholesale_retail_links")
    .select("wholesale_store_id")
    .eq("retail_store_id", storeId);

  if (!links?.length) {
    return NextResponse.json({ products: [], wholesale_store_ids: [] });
  }

  const wholesaleIds = links.map((l) => l.wholesale_store_id);

  // جيب منتجات كل الـ wholesalers بقرار وحدة
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select(
      `
      id, title, description, price, discount_price,
      stock, images, category_id, variants, variantGroups,
      store_id,
      store_products!left(allocated_quantity)
    `,
    )
    .in("store_id", wholesaleIds)
    .eq("is_active", true)
    .filter("store_products.retail_store_id", "eq", storeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = products.map((p) => ({
    ...p,
    allocated_quantity: p.store_products?.[0]?.allocated_quantity ?? null,
    already_imported: p.store_products?.[0] !== undefined,
  }));

  return NextResponse.json({
    products: formatted,
    wholesale_store_ids: wholesaleIds,
  });
}
