import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireStoreSession } from "@/lib/store";
import { headers } from "next/headers";

export async function GET() {
  try {
    // 1. Get the authenticated store admin session securely
    const user = await requireStoreSession();

    // 2. Fetch products only for this specific store
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("store_id", user.id)
      .order("created_at", { ascending: false });

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

    const { title, description, price, stock, images } = body;

    // Validation
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 },
      );
    }

    if (price === undefined || price === null || isNaN(Number(price))) {
      return NextResponse.json(
        { success: false, message: "Valid price is required" },
        { status: 400 },
      );
    }

    const parsedPrice = parseFloat(price);
    const parsedStock =
      stock !== undefined && stock !== null ? parseInt(stock) : 0;

    if (parsedPrice < 0) {
      return NextResponse.json(
        { success: false, message: "Price cannot be negative" },
        { status: 400 },
      );
    }

    if (parsedStock < 0) {
      return NextResponse.json(
        { success: false, message: "Stock cannot be negative" },
        { status: 400 },
      );
    }

    // Ensure images is an array
    const imageArray = Array.isArray(images) ? images : [];

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        store_id: user.id,
        title: title.trim(),
        description: description?.trim() || "",
        price: parsedPrice,
        stock: parsedStock,
        images: imageArray,
      })
      .select()
      .single();

    if (error) {
      console.error("INSERT product error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error("POST product catch error:", err);
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

    const { id, title, description, price, stock, images } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID required" },
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
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || "";
    }

    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json(
          { success: false, message: "Invalid price" },
          { status: 400 },
        );
      }
      updates.price = parsedPrice;
    }

    if (stock !== undefined) {
      const parsedStock = parseInt(stock);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return NextResponse.json(
          { success: false, message: "Invalid stock" },
          { status: 400 },
        );
      }
      updates.stock = parsedStock;
    }

    if (images !== undefined) {
      updates.images = Array.isArray(images) ? images : [];
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No updates provided" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updates)
      .eq("id", id)
      .eq("store_id", user.id) // Security: ensure product belongs to this store
      .select()
      .single();

    if (error) {
      console.error("UPDATE product error:", error);

      // Handle case where product doesn't exist or doesn't belong to store
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { success: false, message: "Product not found or access denied" },
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
    console.error("PATCH product catch error:", err);
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
        { success: false, message: "Product ID required" },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id)
      .eq("store_id", user.id); // Security: ensure product belongs to this store

    if (error) {
      console.error("DELETE product error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err: any) {
    console.error("DELETE product catch error:", err);
    const isAuth = err.message === "Unauthorized";
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: isAuth ? 401 : 500 },
    );
  }
}
