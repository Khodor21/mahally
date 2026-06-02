import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "mahally.app";

  // Remove port for local dev
  const cleanHost = hostname.replace(":3000", "");

  // ─────────────────────────────────────────────
  // 1. DOMAIN CLASSIFICATION
  // ─────────────────────────────────────────────

  const isLocalhost = cleanHost.includes("localhost");

  const isMainDomain =
    cleanHost === appDomain || cleanHost === `www.${appDomain}`;

  const isVercelPreview = cleanHost.includes("vercel.app");

  // Detect subdomain (ONLY for mahally.app)
  let subdomain: string | null = null;

  if (!isLocalhost && cleanHost.endsWith(appDomain)) {
    const parts = cleanHost.replace(appDomain, "").split(".");
    subdomain = parts[parts.length - 2] || null;
  }

  const isStoreSubdomain = !!subdomain && !isMainDomain;

  // ─────────────────────────────────────────────
  // 2. AUTH (NEXTAUTH)
  // ─────────────────────────────────────────────

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;

  // ─────────────────────────────────────────────
  // 3. STORE ROUTING (CRITICAL PART)
  // ─────────────────────────────────────────────

  // If it's a store subdomain → rewrite to store route
  if (isStoreSubdomain) {
    url.pathname = `/store/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // If it's custom domain OR main domain → no rewrite
  // (store resolution will happen in server via host header)

  // ─────────────────────────────────────────────
  // 4. PROTECTED DASHBOARD
  // ─────────────────────────────────────────────

  const isDashboardRoute = url.pathname.startsWith("/dashboard");

  if (isDashboardRoute && !isLoggedIn) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────────
  // 5. AUTH GUARD (LOGIN / ONBOARDING)
  // ─────────────────────────────────────────────

  const isAuthPage =
    url.pathname.startsWith("/login") || url.pathname.startsWith("/onboarding");

  if (isLoggedIn && isAuthPage) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────────
  // 6. DEFAULT
  // ─────────────────────────────────────────────

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
