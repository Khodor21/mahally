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
// Retry helper — handles 429 from Gemini
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
        err?.statusCode === 429 ||
        String(err?.message).includes("429") ||
        String(err?.message).toLowerCase().includes("quota") ||
        String(err?.message).toLowerCase().includes("rate");

      // 💡 التعديل هنا: إذا كان الخطأ 429، ارمِ الخطأ فوراً ولا تحاول مرة أخرى
      if (is429) throw err;

      // إذا كان خطأ آخر (مثل مشكلة مؤقتة في سيرفرات جوجل)، استمر في المحاولة
      if (attempt === maxAttempts - 1) throw err;
      const waitMs = Math.pow(2, attempt) * 2000;
      console.warn(
        `[AI] Error — retrying in ${waitMs}ms (attempt ${attempt + 1})`,
      );
      await new Promise((r) => setTimeout(r, waitMs));
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
      title: { type: SchemaType.STRING, description: "الاسم الجديد (اختياري)" },
      price: { type: SchemaType.NUMBER, description: "السعر الجديد (اختياري)" },
      stock: {
        type: SchemaType.NUMBER,
        description: "الكمية الجديدة (اختياري)",
      },
      discount_price: {
        type: SchemaType.NUMBER,
        description: "سعر الخصم الجديد (اختياري)",
      },
      description: {
        type: SchemaType.STRING,
        description: "الوصف الجديد (اختياري)",
      },
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
      product_name: {
        type: SchemaType.STRING,
        description: "اسم المنتج المراد حذفه",
      },
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
      title: { type: SchemaType.STRING, description: "اسم القسم (مطلوب)" },
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
      category_name: {
        type: SchemaType.STRING,
        description: "الاسم الحالي للقسم",
      },
      title: { type: SchemaType.STRING, description: "الاسم الجديد للقسم" },
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
      category_name: {
        type: SchemaType.STRING,
        description: "اسم القسم المراد حذفه",
      },
    },
    required: ["category_name"],
  },
};

// ── Section Tools ──────────────────────────────────────────────────────────

const createSectionTool: FunctionDeclaration = {
  name: "create_section",
  description:
    "إضافة قسم جديد لواجهة المتجر (Storefront). يحتاج عنوان القسم واسم التصنيف المرتبط به.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING, description: "عنوان القسم (مطلوب)" },
      category_name: {
        type: SchemaType.STRING,
        description: "اسم التصنيف المرتبط بهذا القسم (مطلوب)",
      },
      status: {
        type: SchemaType.STRING,
        description: "حالة القسم: 'active' أو 'draft' (افتراضي: active)",
      },
    },
    required: ["title", "category_name"],
  },
};

const updateSectionTool: FunctionDeclaration = {
  name: "update_section",
  description: "تعديل عنوان أو حالة قسم موجود في واجهة المتجر باستخدام اسمه.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      section_name: {
        type: SchemaType.STRING,
        description: "العنوان الحالي للقسم",
      },
      title: {
        type: SchemaType.STRING,
        description: "العنوان الجديد (اختياري)",
      },
      status: {
        type: SchemaType.STRING,
        description: "الحالة الجديدة: 'active' أو 'draft' (اختياري)",
      },
      category_name: {
        type: SchemaType.STRING,
        description: "اسم التصنيف الجديد المرتبط (اختياري)",
      },
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
      section_name: {
        type: SchemaType.STRING,
        description: "عنوان القسم المراد حذفه",
      },
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
    .select("id, title")
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

// ==========================================
// Internal API caller (preserves session)
// ==========================================

