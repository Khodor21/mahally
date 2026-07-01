// lib/customer-auth.ts

import { cookies } from "next/headers";

function parseCustomerSession(): {
  customerId: string;
  storeId: string;
} | null {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("store_customer_session")?.value;

    if (!sessionCookie) {
      console.log("❌ No customer session cookie found");
      return null;
    }

    // Parse the JSON string
    const session = JSON.parse(decodeURIComponent(sessionCookie));

    if (!session.customerId || !session.storeId) {
      console.error(
        "❌ Customer session missing customerId or storeId:",
        session,
      );
      return null;
    }

    return {
      customerId: session.customerId,
      storeId: session.storeId,
    };
  } catch (error) {
    console.error("❌ Failed to parse customer session:", error);
    return null;
  }
}

/**
 * Require customer session - throws if not authenticated
 * Used in API routes that need customer context (like push notifications)
 */
export async function requireCustomerSession(): Promise<{
  id: string;
  store_id: string;
}> {
  const session = parseCustomerSession();

  if (!session) {
    console.error("❌ Customer not authenticated");
    throw new Error("Unauthorized");
  }

  console.log("✅ Customer authenticated:", {
    customerId: session.customerId,
    storeId: session.storeId,
  });

  return {
    id: session.customerId,
    store_id: session.storeId,
  };
}

/**
 * Get customer session if it exists (doesn't throw)
 * Used in components/routes that need optional customer context
 */
export function getCustomerSession(): {
  customerId: string;
  storeId: string;
} | null {
  return parseCustomerSession();
}
