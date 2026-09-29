import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { storeId, oldPassword, newPassword } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Fetch current hash
  const { data: store } = await supabase
    .from("stores")
    .select("password_hash")
    .eq("id", storeId)
    .single();

  if (!store)
    return new Response(JSON.stringify({ error: "Store not found" }), {
      status: 404,
    });

  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, store.password_hash);
  if (!isValid)
    return new Response(JSON.stringify({ error: "Invalid password" }), {
      status: 401,
    });

  // Hash & update new password
  const newHash = await bcrypt.hash(newPassword, 10);
  await supabase
    .from("stores")
    .update({ password_hash: newHash })
    .eq("id", storeId);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