async function callAPI(
  cookieHeader: string,
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: Record<string, any>,
  queryParams?: Record<string, string>,
): Promise<{ ok: boolean; data?: any; message?: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  let url = `${baseUrl}${endpoint}`;
  if (queryParams && Object.keys(queryParams).length > 0) {
    const qs = new URLSearchParams(queryParams).toString();
    url = `${url}?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", cookie: cookieHeader },
    body: method !== "DELETE" ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  return {
    ok: res.ok,
    data: json.data ?? json,
    message: json.message || json.error,
  };
}

// ==========================================
// POST handler
// ==========================================

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "غير مصرح." },
        { status: 401 },
      );
    }

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

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: `أنت 'مساعد محلي'، ذكاء اصطناعي متخصص حصرياً في إدارة المتجر الإلكتروني على منصة 'محلي'.
مهمتك مساعدة التاجر في إدارة منتجاته وأقسامه وأقسام الواجهة (Storefront Sections) وكوبونات الخصم وتقارير التحليلات.

قواعد المنتج: title وprice مطلوبان. اسأل عن الناقص قبل الإنشاء.
قواعد القسم (category): title مطلوب فقط.
قواعد قسم الواجهة (section): title واسم التصنيف المرتبط به مطلوبان. اسأل عن الناقص.
لا تسأل عن الصور أبداً — تُستخدم صور افتراضية تلقائياً.
إذا سألك المستخدم عن مواضيع خارج المتجر، ارفض بلباقة.`,
      tools: [
        {
          functionDeclarations: [
            createCouponTool,
            createProductTool,
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
      const result = await chat.sendMessage(message);
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
        const { error: dbError } = await supabase.from("coupons").insert({
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
        if (dbError) throw dbError;
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

        const result = await callAPI(cookieHeader, "/api/products", "POST", {
          title: title.trim(),
          description: description?.trim() || "",
          price: Number(price),
          discount_price: discount_price ? Number(discount_price) : null,
          stock: stock !== undefined ? Number(stock) : 0,
          images: [DEFAULT_PRODUCT_IMAGE],
          variantGroups: [],
          pin: false,
        });
        if (!result.ok)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل إنشاء المنتج: ${result.message}`,
          });
        return NextResponse.json({
          success: true,
          reply: `✅ تم إضافة المنتج **${title}** بسعر **${price}$** بنجاح!\n\n> 💡 يمكنك تعديل صورة المنتج من لوحة المنتجات.`,
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

        const updates: Record<string, any> = { id: product.id };
        if (title !== undefined) updates.title = title.trim();
        if (price !== undefined) updates.price = Number(price);
        if (stock !== undefined) updates.stock = Number(stock);
        if (discount_price !== undefined)
          updates.discount_price = Number(discount_price);
        if (description !== undefined) updates.description = description.trim();

        const result = await callAPI(
          cookieHeader,
          "/api/products",
          "PATCH",
          updates,
        );
        if (!result.ok)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل تحديث المنتج: ${result.message}`,
          });

        const changed: string[] = [];
        if (title) changed.push(`الاسم: **${title}**`);
        if (price) changed.push(`السعر: **${price}$**`);
        if (stock !== undefined) changed.push(`المخزون: **${stock}**`);
        if (discount_price !== undefined)
          changed.push(`سعر الخصم: **${discount_price}$**`);
        if (description) changed.push("الوصف");
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
        const result = await callAPI(
          cookieHeader,
          "/api/products",
          "DELETE",
          undefined,
          { id: product.id },
        );
        if (!result.ok)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل حذف المنتج: ${result.message}`,
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
        const result = await callAPI(cookieHeader, "/api/categories", "POST", {
          title: title.trim(),
          logo_url: DEFAULT_CATEGORY_IMAGE,
        });
        if (!result.ok)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل إنشاء القسم: ${result.message}`,
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
        const result = await callAPI(cookieHeader, "/api/categories", "PUT", {
          id: category.id,
          title: title.trim(),
        });
        if (!result.ok)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل تحديث القسم: ${result.message}`,
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
        const result = await callAPI(
          cookieHeader,
          "/api/categories",
          "DELETE",
          undefined,
          { id: category.id },
        );
        if (!result.ok)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل حذف القسم: ${result.message}`,
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

        // Resolve category ID from name
        const category = await findCategoryByName(storeId, category_name);
        if (!category) {
          return NextResponse.json({
            success: true,
            reply: `❌ لم أجد تصنيفاً باسم "${category_name}". تأكد من الاسم أو أضف التصنيف أولاً.`,
          });
        }

        const sectionOrder = await getNextSectionOrder(storeId);

        const result = await callAPI(cookieHeader, "/api/sections", "POST", {
          title: title.trim(),
          banner_url: DEFAULT_SECTION_BANNER,
          category_id: category.id,
          status: status === "draft" ? "draft" : "active",
          store_id: storeId,
          section_order: sectionOrder,
        });

        if (!result.ok)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل إنشاء قسم الواجهة: ${result.message}`,
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

        // Resolve new category if provided
        let categoryId = section.category_id;
        let categoryTitle: string | undefined;
        if (category_name?.trim()) {
          const cat = await findCategoryByName(storeId, category_name);
          if (!cat) {
            return NextResponse.json({
              success: true,
              reply: `❌ لم أجد تصنيفاً باسم "${category_name}". تأكد من الاسم وحاول مجدداً.`,
            });
          }
          categoryId = cat.id;
          categoryTitle = cat.title;
        }

        const result = await callAPI(
          cookieHeader,
          `/api/sections/${section.id}`,
          "PUT",
          {
            title: title?.trim() || section.title,
            banner_url: DEFAULT_SECTION_BANNER,
            category_id: categoryId,
            status:
              status === "draft" || status === "active"
                ? status
                : section.status,
            store_id: storeId,
            section_order: section.section_order,
          },
        );

        if (!result.ok)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل تحديث قسم الواجهة: ${result.message}`,
          });

        const changed: string[] = [];
        if (title) changed.push(`العنوان: **${title}**`);
        if (status)
          changed.push(`الحالة: **${status === "active" ? "نشط" : "مسودة"}**`);
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

        // DELETE /api/sections/[id]?store_id=...
        const result = await callAPI(
          cookieHeader,
          `/api/sections/${section.id}`,
          "DELETE",
          undefined,
          { store_id: storeId },
        );

        if (!result.ok)
          return NextResponse.json({
            success: false,
            reply: `❌ فشل حذف قسم الواجهة: ${result.message}`,
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
