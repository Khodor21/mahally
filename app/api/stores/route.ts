import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";

/* ─────────────────────────────────────────────
   GET STORE + SETTINGS (MERGED FOR FRONTEND)
───────────────────────────────────────────── */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  // 1. Get store
  const { data: store, error: storeError } = await supabaseAdmin
    .from("stores")
    .select("*")
    .eq("id", userId)
    .single();

  if (storeError) {
    return NextResponse.json({ error: storeError.message }, { status: 500 });
  }

  // 2. Get settings
  const { data: settings, error: settingsError } = await supabaseAdmin
    .from("store_settings")
    .select("*")
    .eq("store_id", userId)
    .maybeSingle();

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  // 3. MERGE settings into store object for frontend consistency
  const mergedStore = {
    ...store,
    primary_color: settings?.primary_color || null,
    privacy_policy: settings?.privacy_policy || null,
    shipping_policy: settings?.shipping_policy || null,
    return_policy: settings?.return_policy || null,
    logo_url: settings?.logo_url || null,
  };

  return NextResponse.json({
    store: mergedStore,
    settings: settings, // Keep for reference if needed
  });
}

const CreateStoreSchema = z.object({
  adminName: z
    .string()
    .min(2, "الاسم قصير جداً")
    .max(100, "الاسم طويل جداً")
    .regex(
      /^[\u0600-\u06FFa-zA-Z\s'-]+$/,
      "الاسم يحتوي على رموز غير مسموح بها",
    ),

  adminEmail: z
    .string()
    .email("بريد إلكتروني غير صالح")
    .max(255)
    .toLowerCase()
    .trim(),

  phone: z
    .string()
    .regex(/^[\d\s+()-]{7,20}$/, "رقم هاتف غير صالح")
    .optional()
    .or(z.literal("")),

  location: z
    .string()
    .max(200, "المدينة طويلة جداً")
    .optional()
    .or(z.literal("")),

  storeName: z
    .string()
    .min(2, "اسم المتجر قصير جداً")
    .max(100, "اسم المتجر طويل جداً")
    .trim(),

  storeType: z
    .enum([
      "fashion",
      "electronics",
      "food",
      "beauty",
      "home",
      "sports",
      "books",
      "jewelry",
      "toys",
      "other",
    ])
    .optional(),

  slug: z
    .string()
    .min(2, "الرابط قصير جداً")
    .max(30, "الرابط طويل جداً")
    .regex(
      /^[a-z0-9-]+$/,
      "الرابط يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط",
    )
    .refine((s) => !s.startsWith("-") && !s.endsWith("-"), {
      message: "الرابط لا يمكن أن يبدأ أو ينتهي بشرطة",
    }),

  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .max(72, "كلمة المرور طويلة جداً") // bcrypt max
    .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير")
    .regex(/[0-9]/, "يجب أن تحتوي على رقم"),
});

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
  "smtp",
  "ftp",
  "cdn",
  "static",
  "assets",
  "mahalli",
  "محلي",
  "about",
  "contact",
  "terms",
  "privacy",
]);

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blockedUntil?: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5; // 5 store creations per IP per hour
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24h block after abuse

function getRateLimitKey(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string): {
  allowed: boolean;
  retryAfter?: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  // Blocked
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  // Reset window
  if (!entry || now - entry.firstRequest > WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, firstRequest: now });
    return { allowed: true };
  }

  // Increment
  entry.count += 1;

  // Abuse: block
  if (entry.count > MAX_REQUESTS * 2) {
    entry.blockedUntil = now + BLOCK_DURATION_MS;
    return { allowed: false, retryAfter: BLOCK_DURATION_MS / 1000 };
  }

  // Limit reached
  if (entry.count > MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.firstRequest + WINDOW_MS - now) / 1000),
    };
  }

  return { allowed: true };
}

