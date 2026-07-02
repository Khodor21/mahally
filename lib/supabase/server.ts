import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// نستخدم الرابط الجديد هنا للعمليات التي تتم في الـ Backend
const dbPoolUrl = process.env.DATABASE_POOL_URL!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: "public",
  },
  // Supabase-js يستخدم هذا الرابط للعمليات المباشرة على قاعدة البيانات
  // ملاحظة: نمرر الرابط للـ db لضمان استخدام الـ Pooler
});

// ملاحظة تقنية: supabase-js لا يقبل رابط قاعدة بيانات مباشر في الـ constructor،
// هو يستخدم الـ REST API الخاص بـ Supabase الذي يتعامل تلقائياً مع الـ Pooling.
// لذا، تأكد فقط أنك تستخدم `supabaseAdmin` في كل عمليات الـ Database داخل الـ API Routes.
