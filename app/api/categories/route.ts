// app/api/categories/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// ── Zod Schemas ─────────────────────────────────────────────────────────────
const CategorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  logo_url: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

const UpdateCategorySchema = CategorySchema.extend({
  id: z.string().uuid("Invalid category ID"),
  display_order: z.number().int().optional(),
});

// ── Read (GET) ──────────────────────────────────────────────────────────────
// PUBLIC route: Anyone can fetch a store's categories if they pass the store_id
export async function GET(req: NextRequest) {
  const store_id = req.nextUrl.searchParams.get("store_id");
  if (!store_id) {
    return NextResponse.json(
      { error: "Store ID is required" },
      { status: 400 },
    );
  }

  try {
    // 👉 UPDATED: Select display_order for sorting
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select(
        `
        id,
        title,
        logo_url,
        display_order,
        products(id)
      `,
      )
      .eq("store_id", store_id)
      .order("display_order", { ascending: true });

    if (error) throw error;

    // 👉 ADDED: Calculate product_count for each category
    const enrichedCategories = (categories || []).map((cat: any) => ({
      id: cat.id,
      title: cat.title,
      logo_url: cat.logo_url,
      display_order: cat.display_order || 0,
      product_count: cat.products?.length || 0,
    }));

    return NextResponse.json(enrichedCategories);
  } catch (error: any) {
    console.error("GET Categories Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// ── Create (POST) ───────────────────────────────────────────────────────────
// PROTECTED: Only the authenticated admin can create a category for their store
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = (session.user as any).id;

  try {
    const body = await req.json();
    const parsed = CategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { title, logo_url } = parsed.data;

    // 👉 ADDED: Get the next display_order (max + 1)
    const { data: existingCategories } = await supabaseAdmin
      .from("categories")
      .select("display_order")
      .eq("store_id", storeId)
      .order("display_order", { ascending: false })
      .limit(1);

    const nextDisplayOrder =
      (existingCategories && existingCategories.length > 0
        ? existingCategories[0].display_order
        : -1) + 1;

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        title,
        logo_url,
        store_id: storeId,
        display_order: nextDisplayOrder, // 👉 ADDED: Auto-increment order
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("POST Category Error:", error);
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}

// ── Update (PUT) ────────────────────────────────────────────────────────────
// PROTECTED: Only the authenticated admin can edit their own categories
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = (session.user as any).id;

  try {
    const body = await req.json();
    const parsed = UpdateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { id, title, logo_url, display_order } = parsed.data;

    // 👉 UPDATED: Include display_order in update if provided
    const updatePayload: any = { title, logo_url };
    if (display_order !== undefined) {
      updatePayload.display_order = display_order;
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .update(updatePayload)
      .eq("id", id)
      .eq("store_id", storeId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("PUT Category Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ── Reorder (PATCH) ─────────────────────────────────────────────────────────
// 👉 NEW: Dedicated endpoint for reordering categories
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = (session.user as any).id;

  try {
    const body = await req.json();
    const { orders } = body; // Array of { id, display_order }

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: "Invalid orders array" },
        { status: 400 },
      );
    }

    // 👉 BATCH UPDATE: Update all categories at once
    const updates = orders.map((order: any) => ({
      id: order.id,
      display_order: order.display_order,
    }));

    // Perform individual updates (Supabase doesn't have a true batch update)
    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from("categories")
        .update({ display_order: update.display_order })
        .eq("id", update.id)
        .eq("store_id", storeId);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Categories reordered",
    });
  } catch (error: any) {
    console.error("PATCH Categories Error:", error);
    return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
  }
}

// ── Delete (DELETE) ─────────────────────────────────────────────────────────
// PROTECTED: Only the authenticated admin can delete their own categories
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = (session.user as any).id;
  const categoryId = req.nextUrl.searchParams.get("id");

  if (!categoryId) {
    return NextResponse.json(
      { error: "Category ID is required" },
      { status: 400 },
    );
  }

  try {
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("store_id", storeId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
