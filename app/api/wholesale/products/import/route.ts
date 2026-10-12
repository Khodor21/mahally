// app/api/wholesale/products/import/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const ImportSchema = z.object({
  wholesale_product_id: z.string().uuid(),
  allocated_quantity: z.number().int().min(1),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = (session.user as any).id;

  try {
    const body = ImportSchema.parse(await request.json());

    // 1. تأكد إنه retail ومرتبط بـ wholesale
    const { data: link } = await supabaseAdmin
      .from("wholesale_retail_links")
      .select("wholesale_store_id")
      .eq("retail_store_id", storeId)
      .maybeSingle();

    if (!link) {
      return NextResponse.json({ error: "Not linked to a wholesale" }, { status: 403 });
    }

    // 2. تأكد إن المنتج فعلاً تابع لهيدا الـ wholesale
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, stock")
      .eq("id", body.wholesale_product_id)
      .eq("store_id", link.wholesale_store_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 3. تأكد إن الكمية ما بتتخطى الـ stock
    if (body.allocated_quantity > product.stock) {
      return NextResponse.json(
        { error: `الكمية تتخطى المتاح (${product.stock})` },
        { status: 422 }
      );
    }

    // 4. upsert — إذا موجود مسبقاً بيحدث الكمية
    const { data, error } = await supabaseAdmin
      .from("store_products")
      .upsert(
        {
          retail_store_id: storeId,
          wholesale_product_id: body.wholesale_product_id,
          allocated_quantity: body.allocated_quantity,
        },
        { onConflict: "retail_store_id,wholesale_product_id" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, store_product: data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}