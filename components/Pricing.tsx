"use client";

import { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";

const plans = [
  {
    id: "starter",
    name: "المبتدئ",
    nameEn: "Starter",
    price: {
      monthly: "مجاني",
      yearly: "مجاني",
    },
    period: "للأبد",
    popular: false,
    cta: "ابدأ مجاناً",
    outlined: true,

    features: [
      { text: "متجر واحد", included: true },
      { text: "حتى 10 منتجات", included: true },
      { text: "قالب واحد", included: true },
      { text: "دومين فرعي مجاني", included: true },
      { text: "دعم عبر الإيميل", included: true },
      { text: "دومين خاص", included: false },
      { text: "تقارير متقدمة", included: false },
      { text: "تكامل شحن ودفع", included: false },
    ],
  },

  {
    id: "growth",
    name: "النمو",
    nameEn: "Growth",
    price: {
      monthly: "$19",
      yearly: "$15",
    },
    period: "/ شهر",
    popular: true,
    badge: "الأكثر اختياراً",
    cta: "ابدأ 14 يوم مجاناً",

    features: [
      { text: "حتى 500 منتج", included: true },
      { text: "كل القوالب", included: true },
      { text: "دومين خاص مجاني", included: true },
      { text: "تقارير كاملة", included: true },
      { text: "تكامل شحن ودفع", included: true },
      { text: "دعم واتساب مباشر", included: true },
      { text: "SEO متقدم", included: true },
      { text: "برنامج أفلييت", included: true },
    ],
  },

  {
    id: "pro",
    name: "الاحترافي",
    nameEn: "Pro",
    price: {
      monthly: "$49",
      yearly: "$39",
    },
    period: "/ شهر",
    popular: false,
    cta: "تواصل معنا",
    outlined: true,

    features: [
      { text: "متاجر متعددة", included: true },
      { text: "منتجات غير محدودة", included: true },
      { text: "كل مميزات النمو", included: true },
      { text: "API Access", included: true },
      { text: "صلاحيات فريق", included: true },
      { text: "تحليلات متقدمة", included: true },
      { text: "أولوية بالدعم", included: true },
      { text: "دومين مخصص", included: true },
    ],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-brand-grey overflow-hidden">
      <div className="w-full mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <span className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-brand-light text-brand-dark text-sm font-medium mb-6">
            الأسعار
          </span>

          <h2
            className="text-[34px] md:text-[64px] leading-[1.15] text-brand-dark mb-4"
            style={{ fontFamily: "Lalezar, cursive" }}
          >
            خطط تناسب كل متجر
          </h2>

          <p className="text-brand-dark/70 text-[16px] md:text-[18px] leading-[1.9] mb-8">
            ابدأ مجاناً وطوّر متجرك لما تكبر مبيعاتك
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full border border-brand-light bg-brand-white">
            <button
              onClick={() => setYearly(false)}
              className={`h-[46px] px-6 rounded-full text-sm font-semibold transition-all duration-300 ${
                !yearly
                  ? "bg-brand-dark text-brand-white"
                  : "text-brand-dark/60 hover:text-brand-dark"
              }`}
            >
              شهري
            </button>

            <button
              onClick={() => setYearly(true)}
              className={`h-[46px] px-6 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                yearly
                  ? "bg-brand-dark text-brand-white"
                  : "text-brand-dark/60 hover:text-brand-dark"
              }`}
            >
              <span>سنوي</span>

              <span
                className={`text-[11px] px-2 py-1 rounded-full ${
                  yearly
                    ? "bg-brand-white/10 text-brand-white"
                    : "bg-brand-light text-brand-dark"
                }`}
              >
                وفر 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan) => {
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative rounded-[34px] p-6 md:p-8 transition-all duration-300 flex flex-col ${
                  isPopular
                    ? "bg-brand-dark text-brand-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] xl:-translate-y-3"
                    : "bg-brand-white border border-brand-light"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-5 left-5">
                    <span className="px-4 py-2 rounded-full bg-brand-white text-brand-dark text-xs font-bold">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan */}
                <div className="mb-8">
                  <p
                    className={`text-sm mb-2 ${
                      isPopular ? "text-brand-white/60" : "text-brand-dark/50"
                    }`}
                  >
                    {plan.nameEn}
                  </p>

                  <h3 className="text-[28px] font-bold mb-5">{plan.name}</h3>

                  {/* Price */}
                  <div className="flex items-end gap-2">
                    <span
                      className="text-[52px] leading-none"
                      style={{ fontFamily: "Lalezar, cursive" }}
                    >
                      {yearly ? plan.price.yearly : plan.price.monthly}
                    </span>

                    <span
                      className={`pb-2 text-sm ${
                        isPopular ? "text-brand-white/60" : "text-brand-dark/50"
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
                        className={`w-5 h-5 rounded-full flex items-center justify-center mt-[2px] shrink-0 ${
                          feature.included
                            ? isPopular
                              ? "bg-brand-white/10"
                              : "bg-brand-light"
                            : "bg-brand-grey"
                        }`}
                      >
                        {feature.included ? (
                          <FiCheck
                            size={12}
                            strokeWidth={3}
                            className={
                              isPopular ? "text-brand-white" : "text-brand-dark"
                            }
                          />
                        ) : (
                          <FiX
                            size={11}
                            strokeWidth={3}
                            className="text-brand-dark/40"
                          />
                        )}
                      </div>

                      {/* Text */}
                      <span
                        className={`text-[15px] leading-[1.9] ${
                          feature.included
                            ? isPopular
                              ? "text-brand-white/85"
                              : "text-brand-dark/80"
                            : "text-brand-dark/35 line-through"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="#"
                  className={`h-[56px] rounded-2xl text-[15px] font-bold flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 ${
                    isPopular
                      ? "bg-brand-white text-brand-dark hover:opacity-90"
                      : plan.outlined
                        ? "border border-brand-light text-brand-dark hover:bg-brand-dark hover:text-brand-white"
                        : "bg-brand-dark text-brand-white"
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
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-[28px] border border-brand-light bg-brand-white px-6 py-5">
            <div className="flex items-center gap-2 text-brand-dark/70 text-sm">
              <span>🔒</span>
              <span>SSL مجاني</span>
            </div>

            <div className="flex items-center gap-2 text-brand-dark/70 text-sm">
              <span>💾</span>
              <span>نسخ احتياطي يومي</span>
            </div>

            <div className="flex items-center gap-2 text-brand-dark/70 text-sm">
              <span>🔄</span>
              <span>تحديثات مجانية</span>
            </div>

            <div className="flex items-center gap-2 text-brand-dark/70 text-sm">
              <span>💳</span>
              <span>دفع بالدولار أو الليرة</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
