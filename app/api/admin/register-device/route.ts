import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireStoreSession } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { fcmToken, deviceName } = await req.json();

    if (!fcmToken?.trim()) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const store = await requireStoreSession();

    await supabaseAdmin.from("admin_devices").upsert(
      {
        store_id: store.id,
        fcm_token: fcmToken.trim(),
        device_name: deviceName || "Device",
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "store_id,fcm_token" },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
