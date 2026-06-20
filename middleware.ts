// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "mahally.app";

  const cleanHost = hostname.replace(":3000", "");

  // ─────────────────────────────────────────────
  // 1. DOMAIN CLASSIFICATION
  // ─────────────────────────────────────────────

  const isLocalhost = cleanHost.includes("localhost");
  const isMainDomain =
    cleanHost === appDomain || cleanHost === `www.${appDomain}`;
  const isVercelPreview = cleanHost.includes("vercel.app");

  // Detect subdomain (for BOTH localhost AND mahally.app)
  let subdomain: string | null = null;

  if (isLocalhost) {
    // localhost: perfumes.localhost → perfumes
    const parts = cleanHost.split(".");
    if (parts[0] !== "localhost" && parts.length > 1) {
      subdomain = parts[0];
    }
  } else if (cleanHost.endsWith(appDomain)) {
    // mahally.app: perfumes.mahally.app → perfumes
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
  const storeCustomerSession = req.cookies.get("store_customer_session")?.value;

  let storeCustomer: any = null;

  if (storeCustomerSession) {
    try {
      storeCustomer = JSON.parse(decodeURIComponent(storeCustomerSession));
    } catch (err) {
      storeCustomer = null;
    }
  }

  const isStoreCustomerLoggedIn = !!storeCustomer?.storeId;

  // ─────────────────────────────────────────────
  // 3. BLOCK /AUTH IF STORE CUSTOMER EXISTS
  // ─────────────────────────────────────────────

  const isAuthRoute = url.pathname.includes("/auth");

  if (isAuthRoute && isStoreCustomerLoggedIn) {
    url.pathname = `/`;
    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────────
  // 4. API ROUTES (EARLY RETURN - CRITICAL!)
  // ─────────────────────────────────────────────
  // ✅ IMPORTANT: This must come BEFORE subdomain rewriting
  // so that /api/track-visitor doesn't become /store/slug/api/track-visitor
  if (url.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────
  // 5. STORE ROUTING (SUBDOMAIN REWRITING)
  // ─────────────────────────────────────────────
  // Rewrite store subdomains to internal routes
  // perfumes.mahally.app → /store/perfumes
  if (isStoreSubdomain) {
    url.pathname = `/store/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // ─────────────────────────────────────────────
  // 6. PROTECTED DASHBOARD
  // ─────────────────────────────────────────────

  const isDashboardRoute = url.pathname.startsWith("/dashboard");
  if (isDashboardRoute && !isLoggedIn) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────────
  // 7. AUTH GUARD (LOGIN / ONBOARDING)
  // ─────────────────────────────────────────────

  const isAuthPage =
    url.pathname.startsWith("/login") || url.pathname.startsWith("/onboarding");
  if (isLoggedIn && isAuthPage) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────────
  // 8. DEFAULT
  // ─────────────────────────────────────────────

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|.*\\..*).*)",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$).*)",
  ],
};
