import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function AccountPage({
  params,
}: {
  params: { slug: string };
}) {
  const cookieStore = cookies();
  const langCookie = cookieStore.get("lang")?.value;
  const lang = (langCookie === "ar" ? "ar" : "en") as "en" | "ar";

  // Fetch customer data
  const headersList = headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";

  let customer = null;
  let isAuthenticated = false;

  try {
    const res = await fetch(`${protocol}://${host}/api/profile`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      customer = json.data;
      isAuthenticated = true;
    } else if (res.status === 401) {
      // Not authenticated - redirect to auth page
      redirect(`/store/${params.slug}/auth`);
    }
  } catch (error) {
    console.error("Failed to fetch customer data:", error);
  }

  // If not authenticated, redirect
  if (!isAuthenticated || !customer) {
    redirect(`/store/${params.slug}/auth`);
  }

  // Pass data to client component
  return <ProfileClient customer={customer} lang={lang} slug={params.slug} />;
}
