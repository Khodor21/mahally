"use client";

import React, { useMemo } from "react";
import { Emoji } from "emoji-picker-react";

interface PolicyPageProps {
  type: "privacy" | "return-policy" | "shipping";
  lang: "en" | "ar";
  storeName: string;
  primaryColor: string | null;
  dbContent: string | null;
  isLoading?: boolean;
}

const DEFAULT_POLICIES = {
  privacy: {
    en: {
      title: "Privacy Policy",
      sections: [
        {
          heading: "Information We Collect",
          emoji: "1F50D",
          content:
            "We collect information you provide directly (name, email, address) and information automatically (cookies, IP address, browsing activity).",
        },
        {
          heading: "How We Use Your Information",
          emoji: "1F4CA",
          content:
            "Your information helps us process orders, communicate with you, improve our service, and comply with legal obligations.",
        },
        {
          heading: "Data Security",
          emoji: "1F512",
          content:
            "We implement industry-standard security measures to protect your personal information from unauthorized access.",
        },
        {
          heading: "Third-Party Sharing",
          emoji: "1F91C",
          content:
            "We only share your information with trusted partners necessary to complete your purchase or comply with law.",
        },
        {
          heading: "Your Rights",
          emoji: "1F64B",
          content:
            "You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.",
        },
      ],
    },
    ar: {
      title: "سياسة الخصوصية",
      sections: [
        {
          heading: "المعلومات التي نجمعها",
          emoji: "1F50D",
          content:
            "نجمع المعلومات التي تزودنا بها مباشرة (الاسم، البريد الإلكتروني، العنوان) والمعلومات التلقائية (ملفات تعريف الارتباط، عنوان IP).",
        },
        {
          heading: "كيفية استخدام معلوماتك",
          emoji: "1F4CA",
          content:
            "تساعدنا معلوماتك في معالجة الطلبات والتواصل معك وتحسين خدمتنا والامتثال للالتزامات القانونية.",
        },
        {
          heading: "أمان البيانات",
          emoji: "1F512",
          content:
            "نطبق إجراءات أمان معيارية لحماية معلوماتك الشخصية من الوصول غير المصرح به.",
        },
        {
          heading: "مشاركة الجهات الثالثة",
          emoji: "1F91C",
          content:
            "نشارك معلوماتك فقط مع الشركاء الموثوقين الضروريين لإكمال عملية الشراء.",
        },
        {
          heading: "حقوقك",
          emoji: "1F64B",
          content:
            "لديك الحق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها. اتصل بنا لممارسة هذه الحقوق.",
        },
      ],
    },
  },
  "return-policy": {
    en: {
      title: "Returns & Exchange",
      sections: [
        {
          heading: "Return Period",
          emoji: "1F552",
          content:
            "Items can be returned within 14 days of purchase. The item must be unused and in original packaging.",
        },
        {
          heading: "How to Request a Return",
          emoji: "1F4DD",
          content:
            "Contact us with your order number and reason for return. We'll provide a return label and instructions.",
        },
        {
          heading: "Refund Processing",
          emoji: "1F4B5",
          content:
            "Once we receive and inspect your item, refunds are processed within 5-7 business days.",
        },
        {
          heading: "Non-Returnable Items",
          emoji: "1F6AB",
          content:
            "Certain items like personalized products, final sale items, or items damaged by misuse cannot be returned.",
        },
        {
          heading: "Exchanges",
          emoji: "1F4E6",
          content:
            "We offer free exchanges for defective items or wrong sizes within 14 days of purchase.",
        },
      ],
    },
    ar: {
      title: "سياسة الاسترجاع والاستبدال",
      sections: [
        {
          heading: "فترة الاسترجاع",
          emoji: "1F552",
          content:
            "يمكن استرجاع المنتجات خلال 14 يوماً من الشراء. يجب أن يكون المنتج غير مستخدم وفي عبوته الأصلية.",
        },
        {
          heading: "طلب الاسترجاع",
          emoji: "1F4DD",
          content:
            "تواصل معنا برقم طلبك وسبب الاسترجاع. سننصحك بتعليمات الاسترجاع وملصق العودة.",
        },
        {
          heading: "معالجة المبلغ المستردّ",
          emoji: "1F4B5",
          content:
            "بعد استقبال وفحص المنتج، يتم معالجة المبلغ المستردّ خلال 5-7 أيام عمل.",
        },
        {
          heading: "المنتجات غير القابلة للاسترجاع",
          emoji: "1F6AB",
          content:
            "بعض المنتجات مثل المنتجات المخصصة أو المنتجات النهائية لا يمكن استرجاعها.",
        },
        {
          heading: "الاستبدال",
          emoji: "1F4E6",
          content:
            "نوفر استبدالاً مجانياً للمنتجات المعيبة أو الأحجام الخاطئة خلال 14 يوم من الشراء.",
        },
      ],
    },
  },
  shipping: {
    en: {
      title: "Shipping & Delivery",
      sections: [
        {
          heading: "Shipping Methods",
          emoji: "1F69A",
          content:
            "We offer standard and express shipping options. Choose at checkout based on your urgency and location.",
        },
        {
          heading: "Delivery Times",
          emoji: "1F552",
          content:
            "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.",
        },
        {
          heading: "Free Shipping",
          emoji: "1F381",
          content:
            "Free shipping on orders over 200,000 LBP. Standard shipping rates apply to smaller orders.",
        },
        {
          heading: "Tracking Your Order",
          emoji: "1F4CD",
          content:
            "You'll receive a tracking number via email once your order ships. Track your package in real time.",
        },
        {
          heading: "Lost or Damaged Packages",
          emoji: "1F4A8",
          content:
            "Contact us immediately with photos if your package arrives damaged. We'll file a claim with the carrier.",
        },
      ],
    },
    ar: {
      title: "الشحن والتوصيل",
      sections: [
        {
          heading: "طرق الشحن",
          emoji: "1F69A",
          content:
            "نوفر خيارات الشحن العادي والسريع. اختر عند الدفع بناءً على احتياجاتك وموقعك.",
        },
        {
          heading: "أوقات التوصيل",
          emoji: "1F552",
          content:
            "الشحن العادي يستغرق 3-5 أيام عمل. الشحن السريع يستغرق 1-2 يوم عمل.",
        },
        {
          heading: "الشحن المجاني",
          emoji: "1F381",
          content:
            "شحن مجاني على الطلبات التي تزيد قيمتها عن 200,000 ليرة لبنانية.",
        },
        {
          heading: "تتبع طلبك",
          emoji: "1F4CD",
          content:
            "ستتلقى رقم تتبع عبر البريد الإلكتروني بعد شحن طلبك. تتبع حزمتك في الوقت الفعلي.",
        },
        {
          heading: "الحزم المفقودة أو التالفة",
          emoji: "1F4A8",
          content:
            "تواصل معنا فوراً مع صور إذا وصلت الحزمة تالفة. سنقدم مطالبة للناقل.",
        },
      ],
    },
  },
};

