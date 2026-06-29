import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * PUBLIC endpoint for storefront clients to fetch store config by subdomain
 * GET /api/storefront/config
 *
 * No authentication required - this is read-only public data
 */
export async function GET(request: NextRequest) {
  try {
    // Extract subdomain from the request host
    const host = request.headers.get("host");
    console.log("📍 Storefront config request from host:", host);

    if (!host) {
      console.error("❌ No host header");
      return NextResponse.json({ error: "No host header" }, { status: 400 });
    }

    const subdomain = host.split(".")[0];
    console.log("🔍 Extracted subdomain:", subdomain);

    // 1. Fetch store by slug
    const { data: store, error: storeError } = await supabaseAdmin
      .from("stores")
      .select(
        "id, store_name, language, admin_email, delivery_cost, payment_methods, currency_symbol",
      )
      .eq("slug", subdomain)
      .maybeSingle();

    if (storeError) {
      console.error("❌ Store fetch error:", storeError);
      return NextResponse.json({ error: storeError.message }, { status: 500 });
    }

    if (!store) {
      console.warn("⚠️ Store not found for subdomain:", subdomain);
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    console.log("✅ Store found:", store.id, store.store_name);

    // 2. Fetch store settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("store_settings")
      .select("primary_color, logo_url, description, promo_text")
      .eq("store_id", store.id)
      .maybeSingle();

    if (settingsError) {
      console.error("❌ Settings fetch error:", settingsError);
      return NextResponse.json(
        { error: settingsError.message },
        { status: 500 },
      );
    }

    console.log("✅ Settings found for store", store.id);

    // 3. Merge and return
    const mergedStore = {
      id: store.id,
      store_name: store.store_name,
      language: store.language || "ar",
      admin_email: store.admin_email,
      delivery_cost: store.delivery_cost ?? 0,
      payment_methods: store.payment_methods
        ? JSON.parse(store.payment_methods)
        : ["cash_on_delivery"],
      currency_symbol: store.currency_symbol || "$",
      primary_color: settings?.primary_color || "#1F2937",
      logo_url: settings?.logo_url || null,
      description: settings?.description || "",
      promo_text: settings?.promo_text || "",
    };

    console.log("✅ Returning merged store config");
    return NextResponse.json({ store: mergedStore });
  } catch (error) {
    console.error("❌ GET /api/storefront/config error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
