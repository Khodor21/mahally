import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import OnboardingClient from "./OnboardingClient";

// ===============================
// SERVER COMPONENT (PROTECTED ROUTE)
// ===============================

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  // If user already logged in → block onboarding
  if (session) {
    redirect("/dashboard");
  }

  return <OnboardingClient />;
}
