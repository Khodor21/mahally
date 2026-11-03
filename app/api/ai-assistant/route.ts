import {
  GoogleGenerativeAI,
  SchemaType,
  FunctionDeclaration,
} from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
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

const createCouponTool: FunctionDeclaration = {
  name: "create_coupon",
  description: "أنشئ كوبون خصم جديد للمتجر بالنسبة المئوية المحددة",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      code: { type: SchemaType.STRING, description: "اسم الكوبون" },
      discount_percentage: {
        type: SchemaType.NUMBER,
        description: "نسبة الخصم",
      },
    },
    required: ["code", "discount_percentage"],
  },
};

const createProductTool: FunctionDeclaration = {
  name: "create_product",
  description: "إضافة منتج جديد إلى المتجر. title وprice مطلوبان.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING, description: "اسم المنتج (مطلوب)" },
      price: {
        type: SchemaType.NUMBER,
        description: "سعر المنتج (مطلوب، > 0)",
      },
      description: {
        type: SchemaType.STRING,
        description: "وصف المنتج (اختياري)",
      },
      stock: {
        type: SchemaType.NUMBER,
        description: "الكمية (اختياري، افتراضي: 0)",
      },
      discount_price: {
        type: SchemaType.NUMBER,
        description: "سعر الخصم (اختياري)",
      },
    },
    required: ["title", "price"],
  },
};

const createMultipleProductsTool: FunctionDeclaration = {
  name: "create_multiple_products",
  description: "إضافة عدة منتجات دفعة واحدة.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      products: {
        type: SchemaType.ARRAY,
        description: "قائمة المنتجات المراد إضافتها",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            price: { type: SchemaType.NUMBER },
            description: { type: SchemaType.STRING },
            stock: { type: SchemaType.NUMBER },
            discount_price: { type: SchemaType.NUMBER },
          },
          required: ["title", "price"],
        },
      },
    },
    required: ["products"],
  },
};

const updateProductTool: FunctionDeclaration = {
  name: "update_product",
  description: "تعديل بيانات منتج موجود باستخدام اسمه.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      product_name: {
        type: SchemaType.STRING,
        description: "اسم المنتج المراد تعديله",
      },
      title: { type: SchemaType.STRING },
      price: { type: SchemaType.NUMBER },
      stock: { type: SchemaType.NUMBER },
      discount_price: { type: SchemaType.NUMBER },
      description: { type: SchemaType.STRING },
    },
    required: ["product_name"],
  },
};

const deleteProductTool: FunctionDeclaration = {
  name: "delete_product",
  description: "حذف منتج من المتجر باستخدام اسمه",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      product_name: { type: SchemaType.STRING },
    },
    required: ["product_name"],
  },
};

const createCategoryTool: FunctionDeclaration = {
  name: "create_category",
  description: "إضافة قسم/تصنيف جديد للمتجر.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING },
    },
    required: ["title"],
  },
};

const updateCategoryTool: FunctionDeclaration = {
  name: "update_category",
  description: "تعديل اسم قسم موجود باستخدام اسمه الحالي.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      category_name: { type: SchemaType.STRING },
      title: { type: SchemaType.STRING },
    },
    required: ["category_name", "title"],
  },
};

const deleteCategoryTool: FunctionDeclaration = {
  name: "delete_category",
  description: "حذف قسم من المتجر باستخدام اسمه. سيحذف أيضاً جميع منتجاته.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      category_name: { type: SchemaType.STRING },
    },
    required: ["category_name"],
  },
};

const createSectionTool: FunctionDeclaration = {
  name: "create_section",
  description:
    "إضافة قسم جديد لواجهة المتجر. يحتاج عنوان القسم واسم التصنيف المرتبط به.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING },
      category_name: { type: SchemaType.STRING },
      status: { type: SchemaType.STRING, description: "'active' أو 'draft'" },
    },
    required: ["title", "category_name"],
  },
};

const updateSectionTool: FunctionDeclaration = {
  name: "update_section",
  description: "تعديل عنوان أو حالة قسم موجود في واجهة المتجر.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      section_name: { type: SchemaType.STRING },
      title: { type: SchemaType.STRING },
      status: { type: SchemaType.STRING },
      category_name: { type: SchemaType.STRING },
    },
    required: ["section_name"],
  },
};

