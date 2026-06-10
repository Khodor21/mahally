import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import { supabaseAdmin } from "@/lib/supabase/server";

export default async function AccountPage({
  params,
}: {
  params: { slug: string };
}) {
  const cookieStore = cookies();
  const langCookie = cookieStore.get("lang")?.value;
  const lang = (langCookie === "ar" ? "ar" : "en") as "en" | "ar";

  // 1. Read the session cookie directly
  const sessionCookie = cookieStore.get("store_customer_session")?.value;

  if (!sessionCookie) {
    redirect("/auth");
  }

  let customer = null;

  try {
    const sessionData = JSON.parse(sessionCookie);

    // 2. Fetch customer directly from the database (No HTTP fetch required)
    const { data, error } = await supabaseAdmin
      .from("store_customers")
      .select("id, first_name, last_name, phone, governorate, store_id")
      .eq("id", sessionData.customerId)
      .single();

    if (error || !data) {
      throw new Error("Customer not found");
    }

    customer = data;
  } catch (error) {
    console.error("Failed to parse session or fetch customer:", error);
    // If anything fails (tampered cookie, deleted user), send them to login
    redirect("/auth");
  }

  // Pass data to client component
  return <ProfileClient customer={customer} lang={lang} slug={params.slug} />;
}
