import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const UpdateCategorySchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  logo_url: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
  parent_id: z.string().uuid("Invalid parent ID").optional().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = (session.user as any).id;
  const categoryId = params.id;

  try {
    const body = await req.json();
    const parsed = UpdateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { title, logo_url, parent_id } = parsed.data;

    // Validate parent_id if provided
    if (parent_id) {
      // Prevent self-reference
      if (parent_id === categoryId) {
        return NextResponse.json(
          { error: "Category cannot be its own parent" },
          { status: 400 },
        );
      }

      // Verify parent exists and belongs to same store
      const { data: parentCheck } = await supabaseAdmin
        .from("categories")
        .select("id, parent_id")
        .eq("id", parent_id)
        .eq("store_id", storeId)
        .single();

      if (!parentCheck) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 404 },
        );
      }

      // Prevent nesting beyond one level
      if (parentCheck.parent_id) {
        return NextResponse.json(
          { error: "Cannot nest subcategories more than one level" },
          { status: 400 },
        );
      }
    }

    // Check duplicate title (excluding self)
    if (title) {
      const { data: existingCategory } = await supabaseAdmin
        .from("categories")
        .select("id")
        .eq("store_id", storeId)
        .eq("title", title)
        .neq("id", categoryId)
        .maybeSingle();

      if (existingCategory) {
        return NextResponse.json(
          { error: "A category with this exact title already exists." },
          { status: 409 },
        );
      }
    }

    const updatePayload: any = {};
    if (title !== undefined) updatePayload.title = title;
    if (logo_url !== undefined) updatePayload.logo_url = logo_url;
    updatePayload.parent_id = parent_id ?? null;

    const { data, error } = await supabaseAdmin
      .from("categories")
      .update(updatePayload)
      .eq("id", categoryId)
      .eq("store_id", storeId)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Title already exists." },
          { status: 409 },
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update category. Please try again." },
      { status: 500 },
    );
  }
}
// ── Delete (DELETE) ─────────────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = (session.user as any).id;
  const categoryId = params.id;

  try {
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("store_id", storeId); // SECURITY: Ensure they own this category

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          "Failed to delete category. Ensure it contains no products before deleting.",
      },
      { status: 500 },
    );
  }
}
