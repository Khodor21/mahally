import { cookies } from "next/headers";
import { verifyCustomerToken } from "./jwt";

export async function requireAuth() {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    return verifyCustomerToken(token) as {
      userId: string;
      storeId: string;
      role: "admin" | "customer";
    };
  } catch {
    throw new Error("Unauthorized");
  }
}
