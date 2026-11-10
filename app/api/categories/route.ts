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
  parent_id: z.string().uuid("Invalid parent ID").optional().nullable(),
});

const UpdateCategorySchema = CategorySchema.extend({
  id: z.string().uuid("Invalid category ID"),
  display_order: z.number().int().optional(),
});

// ── Read (GET) ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const store_id = req.nextUrl.searchParams.get("store_id");
  if (!store_id) {
    return NextResponse.json(
      { error: "Store ID is required" },
      { status: 400 },
    );
  }

  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select(
        `
        id,
        title,
        logo_url,
        display_order,
        parent_id,
        products(id)
      `,
      )
      .eq("store_id", store_id)
      .order("display_order", { ascending: true });

    if (error) throw error;

    const rawList = categories || [];
    const childProductCounts: Record<string, number> = {};
    for (const cat of rawList) {
      if (cat.parent_id) {
        childProductCounts[cat.parent_id] =
          (childProductCounts[cat.parent_id] || 0) +
          (cat.products?.length || 0);
      }
    }

    const enrichedCategories = rawList.map((cat: any) => {
      const isParent = !cat.parent_id;
      const hasChildren =
        isParent && rawList.some((c: any) => c.parent_id === cat.id);

      return {
        id: cat.id,
        title: cat.title,
        logo_url: cat.logo_url,
        display_order: cat.display_order || 0,
        parent_id: cat.parent_id ?? null,
        has_children: hasChildren,
        product_count: isParent
          ? childProductCounts[cat.id] || 0
          : cat.products?.length || 0,
      };
    });

    return NextResponse.json(enrichedCategories);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// ── Create (POST) ───────────────────────────────────────────────────────────
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

    const { title, logo_url, parent_id } = parsed.data;

    // If parent_id provided, verify it belongs to same store
    if (parent_id) {
      const { data: parentCheck, error: parentError } = await supabaseAdmin
        .from("categories")
        .select("id, parent_id")
        .eq("id", parent_id)
        .eq("store_id", storeId)
        .single();

      if (parentError || !parentCheck) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 404 },
        );
      }

      // Prevent nesting beyond one level
      if (parentCheck.parent_id) {
        return NextResponse.json(
          { error: "Cannot create a subcategory of a subcategory" },
          { status: 400 },
        );
      }
    }

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
        display_order: nextDisplayOrder,
        parent_id: parent_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}

// ── Update (PUT) ────────────────────────────────────────────────────────────
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

    const { id, title, logo_url, display_order, parent_id } = parsed.data;

    // If changing to a child, validate parent
    if (parent_id) {
      const { data: parentCheck, error: parentError } = await supabaseAdmin
        .from("categories")
        .select("id, parent_id")
        .eq("id", parent_id)
        .eq("store_id", storeId)
        .single();

      if (parentError || !parentCheck) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 404 },
        );
      }

      if (parentCheck.parent_id) {
        return NextResponse.json(
          { error: "Cannot nest subcategories more than one level" },
          { status: 400 },
        );
      }

      // Prevent setting a parent to be its own child
      if (parent_id === id) {
        return NextResponse.json(
          { error: "Category cannot be its own parent" },
          { status: 400 },
        );
      }
    }

    const updatePayload: any = {
      title,
      logo_url,
      parent_id: parent_id || null,
    };
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
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ── Reorder (PATCH) ─────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = (session.user as any).id;

  try {
    const body = await req.json();
    const { orders } = body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: "Invalid orders array" },
        { status: 400 },
      );
    }

    for (const order of orders) {
      const { error } = await supabaseAdmin
        .from("categories")
        .update({ display_order: order.display_order })
        .eq("id", order.id)
        .eq("store_id", storeId);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Categories reordered",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
  }
}

// ── Delete (DELETE) ─────────────────────────────────────────────────────────
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
    // 1. Verify ownership
    const { data: categoryCheck, error: checkError } = await supabaseAdmin
      .from("categories")
      .select("id, parent_id")
      .eq("id", categoryId)
      .eq("store_id", storeId)
      .single();

    if (checkError || !categoryCheck) {
      return NextResponse.json(
        { error: "Category not found or unauthorized" },
        { status: 404 },
      );
    }

    const isParent = !categoryCheck.parent_id;

    if (isParent) {
      // 2a. Get all children IDs
      const { data: children } = await supabaseAdmin
        .from("categories")
        .select("id")
        .eq("parent_id", categoryId)
        .eq("store_id", storeId);

      if (children && children.length > 0) {
        const childIds = children.map((c) => c.id);

        // 2b. Delete all products belonging to children
        await supabaseAdmin
          .from("products")
          .delete()
          .in("category_id", childIds);

        // 2c. Delete children categories
        await supabaseAdmin.from("categories").delete().in("id", childIds);
      }
    } else {
      // 2. Child: delete its products first
      await supabaseAdmin
        .from("products")
        .delete()
        .eq("category_id", categoryId);
    }

    // 3. Delete the category itself
    const { error: categoryError } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("store_id", storeId);

    if (categoryError) throw categoryError;

    return NextResponse.json({
      success: true,
      message: isParent
        ? "Parent category, its subcategories, and all associated products deleted"
        : "Category and associated products deleted",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
