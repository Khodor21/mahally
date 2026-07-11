import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const customerCookie = cookieStore.get("store_customer_session");

  if (!customerCookie?.value) {
    console.log("❌ No cookie found");
    return null;
  }

  try {
    const { customerId, storeId } = JSON.parse(customerCookie.value);
    console.log("🔍 Looking for customer:", { customerId, storeId });

    const { data: customer, error } = await supabaseAdmin
      .from("store_customers")
      .select("id, first_name, last_name, phone, governorate, store_id")
      .eq("id", customerId)
      .eq("store_id", storeId)
      .single();

    console.log("📊 Query result:", { error, customer });

    if (error || !customer) {
      console.log("❌ Customer not found or error");
      return null;
    }

    console.log("✅ Customer found");
    return customer;
  } catch (e) {
    console.log("❌ Catch error:", e);
    return null;
  }
}

export async function requireCustomerSession() {
  const customer = await getCustomerSession();

  if (!customer) {
    throw new Error("Unauthorized");
  }

  return customer;
}
