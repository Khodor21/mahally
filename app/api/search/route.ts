import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Parse variantGroups JSON string safely
 */
function parseVariantGroups(data: any): any[] {
  if (!data) return [];

  let parsed = data;

  // Handle string JSON
  if (typeof data === "string") {
    try {
      parsed = JSON.parse(data);
    } catch {
      return [];
    }
  }

  // Ensure it's an array
  return Array.isArray(parsed) ? parsed : [];
}

/**
 * Check if query matches title, variant group title, or any variant text field
 * Supports Arabic fuzzy matching with normalization
 */
function matchesQueryFuzzy(
  title: string,
  variantGroups: any[],
  query: string,
): boolean {
  const normalizeText = (text: string) => {
    if (!text) return "";
    let norm = text;
    norm = norm.replace(/أ|إ|آ/g, "ا");
    norm = norm.replace(/ة/g, "ه");
    norm = norm.replace(/ى/g, "ي");
    norm = norm.replace(/[\u064B-\u065F]/g, "");
    norm = norm.trim().replace(/\s+/g, " ");
    return norm.toLowerCase();
  };

  const normalizedQuery = normalizeText(query);

  // 1. Check Product title
  if (normalizeText(title).includes(normalizedQuery)) {
    return true;
  }

  // 2. Check variant groups
  for (const group of variantGroups) {
    if (group.type === "text") {
      // ✅ الإضافة الجديدة: البحث داخل اسم المجموعة (Group Title)
      if (group.title && normalizeText(group.title).includes(normalizedQuery)) {
        return true;
      }

      // البحث داخل الخيارات (Group Options Values)
      if (group.options) {
        for (const option of group.options) {
          if (
            option.value &&
            normalizeText(option.value).includes(normalizedQuery)
          ) {
            return true;
          }
        }
      }
    }
  }

  return false;
}
/**
 * Extract variant text options for display
 */
function getVariantTexts(variantGroups: any[]): string[] {
  const texts: string[] = [];

  for (const group of variantGroups) {
    if (group.type === "text" && group.options) {
      for (const option of group.options) {
        if (option.value) {
          texts.push(option.value);
        }
      }
    }
  }

  return texts;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const storeId = searchParams.get("store_id");

    if (!q) {
      return NextResponse.json({ success: true, data: [] });
    }

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "store_id is required" },
        { status: 400 },
      );
    }

    // Fetch from database (includes variantGroups now)
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, title, price, discount_price, images, variantGroups")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .limit(100); // Fetch more, filter in code for fuzzy matching

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Client-side fuzzy filtering with variant support
    const filtered = data
      .map((product) => {
        const variantGroups = parseVariantGroups(product.variantGroups);
        return {
          ...product,
          variantGroups, // Include parsed variants for frontend
        };
      })
      .filter((product) =>
        matchesQueryFuzzy(product.title, product.variantGroups, q),
      )
      .slice(0, 10); // Return top 10

    return NextResponse.json({ success: true, data: filtered });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
