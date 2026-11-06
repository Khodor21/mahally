import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const DEFAULT_PRODUCT_IMAGE =
  "https://placehold.co/600x600/f4f2f5/3c1c54?text=Product";
const DEFAULT_CATEGORY_IMAGE =
  "https://placehold.co/200x200/f4f2f5/3c1c54?text=Category";
const DEFAULT_SECTION_BANNER =
  "https://placehold.co/1200x400/f4f2f5/3c1c54?text=Section";

// ==========================================
// Message Normalization
// ==========================================
function normalizeMessage(message: string): string {
  const couponKeywords = [
    "كوبون",
    "كود خصم",
    "كود ترويج",
    "كود عرض",
    "قسيمة خصم",
    "بروموشن",
    "عرض ترويجي",
    "كوبونات",
  ];
  if (couponKeywords.some((kw) => message.includes(kw))) {
    message += "\n[السياق: الطلب يتعلق بإنشاء كوبون أو كود خصم]";
  }
  return message;
}

// ==========================================
// Retry helper
// ==========================================
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const is429 =
        err?.status === 429 ||
        String(err?.message).includes("429") ||
        String(err?.message).toLowerCase().includes("quota") ||
        String(err?.message).toLowerCase().includes("rate");
      if (is429) throw err;
      if (attempt === maxAttempts - 1) throw err;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 2000));
    }
  }
  throw lastError;
}

