// app/api/categories/[id]/route.ts
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

    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({ title, logo_url })
      .eq("id", categoryId)
      .eq("store_id", storeId) // Security check: Ensure it belongs to this store
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
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
      .eq("store_id", storeId); // Security check: Ensure it belongs to this store

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
