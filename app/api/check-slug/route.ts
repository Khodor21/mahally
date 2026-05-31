import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const RESERVED_SLUGS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "login",
  "logout",
  "signup",
  "register",
  "store",
  "stores",
  "shop",
  "support",
  "help",
  "mail",
  "cdn",
  "static",
  "assets",
  "mahalli",
  "about",
  "contact",
  "terms",
  "privacy",
]);

// Simple per-IP rate limit for slug checks
const slugCheckRateLimit = new Map<string, { count: number; reset: number }>();

export async function GET(req: NextRequest) {
  // ── Rate limit ────────────────────────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const limit = slugCheckRateLimit.get(ip);

  if (limit && now < limit.reset) {
    if (limit.count >= 60) {
      // 60 checks per minute per IP
      return NextResponse.json(
        { available: false, error: "Too many requests" },
        { status: 429 },
      );
    }
    limit.count += 1;
  } else {
    slugCheckRateLimit.set(ip, { count: 1, reset: now + 60_000 });
  }

  // ── Validate input ────────────────────────────────────────────────────────
  const slug = req.nextUrl.searchParams.get("slug")?.toLowerCase().trim();

  if (!slug || slug.length < 2) {
    return NextResponse.json({ available: false });
  }

  if (slug.length > 30) {
    return NextResponse.json({ available: false });
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ available: false });
  }

  if (slug.startsWith("-") || slug.endsWith("-")) {
    return NextResponse.json({ available: false });
  }

  if (RESERVED_SLUGS.has(slug)) {
    return NextResponse.json({ available: false });
  }

  // ── DB check ──────────────────────────────────────────────────────────────
  try {
    const { data, error } = await supabaseAdmin
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Slug check DB error:", error);
      // Fail open so UI isn't blocked by DB hiccup
      return NextResponse.json({ available: true });
    }

    return NextResponse.json({ available: data === null });
  } catch (err) {
    console.error("Slug check unexpected error:", err);
    return NextResponse.json({ available: true });
  }
}
