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
});

// ── Update (PUT) ────────────────────────────────────────────────────────────
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

    const { title, logo_url } = parsed.data;

    // 1. PREVENT REPEATS: Check if another category already uses this title
    if (title) {
      const { data: existingCategory, error: checkError } = await supabaseAdmin
        .from("categories")
        .select("id")
        .eq("store_id", storeId)
        .eq("title", title)
        .neq("id", categoryId) // Exclude the current category being updated
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingCategory) {
        return NextResponse.json(
          { error: "A category with this exact title already exists." },
          { status: 409 }, // 409 Conflict
        );
      }
    }

    // 2. UPDATE: Apply changes securely
    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({ title, logo_url })
      .eq("id", categoryId)
      .eq("store_id", storeId) // SECURITY: Ensure they own this category
      .select()
      .single();

    if (error) {
      // Handle Supabase unique constraint violations gracefully
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
    console.error("PUT /categories/[id] Error:", error);
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
    console.error("DELETE /categories/[id] Error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to delete category. Ensure it contains no products before deleting.",
      },
      { status: 500 },
    );
  }
}
