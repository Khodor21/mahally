import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function getCustomerSession() {
  const cookieStore = cookies();
  const customerCookie = cookieStore.get("store_customer_session");

  if (!customerCookie?.value) {
    return null;
  }

  try {
    const { customerId, storeId } = JSON.parse(customerCookie.value);

    const { data: customer, error } = await supabaseAdmin
      .from("store_customers")
      .select("id, first_name, last_name, phone, governorate, store_id")
      .eq("id", customerId)
      .eq("store_id", storeId)
      .single();

    if (error || !customer) {
      return null;
    }

    return customer;
  } catch {
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
