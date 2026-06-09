import { NextRequest, NextResponse } from "next/server";
import { requireStoreSession } from "@/lib/store";
import { supabaseAdmin } from "@/lib/supabase/server";
import admin from "@/lib/firebaseAdmin";

// 1. Tell Next.js to NEVER statically analyze or cache this route at build time
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const store = await requireStoreSession();

    const body = await req.json();

    const title = body?.title?.trim();
    const message = body?.message?.trim();

    if (!title || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and message are required",
        },
        { status: 400 },
      );
    }

    await supabaseAdmin.from("notifications").insert({
      store_id: store.id,
      title,
      body: message,
    });

    const { data: subscriptions, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("fcm_token")
      .eq("store_id", store.id)
      .eq("active", true);

    if (error) {
      throw error;
    }

    const tokens =
      subscriptions?.map((item) => item.fcm_token).filter(Boolean) || [];

    if (!tokens.length) {
      return NextResponse.json({
        success: true,
        sent: 0,
      });
    }

    const result = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title,
        body: message,
      },
    });

    return NextResponse.json({
      success: true,
      sent: result.successCount,
      failed: result.failureCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      {
        status: err.message === "Unauthorized" ? 401 : 500,
      },
    );
  }
}
