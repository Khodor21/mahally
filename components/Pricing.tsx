"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Emoji } from "emoji-picker-react";

const plans = [
  {
    id: "catalogue",
    name: "الكتالوج",
    nameEn: "Catalogue",
    price: {
      monthly: "$9",
      yearly: "$7",
    },
    period: "/ شهر",
    popular: false,
    cta: "ابدأ الآن",
    outlined: true,

    features: [
      { text: "حتى 50 منتج", included: true },
      { text: "حتى 100 طلب / شهر", included: true },
      { text: "صفحة متجر احترافية", included: true },
      { text: "دومين فرعي مجاني", included: true },
      { text: "دعم عبر الإيميل", included: true },
      { text: "حسابات العملاء", included: false },
      { text: "إشعارات فورية", included: false },
      { text: "تقارير وتحليلات متقدمة", included: false },
    ],
  },

  {
    id: "ecommerce",
    name: "المتجر الكامل",
    nameEn: "Ecommerce",
    price: {
      monthly: "$19",
      yearly: "$15",
    },
    period: "/ شهر",
    popular: true,
    badge: "الأكثر اختياراً",
    cta: "ابدأ 14 يوم مجاناً",

    features: [
      { text: "منتجات غير محدودة", included: true },
      { text: "طلبات غير محدودة", included: true },
      { text: "حسابات العملاء", included: true },
      { text: "إشعارات فورية", included: true },
      { text: "تقارير وتحليلات متقدمة", included: true },
      { text: "دومين فرعي مجاني", included: true },
      { text: "كوبونات وعروض", included: true },
      { text: "دعم واتساب مباشر", included: true },
    ],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section
      id="pricing"
      className="py-8 md:py-18 bg-brand-grey overflow-hidden"
    >
      <div className="w-full mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-brand-light text-brand-dark text-xs font-medium mb-6 shadow-sm">
            الأسعار
          </span>

          <h2
            className="text-[28px] md:text-[60px] leading-[1.15] text-brand-dark mb-4"
            style={{ fontFamily: "Lalezar, cursive" }}
          >
            خطط تناسب كل متجر
          </h2>

          <p className="text-brand-light text-[13px] md:text-[15px] mb-8 font-medium">
            ابدأ بالكتالوج وطوّر متجرك لما تكبر مبيعاتك
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full border border-brand-light bg-brand-white shadow-sm">
            <button
              onClick={() => setYearly(false)}
              className={`h-[38px] px-4 rounded-full text-xs font-bold transition-all duration-300 ${
                !yearly
                  ? "bg-brand-dark text-brand-white shadow-md"
                  : "text-brand-dark/60 hover:text-brand-dark"
              }`}
            >
              شهري
            </button>

            <button
              onClick={() => setYearly(true)}
              className={`h-[38px] px-4 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                yearly
                  ? "bg-brand-dark text-brand-white shadow-md"
                  : "text-brand-dark/60 hover:text-brand-dark"
              }`}
            >
              <span>سنوي</span>

              <span
                className={`text-[9px] px-2 py-1 rounded-full tracking-wide ${
                  yearly
                    ? "bg-brand-white/20 text-brand-white"
                    : "bg-brand-light text-brand-dark"
                }`}
              >
                وفر 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch max-w-3xl mx-auto">
          {plans.map((plan) => {
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative rounded-[28px] p-6 md:p-8 transition-all duration-300 flex flex-col ${
                  isPopular
                    ? "bg-brand-dark text-brand-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] xl:-translate-y-3"
                    : "bg-brand-white border border-brand-light shadow-sm"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-5 left-5">
                    <span className="px-4 py-1.5 rounded-full bg-brand-white text-brand-dark text-[11px] font-bold shadow-sm">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan */}
                <div className="mb-8 mt-2 md:mt-0">
                  <p
                    className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                      isPopular ? "text-brand-white/60" : "text-brand-dark/50"
                    }`}
                  >
                    {plan.nameEn}
                  </p>

                  <h3 className="text-[22px] md:text-[28px] font-bold mb-5">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-end gap-2">
                    <span
                      className="text-[48px] md:text-[52px] leading-none"
                      style={{ fontFamily: "Lalezar, cursive" }}
                    >
                      {yearly ? plan.price.yearly : plan.price.monthly}
                    </span>

                    <span
                      className={`pb-2 text-xs font-medium ${
                        isPopular ? "text-brand-light" : "text-brand-dark/50"
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 flex-1 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`md:w-5 md:h-5 w-4 h-4 rounded-full flex items-center justify-center mt-[3px] shrink-0 ${
                          feature.included
                            ? isPopular
                              ? "bg-brand-white/15"
                              : "bg-brand-light"
                            : "bg-brand-grey"
                        }`}
                      >
                        {feature.included ? (
                          <Check
                            size={12}
                            strokeWidth={3}
                            className={
                              isPopular ? "text-brand-white" : "text-brand-dark"
                            }
                          />
                        ) : (
                          <X
                            size={11}
                            strokeWidth={3}
                            className="text-brand-dark/40"
                          />
                        )}
                      </div>

                      {/* Text */}
                      <span
                        className={`text-[13px] md:text-[14px] leading-relaxed font-medium ${
                          feature.included
                            ? isPopular
                              ? "text-brand-white/90"
                              : "text-brand-dark/90"
                            : "text-brand-dark/40 line-through"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="/onboarding"
                  className={`h-[48px] md:h-[52px] rounded-xl text-[13px] md:text-[14px] font-bold flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 ${
                    isPopular
                      ? "bg-brand-white text-brand-dark hover:opacity-95 shadow-md"
                      : plan.outlined
                        ? "border border-brand-light text-brand-dark hover:bg-brand-dark hover:text-brand-white"
                        : "bg-brand-dark text-brand-white shadow-md"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust */}
        <div className="flex justify-center mt-10">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-[24px] border border-brand-light bg-brand-white px-8 py-5 shadow-sm">
            <div className="flex items-center gap-2.5 text-brand-dark/80 text-sm font-semibold">
              <Emoji unified="1f512" size={18} />
              <span>SSL مجاني</span>
            </div>

            <div className="flex items-center gap-2.5 text-brand-dark/80 text-sm font-semibold">
              <Emoji unified="1f4be" size={18} />
              <span>نسخ احتياطي يومي</span>
            </div>

            <div className="flex items-center gap-2.5 text-brand-dark/80 text-sm font-semibold">
              <Emoji unified="1f504" size={18} />
              <span>تحديثات مجانية</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
