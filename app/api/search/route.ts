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

    if (!isValidSearchQuery(q)) {
      return NextResponse.json({ success: true, data: [] });
    }

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "store_id is required" },
        { status: 400 },
      );
    }

    let allProducts: any[] = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabaseAdmin
        .from("products")
        .select("id, title, price, discount_price, images, variantGroups")
        .eq("store_id", storeId)
        .eq("is_active", true)
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Database error:", error);
        return NextResponse.json(
          { success: false, message: "Search failed" },
          { status: 500 },
        );
      }

      if (!data || data.length === 0) break;
      allProducts = allProducts.concat(data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    if (allProducts.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const searchResults: SearchedProduct[] = [];

    for (const product of allProducts) {
      if (!product.title) continue;

      const variantGroups = parseVariantGroups(product.variantGroups);
      const match = searchProduct(product.title, variantGroups, q);

      if (match) {
        searchResults.push({
          id: product.id,
          title: product.title,
          price: product.price,
          discount_price: product.discount_price,
          images: product.images,
          variantGroups,
          matchScore: match.score,
        });
      }
    }

    if (searchResults.length === 0) {
      const alternatives = generateAlternativeSpellings(q);
      const uniqueAlternatives = Array.from(new Set(alternatives)).filter(
        (alt) => alt !== q && alt.length > 0,
      );

      for (const alt of uniqueAlternatives) {
        for (const product of allProducts) {
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
              matchScore: match.score * 0.9,
            });
          }
        }

        if (searchResults.length > 0) break;
      }
    }

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
