import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireStoreSession } from "@/lib/store";

// Validation helper - mirrors your products validation pattern
function isValidFeature(feature: any): boolean {
  return (
    typeof feature === "object" &&
    typeof feature.title === "string" &&
    feature.title.trim().length > 0 &&
    feature.title.trim().length <= 255 &&
    typeof feature.description === "string" &&
    feature.description.trim().length > 0 &&
    feature.description.trim().length <= 2000 &&
    typeof feature.icon_name === "string" &&
    feature.icon_name.trim().length > 0 &&
    feature.icon_name.trim().length <= 100
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeSlug = searchParams.get("store_slug");
    const isPublic = searchParams.get("public") === "true";

    let storeId: string;

    if (isPublic && storeSlug) {
      // Fetch store_id using the slug publicly
      const { data: store, error: storeError } = await supabaseAdmin
        .from("stores")
        .select("id")
        .eq("slug", storeSlug)
        .single();

      if (storeError || !store) throw new Error("Store not found");
      storeId = store.id;
    } else {
      // Original protected behavior
      const user = await requireStoreSession();
      storeId = user.id;
    }

    // Fetch features
    const { data, error } = await supabaseAdmin
      .from("features")
      .select("id, title, description, icon_name, display_order, is_active")
      .eq("store_id", storeId)
      .eq("is_active", true) // Only show active features to public
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireStoreSession();

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

    // Destructure with validation
    const { title, description, icon_name, display_order, is_active } = body;

    // Validation - Title
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 },
      );
    }

    if (title.length > 255) {
      return NextResponse.json(
        { success: false, message: "Title cannot exceed 255 characters" },
        { status: 400 },
      );
    }

    // Validation - Description
    if (!description || description.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Description is required" },
        { status: 400 },
      );
    }

    if (description.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "Description cannot exceed 2000 characters",
        },
        { status: 400 },
      );
    }

    // Validation - Icon Name
    if (!icon_name || icon_name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Icon name is required" },
        { status: 400 },
      );
    }

    if (icon_name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Icon name cannot exceed 100 characters" },
        { status: 400 },
      );
    }

    // Validation - Display Order
    let parsedDisplayOrder = 0;
    if (display_order !== undefined && display_order !== null) {
      parsedDisplayOrder = parseInt(display_order);
      if (isNaN(parsedDisplayOrder) || parsedDisplayOrder < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Display order must be a non-negative number",
          },
          { status: 400 },
        );
      }
    }

    // Insert feature
    const { data, error } = await supabaseAdmin
      .from("features")
      .insert({
        store_id: user.id,
        title: title.trim(),
        description: description.trim(),
        icon_name: icon_name.trim(),
        display_order: parsedDisplayOrder,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select(
        "id, store_id, title, description, icon_name, display_order, is_active, created_at, updated_at",
      )
      .single();

    if (error) {
      console.error("INSERT feature error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error("POST feature catch error:", err);
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: isAuth ? 401 : 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireStoreSession();

    // Parse body with error handling
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

    // Destructure
    const { id, title, description, icon_name, display_order, is_active } =
      body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Feature ID required" },
        { status: 400 },
      );
    }

    // Build updates object with validation
    const updates: any = {};

    if (title !== undefined) {
      if (title.trim() === "") {
        return NextResponse.json(
          { success: false, message: "Title cannot be empty" },
          { status: 400 },
        );
      }
      if (title.length > 255) {
        return NextResponse.json(
          { success: false, message: "Title cannot exceed 255 characters" },
          { status: 400 },
        );
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (description.trim() === "") {
        return NextResponse.json(
          { success: false, message: "Description cannot be empty" },
          { status: 400 },
        );
      }
      if (description.length > 2000) {
        return NextResponse.json(
          {
            success: false,
            message: "Description cannot exceed 2000 characters",
          },
          { status: 400 },
        );
      }
      updates.description = description.trim();
    }

    if (icon_name !== undefined) {
      if (icon_name.trim() === "") {
        return NextResponse.json(
          { success: false, message: "Icon name cannot be empty" },
          { status: 400 },
        );
      }
      if (icon_name.length > 100) {
        return NextResponse.json(
          { success: false, message: "Icon name cannot exceed 100 characters" },
          { status: 400 },
        );
      }
      updates.icon_name = icon_name.trim();
    }

    if (display_order !== undefined) {
      const parsedDisplayOrder = parseInt(display_order);
      if (isNaN(parsedDisplayOrder) || parsedDisplayOrder < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Display order must be a non-negative number",
          },
          { status: 400 },
        );
      }
      updates.display_order = parsedDisplayOrder;
    }

    if (is_active !== undefined) {
      updates.is_active =
        typeof is_active === "boolean" ? is_active : is_active === "true";
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No updates provided" },
        { status: 400 },
      );
    }

    // Update feature
    const { data, error } = await supabaseAdmin
      .from("features")
      .update(updates)
      .eq("id", id)
      .eq("store_id", user.id) // Security: ensure feature belongs to this store
      .select(
        "id, store_id, title, description, icon_name, display_order, is_active, created_at, updated_at",
      )
      .single();

    if (error) {
      console.error("UPDATE feature error:", error);

      // Handle case where feature doesn't exist or doesn't belong to store
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, message: "Feature not found or access denied" },
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
    console.error("PATCH feature catch error:", err);
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: isAuth ? 401 : 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireStoreSession();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Feature ID required" },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("features")
      .delete()
      .eq("id", id)
      .eq("store_id", user.id); // Security: ensure feature belongs to this store

    if (error) {
      console.error("DELETE feature error:", error);

      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, message: "Feature not found or access denied" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE feature catch error:", err);
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: isAuth ? 401 : 500 },
    );
  }
}
