// app/api/notifications/send/route.ts - WITH DETAILED ERROR LOGGING

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import admin from "@/lib/firebaseAdmin";
import { requireStoreSession } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { title, body } = await req.json();

    console.log("\n========== 📤 SEND NOTIFICATION ==========");
    console.log("📥 Received:", { title, body });

    // Validate input
    if (!title?.trim() || !body?.trim()) {
      console.log("❌ Missing title or body");
      return NextResponse.json(
        { success: false, message: "Title and body are required" },
        { status: 400 },
      );
    }

    // Get store from authenticated session
    let store: any;
    try {
      store = await requireStoreSession();
      console.log("✅ Store authenticated:", store.id);
    } catch (error) {
      console.error("❌ Auth failed:", error);
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const storeId = store.id;

    // Query for this store's subscriptions
    const { data: subscriptions, error: fetchError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("fcm_token")
      .eq("store_id", storeId)
      .eq("active", true);

    console.log(`📊 Found ${subscriptions?.length || 0} subscribers`);

    if (fetchError) {
      console.error("❌ Query error:", fetchError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch subscriptions" },
        { status: 500 },
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("⚠️ No subscriptions found");

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
    console.log(`🎫 Sending to ${tokens.length} tokens`);

    // Log first token for debugging
    console.log(
      `🔍 First token (first 50 chars): ${tokens[0].substring(0, 50)}`,
    );

    // Get Firebase messaging instance
    const messaging = admin.messaging();
    console.log("🔥 Calling Firebase messaging.sendEachForMulticast...");

    // Send notifications using sendEachForMulticast
    let response;
    try {
      response = await messaging.sendEachForMulticast({
        notification: {
          title: title.trim(),
          body: body.trim(),
        },
        tokens,
      });

      console.log(`✅ Firebase response:`, {
        successCount: response.successCount,
        failureCount: response.failureCount,
      });

      // DETAILED ERROR LOGGING - Log why tokens failed
      if (response.failureCount > 0) {
        console.log("\n🔍 FAILURE ANALYSIS:");
        response.responses.forEach((resp: any, idx: number) => {
          if (!resp.success) {
            console.log(`   Token ${idx}:`);
            console.log(`      Error Code: ${resp.error?.code}`);
            console.log(`      Error Message: ${resp.error?.message}`);
            console.log(
              `      Token (first 50): ${tokens[idx].substring(0, 50)}`,
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
    console.log(`✅ SUCCESS:`, messageAr);
    console.log("========== ✅ DONE ==========\n");

    return NextResponse.json({
      success: true,
      message: messageAr,
      sentCount: response.successCount,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error: any) {
    console.error("❌ ERROR:", error.message);
    console.error("❌ Full error:", error);
    console.log("========== ❌ FAILED ==========\n");

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to send notification",
      },
      { status: 500 },
    );
  }
}
