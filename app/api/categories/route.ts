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
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("store_id", store_id)
      .order("created_at", { ascending: true }); // Good practice to order them

    if (error) throw error;

    return NextResponse.json(data || []);
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

  // Enforce tenant isolation: The store ID strictly equals the logged-in user ID
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

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        title,
        logo_url,
        store_id: storeId, // Forced by the server session, impossible to spoof
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

    const { id, title, logo_url } = parsed.data;

    // The dual .eq() check ensures the category exists AND belongs to the admin making the request
    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({ title, logo_url })
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
    // Again, we mandate that the store_id matches the session ID to prevent unauthorized deletes
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
