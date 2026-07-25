import { Metadata } from "next";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/server";
import { ChevronDown } from "lucide-react";

// ================================================================
// TYPES
// ================================================================
interface FaqItem {
  id?: string | number;
  question: { ar: string; en: string };
  answer: { ar: string; en: string };
}

interface FaqSettings {
  faqs: FaqItem[];
}

// ================================================================
// DYNAMIC METADATA GENERATION
// ================================================================
export async function generateMetadata(): Promise<Metadata> {
  try {
    const headersList = headers();
    const host = headersList.get("host");
    const storeData = await getStoreByDomain(host);

    const storeName = storeData?.store_name || "متجرك";
    const language = storeData?.language || "ar";

    const titleText =
      language === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions";
    const title = `${titleText} - ${storeName}`;
    const description =
      language === "ar"
        ? `تصفح الأسئلة الشائعة لمتجر ${storeName}.`
        : `Browse the frequently asked questions for ${storeName}.`;

    return {
      title,
      description,
      robots: "index, follow",
      openGraph: {
        type: "website",
        title,
        description,
        siteName: storeName,
      },
      alternates: {
        canonical: `https://${host}/faq`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "الأسئلة الشائعة | FAQ",
      description: "الأسئلة الشائعة",
    };
  }
}

// ================================================================
// HELPER: GET STORE BY DOMAIN
// ================================================================
async function getStoreByDomain(domain: string | null) {
  if (!domain) return null;

  const subdomain = domain.split(".")[0];

  try {
    const { data: store, error } = await supabaseAdmin
      .from("stores")
      .select("id, store_name, language, slug")
      .eq("slug", subdomain)
      .maybeSingle();

    if (error) {
      console.error("Error fetching store:", error);
      return null;
    }

    return store;
  } catch (err) {
    console.error("Exception fetching store:", err);
    return null;
  }
}

// ================================================================
// HELPER: GET STORE SETTINGS
// ================================================================
async function getStoreSettings(storeId: string) {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from("store_settings")
      .select("faq, primary_color")
      .eq("store_id", storeId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings:", error);
      return null;
    }

    return settings;
  } catch (err) {
    console.error("Exception fetching settings:", err);
    return null;
  }
}

// ================================================================
// PAGE COMPONENT (SERVER COMPONENT)
// ================================================================
export default async function FaqPage() {
  const headersList = headers();
  const host = headersList.get("host");

  let storeData = null;
  let storeSettings = null;

  try {
    storeData = await getStoreByDomain(host);

    if (storeData?.id) {
      storeSettings = await getStoreSettings(storeData.id);
    }
  } catch (error) {
    console.error("Error in FaqPage:", error);
  }

  // Tenant configuration
  const language = (storeData?.language as "en" | "ar") || "ar";
  const primaryColor = storeSettings?.primary_color || "#1F2937";
  const faqData: FaqSettings = storeSettings?.faq || { faqs: [] };

  // Safe extraction of the FAQs array
  const faqs = Array.isArray(faqData.faqs) ? faqData.faqs : [];

  // Translations for the UI
  const pageTitle =
    language === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions";
  const emptyMessage =
    language === "ar"
      ? "لا توجد أسئلة شائعة مضافة حالياً."
      : "No FAQs available at the moment.";

  // Theme variable injection for Tailwind
  const themeStyle = {
    "--brand-primary": primaryColor,
  } as React.CSSProperties;

  // Alignment classes based on language
  const textAlignment = language === "ar" ? "text-right" : "text-left";

  return (
    <div
      style={themeStyle}
      className="min-h-screen bg-gray-50/50 py-8 px-4 md:py-12 sm:px-6 lg:px-8"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className={`mb-8 md:mb-12 ${textAlignment}`}>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight mb-3">
            {pageTitle}
          </h3>
          <div className="w-16 h-1 bg-[var(--brand-primary)] rounded-full opacity-80 inline-block"></div>
        </div>

        {/* FAQ Accordion List */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {faqs.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {faqs.map((item, index) => {
                // Graceful fallback for bilingual fields
                const questionText =
                  item.question?.[language] ||
                  item.question?.ar ||
                  item.question?.en ||
                  "";
                const answerText =
                  item.answer?.[language] ||
                  item.answer?.ar ||
                  item.answer?.en ||
                  "";

                if (!questionText) return null; // Skip if completely empty

                return (
                  <details key={item.id || index} className="group">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none py-4 px-4 md:py-5 md:px-6 text-gray-900 hover:bg-gray-50 transition-colors duration-200">
                      <span
                        className={`text-base md:text-lg pe-4 ${textAlignment}`}
                      >
                        {questionText}
                      </span>
                      <span className="transition duration-300 group-open:-rotate-180 text-[var(--brand-primary)] flex-shrink-0">
                        <ChevronDown className="w-5 h-5" />
                      </span>
                    </summary>
                    <div
                      className={`text-gray-600 pb-4 px-4 md:pb-6 md:px-6 leading-relaxed whitespace-pre-wrap text-sm md:text-base ${textAlignment}`}
                    >
                      <div className="pt-2 border-t border-gray-50">
                        {answerText}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          ) : (
            <div className="py-8 md:py-12 text-center text-gray-500 text-sm md:text-base">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
