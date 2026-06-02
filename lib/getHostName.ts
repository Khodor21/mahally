import { headers } from "next/headers";

export async function getHostname() {
  const headersList = await headers();

  return headersList.get("x-hostname") || "";
}
