// app/api/notifications/send/route.ts - WITH DETAILED ERROR LOGGING

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import admin from "@/lib/firebaseAdmin";
import { requireStoreSession } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { title, body } = await req.json();

    // Validate input
    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title and body are required" },
        { status: 400 },
      );
    }

    // Get store from authenticated session
    let store: any;
    try {
      store = await requireStoreSession();
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const storeId = store.id;

    // Fetch the store's logo from store_settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("store_settings")
      .select("logo_url")
      .eq("store_id", storeId)
      .maybeSingle();

    if (settingsError) {
    }

    // Determine the icon to use (must be a valid absolute HTTPS URL)
    const storeIcon =
      settings?.logo_url || "https://mahalli.com/icon-192x192.png"; // Replace with your actual default absolute URL if needed

    // Query for this store's subscriptions
    const { data: subscriptions, error: fetchError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("fcm_token")
      .eq("store_id", storeId)
      .eq("active", true);


    if (fetchError) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch subscriptions" },
        { status: 500 },
      );
    }

    if (!subscriptions || subscriptions.length === 0) {

      await supabaseAdmin.from("notifications").insert({
        store_id: storeId,
        title: title.trim(),
        body: body.trim(),
        sent_count: 0,
      });

      console.log("========== ✅ DONE ==========\n");

      return NextResponse.json({
        success: true,
        message: "تم ارسال الاشعار الى 0 عميل",
        sentCount: 0,
      });
    }

    // Extract tokens
    const tokens: string[] = subscriptions.map((sub: any) => sub.fcm_token);

   

    // Get Firebase messaging instance
    const messaging = admin.messaging();

    // Send notifications using sendEachForMulticast
    let response;
    try {
      response = await messaging.sendEachForMulticast({
        data: {
          title: title.trim(),
          body: body.trim(),
          icon: storeIcon, // Injects the dynamic multi-tenant logo here
        },
        tokens,
      });


      // DETAILED ERROR LOGGING - Log why tokens failed
      if (response.failureCount > 0) {
        console.log("\n🔍 FAILURE ANALYSIS:");
        response.responses.forEach((resp: any, idx: number) => {
          if (!resp.success) {
            console.log(`   Token ${idx}:`);
            console.log(`     Error Code: ${resp.error?.code}`);
            console.log(`     Error Message: ${resp.error?.message}`);
            console.log(
              `     Token (first 50): ${tokens[idx].substring(0, 50)}`,
            );
          }
        });
        console.log("");
      }
    } catch (firebaseError: any) {
      console.error("❌ Firebase sendEachForMulticast error:");
      console.error("   Code:", firebaseError.code);
      console.error("   Message:", firebaseError.message);
      console.error("   Full error:", firebaseError);

      return NextResponse.json(
        {
          success: false,
          message: `Firebase error: ${firebaseError.message}`,
        },
        { status: 500 },
      );
    }

    // Handle failures - delete invalid tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = response.responses
        .map((resp: any, idx: number) => (!resp.success ? tokens[idx] : null))
        .filter((token: string | null): token is string => token !== null);

      console.log(`🗑️ Deleting ${failedTokens.length} invalid tokens`);

      if (failedTokens.length > 0) {
        await supabaseAdmin
          .from("push_subscriptions")
          .delete()
          .in("fcm_token", failedTokens);
      }
    }

    // Save notification to database
    await supabaseAdmin.from("notifications").insert({
      store_id: storeId,
      title: title.trim(),
      body: body.trim(),
      sent_count: response.successCount,
      failed_count: response.failureCount,
    });

    const messageAr = `تم ارسال الاشعار الى ${response.successCount} عميل`;
 

    return NextResponse.json({
      success: true,
      message: messageAr,
      sentCount: response.successCount,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error: any) {
 
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to send notification",
      },
      { status: 500 },
    );
  }
}