export async function POST(request: NextRequest) {
  // ── Rate limit ────────────────────────────────────────────────────────────
  const ipKey = getRateLimitKey(request);
  const rateLimit = checkRateLimit(ipKey);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "طلبات كثيرة جداً، يرجى المحاولة لاحقاً" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter ?? 3600),
          "X-RateLimit-Limit": String(MAX_REQUESTS),
        },
      },
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const parsed = CreateStoreSchema.safeParse(rawBody);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];

    return NextResponse.json(
      {
        error: firstError.message,
        field:
          typeof firstError.path[0] === "string"
            ? firstError.path[0]
            : undefined,

        // Only expose full errors in dev
        ...(process.env.NODE_ENV === "development" && {
          errors: parsed.error.issues,
        }),
      },
      { status: 422 },
    );
  }

  const {
    adminName,
    adminEmail,
    phone,
    location,
    storeName,
    storeType,
    slug,
    password,
  } = parsed.data;

  // ── Reserved slug check ───────────────────────────────────────────────────
  if (RESERVED_SLUGS.has(slug)) {
    return NextResponse.json(
      { error: "هذا الرابط محجوز، يرجى اختيار رابط آخر", field: "slug" },
      { status: 409 },
    );
  }

  // ── Duplicate checks (parallel) ───────────────────────────────────────────
  const [slugCheck, emailCheck] = await Promise.all([
    supabaseAdmin.from("stores").select("id").eq("slug", slug).maybeSingle(),
    supabaseAdmin
      .from("stores")
      .select("id")
      .eq("admin_email", adminEmail)
      .maybeSingle(),
  ]);

  if (slugCheck.error || emailCheck.error) {
    const err = slugCheck.error ?? emailCheck.error;
    console.error("SUPABASE ERROR:", JSON.stringify(err, null, 2));
    return NextResponse.json(
      { error: err?.message ?? "DB error" },
      { status: 500 },
    );
  }

  if (slugCheck.data) {
    return NextResponse.json(
      { error: "هذا الرابط محجوز، يرجى اختيار رابط آخر", field: "slug" },
      { status: 409 },
    );
  }

  if (emailCheck.data) {
    return NextResponse.json(
      { error: "هذا البريد الإلكتروني مسجّل مسبقاً", field: "email" },
      { status: 409 },
    );
  }

  // ── Hash password ─────────────────────────────────────────────────────────
  // Cost factor 12: ~300ms on modern hardware — good balance
  const passwordHash = await bcrypt.hash(password, 12);

  // ── Insert ────────────────────────────────────────────────────────────────
  const { data: newStore, error: insertError } = await supabaseAdmin
    .from("stores")
    .insert({
      admin_name: adminName,
      admin_email: adminEmail,
      phone: phone || null,
      location: location || null,
      store_name: storeName,
      store_type: storeType || null,
      slug,
      password_hash: passwordHash,
      is_active: true,
      created_at: new Date().toISOString(),
    })
    .select("id, slug, store_name, admin_email")
    .single();

  if (insertError) {
    console.error("Insert error:", insertError);

    // Unique constraint violations (race condition fallback)
    if (insertError.code === "23505") {
      const isSlug = insertError.message.includes("slug");
      return NextResponse.json(
        {
          error: isSlug
            ? "هذا الرابط محجوز، يرجى اختيار رابط آخر"
            : "هذا البريد الإلكتروني مسجّل مسبقاً",
          field: isSlug ? "slug" : "email",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "فشل إنشاء المتجر، يرجى المحاولة مجدداً" },
      { status: 500 },
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  return NextResponse.json(
    {
      success: true,
      store: {
        slug: newStore.slug,
        storeName: newStore.store_name,
      },
    },
    { status: 201 },
  );
}

// ─── Update Store Settings (PUT) ──────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeId = (session.user as any).id;

  try {
    const body = await request.json();

    const {
      store_name,
      location,
      phone,
      store_type,
      admin_name,
      admin_email,

      // settings only
      primary_color,
      privacy_policy,
      shipping_policy,
      return_policy,
      logo_url,
    } = body;

    /* ─────────────────────────────
       1. UPDATE stores TABLE
    ───────────────────────────── */
    const storeUpdate: Record<string, any> = {};
    if (store_name !== undefined) storeUpdate.store_name = store_name;
    if (location !== undefined) storeUpdate.location = location;
    if (phone !== undefined) storeUpdate.phone = phone;
    if (store_type !== undefined) storeUpdate.store_type = store_type;
    if (admin_name !== undefined) storeUpdate.admin_name = admin_name;
    if (admin_email !== undefined) storeUpdate.admin_email = admin_email;

    if (Object.keys(storeUpdate).length > 0) {
      const { error: storeError } = await supabaseAdmin
        .from("stores")
        .update(storeUpdate)
        .eq("id", storeId);

      if (storeError) {
        return NextResponse.json(
          { error: storeError.message },
          { status: 500 },
        );
      }
    }

    /* ─────────────────────────────
       2. UPSERT store_settings
       - Guarantees ONE row per store
       - Updates if exists, creates if not
    ───────────────────────────── */
    const settingsUpdate: Record<string, any> = {
      store_id: storeId,
    };

    // Only add fields that are explicitly provided
    if (primary_color !== undefined)
      settingsUpdate.primary_color = primary_color;
    if (privacy_policy !== undefined)
      settingsUpdate.privacy_policy = privacy_policy;
    if (shipping_policy !== undefined)
      settingsUpdate.shipping_policy = shipping_policy;
    if (return_policy !== undefined)
      settingsUpdate.return_policy = return_policy;
    if (logo_url !== undefined) settingsUpdate.logo_url = logo_url;

    settingsUpdate.updated_at = new Date().toISOString();

    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from("store_settings")
      .upsert(settingsUpdate, {
        onConflict: "store_id", // Ensures only ONE row per store
      })
      .select()
      .single();

    if (settingsError) {
      return NextResponse.json(
        { error: settingsError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      store: storeId,
      settings: settingsData,
    });
  } catch (err) {
    console.error("PUT /stores error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
