import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireStoreSession } from "@/lib/store";

export async function GET() {
  try {
    const user = await requireStoreSession();

    const { data, error } = await supabaseAdmin
      .from("product_recommendations")
      .select(
        `
        id,
        product_id,
        priority,
        created_at,
        products!inner(id, title, images, price)
      `,
      )
      .eq("store_id", user.id)
      .order("priority", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message },
      { status: isAuth ? 401 : 500 },
    );
  }
}

/**
 * POST - Add a product to featured list
 * Body: { product_id, priority? }
 */
export async function POST(req: Request) {
  try {
    const user = await requireStoreSession();
    const { product_id, priority } = await req.json();

    if (!product_id) {
      return NextResponse.json(
        { success: false, message: "Product ID required" },
        { status: 400 },
      );
    }

    // Verify product belongs to this store
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", product_id)
      .eq("store_id", user.id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, message: "Product not found or access denied" },
        { status: 404 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("product_recommendations")
      .insert({
        store_id: user.id,
        product_id,
        priority: priority || 0,
      })
      .select(
        `
        id,
        product_id,
        priority,
        products!inner(id, title, images, price)
      `,
      )
      .single();

    if (error) {
      // Handle UNIQUE constraint violation (product already featured)
      if (error.code === "23505") {
        return NextResponse.json(
          { success: false, message: "Product already featured" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: isAuth ? 401 : 500 },
    );
  }
}

/**
 * PATCH - Update priority of a featured product
 * Body: { recommendation_id, priority }
 */
export async function PATCH(req: Request) {
  try {
    const user = await requireStoreSession();
    const { recommendation_id, priority } = await req.json();

    if (!recommendation_id || priority === undefined) {
      return NextResponse.json(
        { success: false, message: "Recommendation ID and priority required" },
        { status: 400 },
      );
    }

    if (priority < 0 || priority > 100) {
      return NextResponse.json(
        { success: false, message: "Priority must be between 0 and 100" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("product_recommendations")
      .update({ priority })
      .eq("id", recommendation_id)
      .eq("store_id", user.id)
      .select(
        `
        id,
        product_id,
        priority,
        products!inner(id, title, images, price)
      `,
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            message: "Recommendation not found or access denied",
          },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: isAuth ? 401 : 500 },
    );
  }
}

/**
 * DELETE - Remove product from featured list
 * Query: ?recommendation_id=xxx
 */
export async function DELETE(req: Request) {
  try {
    const user = await requireStoreSession();
    const { searchParams } = new URL(req.url);
    const recommendation_id = searchParams.get("recommendation_id");

    if (!recommendation_id) {
      return NextResponse.json(
        { success: false, message: "Recommendation ID required" },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("product_recommendations")
      .delete()
      .eq("id", recommendation_id)
      .eq("store_id", user.id);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product removed from featured",
    });
  } catch (err: any) {
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: isAuth ? 401 : 500 },
    );
  }
}
