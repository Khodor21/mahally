"use client";

import { useState } from "react";
import { Check, X, Building2, Timer } from "lucide-react";
import { Emoji } from "emoji-picker-react";

const plans = [
  {
    id: "catalogue",
    name: "الكتالوج",
    nameEn: "Catalogue",
    price: {
      monthly: "$10",
      baseYearly: "$120",
      yearlyDiscounted: "$89",
    },
    savings: "$31",
    yearlyNote: "شهرين وشوي مجاناً!",
    popular: false,
    cta: "ابدأ الآن",
    outlined: true,
    description: "للمتاجر الصغيرة والكتالوجات",
    features: [
      { text: "حتى 200 منتج", included: true },
      { text: "حتى 150 طلب / شهر", included: true },
      { text: "صفحة متجر احترافية", included: true },
      { text: "دومين فرعي مجاني", included: true },
      { text: "كوبونات وعروض", included: true },
      { text: "دعم واتساب مباشر", included: true },
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
      monthly: "$17",
      baseYearly: "$204",
      yearlyDiscounted: "$154",
    },
    savings: "$50",
    yearlyNote: "شهرين مجاناً!",
    popular: true,
    badge: "الأكثر اختياراً",
    cta: "ابدأ 5 أيّام مجاناً",
    description: "للمتاجر الجادة بالنمو والمبيعات",
    features: [
      { text: "منتجات غير محدودة", included: true },
      { text: "طلبات غير محدودة", included: true },
      { text: "حسابات العملاء", included: true },
      { text: "إشعارات فورية", included: true },
      { text: "تقارير وتحليلات متقدمة", included: true },
      { text: "دومين فرعي مجاني", included: true },
      { text: "كوبونات وعروض", included: true },
      { text: "دعم واتساب مباشر", included: true },
      { text: "نسخ احتياطي يومي", included: true },
      { text: "SSL مجاني", included: true },
    ],
  },
];

