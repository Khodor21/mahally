import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "yoursaas.com";

  // ─────────────────────────────────────────────
  // 1. SUBDOMAIN DETECTION (KEEPING YOUR LOGIC)
  // ─────────────────────────────────────────────
  const subdomain = hostname
    .replace(`.${appDomain}`, "")
    .replace(":3000", "")
    .replace("localhost", "");

  const isMainDomain =
    hostname === appDomain ||
    hostname === `www.${appDomain}` ||
    hostname.startsWith("localhost") ||
    hostname.includes("vercel.app");

  // Rewrite subdomain → /store/[slug]
  if (!isMainDomain && subdomain && subdomain !== hostname) {
    url.pathname = `/store/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // ─────────────────────────────────────────────
  // 2. AUTH CHECK (NEXTAUTH JWT)
  // ─────────────────────────────────────────────
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;

  // ─────────────────────────────────────────────
  // 3. PROTECTED ROUTES (KEEP OLD + EXTEND SAFE)
  // ─────────────────────────────────────────────
  const isDashboardRoute = url.pathname.startsWith("/dashboard");

  if (isDashboardRoute && !isLoggedIn) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────────
  // 4. AUTH PAGES BLOCK (NEW LOGIC YOU REQUESTED)
  // If user is logged in → block login & onboarding
  // ─────────────────────────────────────────────
  const isAuthPage =
    url.pathname.startsWith("/login") || url.pathname.startsWith("/onboarding");

  if (isLoggedIn && isAuthPage) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────────
  // 5. DEFAULT
  // ─────────────────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and auth assets
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
