// app/api/testimonials/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireStoreSession } from "@/lib/store";

interface TestimonialPayload {
  name: string;
  role?: string;
  content: string;
  rating: number;
}

interface UpdateTestimonialPayload extends Partial<TestimonialPayload> {
  id: number;
  is_active?: boolean;
}

/**
 * GET - Retrieve testimonials (Admin & Public)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeSlug = searchParams.get("store_slug");
    const isPublic = searchParams.get("public") === "true";

    if (!storeSlug && !isPublic) {
      const user = await requireStoreSession();

      const { data, error } = await supabaseAdmin
        .from("testimonials")
        .select("id, name, role, content, rating, is_active, created_at")
        .eq("store_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true, data });
    }

    if (isPublic && storeSlug) {
      // PERFORMANCE FIX: Single database trip using PostgREST inner join
      const { data, error } = await supabaseAdmin
        .from("testimonials")
        .select(
          `
          id, 
          name, 
          role, 
          content, 
          rating,
          created_at,
          stores!inner(slug)
        `,
        )
        .eq("stores.slug", storeSlug)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 },
        );
      }

      // Map out the joined stores object to keep the response payload flat
      const formattedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        role: item.role,
        content: item.content,
        rating: item.rating,
        created_at: item.created_at,
      }));

      return NextResponse.json({ success: true, data: formattedData });
    }

    return NextResponse.json(
      { success: false, message: "Invalid request parameters" },
      { status: 400 },
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

/**
 * POST - Create testimonial
 */
export async function POST(req: Request) {
  try {
    const user = await requireStoreSession();
    const body: TestimonialPayload = await req.json();

    const { name, role, content, rating } = body;

    if (!name || !content || !rating) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields (name, content, rating)",
        },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be an integer between 1 and 5",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .insert({
        store_id: user.id,
        name: name.trim(),
        role: role?.trim() || null,
        content: content.trim(),
        rating: Math.floor(rating),
        is_active: true,
      })
      .select("id, name, role, content, rating, is_active, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

/**
 * PATCH - Update testimonial
 */
export async function PATCH(req: Request) {
  try {
    const user = await requireStoreSession();
    const body: UpdateTestimonialPayload = await req.json();

    const { id, name, role, content, rating, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Testimonial ID required" },
        { status: 400 },
      );
    }

    const updates: Partial<TestimonialPayload> & { is_active?: boolean } = {};

    if (name !== undefined) updates.name = name.trim();
    if (role !== undefined) updates.role = role?.trim() || undefined;
    if (content !== undefined) updates.content = content.trim();

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { success: false, message: "Rating must be between 1 and 5" },
          { status: 400 },
        );
      }
      updates.rating = Math.floor(rating);
    }

    if (is_active !== undefined) updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No updates provided" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .update(updates)
      .eq("id", id)
      .eq("store_id", user.id)
      .select("id, name, role, content, rating, is_active, created_at")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, message: "Testimonial not found or access denied" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

/**
 * DELETE - Remove testimonial
 */
export async function DELETE(req: Request) {
  try {
    const user = await requireStoreSession();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Testimonial ID required" },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("testimonials")
      .delete()
      .eq("id", id)
      .eq("store_id", user.id);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
