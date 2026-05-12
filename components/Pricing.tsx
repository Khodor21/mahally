"use client";
import { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";

const plans = [
  {
    id: "starter",
    name: "المبتدئ",
    nameEn: "Starter",
    price: { monthly: "مجاني", yearly: "مجاني" },
    period: "للأبد",
    tag: null,
    popular: false,
    cta: "ابدأ مجاناً",
    ctaSecondary: true,
    features: [
      { text: "متجر واحد", included: true },
      { text: "حتى 10 منتجات", included: true },
      { text: "قالب واحد", included: true },
      { text: "دومين فرعي (yourstore.محلي.lb)", included: true },
      { text: "دعم عبر الإيميل", included: true },
      { text: "دومين خاص", included: false },
      { text: "تقارير متقدمة", included: false },
      { text: "تكامل مع الشحن", included: false },
    ],
  },
  {
    id: "growth",
    name: "النمو",
    nameEn: "Growth",
    price: { monthly: "$19", yearly: "$15" },
    period: "/ شهر",
    tag: "وفّر 20% مع الاشتراك السنوي",
    popular: true,
    cta: "جرب 14 يوم مجاناً ←",
    ctaSecondary: false,
    features: [
      { text: "متجر واحد", included: true },
      { text: "حتى 500 منتج", included: true },
      { text: "كل القوالب", included: true },
      { text: "دومين خاص مجاناً", included: true },
      { text: "تقارير كاملة", included: true },
      { text: "تكامل مع الشحن والدفع", included: true },
      { text: "دعم واتساب وشات", included: true },
      { text: "SEO Tools", included: true },
    ],
  },
  {
    id: "pro",
    name: "الاحترافي",
    nameEn: "Pro",
    price: { monthly: "$49", yearly: "$39" },
    period: "/ شهر",
    tag: null,
    popular: false,
    cta: "تواصل معنا",
    ctaSecondary: true,
    features: [
      { text: "متاجر متعددة", included: true },
      { text: "منتجات غير محدودة", included: true },
      { text: "كل مميزات النمو", included: true },
      { text: "API Access", included: true },
      { text: "Manager Account", included: true },
      { text: "تقارير وتحليلات متقدمة", included: true },
      { text: "أولوية الدعم الفني", included: true },
      { text: "Custom domain", included: true },
    ],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="py-20 md:py-28 bg-[#FDF6EC]" id="pricing">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-[#C8392B]/10 text-[#C8392B] rounded-full px-5 py-2 text-sm font-semibold mb-5">
            الأسعار
          </span>
          <h2
            className="text-[32px] md:text-[38px] font-bold text-[#1E1E1E] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            أسعار بتناسب كل تاجر
          </h2>
          <p className="text-[18px] text-[#6B6B6B] font-medium mb-8">
            ابدأ مجاناً — اشترك لما تكون جاهز
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white rounded-full p-1.5 border border-[#E8E0D5] shadow-sm">
            <button
              onClick={() => setYearly(false)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                !yearly
                  ? "bg-[#C8392B] text-white shadow-md"
                  : "text-[#6B6B6B] hover:text-[#1E1E1E]"
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                yearly
                  ? "bg-[#C8392B] text-white shadow-md"
                  : "text-[#6B6B6B] hover:text-[#1E1E1E]"
              }`}
            >
              <span>سنوي</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${yearly ? "bg-white/20 text-white" : "bg-[#2ECC71]/15 text-[#2A5C45]"}`}
              >
                وفّر 20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl flex flex-col ${
                plan.popular
                  ? "pricing-popular text-white shadow-2xl shadow-[#C8392B]/30 scale-[1.02] md:scale-105 z-10"
                  : "bg-white border border-[#E8E0D5] shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#E8A838] text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-md whitespace-nowrap">
                    ⭐ الأكثر شيوعاً
                  </span>
                </div>
              )}

              <div className="p-7 flex flex-col h-full">
                {/* Plan name */}
                <div className="mb-6">
                  <p
                    className={`text-sm font-semibold mb-1 ${plan.popular ? "text-white/70" : "text-[#6B6B6B]"}`}
                  >
                    {plan.nameEn}
                  </p>
                  <h3
                    className={`text-[22px] font-bold ${plan.popular ? "text-white" : "text-[#1E1E1E]"}`}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {plan.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span
                      className={`text-[44px] font-bold leading-none ${plan.popular ? "text-white" : "text-[#1E1E1E]"}`}
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {yearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.period !== "للأبد" && (
                      <span
                        className={`text-sm pb-2 ${plan.popular ? "text-white/70" : "text-[#6B6B6B]"}`}
                      >
                        {plan.period}
                      </span>
                    )}
                    {plan.period === "للأبد" && (
                      <span
                        className={`text-sm pb-2 ${plan.popular ? "text-white/70" : "text-[#6B6B6B]"}`}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {plan.tag && yearly && (
                    <p className="text-[#E8A838] text-xs font-semibold mt-2 bg-[#E8A838]/10 rounded-lg px-3 py-1 inline-block">
                      {plan.tag}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div
                  className={`h-px mb-6 ${plan.popular ? "bg-white/20" : "bg-[#E8E0D5]"}`}
                />

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {f.included ? (
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            plan.popular ? "bg-white/20" : "bg-[#2ECC71]/15"
                          }`}
                        >
                          <FiCheck
                            size={11}
                            className={
                              plan.popular ? "text-white" : "text-[#2ECC71]"
                            }
                            strokeWidth={3}
                          />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#E8E0D5] flex items-center justify-center flex-shrink-0">
                          <FiX
                            size={10}
                            className="text-[#6B6B6B]"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                      <span
                        className={`text-[14px] ${
                          f.included
                            ? plan.popular
                              ? "text-white/90"
                              : "text-[#1E1E1E]"
                            : "text-[#6B6B6B] line-through"
                        }`}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="#"
                  className={`block w-full text-center py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5 ${
                    plan.popular
                      ? "bg-white text-[#C8392B] hover:bg-[#FDF6EC] shadow-md"
                      : plan.ctaSecondary
                        ? "border-2 border-[#C8392B] text-[#C8392B] hover:bg-[#C8392B] hover:text-white"
                        : "bg-[#C8392B] text-white hover:bg-[#a82e22] shadow-md"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-10 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-white rounded-2xl px-8 py-5 border border-[#E8E0D5] shadow-sm">
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
              <span>🔒</span>
              <span>SSL مجاني</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-[#E8E0D5]" />
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
              <span>💾</span>
              <span>نسخ احتياطي تلقائي</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-[#E8E0D5]" />
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
              <span>🔄</span>
              <span>تحديثات مجانية</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-[#E8E0D5]" />
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
              <span>💳</span>
              <span>بتقدر تدفع بالليرة اللبنانية أو الدولار</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
