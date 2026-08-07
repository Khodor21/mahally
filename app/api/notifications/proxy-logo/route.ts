// app/api/notifications/proxy-logo/route.ts
// Serves dynamic store logos with proper CORS headers for Firebase Cloud Messaging

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("store_id");

    console.log(`🖼️ Logo proxy requested for store: ${storeId}`);

    if (!storeId) {
      console.warn("⚠️ Missing store_id parameter");
      return NextResponse.json({ error: "store_id required" }, { status: 400 });
    }

    // Fetch store logo from Supabase
    console.log(`📊 Fetching logo_url from store_settings for ${storeId}`);
    const { data: settings, error } = await supabaseAdmin
      .from("store_settings")
      .select("logo_url")
      .eq("store_id", storeId)
      .single();

    if (error) {
      console.warn(`⚠️ Error fetching store settings: ${error.message}`);
      return NextResponse.redirect("https://mahalli.com/icon-192x192.png");
    }

    if (!settings?.logo_url) {
      console.warn(`⚠️ No logo_url found for store ${storeId}`);
      return NextResponse.redirect("https://mahalli.com/icon-192x192.png");
    }

    console.log(`✅ Found logo URL: ${settings.logo_url.substring(0, 100)}...`);

    // Fetch the image from Supabase Storage
    console.log("🔄 Fetching image from Supabase Storage...");
    const logoResponse = await fetch(settings.logo_url);

    if (!logoResponse.ok) {
      console.warn(
        `⚠️ Failed to fetch logo from Supabase: ${logoResponse.status}`,
      );
      return NextResponse.redirect("https://mahalli.com/icon-192x192.png");
    }

    const imageBuffer = await logoResponse.arrayBuffer();
    const contentType = logoResponse.headers.get("content-type") || "image/png";

    console.log(
      `✅ Logo fetched successfully (${imageBuffer.byteLength} bytes)`,
    );

    // Return with proper CORS and Cache headers for Firebase
    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*", // Allow Firebase to fetch
        "Access-Control-Allow-Methods": "GET",
      },
    });
  } catch (error) {
    console.error("❌ Logo proxy error:", error);
    // Fallback to default on any error
    return NextResponse.redirect("https://mahalli.com/icon-192x192.png");
  }
}