export default function PolicyPage({
  type,
  lang,
  storeName,
  primaryColor,
  dbContent,
  isLoading = false,
}: PolicyPageProps) {
  const themeStyle = {
    "--brand-primary": primaryColor || "#1F2937",
  } as React.CSSProperties;

  const policy = DEFAULT_POLICIES[type][lang];
  const content = dbContent || null;

  const sections = useMemo(() => {
    if (!content || content.trim() === "") {
      return policy.sections;
    }

    // If content is a plain string (not JSON), wrap it in a single section
    if (!content.trim().startsWith("[") && !content.trim().startsWith("{")) {
      return [
        {
          heading: policy.title,
          emoji: "1F4DD",
          content: content,
        },
      ];
    }

    // Try to parse as JSON
    try {
      return JSON.parse(content);
    } catch {
      // If JSON parsing fails, treat as plain text
      return [
        {
          heading: policy.title,
          emoji: "1F4DD",
          content: content,
        },
      ];
    }
  }, [content, policy]);

  if (isLoading) {
    return (
      <div style={themeStyle} className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 bg-gray-100 rounded w-1/3 animate-pulse"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={themeStyle} className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Title */}
        <h3 className="text-2xl font-semibold text-gray-900 mb-8">
          {policy.title}
        </h3>

        {/* Sections */}
        <div className="space-y-6 text-gray-700 leading-relaxed">
          {sections.map((section: any, idx: number) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-2">
                <Emoji unified={section.emoji} size={20} />
                <h3 className="font-semibold text-gray-900">
                  {section.heading}
                </h3>
              </div>
              {/* Added whitespace-pre-wrap to properly render database line breaks */}
              <p className="text-gray-600 whitespace-pre-wrap">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
