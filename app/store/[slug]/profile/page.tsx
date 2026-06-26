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

  const sessionCookie = cookieStore.get("store_customer_session")?.value;

  if (!sessionCookie) {
    redirect("/auth");
  }

  let customer = null;
  let lang: "en" | "ar" = "ar";

  try {
    const sessionData = JSON.parse(sessionCookie);

    const { data, error } = await supabaseAdmin
      .from("store_customers")
      .select("id, first_name, last_name, phone, governorate, store_id")
      .eq("id", sessionData.customerId)
      .single();

    if (error || !data) {
      throw new Error("Customer not found");
    }

    customer = data;

    // Fetch store settings to get the explicit store language, matching StorePage logic
    const { data: storeData } = await supabaseAdmin
      .from("stores")
      .select("language")
      .eq("id", data.store_id)
      .single();

    if (storeData?.language) {
      lang = storeData.language === "en" ? "en" : "ar";
    }
  } catch (error) {
    console.error("Failed to parse session or fetch customer:", error);
    redirect("/auth");
  }

  return <ProfileClient customer={customer} lang={lang} slug={params.slug} />;
}