const deleteSectionTool: FunctionDeclaration = {
  name: "delete_section",
  description: "حذف قسم من واجهة المتجر باستخدام اسمه.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      section_name: { type: SchemaType.STRING },
    },
    required: ["section_name"],
  },
};

const getAnalyticsReportTool: FunctionDeclaration = {
  name: "get_analytics_report",
  description: "الحصول على تقارير وتحليلات المتجر",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      report_type: {
        type: SchemaType.STRING,
        description: "'revenue' أو 'orders' أو 'visitors' أو 'all'",
      },
    },
    required: ["report_type"],
  },
};

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

    // Security: ensure the session user owns this store
    if (storeId !== sessionStoreId) {
      return NextResponse.json(
        { success: false, error: "غير مصرح." },
        { status: 403 },
      );
    }

    const normalizedMessage = normalizeMessage(message);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `أنت 'مساعد محلي'، ذكاء اصطناعي متخصص حصرياً في إدارة المتجر الإلكتروني على منصة 'محلي'.
مهمتك مساعدة التاجر في إدارة منتجاته وأقسامه وأقسام الواجهة (Storefront Sections) وكوبونات الخصم وتقارير التحليلات.

🎯 **المرادفات التي تفهمها:**
- "كوبون" = "كود خصم" = "كود ترويج" = "كود عرض" = "قسيمة خصم"
- "خصم" أو "discount" على منتج = discount_price في update_product أو create_product

📋 **القواعد:**
- قاعدة المنتج: title وprice مطلوبان. اسأل عن الناقص قبل الإنشاء.
- قاعدة القسم (category): title مطلوب فقط.
- قاعدة قسم الواجهة (section): title واسم التصنيف مطلوبان.
- عند طلب منتجات متعددة في أمر واحد، استخدم دالة create_multiple_products.
- لا تسأل عن الصور أبداً — تُستخدم صور افتراضية تلقائياً.
- إذا سألك المستخدم عن مواضيع خارج المتجر، ارفض بلباقة.`,
      tools: [
        {
          functionDeclarations: [
            createCouponTool,
            createProductTool,
            createMultipleProductsTool,
            updateProductTool,
            deleteProductTool,
            createCategoryTool,
            updateCategoryTool,
            deleteCategoryTool,
            createSectionTool,
            updateSectionTool,
            deleteSectionTool,
            getAnalyticsReportTool,
          ],
        },
      ],
    });

    const response = await withRetry(async () => {
      const chat = model.startChat();
      const result = await chat.sendMessage(normalizedMessage);
      return result.response;
    });

    const functionCalls = response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];

      // ── Create Coupon ──────────────────────────────────────────────────
      if (call.name === "create_coupon") {
        const { code, discount_percentage } = call.args as any;
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
          reply: `✅ تم إنشاء كوبون **${code.toUpperCase()}** بخصم **${discount_percentage}%** بنجاح!`,
        });
      }

      // ── Create Product ─────────────────────────────────────────────────
      else if (call.name === "create_product") {
        const { title, price, description, stock, discount_price } =
          call.args as any;

        if (!title?.trim())
          return NextResponse.json({
            success: true,
            reply: "ما اسم المنتج الذي تريد إضافته؟",
          });
        if (!price || Number(price) <= 0)
          return NextResponse.json({
            success: true,
            reply: `كم سيكون سعر منتج "${title}"؟`,
          });

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
        });

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل إنشاء المنتج: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply: `✅ تم إضافة المنتج **${title}** بسعر **${price}$** بنجاح!\n\n> 💡 يمكنك تعديل صورة المنتج من لوحة المنتجات.`,
        });
      }

      // ── Create Multiple Products ───────────────────────────────────────
      else if (call.name === "create_multiple_products") {
        const { products } = call.args as any;

        if (!Array.isArray(products) || products.length === 0)
          return NextResponse.json({
            success: true,
            reply: "لم أفهم قائمة المنتجات. يرجى تحديدها بوضوح.",
          });

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
          });
        }

        if (validRows.length === 0)
          return NextResponse.json({
            success: false,
            reply: "❌ جميع المنتجات تحتوي على بيانات ناقصة.",
          });

        const { error } = await supabase.from("products").insert(validRows);

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل إنشاء المنتجات: ${error.message}`,
          });

        const summary = validRows
          .map((r) => `✅ **${r.title}** - $${r.price} (الكمية: ${r.stock})`)
          .join("\n");

        const failSummary = invalidTitles.length
          ? `\n\n❌ فشل (بيانات ناقصة): ${invalidTitles.map((t) => `**${t}**`).join("، ")}`
          : "";

        return NextResponse.json({
          success: true,
          reply:
            `📦 **تم معالجة ${products.length} منتج:**\n\n${summary}${failSummary}\n\n` +
            `✅ نجح: ${validRows.length}${invalidTitles.length ? ` | ❌ فشل: ${invalidTitles.length}` : ""}\n\n` +
            `> 💡 يمكنك تعديل الصور من لوحة المنتجات.`,
        });
      }

      // ── Update Product ─────────────────────────────────────────────────
      else if (call.name === "update_product") {
        const {
          product_name,
          title,
          price,
          stock,
          discount_price,
          description,
        } = call.args as any;

        const product = await findProductByName(storeId, product_name);
        if (!product)
          return NextResponse.json({
            success: true,
            reply: `❌ لم أجد منتجاً باسم "${product_name}".`,
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
            reply: "لم تحدد أي تعديلات.",
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
        if (updates.title) changed.push(`الاسم: **${updates.title}**`);
        if (updates.price !== undefined)
          changed.push(`السعر: **${updates.price}$**`);
        if (updates.stock !== undefined)
          changed.push(`المخزون: **${updates.stock}**`);
        if (updates.discount_price !== undefined)
          changed.push(
            updates.discount_price
              ? `سعر الخصم: **${updates.discount_price}$**`
              : "إزالة الخصم",
          );
        if (updates.description !== undefined) changed.push("الوصف");

        return NextResponse.json({
          success: true,
          reply:
            `✅ تم تحديث المنتج **${product.title}** بنجاح!\n` +
            (changed.length ? `> التعديلات: ${changed.join("، ")}` : ""),
        });
      }

      // ── Delete Product ─────────────────────────────────────────────────
      else if (call.name === "delete_product") {
        const { product_name } = call.args as any;

        const product = await findProductByName(storeId, product_name);
        if (!product)
          return NextResponse.json({
            success: true,
            reply: `❌ لم أجد منتجاً باسم "${product_name}".`,
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
          reply: `✅ تم حذف المنتج **${product.title}** بنجاح.`,
        });
      }

      // ── Create Category ────────────────────────────────────────────────
      else if (call.name === "create_category") {
        const { title } = call.args as any;

        if (!title?.trim())
          return NextResponse.json({
            success: true,
            reply: "ما اسم القسم الذي تريد إضافته؟",
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
            reply: `❌ فشل إنشاء القسم: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply: `✅ تم إضافة القسم **${title}** بنجاح!\n\n> 💡 يمكنك تعديل صورة القسم من لوحة الأقسام.`,
        });
      }

      // ── Update Category ────────────────────────────────────────────────
      else if (call.name === "update_category") {
        const { category_name, title } = call.args as any;

        const category = await findCategoryByName(storeId, category_name);
        if (!category)
          return NextResponse.json({
            success: true,
            reply: `❌ لم أجد قسماً باسم "${category_name}".`,
          });

        const { error } = await supabase
          .from("categories")
          .update({ title: title.trim() })
          .eq("id", category.id)
          .eq("store_id", storeId);

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل تحديث القسم: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply: `✅ تم تغيير اسم القسم من **${category.title}** إلى **${title}** بنجاح!`,
        });
      }

      // ── Delete Category ────────────────────────────────────────────────
      else if (call.name === "delete_category") {
        const { category_name } = call.args as any;

        const category = await findCategoryByName(storeId, category_name);
        if (!category)
          return NextResponse.json({
            success: true,
            reply: `❌ لم أجد قسماً باسم "${category_name}".`,
          });

        // Delete products first (foreign key)
        const { error: productsError } = await supabase
          .from("products")
          .delete()
          .eq("category_id", category.id);

        if (productsError)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل حذف منتجات القسم: ${productsError.message}`,
          });

        const { error } = await supabase
          .from("categories")
          .delete()
          .eq("id", category.id)
          .eq("store_id", storeId);

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل حذف القسم: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply: `✅ تم حذف القسم **${category.title}** وجميع منتجاته بنجاح.`,
        });
      }

      // ── Create Section ─────────────────────────────────────────────────
      else if (call.name === "create_section") {
        const { title, category_name, status } = call.args as any;

        if (!title?.trim())
          return NextResponse.json({
            success: true,
            reply: "ما عنوان قسم الواجهة الذي تريد إضافته؟",
          });
        if (!category_name?.trim())
          return NextResponse.json({
            success: true,
            reply: `بأي تصنيف تريد ربط قسم "${title}"؟`,
          });

        const category = await findCategoryByName(storeId, category_name);
        if (!category)
          return NextResponse.json({
            success: true,
            reply: `❌ لم أجد تصنيفاً باسم "${category_name}". تأكد من الاسم أو أضف التصنيف أولاً.`,
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
            reply: `❌ فشل إنشاء قسم الواجهة: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply:
            `✅ تم إضافة قسم الواجهة **${title}** مرتبطاً بتصنيف **${category.title}** بنجاح!\n\n` +
            `> 💡 يمكنك تعديل صورة البانر من لوحة الواجهة.`,
        });
      }

      // ── Update Section ─────────────────────────────────────────────────
      else if (call.name === "update_section") {
        const { section_name, title, status, category_name } = call.args as any;

        const section = await findSectionByName(storeId, section_name);
        if (!section)
          return NextResponse.json({
            success: true,
            reply: `❌ لم أجد قسم واجهة باسم "${section_name}".`,
          });

        let categoryId = section.category_id;
        let categoryTitle: string | undefined;

        if (category_name?.trim()) {
          const cat = await findCategoryByName(storeId, category_name);
          if (!cat)
            return NextResponse.json({
              success: true,
              reply: `❌ لم أجد تصنيفاً باسم "${category_name}".`,
            });
          categoryId = cat.id;
          categoryTitle = cat.title;
        }

        const updates: Record<string, any> = {
          category_id: categoryId,
        };
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
            reply: `❌ فشل تحديث قسم الواجهة: ${error.message}`,
          });

        const changed: string[] = [];
        if (updates.title) changed.push(`العنوان: **${updates.title}**`);
        if (updates.status)
          changed.push(
            `الحالة: **${updates.status === "active" ? "نشط" : "مسودة"}**`,
          );
        if (categoryTitle) changed.push(`التصنيف: **${categoryTitle}**`);

        return NextResponse.json({
          success: true,
          reply:
            `✅ تم تحديث قسم الواجهة **${section.title}** بنجاح!\n` +
            (changed.length ? `> التعديلات: ${changed.join("، ")}` : ""),
        });
      }

      // ── Delete Section ─────────────────────────────────────────────────
      else if (call.name === "delete_section") {
        const { section_name } = call.args as any;

        const section = await findSectionByName(storeId, section_name);
        if (!section)
          return NextResponse.json({
            success: true,
            reply: `❌ لم أجد قسم واجهة باسم "${section_name}".`,
          });

        const { error } = await supabase
          .from("storefront_sections")
          .delete()
          .eq("id", section.id)
          .eq("store_id", storeId);

        if (error)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل حذف قسم الواجهة: ${error.message}`,
          });

        return NextResponse.json({
          success: true,
          reply: `✅ تم حذف قسم الواجهة **${section.title}** بنجاح.`,
        });
      }

      // ── Analytics ──────────────────────────────────────────────────────
      else if (call.name === "get_analytics_report") {
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
            `📊 **ملخص تقارير وتحليلات متجرك:**\n\n` +
            `- 💰 **إجمالي الإيرادات:** $${totalRevenue.toLocaleString()}\n` +
            `- 🛒 **إجمالي الطلبات:** ${totalOrders}\n` +
            `- 👁️ **إجمالي الزيارات:** ${totalVisits.toLocaleString()}\n` +
            `- 📈 **معدل التحويل:** ${conversionRate}%\n` +
            `- 💵 **متوسط قيمة الطلب:** $${avgOrderValue}`,
        });
      }
    }

    return NextResponse.json({ success: true, reply: response.text() });
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
          error:
            "المساعد مشغول حالياً بسبب كثرة الطلبات. انتظر لحظة وحاول مجدداً.",
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
