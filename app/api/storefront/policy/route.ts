// File: app/api/storefront/policy/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get("host");

    if (!host) {
      return NextResponse.json({ error: "No host" }, { status: 400 });
    }

    // Extract subdomain: storename.mahally.app -> storename
    const subdomain = host.split(".")[0];
    console.log("Subdomain:", subdomain);

    // 1. Get store
    const { data: store, error: storeError } = await supabaseAdmin
      .from("stores")
      .select("id, store_name, language")
      .eq("slug", subdomain)
      .single();

    if (storeError || !store) {
      console.error("Store error:", storeError);
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    console.log("Store found:", store);

    // 2. Get settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("store_settings")
      .select("primary_color, privacy_policy, shipping_policy, return_policy")
      .eq("store_id", store.id)
      .single();

    if (settingsError) {
      console.error("Settings error:", settingsError);
      // Continue even if settings not found
    }

    console.log("Settings found:", settings);

    // 3. Return data
    return NextResponse.json({
      success: true,
      storeName: store.store_name || "متجرك",
      language: store.language || "ar",
      primaryColor: settings?.primary_color || "#131944",
      privacyPolicy: settings?.privacy_policy || null,
      shippingPolicy: settings?.shipping_policy || null,
      returnPolicy: settings?.return_policy || null,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
