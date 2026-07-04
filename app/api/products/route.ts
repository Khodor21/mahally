import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireStoreSession } from "@/lib/store";

// ============================================
// FLEXIBLE VARIANT VALIDATION
// ============================================

function isValidVariantOption(option: any): boolean {
  return (
    typeof option === "object" &&
    typeof option.id === "string" &&
    typeof option.value === "string" &&
    (option.price === undefined || typeof option.price === "number") &&
    (option.stock === undefined || typeof option.stock === "number")
  );
}

function isValidVariantGroup(group: any): boolean {
  return (
    typeof group === "object" &&
    typeof group.id === "string" &&
    typeof group.title === "string" &&
    ["select", "text"].includes(group.type) &&
    typeof group.allowPrice === "boolean" &&
    typeof group.allowStock === "boolean" &&
    Array.isArray(group.options) &&
    group.options.every((opt: any) => isValidVariantOption(opt))
  );
}

function isValidVariantGroups(variantGroups: any): boolean {
  if (!Array.isArray(variantGroups)) return false;
  return variantGroups.every((group) => isValidVariantGroup(group));
}

// ============================================
// ROUTES
// ============================================

export async function GET() {
  try {
    const user = await requireStoreSession();

    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, store_id, title, description, price, discount_price, stock, images, is_active, pin, created_at, updated_at, category_id, variants, variantGroups, sales_count",
      )
      .eq("store_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }
    const data_with_renamed_variants = data.map((product: any) => ({
      ...product,
      variantGroups: product.variants, // Map old column to new field name
      variants: undefined, // Remove old field
    }));

    return NextResponse.json({
      success: true,
      data: data_with_renamed_variants,
    });
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

    const {
      title,
      description,
      price,
      discount_price,
      stock,
      images,
      category_id,
      variantGroups,
      pin,
    } = body;

    // ============================================
    // VALIDATION
    // ============================================

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
    if (parsedPrice < 0) {
      return NextResponse.json(
        { success: false, message: "Price cannot be negative" },
        { status: 400 },
      );
    }

    const parsedStock =
      stock !== undefined && stock !== null ? parseInt(stock) : 0;

    if (parsedStock < 0) {
      return NextResponse.json(
        { success: false, message: "Stock cannot be negative" },
        { status: 400 },
      );
    }

    let parsedDiscountPrice = null;
    if (
      discount_price !== undefined &&
      discount_price !== null &&
      discount_price !== ""
    ) {
      parsedDiscountPrice = parseFloat(discount_price);
      if (isNaN(parsedDiscountPrice) || parsedDiscountPrice < 0) {
        return NextResponse.json(
          { success: false, message: "Invalid discount price" },
          { status: 400 },
        );
      }
    }

    const isPinned = pin !== undefined ? Boolean(pin) : false;

    const imageArray = Array.isArray(images) ? images : [];

    // NEW: Validate variantGroups if provided
    let variantGroupsArray: any[] = [];
    if (variantGroups !== undefined) {
      if (!isValidVariantGroups(variantGroups)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid variant groups structure. Each group must have id, title, type (select|text), allowPrice, allowStock, and options array.",
          },
          { status: 400 },
        );
      }
      variantGroupsArray = variantGroups;
    }

    // ============================================
    // INSERT
    // ============================================

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        store_id: user.id,
        title: title.trim(),
        description: description?.trim() || "",
        price: parsedPrice,
        discount_price: parsedDiscountPrice,
        stock: parsedStock,
        images: imageArray,
        category_id: category_id || null,
        variantGroups: variantGroupsArray,
        pin: isPinned,
        sales_count: 0, // Initialize sales_count
      })
      .select(
        "id, title, description, price, discount_price, stock, images, category_id, variantGroups, pin, sales_count",
      )
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

    const {
      id,
      title,
      description,
      price,
      discount_price,
      stock,
      images,
      category_id,
      variantGroups,
      pin,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID required" },
        { status: 400 },
      );
    }

    // ============================================
    // BUILD UPDATES
    // ============================================

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

    if (discount_price !== undefined) {
      if (discount_price === "" || discount_price === null) {
        updates.discount_price = null;
      } else {
        const parsedDiscountPrice = parseFloat(discount_price);
        if (isNaN(parsedDiscountPrice) || parsedDiscountPrice < 0) {
          return NextResponse.json(
            { success: false, message: "Invalid discount price" },
            { status: 400 },
          );
        }
        updates.discount_price = parsedDiscountPrice;
      }
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

    if (pin !== undefined) {
      updates.pin = Boolean(pin);
    }

    // NEW: Validate variantGroups if provided
    if (variantGroups !== undefined) {
      if (!isValidVariantGroups(variantGroups)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid variant groups structure. Each group must have id, title, type (select|text), allowPrice, allowStock, and options array.",
          },
          { status: 400 },
        );
      }
      updates.variantGroups = variantGroups;
    }

    if (category_id !== undefined) {
      updates.category_id = category_id === "" ? null : category_id;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No updates provided" },
        { status: 400 },
      );
    }

    // ============================================
    // UPDATE
    // ============================================

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updates)
      .eq("id", id)
      .eq("store_id", user.id)
      .select(
        "id, title, description, price, discount_price, stock, images, category_id, variantGroups, pin, sales_count",
      )
      .single();

    if (error) {
      console.error("UPDATE product error:", error);

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
      .eq("store_id", user.id);

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