// ==========================================
// Tool Declarations
// ==========================================
const tools: Groq.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_coupon",
      description:
        "إنشاء كوبون خصم جديد للمتجر. يُستخدم عند طلب كوبون أو كود خصم أو قسيمة.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string", description: "كود الكوبون (أحرف وأرقام)" },
          discount_percentage: {
            type: "number",
            description: "نسبة الخصم من 1 إلى 100",
          },
        },
        required: ["code", "discount_percentage"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_product",
      description:
        "إضافة منتج واحد جديد للمتجر. استخدم create_multiple_products إذا كان أكثر من منتج.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "اسم المنتج (مطلوب)" },
          price: {
            type: "number",
            description: "السعر الأصلي بالدولار (مطلوب، > 0)",
          },
          description: { type: "string", description: "وصف المنتج (اختياري)" },
          stock: {
            type: "number",
            description: "الكمية المتاحة (اختياري، افتراضي 0)",
          },
          discount_price: {
            type: "number",
            description: "سعر بعد الخصم إذا وجد (اختياري)",
          },
          category_name: {
            type: "string",
            description: "اسم التصنيف/القسم لربط المنتج به (اختياري)",
          },
        },
        required: ["title", "price"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_multiple_products",
      description:
        "إضافة عدة منتجات دفعة واحدة. استخدم هذه الدالة دائماً عند إضافة أكثر من منتج في نفس الطلب.",
      parameters: {
        type: "object",
        properties: {
          products: {
            type: "array",
            description: "قائمة المنتجات",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "اسم المنتج" },
                price: { type: "number", description: "السعر > 0" },
                description: { type: "string", description: "وصف المنتج" },
                stock: { type: "number", description: "الكمية" },
                discount_price: { type: "number", description: "سعر الخصم" },
              },
              required: ["title", "price"],
            },
          },
          category_name: {
            type: "string",
            description:
              "اسم التصنيف لربط جميع المنتجات به. إذا ذكر المستخدم تصنيفاً أو قسماً أو نوعاً، ضعه هنا.",
          },
        },
        required: ["products"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_product",
      description:
        "تعديل بيانات منتج موجود (السعر، الاسم، المخزون، الخصم، الوصف).",
      parameters: {
        type: "object",
        properties: {
          product_name: {
            type: "string",
            description: "اسم المنتج المراد تعديله",
          },
          title: { type: "string", description: "الاسم الجديد" },
          price: { type: "number", description: "السعر الجديد" },
          stock: { type: "number", description: "المخزون الجديد" },
          discount_price: {
            type: "number",
            description: "سعر الخصم الجديد (0 لإزالة الخصم)",
          },
          description: { type: "string", description: "الوصف الجديد" },
        },
        required: ["product_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_product",
      description: "حذف منتج نهائياً من المتجر.",
      parameters: {
        type: "object",
        properties: {
          product_name: {
            type: "string",
            description: "اسم المنتج المراد حذفه",
          },
        },
        required: ["product_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_category",
      description: "إنشاء تصنيف/قسم جديد في المتجر لتنظيم المنتجات.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "اسم التصنيف" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_category",
      description: "تغيير اسم تصنيف موجود.",
      parameters: {
        type: "object",
        properties: {
          category_name: {
            type: "string",
            description: "الاسم الحالي للتصنيف",
          },
          title: { type: "string", description: "الاسم الجديد" },
        },
        required: ["category_name", "title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_category",
      description: "حذف تصنيف وجميع منتجاته نهائياً.",
      parameters: {
        type: "object",
        properties: {
          category_name: {
            type: "string",
            description: "اسم التصنيف المراد حذفه",
          },
        },
        required: ["category_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_section",
      description:
        "إضافة قسم في واجهة المتجر (الصفحة الرئيسية). يربط تصنيفاً بعرض مرئي.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "عنوان القسم في الواجهة" },
          category_name: {
            type: "string",
            description: "اسم التصنيف المرتبط بهذا القسم",
          },
          status: {
            type: "string",
            description: "'active' للنشر أو 'draft' للمسودة",
          },
        },
        required: ["title", "category_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_section",
      description: "تعديل قسم في واجهة المتجر.",
      parameters: {
        type: "object",
        properties: {
          section_name: { type: "string", description: "اسم القسم الحالي" },
          title: { type: "string", description: "العنوان الجديد" },
          status: { type: "string", description: "'active' أو 'draft'" },
          category_name: {
            type: "string",
            description: "تغيير التصنيف المرتبط",
          },
        },
        required: ["section_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_section",
      description: "حذف قسم من واجهة المتجر.",
      parameters: {
        type: "object",
        properties: {
          section_name: {
            type: "string",
            description: "اسم القسم المراد حذفه",
          },
        },
        required: ["section_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_analytics_report",
      description:
        "عرض إحصائيات وتقارير المتجر (إيرادات، طلبات، زيارات، معدل التحويل).",
      parameters: {
        type: "object",
        properties: {
          report_type: {
            type: "string",
            description:
              "'revenue' للإيرادات، 'orders' للطلبات، 'visitors' للزيارات، 'all' للكل",
          },
        },
        required: ["report_type"],
      },
    },
  },
];

// ==========================================
// DB Helpers
// ==========================================

async function findProductByName(storeId: string, name: string) {
  const { data } = await supabase
    .from("products")
    .select("id, title")
    .eq("store_id", storeId)
    .ilike("title", `%${name}%`)
    .limit(1)
    .single();
  return data ?? null;
}

async function findCategoryByName(storeId: string, name: string) {
  const { data } = await supabase
    .from("categories")
    .select("id, title, display_order")
    .eq("store_id", storeId)
    .ilike("title", `%${name}%`)
    .limit(1)
    .single();
  return data ?? null;
}

async function findSectionByName(storeId: string, name: string) {
  const { data } = await supabase
    .from("storefront_sections")
    .select("id, title, category_id, status, section_order")
    .eq("store_id", storeId)
    .ilike("title", `%${name}%`)
    .limit(1)
    .single();
  return data ?? null;
}

async function getNextSectionOrder(storeId: string): Promise<number> {
  const { data } = await supabase
    .from("storefront_sections")
    .select("section_order")
    .eq("store_id", storeId)
    .order("section_order", { ascending: false })
    .limit(1);
  return data && data.length > 0 ? (data[0].section_order ?? 0) + 1 : 0;
}

async function getNextCategoryOrder(storeId: string): Promise<number> {
  const { data } = await supabase
    .from("categories")
    .select("display_order")
    .eq("store_id", storeId)
    .order("display_order", { ascending: false })
    .limit(1);
  return data && data.length > 0 ? (data[0].display_order ?? -1) + 1 : 0;
}

// ==========================================
// POST handler
// ==========================================

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "غير مصرح." },
        { status: 401 },
      );
    }

    const sessionStoreId = (session.user as any).id as string;

    let message: string;
    let storeId: string;
    try {
      const body = await req.json();
      message = body.message;
      storeId = body.storeId;
    } catch {
      return NextResponse.json(
        { success: false, error: "طلب غير صالح." },
        { status: 400 },
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: "معرف المتجر مفقود." },
        { status: 400 },
      );
    }

    if (storeId !== sessionStoreId) {
      return NextResponse.json(
        { success: false, error: "غير مصرح." },
        { status: 403 },
      );
    }

    const normalizedMessage = normalizeMessage(message);

    const response = await withRetry(async () => {
      return await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: `أنت "مساعد محلي" — مساعد ذكي متخصص في إدارة المتاجر الإلكترونية على منصة "محلي".
تتحدث بالعربية دائماً، وتفهم جميع أساليب التجار اللبنانيين والعرب في الكتابة.

━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 فهم النوايا والمرادفات
━━━━━━━━━━━━━━━━━━━━━━━━━
• "انشر / حط / ضف / أضف / خلق / أنشئ" = إنشاء
• "عدّل / غيّر / بدّل / حدّث / صلّح" = تعديل
• "احذف / شيل / امسح / أزل" = حذف
• "كوبون / كود خصم / كود ترويج / قسيمة / بروموشن" = create_coupon
• "تصنيف / قسم / كاتيغوري / نوع / فئة" = category
• "قسم الواجهة / سيكشن / عرض رئيسي" = storefront section
• "خصم / أوفر / سعر مخفض" على منتج = discount_price
• "كمية / مخزون / ستوك / عندي X قطعة" = stock

━━━━━━━━━━━━━━━━━━━━━━━━━
📋 قواعد العمل
━━━━━━━━━━━━━━━━━━━━━━━━━
1. منتج واحد → create_product | أكثر من منتج → create_multiple_products دائماً
2. إذا ذكر التاجر تصنيفاً مع المنتجات، مرره في category_name — لا تنشئ تصنيفاً جديداً تلقائياً
3. إذا ذكر التاجر تصنيفاً غير موجود، أخبره بذلك واقترح عليه إنشاءه أولاً
4. لا تسأل عن الصور أبداً — تُضاف صور افتراضية تلقائياً
5. لا تسأل عن معلومات غير ضرورية — اعمل بما عندك
6. إذا كان السعر أو الاسم ناقصاً فقط، اسأل عنه
7. ردودك واضحة ومباشرة — استخدم ✅ ❌ 📦 للتوضيح
8. مواضيع خارج المتجر → ارفض بلباقة

━━━━━━━━━━━━━━━━━━━━━━━━━
💡 أمثلة على فهم التجار
━━━━━━━━━━━━━━━━━━━━━━━━━
• "انشر 5 منتجات أحمر وأسود وبيج سعر 27.5 تصنيف makeup" → create_multiple_products مع category_name="makeup"
• "خلق كوبون SALE20 خصم 20%" → create_coupon
• "غيّر سعر أحمر شفاه لـ 25" → update_product
• "شيل قسم makeup" → delete_category`,
          },
          { role: "user", content: normalizedMessage },
        ],
        tools,
        tool_choice: "auto",
        max_tokens: 1500,
      });
    });

    const choice = response.choices[0];
    const toolCalls = choice.message.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      const call = toolCalls[0];
      const callName = call.function.name;
      const callArgs = JSON.parse(call.function.arguments);

      // ── Create Coupon ──────────────────────────────────────────────────
      if (callName === "create_coupon") {
        const { code, discount_percentage } = callArgs;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const { error } = await supabase.from("coupons").insert({
          store_id: storeId,
          code: code.toUpperCase(),
          type: "percentage",
          discount: discount_percentage,
          description: "تم إنشاؤه بواسطة المساعد الذكي",
          min_purchase: 0,
          max_uses: 999999,
          max_uses_per_customer: 1,
          expiry_date: expiryDate.toISOString(),
          is_active: true,
          used_count: 0,
        });

        if (error) throw error;
        return NextResponse.json({
          success: true,
          reply:
            `✅ **تم إنشاء الكوبون بنجاح!**\n\n` +
            `🎟️ الكود: **${code.toUpperCase()}**\n` +
            `💰 الخصم: **${discount_percentage}%**\n` +
            `📅 ينتهي بعد: **30 يوم**`,
        });
      }

      // ── Create Product ─────────────────────────────────────────────────
      else if (callName === "create_product") {
        const {
          title,
          price,
          description,
          stock,
          discount_price,
          category_name,
        } = callArgs;

        if (!title?.trim())
          return NextResponse.json({
            success: true,
            reply: "ما اسم المنتج اللي بدك تضيفه؟",
          });
        if (!price || Number(price) <= 0)
          return NextResponse.json({
            success: true,
            reply: `كم سعر **${title}**؟`,
          });

        let categoryId: string | null = null;
        let categoryTitle: string | null = null;

        if (category_name?.trim()) {
          const category = await findCategoryByName(storeId, category_name);
          if (!category) {
            return NextResponse.json({
              success: true,
              reply:
                `❌ ما لقيت تصنيف باسم **"${category_name}"**.\n\n` +
                `💡 تقدر تضيف التصنيف أولاً بكتابة: "أضف تصنيف ${category_name}"، ثم أعد إضافة المنتج.`,
            });
          }
          categoryId = category.id;
          categoryTitle = category.title;
        }

        const { error } = await supabase.from("products").insert({
          store_id: storeId,
          title: title.trim(),
          description: description?.trim() || "",
          price: Number(price),
          discount_price: discount_price ? Number(discount_price) : null,
          stock: stock !== undefined ? Number(stock) : 0,
          images: [DEFAULT_PRODUCT_IMAGE],
          variantGroups: [],
          pin: false,
          sales_count: 0,
          ...(categoryId ? { category_id: categoryId } : {}),
        });

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل إنشاء المنتج: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply:
            `✅ **تمت الإضافة بنجاح!**\n\n` +
            `📦 **${title}**\n` +
            `💵 السعر: $${price}${discount_price ? ` ~~$${price}~~ → $${discount_price}` : ""}\n` +
            `📊 المخزون: ${stock ?? 0} قطعة\n` +
            `${categoryTitle ? `🏷️ التصنيف: ${categoryTitle}\n` : ""}` +
            `\n> 💡 يمكنك تعديل الصورة من لوحة المنتجات.`,
        });
      }

      // ── Create Multiple Products ───────────────────────────────────────
      else if (callName === "create_multiple_products") {
        const { products, category_name } = callArgs;

        if (!Array.isArray(products) || products.length === 0)
          return NextResponse.json({
            success: true,
            reply: "ما فهمت قائمة المنتجات. حددها بوضوح من فضلك.",
          });

        // Resolve category
        let categoryId: string | null = null;
        let categoryTitle: string | null = null;

        if (category_name?.trim()) {
          const category = await findCategoryByName(storeId, category_name);
          if (!category) {
            return NextResponse.json({
              success: true,
              reply:
                `❌ ما لقيت تصنيف باسم **"${category_name}"**.\n\n` +
                `💡 أضف التصنيف أولاً بكتابة: "أضف تصنيف ${category_name}"، ثم أعد إضافة المنتجات.`,
            });
          }
          categoryId = category.id;
          categoryTitle = category.title;
        }

        const validRows: any[] = [];
        const invalidTitles: string[] = [];

        for (const p of products) {
          if (!p.title?.trim() || !p.price || Number(p.price) <= 0) {
            invalidTitles.push(p.title || "بدون اسم");
            continue;
          }
          validRows.push({
            store_id: storeId,
            title: p.title.trim(),
            description: p.description?.trim() || "",
            price: Number(p.price),
            discount_price: p.discount_price ? Number(p.discount_price) : null,
            stock: p.stock !== undefined ? Number(p.stock) : 0,
            images: [DEFAULT_PRODUCT_IMAGE],
            variantGroups: [],
            pin: false,
            sales_count: 0,
            ...(categoryId ? { category_id: categoryId } : {}),
          });
        }

        if (validRows.length === 0)
          return NextResponse.json({
            success: false,
            reply: "❌ جميع المنتجات تحتوي على بيانات ناقصة (اسم أو سعر).",
          });

        const { error } = await supabase.from("products").insert(validRows);

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل إنشاء المنتجات: ${error.message}`,
          });

        const summary = validRows
          .map(
            (r) =>
              `• **${r.title}** — $${r.price}${r.stock > 0 ? ` (${r.stock} قطعة)` : ""}`,
          )
          .join("\n");

        const failSummary = invalidTitles.length
          ? `\n\n❌ **تعذّر إضافة (بيانات ناقصة):**\n${invalidTitles.map((t) => `• ${t}`).join("\n")}`
          : "";

        return NextResponse.json({
          success: true,
          reply:
            `✅ **تمت إضافة ${validRows.length} منتج بنجاح!**` +
            `${categoryTitle ? ` — تصنيف: **${categoryTitle}**` : ""}\n\n` +
            `${summary}${failSummary}\n\n` +
            `> 💡 يمكنك تعديل الصور من لوحة المنتجات.`,
        });
      }

      // ── Update Product ─────────────────────────────────────────────────
      else if (callName === "update_product") {
        const {
          product_name,
          title,
          price,
          stock,
          discount_price,
          description,
        } = callArgs;

        const product = await findProductByName(storeId, product_name);
        if (!product)
          return NextResponse.json({
            success: true,
            reply: `❌ ما لقيت منتج باسم **"${product_name}"**. تحقق من الاسم وحاول مجدداً.`,
          });

        const updates: Record<string, any> = {};
        if (title !== undefined) updates.title = title.trim();
        if (price !== undefined) updates.price = Number(price);
        if (stock !== undefined) updates.stock = Number(stock);
        if (discount_price !== undefined)
          updates.discount_price =
            discount_price === 0 ? null : Number(discount_price);
        if (description !== undefined) updates.description = description.trim();

        if (Object.keys(updates).length === 0)
          return NextResponse.json({
            success: true,
            reply: "ما حددت أي تعديل. شو بدك تغير؟",
          });

        const { error } = await supabase
          .from("products")
          .update(updates)
          .eq("id", product.id)
          .eq("store_id", storeId);

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل تحديث المنتج: ${error.message}`,
          });

        const changed: string[] = [];
        if (updates.title) changed.push(`الاسم → **${updates.title}**`);
        if (updates.price !== undefined)
          changed.push(`السعر → **$${updates.price}**`);
        if (updates.stock !== undefined)
          changed.push(`المخزون → **${updates.stock} قطعة**`);
        if (updates.discount_price !== undefined)
          changed.push(
            updates.discount_price
              ? `سعر الخصم → **$${updates.discount_price}**`
              : `إزالة الخصم ✓`,
          );
        if (updates.description !== undefined) changed.push(`الوصف ✓`);

        return NextResponse.json({
          success: true,
          reply:
            `✅ **تم تحديث "${product.title}" بنجاح!**\n\n` +
            changed.map((c) => `• ${c}`).join("\n"),
        });
      }

      // ── Delete Product ─────────────────────────────────────────────────
      else if (callName === "delete_product") {
        const { product_name } = callArgs;

        const product = await findProductByName(storeId, product_name);
        if (!product)
          return NextResponse.json({
            success: true,
            reply: `❌ ما لقيت منتج باسم **"${product_name}"**.`,
          });

        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", product.id)
          .eq("store_id", storeId);

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل حذف المنتج: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply: `🗑️ تم حذف **"${product.title}"** نهائياً.`,
        });
      }

      // ── Create Category ────────────────────────────────────────────────
      else if (callName === "create_category") {
        const { title } = callArgs;

        if (!title?.trim())
          return NextResponse.json({
            success: true,
            reply: "شو اسم التصنيف اللي بدك تضيفه؟",
          });

        const existing = await findCategoryByName(storeId, title);
        if (existing)
          return NextResponse.json({
            success: true,
            reply: `ℹ️ في تصنيف باسم **"${existing.title}"** موجود مسبقاً.`,
          });

        const nextOrder = await getNextCategoryOrder(storeId);

        const { error } = await supabase.from("categories").insert({
          title: title.trim(),
          logo_url: DEFAULT_CATEGORY_IMAGE,
          store_id: storeId,
          display_order: nextOrder,
        });

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل إنشاء التصنيف: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply:
            `✅ **تم إنشاء تصنيف "${title}" بنجاح!**\n\n` +
            `> 💡 يمكنك الآن إضافة منتجات لهذا التصنيف، أو تعديل صورته من لوحة الأقسام.`,
        });
      }

      // ── Update Category ────────────────────────────────────────────────
      else if (callName === "update_category") {
        const { category_name, title } = callArgs;

        const category = await findCategoryByName(storeId, category_name);
        if (!category)
          return NextResponse.json({
            success: true,
            reply: `❌ ما لقيت تصنيف باسم **"${category_name}"**.`,
          });

        const { error } = await supabase
          .from("categories")
          .update({ title: title.trim() })
          .eq("id", category.id)
          .eq("store_id", storeId);

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل تحديث التصنيف: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply: `✅ تم تغيير اسم التصنيف: **"${category.title}"** → **"${title}"**`,
        });
      }

      // ── Delete Category ────────────────────────────────────────────────
      else if (callName === "delete_category") {
        const { category_name } = callArgs;

        const category = await findCategoryByName(storeId, category_name);
        if (!category)
          return NextResponse.json({
            success: true,
            reply: `❌ ما لقيت تصنيف باسم **"${category_name}"**.`,
          });

        const { error: productsError } = await supabase
          .from("products")
          .delete()
          .eq("category_id", category.id);

        if (productsError)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل حذف منتجات التصنيف: ${productsError.message}`,
          });

        const { error } = await supabase
          .from("categories")
          .delete()
          .eq("id", category.id)
          .eq("store_id", storeId);

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل حذف التصنيف: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply: `🗑️ تم حذف تصنيف **"${category.title}"** وجميع منتجاته نهائياً.`,
        });
      }

      // ── Create Section ─────────────────────────────────────────────────
      else if (callName === "create_section") {
        const { title, category_name, status } = callArgs;

        if (!title?.trim())
          return NextResponse.json({
            success: true,
            reply: "شو عنوان القسم اللي بدك تضيفه في الواجهة؟",
          });
        if (!category_name?.trim())
          return NextResponse.json({
            success: true,
            reply: `بأي تصنيف بدك تربط قسم **"${title}"**؟`,
          });

        const category = await findCategoryByName(storeId, category_name);
        if (!category)
          return NextResponse.json({
            success: true,
            reply:
              `❌ ما لقيت تصنيف باسم **"${category_name}"**.\n\n` +
              `💡 أضف التصنيف أولاً بكتابة: "أضف تصنيف ${category_name}"`,
          });

        const sectionOrder = await getNextSectionOrder(storeId);

        const { error } = await supabase.from("storefront_sections").insert({
          title: title.trim(),
          banner_url: DEFAULT_SECTION_BANNER,
          category_id: category.id,
          status: status === "draft" ? "draft" : "active",
          store_id: storeId,
          section_order: sectionOrder,
        });

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل إنشاء القسم: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply:
            `✅ **تم إضافة القسم في الواجهة!**\n\n` +
            `🖼️ العنوان: **${title}**\n` +
            `🏷️ التصنيف: **${category.title}**\n` +
            `📡 الحالة: **${status === "draft" ? "مسودة" : "نشط"}**\n\n` +
            `> 💡 يمكنك تعديل البانر من لوحة الواجهة.`,
        });
      }

      // ── Update Section ─────────────────────────────────────────────────
      else if (callName === "update_section") {
        const { section_name, title, status, category_name } = callArgs;

        const section = await findSectionByName(storeId, section_name);
        if (!section)
          return NextResponse.json({
            success: true,
            reply: `❌ ما لقيت قسم واجهة باسم **"${section_name}"**.`,
          });

        let categoryId = section.category_id;
        let categoryTitle: string | undefined;

        if (category_name?.trim()) {
          const cat = await findCategoryByName(storeId, category_name);
          if (!cat)
            return NextResponse.json({
              success: true,
              reply: `❌ ما لقيت تصنيف باسم **"${category_name}"**.`,
            });
          categoryId = cat.id;
          categoryTitle = cat.title;
        }

        const updates: Record<string, any> = { category_id: categoryId };
        if (title?.trim()) updates.title = title.trim();
        if (status === "active" || status === "draft") updates.status = status;

        const { error } = await supabase
          .from("storefront_sections")
          .update(updates)
          .eq("id", section.id)
          .eq("store_id", storeId);

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل تحديث القسم: ${error.message}`,
          });

        const changed: string[] = [];
        if (updates.title) changed.push(`العنوان → **${updates.title}**`);
        if (updates.status)
          changed.push(
            `الحالة → **${updates.status === "active" ? "نشط" : "مسودة"}**`,
          );
        if (categoryTitle) changed.push(`التصنيف → **${categoryTitle}**`);

        return NextResponse.json({
          success: true,
          reply:
            `✅ **تم تحديث القسم "${section.title}" بنجاح!**\n\n` +
            changed.map((c) => `• ${c}`).join("\n"),
        });
      }

      // ── Delete Section ─────────────────────────────────────────────────
      else if (callName === "delete_section") {
        const { section_name } = callArgs;

        const section = await findSectionByName(storeId, section_name);
        if (!section)
          return NextResponse.json({
            success: true,
            reply: `❌ ما لقيت قسم واجهة باسم **"${section_name}"**.`,
          });

        const { error } = await supabase
          .from("storefront_sections")
          .delete()
          .eq("id", section.id)
          .eq("store_id", storeId);

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل حذف القسم: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply: `🗑️ تم حذف قسم **"${section.title}"** من الواجهة.`,
        });
      }

      // ── Analytics ──────────────────────────────────────────────────────
      else if (callName === "get_analytics_report") {
        const { data: orders } = await supabase
          .from("orders")
          .select("total, status")
          .eq("store_id", storeId);

        const { data: visitors } = await supabase
          .from("visitor_counts")
          .select("visitor_count")
          .eq("store_id", storeId);

        const validOrders = (orders || []).filter(
          (o: any) => o.status !== "cancelled",
        );
        const totalRevenue = validOrders.reduce(
          (s: number, o: any) => s + Number(o.total || 0),
          0,
        );
        const totalOrders = validOrders.length;
        const totalVisits = (visitors || []).reduce(
          (s: number, v: any) => s + Number(v.visitor_count || 0),
          0,
        );
        const conversionRate =
          totalVisits > 0
            ? ((totalOrders / totalVisits) * 100).toFixed(1)
            : "0";
        const avgOrderValue =
          totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0";

        return NextResponse.json({
          success: true,
          reply:
            `📊 **تقرير متجرك:**\n\n` +
            `💰 الإيرادات الكلية: **$${totalRevenue.toLocaleString()}**\n` +
            `🛒 عدد الطلبات: **${totalOrders}**\n` +
            `👁️ إجمالي الزيارات: **${totalVisits.toLocaleString()}**\n` +
            `📈 معدل التحويل: **${conversionRate}%**\n` +
            `💵 متوسط قيمة الطلب: **$${avgOrderValue}**`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      reply: choice.message.content ?? "",
    });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);

    const is429 =
      error?.status === 429 ||
      String(error?.message).includes("429") ||
      String(error?.message).toLowerCase().includes("quota") ||
      String(error?.message).toLowerCase().includes("rate");

    if (is429) {
      return NextResponse.json(
        {
          success: false,
          error: "المساعد مشغول حالياً، انتظر لحظة وحاول مجدداً.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "حدث خطأ غير معروف في المساعد الذكي.",
      },
      { status: 500 },
    );
  }
}
