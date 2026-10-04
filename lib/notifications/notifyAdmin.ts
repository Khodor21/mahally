import admin from "@/lib/firebaseAdmin";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function notifyAdminOrderSubmitted(
  storeId: string,
  orderId: string,
  customerName: string,
  total: number,
) {
  // Fire and forget - لا نستنى النتيجة
  (async () => {
    try {
      const { data: devices } = await supabaseAdmin
        .from("admin_devices")
        .select("fcm_token")
        .eq("store_id", storeId)
        .eq("active", true);

      if (!devices?.length) return;

      const tokens = devices.map((d) => d.fcm_token);

      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: "طلب جديد ✅",
          body: `${customerName} • ${total}$`,
        },
        data: {
          orderId,
          type: "order",
        },
        webpush: {
          fcmOptions: {
            link: `/dashboard/`,
          },
        },
      });
    } catch (err) {
      console.error("Admin notification failed (fire-and-forget):", err);
    }
  })();
}
