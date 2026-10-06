import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  normalizeArabicText,
  searchProduct,
  parseVariantGroups,
  isValidSearchQuery,
  generateAlternativeSpellings,
} from "@/lib/arabicSearchEngine";

interface SearchedProduct {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
  images: string[] | null;
  variantGroups: any[];
  matchScore: number;
}
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const storeId = searchParams.get("store_id");

    // Validation
    if (!isValidSearchQuery(q)) {
      return NextResponse.json({ success: true, data: [] });
    }

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "store_id is required" },
        { status: 400 },
      );
    }

    // Fetch all active products with required fields
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id, title, price, discount_price, images, variantGroups")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .limit(500); // Increased for better filtering

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, message: "Search failed" },
        { status: 500 },
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Process and score results
    const searchResults: SearchedProduct[] = [];

    for (const product of products) {
      if (!product.title) continue;

      // Parse variant groups safely
      const variantGroups = parseVariantGroups(product.variantGroups);

      // Search across title and variant groups
      const match = searchProduct(product.title, variantGroups, q);

      if (match) {
        searchResults.push({
          id: product.id,
          title: product.title,
          price: product.price,
          discount_price: product.discount_price,
          images: product.images,
          variantGroups, // Include parsed variants for frontend
          matchScore: match.score,
        });
      }
    }

    // If no results with original query, try alternatives (fallback)
    if (searchResults.length === 0) {
      const alternatives = generateAlternativeSpellings(q);
      const uniqueAlternativesSet = new Set(alternatives);
      const uniqueAlternatives = Array.from(uniqueAlternativesSet).filter(
        (alt) => alt !== q && alt.length > 0,
      );

      for (const alt of uniqueAlternatives) {
        for (const product of products) {
          if (!product.title) continue;

          const variantGroups = parseVariantGroups(product.variantGroups);
          const match = searchProduct(product.title, variantGroups, alt);

          if (match) {
            searchResults.push({
              id: product.id,
              title: product.title,
              price: product.price,
              discount_price: product.discount_price,
              images: product.images,
              variantGroups,
              matchScore: match.score * 0.9, // Slightly lower score for fallback matches
            });
          }
        }

        // Stop after finding results with first alternative
        if (searchResults.length > 0) break;
      }
    }

    // Remove duplicates (same product might match multiple variants)
    const uniqueResults = new Map<string, SearchedProduct>();
    for (const result of searchResults) {
      const existing = uniqueResults.get(result.id);
      if (!existing || result.matchScore > existing.matchScore) {
        uniqueResults.set(result.id, result);
      }
    }

    const finalResults = Array.from(uniqueResults.values())
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 15)
      .map(({ matchScore, ...product }) => product);

    return NextResponse.json({
      success: true,
      data: finalResults,
      count: finalResults.length,
    });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 },
    );
  }
}
