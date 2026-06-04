import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireStoreSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    // New param: check if the request is from the admin panel
    const isAdmin = searchParams.get("admin") === "true";

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "Store ID is required" },
        { status: 400 },
      );
    }

    let query = supabaseAdmin
      .from("hero_banners")
      .select("*")
      .eq("store_id", storeId)
      .order("order", { ascending: true });

    // If it's the public storefront, ONLY fetch active banners
    if (!isAdmin) {
      query = query.eq("active", true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Hero banners error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST endpoint for creating hero banners
export async function POST(req: Request) {
  try {
    // 1. Secure session check
    const user = await requireStoreSession();

    // 2. Safely parse JSON
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const { image, active, order } = body;

    // 3. Validation
    if (!image || image.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Image URL is required" },
        { status: 400 },
      );
    }

    const parsedOrder =
      order !== undefined && order !== null ? parseInt(order) : 1;

    // 4. Insert into database using the authenticated user's ID
    const { data, error } = await supabaseAdmin
      .from("hero_banners")
      .insert({
        store_id: user.id, // Securely assigning the store_id from the session
        image: image.trim(),
        active: active !== undefined ? active : true,
        order: parsedOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("INSERT banner error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error("POST banner catch error:", err);
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: isAuth ? 401 : 500 },
    );
  }
}

// PUT endpoint for updating banners (e.g. toggling active status)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data, error } = await supabaseAdmin
      .from("hero_banners")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Update hero error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update hero banner" },
      { status: 500 },
    );
  }
}

// DELETE endpoint to remove a banner
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Banner ID is required" },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("hero_banners")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete hero error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete hero banner" },
      { status: 500 },
    );
  }
}
