"use client";

import React, { useMemo } from "react";

export type PolicyType =
  | "privacy"
  | "shipping"
  | "return-policy"
  | "terms"
  | "faq";

interface PolicyPageProps {
  type: PolicyType;
  lang?: "en" | "ar";
  storeName?: string;
  dbContent?: string | null;
  primaryColor?: string | null;
  isLoading?: boolean;
}

// Skeleton Loader Component
function PolicySkeleton() {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 pb-24"
      dir="ltr"
    >
      {/* Hero Skeleton */}
      <div className="h-48 bg-gray-300 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer"></div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 lg:p-16 space-y-6">
          {/* Title skeleton */}
          <div className="h-8 bg-gray-200 rounded-lg w-2/3 animate-pulse"></div>

          {/* Paragraph skeletons */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              {i % 2 === 0 && (
                <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default function PolicyPage({
  type,
  lang = "ar",
  storeName = "متجرك",
  dbContent,
  primaryColor,
  isLoading = false,
}: PolicyPageProps) {
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Configuration with emoji icons
  const config = {
    privacy: {
      emoji: "🛡️",
      title: lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy",
      subtitle:
        lang === "ar"
          ? "نحن نحترم خصوصيتك وأمان بيانات"
          : "We respect your privacy and data security",
    },
    shipping: {
      emoji: "🚚",
      title: lang === "ar" ? "الشحن والتوصيل" : "Shipping & Delivery",
      subtitle:
        lang === "ar"
          ? "سياسة التوصيل السريع والآمن"
          : "Fast and secure delivery policy",
    },
    "return-policy": {
      emoji: "↩️",
      title:
        lang === "ar" ? "سياسة الإسترجاع والاستبدال" : "Returns & Exchange",
      subtitle:
        lang === "ar"
          ? "ضمان رضاك 100% على كل عملية شراء"
          : "100% satisfaction guarantee on every purchase",
    },
    terms: {
      emoji: "📋",
      title: lang === "ar" ? "الشروط والأحكام" : "Terms & Conditions",
      subtitle:
        lang === "ar"
          ? "الشروط الكاملة لاستخدام المتجر"
          : "Complete terms for store usage",
    },
    faq: {
      emoji: "❓",
      title: lang === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions",
      subtitle:
        lang === "ar"
          ? "إجابات لأكثر الأسئلة شيوعاً"
          : "Answers to common questions",
    },
  };

  const activeConfig = config[type];

  // Default content templates
  const defaultContents = {
    ar: {
      privacy: `نحن نقدر مخاوفكم واهتمامكم بشأن خصوصية بياناتكم على شبكة الإنترنت. تم إعداد هذه السياسة لمساعدتكم في تفهم طبيعة البيانات التي نقوم بتجميعها منكم عند زيارتكم لمتجرنا وكيفية تعاملنا مع هذه البيانات الشخصية.

نحن نحتفظ بالحق في تعديل بنود وشروط سياسة سرية وخصوصية المعلومات إن لزم الأمر ومتى كان ذلك ملائماً. سيتم تنفيذ التعديلات هنا وسيتم بصفة مستمرة إخطاركم بالبيانات التي حصلنا عليها، وكيف سنستخدمها والجهة التي سنقوم بتزويدها بهذه البيانات.

البيانات التي نجمعها:
• اسمك وبريدك الإلكتروني
• عنوان التوصيل الخاص بك
• معلومات الدفع والطلبات السابقة
• سجل التصفح والتفضيلات

كيف نستخدم بياناتك:
• لمعالجة طلباتك وتوصيلها بنجاح
• لتحسين خدماتنا وتجربة المتجر
• للتواصل معك بخصوص طلباتك والعروض الخاصة
• للامتثال للقوانين والمتطلبات القانونية`,
      shipping: `يسعى فريق العمل جاهداً لتجهيز وشحن طلباتكم في أسرع وقت ممكن.

تختلف أوقات التسليم بناءً على موقعكم الجغرافي وخيارات الشحن المتاحة في منطقتكم. عادةً ما تستغرق عملية التوصيل من 3 إلى 5 أيام عمل من تاريخ تأكيد الطلب. سيتم تزويدكم برقم تتبع فور شحن طلبكم لتتمكنوا من متابعة حالة الشحنة.

مراحل الشحن:
• تأكيد الطلب والدفع
• تجهيز وتغليف المنتج بعناية
• شحن الطلب عبر شركة توصيل موثوقة
• تسليم آمن لعنوانك

تتبع طلبك:
ستتلقى رسالة نصية أو بريد إلكتروني يحتوي على رقم التتبع. استخدم هذا الرقم للتحقق من حالة طلبك في أي وقت.

الشحن المجاني:
قد ينطبق الشحن المجاني على طلباتك حسب الموقع والقيمة. تفاصيل أكثر متوفرة في سياق كل طلب.`,
      "return-policy": `رضاكم هو هدفنا الأول. إذا لم تكونوا راضين تماماً عن مشترياتكم، يسعدنا تقديم خيارات الاسترجاع أو الاستبدال وفقاً للشروط التالية:

شروط الاسترجاع:
• يمكنكم طلب الاسترجاع أو الاستبدال خلال 7 أيام من تاريخ استلام الطلب
• يجب أن يكون المنتج في حالته الأصلية، غير مستخدم، وبغلافه الأصلي
• يتحمل العميل تكاليف شحن الاسترجاع إلا في حالة استلام منتج تالف أو خاطئ

كيفية طلب الاسترجاع:
1. تواصل معنا عبر البريد الإلكتروني أو الواتس آب مع صورة من الطلب
2. سنقدم لك معلومات العنوان والخطوات التالية
3. أرسل المنتج إلينا برسالة تتبع
4. سنتحقق من المنتج وسنرد أموالك في غضون 5 أيام عمل

استبدال المنتج:
إذا أردت منتجاً آخر بدلاً من الاسترجاع، يمكننا إرسال المنتج الجديد وشحن المنتج الأصلي معاً.`,
      terms: `مرحباً بكم في متجرنا. باستخدامكم لهذا الموقع، فإنكم توافقون على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية قبل إجراء أي عملية شراء.

شروط الاستخدام:
• جميع المنتجات المعروضة تخضع لتوفرها في المخزون
• نحتفظ بالحق في تغيير الأسعار دون إشعار مسبق
• المنتجات المعروضة للبيع فقط للاستخدام الشخصي والعائلي

مسؤوليات البائع:
• ضمان جودة المنتجات المباعة
• التوصيل في الوقت المحدد
• معالجة الشكاوى بسرعة واحترافية

مسؤوليات المشتري:
• تقديم معلومات صحيحة وكاملة
• الالتزام بقوانين الدولة المعنية
• عدم استخدام المنتجات بطرق غير قانونية

التعديلات:
نحتفظ بالحق في تعديل هذه الشروط في أي وقت. ستكون التعديلات سارية المفعول فور نشرها.`,
      faq: `س: متى سيصل طلبي؟
ج: عادة ما يستغرق التوصيل بين 3 إلى 5 أيام عمل من تاريخ تأكيد الطلب. تختلف المدة حسب موقعك والشركة اللوجستية.

س: هل يمكنني تتبع الشحنة؟
ج: نعم، سيصلك رقم التتبع عبر البريد الإلكتروني أو الرسائل النصية بمجرد شحن الطلب. يمكنك استخدامه للتحقق من حالة طلبك.

س: ما سياسة الاسترجاع؟
ج: يمكنك استرجاع المنتج خلال 7 أيام من الاستلام إذا كان بحالة أصلية وغير مستخدم.

س: كيفية الدفع؟
ج: نقبل عدة طرق دفع آمنة بما في ذلك الدفع عند الاستلام والتحويل البنكي.

س: ماذا لو وصلني منتج تالف؟
ج: تواصل معنا فوراً مع صور توضح الضرر، وسنرسل لك منتج جديد أو نرد أموالك بالكامل.`,
    },
    en: {
      privacy: `We value your privacy and are committed to protecting your personal data. This policy is designed to help you understand what information we collect when you visit our store and how we handle this personal data.

We reserve the right to modify the terms and conditions of this privacy policy if necessary and when appropriate. Any updates will be implemented here, and you will continually be notified of what data we obtain, how we use it, and who we provide it to.

Data We Collect:
• Your name and email address
• Delivery address
• Payment and order history
• Browsing history and preferences

How We Use Your Data:
• To process and deliver your orders successfully
• To improve our services and store experience
• To communicate with you about orders and special offers
• To comply with legal requirements and regulations`,
      shipping: `Our team strives to process and ship your orders as quickly as possible.

Delivery times vary based on your geographic location and the shipping options available in your area. Delivery typically takes 3 to 5 business days from the date of order confirmation. You will be provided with a tracking number once your order is shipped.

Shipping Stages:
• Order confirmation and payment
• Product preparation and careful packaging
• Shipment via reliable courier
• Safe delivery to your address

Track Your Order:
You'll receive an SMS or email with a tracking number. Use this number to check your order status anytime.

Free Shipping:
Free shipping may apply to your orders based on location and value. Details are provided with each order.`,
      "return-policy": `Your satisfaction is our top priority. If you are not completely satisfied with your purchase, we gladly offer return or exchange options under the following conditions:

Return Conditions:
• You may request a return or exchange within 7 days of receiving the order
• The product must be in its original condition, unused, and in original packaging
• The customer is responsible for return shipping costs unless a damaged or incorrect item was received

How to Request a Return:
1. Contact us via email or WhatsApp with an order photo
2. We'll provide address details and next steps
3. Send the product to us with tracking
4. We'll verify and refund your money within 5 business days

Product Exchange:
If you prefer a different product, we can send the new item and ship your original product at the same time.`,
      terms: `Welcome to our store. By using this website, you agree to comply with and be bound by the following terms and conditions. Please read them carefully before making any purchase.

Terms of Use:
• All products displayed are subject to stock availability
• We reserve the right to change prices without prior notice
• Products are for personal and family use only

Seller Responsibilities:
• Ensure quality of products sold
• Deliver on time
• Handle complaints professionally

Buyer Responsibilities:
• Provide accurate and complete information
• Comply with applicable laws
• Do not use products unlawfully

Modifications:
We reserve the right to modify these terms anytime. Changes become effective upon publication.`,
      faq: `Q: When will my order arrive?
A: Delivery typically takes 3 to 5 business days from order confirmation. Duration varies based on your location and logistics partner.

Q: Can I track my shipment?
A: Yes, you'll receive a tracking number via email or SMS once your order is shipped.

Q: What is your return policy?
A: You can return products within 7 days of receiving if they're unused and in original condition.

Q: What payment methods do you accept?
A: We accept several secure payment methods including cash on delivery and bank transfers.

Q: What if I receive a damaged product?
A: Contact us immediately with photos of the damage, and we'll send a replacement or refund your money in full.`,
    },
  };

  // Select content - prefer DB content, fallback to default
  const rawContent = dbContent?.trim()
    ? dbContent
    : defaultContents[lang][type];

  // Parse and format content
  const formattedContent = useMemo(() => {
    return rawContent.split("\n").filter((line) => line.trim() !== "");
  }, [rawContent]);

  if (isLoading) {
    return <PolicySkeleton />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24"
      dir={dir}
    >
      {/* Enhanced Hero Section */}
      <div
        className="relative pt-20 pb-32 px-4 overflow-hidden"
        style={{
          background: primaryColor
            ? `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, 20)} 100%)`
            : "linear-gradient(135deg, #131944 0%, #1a2456 100%)",
        }}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Emoji Icon */}
          <div
            className="text-7xl mb-6 animate-bounce"
            style={{ animationDuration: "3s" }}
          >
            {activeConfig.emoji}
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            {activeConfig.title}
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 text-lg md:text-xl font-medium mb-2">
            {activeConfig.subtitle}
          </p>

          {/* Last Updated */}
          <p className="text-white/60 text-sm md:text-base">
            {lang === "ar"
              ? `آخر تحديث لمتجر ${storeName}`
              : `Latest update for ${storeName}`}
          </p>
        </div>
      </div>

      {/* Content Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12 lg:p-16">
          {/* Content */}
          <div className="space-y-6 text-gray-700">
            {formattedContent.map((paragraph, index) => {
              const isBullet = paragraph.trim().startsWith("•");
              const isQuestion =
                paragraph.trim().endsWith("؟") ||
                paragraph.trim().endsWith("?");
              const isHeading =
                paragraph.match(/^[ق|Q]:/i) || paragraph.match(/^[س|S]:/i);

              if (isBullet) {
                return (
                  <div key={index} className="flex items-start gap-4 pl-2">
                    <span className="text-2xl text-gray-400 flex-shrink-0 mt-0.5">
                      •
                    </span>
                    <p className="text-gray-700 leading-relaxed">
                      {paragraph.replace(/^•\s*/, "").trim()}
                    </p>
                  </div>
                );
              }

              if (isQuestion || isHeading) {
                return (
                  <div key={index} className="mt-8 first:mt-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                      {paragraph}
                    </h3>
                  </div>
                );
              }

              return (
                <p
                  key={index}
                  className="text-gray-700 text-base md:text-lg leading-relaxed"
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-12 border-t border-gray-200"></div>

          {/* Footer Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8">
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              {lang === "ar"
                ? `إذا كان لديك أي استفسارات بخصوص هذه السياسة، يرجى التواصل معنا عبر البريد الإلكتروني أو الهاتف. نحن هنا لمساعدتك!`
                : `If you have any questions about this policy, please contact us via email or phone. We're here to help!`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to adjust color brightness
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? R : 255) * 0x10000 +
      (G < 255 ? G : 255) * 0x100 +
      (B < 255 ? B : 255)
    )
      .toString(16)
      .slice(1)
  );
}