export default function Pricing() {
  // Yearly shown first for client (yearly = false means yearly is active)
  const [showMonthly, setShowMonthly] = useState(false);

  return (
    <section
      id="pricing"
      className="py-8 md:py-18 bg-brand-grey overflow-hidden"
    >
      <div className="w-full mx-auto px-4 md:px-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-brand-light text-brand-dark text-xs font-bold mb-5 md:mb-6 shadow-sm">
            الأسعار
          </span>

          <h2
            className="text-[28px] md:text-[60px] leading-[1.15] text-brand-dark mb-4"
            style={{ fontFamily: "Lalezar, cursive" }}
          >
            خطط تناسب كل متجر
          </h2>

          <p className="text-brand-dark/90 text-[13px] md:text-[15px] mb-8 font-medium px-2">
            ابدأ بالكتالوج وطوّر متجرك لما تكبر مبيعاتك
          </p>

          {/* Discount Countdown Banner */}
          {!showMonthly && (
            <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 rounded-2xl p-3.5 flex flex-col items-center justify-center gap-2 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-300 via-red-500 to-red-300 animate-pulse"></div>
              <div className="flex items-center gap-1.5 text-red-600 font-bold text-sm">
                <Timer size={16} className="animate-spin-slow" />
                <span>عرض لفترة محدودة على الدفع السنوي!</span>
              </div>
              <span className="text-red-700/80 text-xs font-semibold">
                وفّر حتى 50$ مقارنة بالدفع الشهري
              </span>
            </div>
          )}

          {/* Toggle (Yearly first) */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full border border-brand-light bg-brand-white shadow-sm">
            <button
              onClick={() => setShowMonthly(false)}
              className={`h-[38px] px-4 md:px-5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                !showMonthly
                  ? "bg-brand-dark text-brand-white shadow-md"
                  : "text-brand-dark/60 hover:text-brand-dark"
              }`}
            >
              <span>سنوي</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full tracking-wide ${
                  !showMonthly
                    ? "bg-red-500 text-white"
                    : "bg-red-100 text-red-600"
                }`}
              >
                خصم إضافي
              </span>
            </button>

            <button
              onClick={() => setShowMonthly(true)}
              className={`h-[38px] px-5 rounded-full text-xs font-bold transition-all duration-300 ${
                showMonthly
                  ? "bg-brand-dark text-brand-white shadow-md"
                  : "text-brand-dark/60 hover:text-brand-dark"
              }`}
            >
              شهري
            </button>
          </div>
        </div>

        {/* Pricing Cards Container */}
        <div className="max-w-3xl mx-auto flex flex-col gap-6 items-stretch">
          {/* Custom Plan Card (Top) */}
          <div className="w-full bg-brand-white border-2 border-brand-dark/10 rounded-[24px] md:rounded-[28px] p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm hover:shadow-md transition-shadow text-center md:text-right">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5 w-full">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-brand-light flex items-center justify-center shrink-0">
                <Building2 size={28} className="text-brand-dark" />
              </div>
              <div>
                <h3 className="text-[18px] md:text-[24px] font-bold mb-1 text-brand-dark">
                  باقة الشركات والمؤسسات
                </h3>
                <p className="text-brand-dark/60 text-[13px] md:text-sm font-medium leading-relaxed">
                  للمؤسسات الكبرى، المتاجر ذات الفروع المتعددة، والمتطلبات
                  الخاصة.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/+96171708103"
              className="w-full md:w-auto px-6 md:px-8 h-[44px] md:h-[48px] rounded-xl bg-brand-dark text-brand-white text-[13px] md:text-[14px] font-bold flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 shadow-md whitespace-nowrap shrink-0"
            >
              تواصل معنا للتفصيل
            </a>
          </div>

          {/* Main Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-stretch">
            {plans.map((plan) => {
              const isPopular = plan.popular;
              const isYearly = !showMonthly;
              const displayPrice = isYearly
                ? plan.price.yearlyDiscounted
                : plan.price.monthly;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-[24px] md:rounded-[28px] p-5 md:p-8 transition-all duration-300 flex flex-col ${
                    isPopular
                      ? "bg-brand-dark text-brand-white shadow-[0_15px_40px_rgba(0,0,0,0.15)] md:-translate-y-2"
                      : "bg-brand-white border border-brand-light shadow-sm"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute top-4 left-4 md:top-5 md:left-5">
                      <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-brand-white text-brand-dark text-[10px] md:text-[11px] font-bold shadow-sm">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Info */}
                  <div className="mb-6 md:mb-8 mt-2 md:mt-0">
                    <p
                      className={`text-[11px] md:text-xs font-bold uppercase tracking-wider mb-1.5 md:mb-2 ${
                        isPopular ? "text-brand-white/60" : "text-brand-dark/50"
                      }`}
                    >
                      {plan.nameEn}
                    </p>

                    <h3 className="text-[20px] md:text-[28px] font-bold mb-1">
                      {plan.name}
                    </h3>

                    <p
                      className={`text-[12px] md:text-xs mb-4 md:mb-5 ${
                        isPopular ? "text-brand-white/50" : "text-brand-dark/40"
                      }`}
                    >
                      {plan.description}
                    </p>

                    {/* Price Section */}
                    <div className="flex flex-col gap-1.5 md:gap-1">
                      {isYearly && (
                        <div
                          className={`text-[11px] md:text-[12px] font-bold px-3 py-1 rounded-full w-fit mb-1 ${
                            isPopular
                              ? "bg-red-500/20 text-red-200"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          🔥 وفر {plan.savings} مقارنة بالشهري
                        </div>
                      )}

                      {isYearly && plan.yearlyNote && (
                        <div
                          className={`text-[11px] md:text-[12px] font-bold w-fit ${
                            isPopular ? "text-green-300" : "text-green-600"
                          }`}
                        >
                          <span>{plan.yearlyNote}</span>
                        </div>
                      )}

                      <div className="flex items-end gap-1.5 md:gap-2 mt-1 md:mt-2">
                        <span
                          className="text-[40px] md:text-[52px] leading-none"
                          style={{ fontFamily: "Lalezar, cursive" }}
                        >
                          {displayPrice}
                        </span>

                        <span
                          className={`pb-1.5 md:pb-2 text-[11px] md:text-xs font-medium ${
                            isPopular
                              ? "text-brand-white/50"
                              : "text-brand-dark/40"
                          }`}
                        >
                          {isYearly ? "/ سنوياً" : "/ شهر"}
                        </span>
                      </div>

                      {isYearly && (
                        <div
                          className={`text-[12px] md:text-sm mt-1 font-medium ${
                            isPopular
                              ? "text-brand-white/50"
                              : "text-brand-dark/50"
                          }`}
                        >
                          بدلاً من{" "}
                          <span className="line-through">
                            {plan.price.baseYearly}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3.5 flex-1 mb-6 md:mb-8">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2.5 md:gap-3"
                      >
                        <div
                          className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center mt-[2px] md:mt-[3px] shrink-0 ${
                            feature.included
                              ? isPopular
                                ? "bg-brand-white/15"
                                : "bg-brand-light"
                              : "bg-brand-grey"
                          }`}
                        >
                          {feature.included ? (
                            <Check
                              size={11}
                              strokeWidth={3}
                              className={
                                isPopular
                                  ? "text-brand-white"
                                  : "text-brand-dark"
                              }
                            />
                          ) : (
                            <X
                              size={10}
                              strokeWidth={3}
                              className="text-brand-dark/40"
                            />
                          )}
                        </div>

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
                    className={`h-[44px] md:h-[52px] rounded-xl text-[13px] md:text-[14px] font-bold flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 ${
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
        </div>

        {/* Bottom Trust */}
        <div className="flex justify-center mt-8 md:mt-10">
          <div className="flex flex-wrap items-center justify-center gap-x-5 md:gap-x-8 gap-y-3 md:gap-y-4 rounded-[20px] md:rounded-[24px] border border-brand-light bg-brand-white px-5 md:px-8 py-4 md:py-5 shadow-sm max-w-full">
            <div className="flex items-center gap-2 md:gap-2.5 text-brand-dark/80 text-[12px] md:text-sm font-semibold">
              <Emoji unified="1f512" size={16} />
              <span>SSL مجاني</span>
            </div>

            <div className="flex items-center gap-2 md:gap-2.5 text-brand-dark/80 text-[12px] md:text-sm font-semibold">
              <Emoji unified="1f4be" size={16} />
              <span>نسخ احتياطي يومي</span>
            </div>

            <div className="flex items-center gap-2 md:gap-2.5 text-brand-dark/80 text-[12px] md:text-sm font-semibold">
              <Emoji unified="1f504" size={16} />
              <span>تحديثات مجانية</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
