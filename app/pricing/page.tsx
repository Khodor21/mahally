"use client";
import { useState, useEffect } from "react";
import { Check, X, Zap, HelpCircle, Building2, Timer } from "lucide-react";
import { Emoji } from "emoji-picker-react";
import Navbar from "../../components/Navbar";
import WhatsAppFloat from "../../components/WhatsAppFloat";
import ScrollToTop from "../../components/ScrollToTop";

// ─── Data ────────────────────────────────────────────────────────────────────
const plans = [
  {
    id: "catalogue",
    name: "الكتالوج",
    nameEn: "Catalogue",
    price: {
      monthly: "$10",
      baseYearly: "$120", // 10 * 12
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
      baseYearly: "$204", // 17 * 12
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

const faqItems = [
  {
    q: "هل يوجد عقد أو التزام طويل الأمد؟",
    a: "لا. يمكنك إلغاء اشتراكك في أي وقت. نوصي بالخطة السنوية لتوفير مبالغ كبيرة لكنها ليست إلزامية.",
  },
  {
    q: "هل يمكنني تغيير خطتي لاحقاً؟",
    a: "نعم، يمكنك الترقية أو التخفيض في أي وقت. يتم احتساب الفارق بشكل تناسبي.",
  },
  {
    q: "ما طرق الدفع المقبولة؟",
    a: "نقبل الدفع عبر Whish Money وBob Finance وبطاقات الائتمان الدولية.",
  },
  {
    q: "ماذا يحدث بعد انتهاء الـ 5 أيّام؟",
    a: "بعد انتهاء الفترة التجريبية، تُختار خطتك تلقائياً ويتم إشعارك قبل أي خصم.",
  },
];

const comparisonRows = [
  { label: "المنتجات", catalogue: "حتى 200", ecommerce: "غير محدودة" },
  { label: "الطلبات / شهر", catalogue: "حتى 150", ecommerce: "غير محدودة" },
  { label: "حسابات العملاء", catalogue: false, ecommerce: true },
  { label: "إشعارات فورية", catalogue: false, ecommerce: true },
  { label: "تقارير متقدمة", catalogue: false, ecommerce: true },
  { label: "كوبونات وعروض", catalogue: true, ecommerce: true },
  { label: "دعم واتساب مباشر", catalogue: true, ecommerce: true },
  { label: "دومين فرعي مجاني", catalogue: true, ecommerce: true },
  { label: "SSL مجاني", catalogue: true, ecommerce: true },
  { label: "نسخ احتياطي يومي", catalogue: true, ecommerce: true },
];

// ─── Components ──────────────────────────────────────────────────────────────
function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return (
      <span className="text-brand-dark text-[13px] md:text-sm font-semibold">
        {value}
      </span>
    );
  }
  return value ? (
    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-brand-light flex items-center justify-center mx-auto">
      <Check size={12} strokeWidth={3} className="text-brand-dark" />
    </div>
  ) : (
    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-brand-grey flex items-center justify-center mx-auto">
      <X size={11} strokeWidth={3} className="text-brand-dark/30" />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [showMonthly, setShowMonthly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Countdown timer logic (18 days from now - static simulation for UI)
  const [timeLeft, setTimeLeft] = useState({ days: 18, hours: 0, minutes: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59 };
        if (prev.days > 0)
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 };
        return prev;
      });
    }, 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-brand-grey" dir="rtl" lang="ar">
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="pt-24 pb-6 md:pt-32 md:pb-8 text-center px-4 md:px-5">
          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-brand-light text-brand-dark text-xs font-bold mb-5 md:mb-6 shadow-sm">
            الأسعار
          </span>
          <h1
            className="text-[28px] md:text-[64px] leading-[1.2] md:leading-[1.1] text-brand-dark mb-4 max-w-2xl mx-auto"
            style={{ fontFamily: "Lalezar, cursive" }}
          >
            باقات متكاملة لانطلاقة كل تاجر
          </h1>
          <p className="text-brand-dark/90 text-[14px] md:text-[16px] mb-8 font-medium max-w-md mx-auto px-2">
            بدّل متجرك من فكرة لمشروع حقيقي. ابدأ مجاناً 5 أيّام، بدون بطاقة
            ائتمانية.
          </p>

          {/* Discount Countdown Banner */}
          {!showMonthly && (
            <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-300 via-red-500 to-red-300 animate-pulse"></div>
              <div className="flex flex-col items-center text-center gap-1">
                <div className="flex items-center gap-1.5 text-red-600 font-bold text-sm md:text-base">
                  <Timer size={18} className="animate-spin-slow" />
                  <span>عرض محدود على الدفع السنوي!</span>
                </div>
                <span className="text-red-700/80 text-xs font-semibold">
                  وفّر حتى 50$ مقارنة بالدفع الشهري
                </span>
              </div>
              <div
                className="flex items-center gap-3 text-red-700 text-lg md:text-xl font-mono font-bold"
                dir="ltr"
              >
                <div className="flex flex-col items-center">
                  <span className="bg-red-100 px-3 py-1.5 rounded-lg min-w-[40px] text-center shadow-sm">
                    {timeLeft.days}
                  </span>
                  <span className="text-[10px] font-sans text-red-500 mt-1">
                    أيام
                  </span>
                </div>{" "}
                :
                <div className="flex flex-col items-center">
                  <span className="bg-red-100 px-3 py-1.5 rounded-lg min-w-[40px] text-center shadow-sm">
                    {timeLeft.hours.toString().padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-sans text-red-500 mt-1">
                    ساعات
                  </span>
                </div>{" "}
                :
                <div className="flex flex-col items-center">
                  <span className="bg-red-100 px-3 py-1.5 rounded-lg min-w-[40px] text-center shadow-sm">
                    {timeLeft.minutes.toString().padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-sans text-red-500 mt-1">
                    دقائق
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full border border-brand-light bg-brand-white shadow-sm mb-2 md:mb-3">
            <button
              onClick={() => setShowMonthly(false)}
              className={`h-[40px] px-4 md:px-5 rounded-full text-[13px] md:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 md:gap-2 ${
                !showMonthly
                  ? "bg-brand-dark text-brand-white shadow-md"
                  : "text-brand-dark/60 hover:text-brand-dark"
              }`}
            >
              <span>سنوي</span>
              <span
                className={`text-[9px] md:text-[10px] px-1.5 py-0.5 md:px-2 rounded-full tracking-wide whitespace-nowrap ${
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
              className={`h-[40px] px-6 md:px-8 rounded-full text-[13px] md:text-sm font-bold transition-all duration-300 ${
                showMonthly
                  ? "bg-brand-dark text-brand-white shadow-md"
                  : "text-brand-dark/60 hover:text-brand-dark"
              }`}
            >
              شهري
            </button>
          </div>
        </section>

        {/* ── Cards ── */}
        <section className="py-4 px-4 md:px-10">
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
                href="/contact"
                className="w-full md:w-auto px-6 md:px-8 h-[44px] md:h-[48px] rounded-xl bg-brand-dark text-brand-white text-[13px] md:text-[14px] font-bold flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 shadow-md whitespace-nowrap shrink-0"
              >
                تواصل معنا للتفصيل
              </a>
            </div>

            {/* Main Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-stretch mt-2 md:mt-4">
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
                    {plan.badge && (
                      <div className="absolute top-4 left-4 md:top-5 md:left-5">
                        <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-brand-white text-brand-dark text-[10px] md:text-[11px] font-bold shadow-sm">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <div className="mb-6 md:mb-8 mt-2 md:mt-0">
                      <p
                        className={`text-[11px] md:text-xs font-bold uppercase tracking-wider mb-1.5 md:mb-2 ${
                          isPopular
                            ? "text-brand-white/60"
                            : "text-brand-dark/50"
                        }`}
                      >
                        {plan.nameEn}
                      </p>
                      <h3 className="text-[20px] md:text-[28px] font-bold mb-1">
                        {plan.name}
                      </h3>
                      <p
                        className={`text-[12px] md:text-xs mb-4 md:mb-5 ${
                          isPopular
                            ? "text-brand-white/50"
                            : "text-brand-dark/40"
                        }`}
                      >
                        {plan.description}
                      </p>

                      {/* Price Display */}
                      <div className="flex flex-col gap-1.5 md:gap-1">
                        {/* Savings Badge */}
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

                        {/* Yearly Note */}
                        {isYearly && plan.yearlyNote && (
                          <div
                            className={`text-[11px] md:text-[12px] font-bold w-fit ${
                              isPopular ? "text-green-300" : "text-green-600"
                            }`}
                          >
                            <Zap size={12} className="inline-block ml-1" />
                            {plan.yearlyNote}
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

                        {/* Crossed-out Base Price */}
                        {isYearly && (
                          <div
                            className={`text-[12px] md:text-sm mt-1 font-medium ${isPopular ? "text-brand-white/50" : "text-brand-dark/50"}`}
                          >
                            بدلاً من{" "}
                            <span className="line-through">
                              {plan.price.baseYearly}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

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

          {/* Trust bar */}
          <div className="flex justify-center mt-8 md:mt-10">
            <div className="flex flex-wrap items-center justify-center gap-x-5 md:gap-x-8 gap-y-3 md:gap-y-4 rounded-[20px] md:rounded-[24px] border border-brand-light bg-brand-white px-5 md:px-8 py-4 md:py-5 shadow-sm max-w-full">
              <div className="flex items-center gap-2 md:gap-2.5 text-brand-dark/80 text-[12px] md:text-sm font-semibold">
                <Emoji unified="1f512" size={16} />
                <span>SSL مجاني</span>
              </div>
              <div className="flex items-center gap-2 md:gap-2.5 text-brand-dark/80 text-[12px] md:text-sm font-semibold">
                <Emoji unified="1f4be" size={16} />
                <span>نسخ يومي</span>
              </div>
              <div className="flex items-center gap-2 md:gap-2.5 text-brand-dark/80 text-[12px] md:text-sm font-semibold">
                <Emoji unified="1f504" size={16} />
                <span>تحديثات مجانية</span>
              </div>
              <div className="flex items-center gap-2 md:gap-2.5 text-brand-dark/80 text-[12px] md:text-sm font-semibold">
                <Emoji unified="274c" size={16} />
                <span>بدون عقود</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="py-12 md:py-20 px-4 md:px-10">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <div className="text-center mb-8 md:mb-10 w-full">
              <h2
                className="text-[24px] md:text-[40px] text-brand-dark"
                style={{ fontFamily: "Lalezar, cursive" }}
              >
                قارن بين الخطط
              </h2>
            </div>

            {/* Scrollable container for mobile table */}
            <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="min-w-[600px] md:min-w-0 rounded-[20px] md:rounded-[24px] overflow-hidden border border-brand-light bg-brand-white shadow-sm">
                <div className="grid grid-cols-3 bg-brand-dark text-brand-white">
                  <div className="py-3 md:py-4 px-4 md:px-5 text-[13px] md:text-sm font-bold">
                    الميزة
                  </div>
                  <div className="py-3 md:py-4 px-4 md:px-5 text-center text-[13px] md:text-sm font-bold border-r border-brand-white/10">
                    الكتالوج
                  </div>
                  <div className="py-3 md:py-4 px-4 md:px-5 text-center text-[13px] md:text-sm font-bold border-r border-brand-white/10">
                    المتجر الكامل
                  </div>
                </div>
                {comparisonRows.map((row, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-3 border-t border-brand-light ${
                      i % 2 === 0 ? "bg-brand-white" : "bg-brand-grey/40"
                    }`}
                  >
                    <div className="py-3 md:py-3.5 px-4 md:px-5 text-[12px] md:text-sm font-medium text-brand-dark/80 flex items-center">
                      {row.label}
                    </div>
                    <div className="py-3 md:py-3.5 px-4 md:px-5 flex items-center justify-center border-r border-brand-light">
                      <CellValue value={row.catalogue} />
                    </div>
                    <div className="py-3 md:py-3.5 px-4 md:px-5 flex items-center justify-center border-r border-brand-light">
                      <CellValue value={row.ecommerce} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="pb-16 md:pb-20 px-4 md:px-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2
                className="text-[24px] md:text-[40px] text-brand-dark"
                style={{ fontFamily: "Lalezar, cursive" }}
              >
                أسئلة شائعة
              </h2>
            </div>
            <div className="space-y-2.5 md:space-y-3">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className="rounded-[16px] md:rounded-[18px] border border-brand-light bg-brand-white overflow-hidden shadow-sm"
                >
                  <button
                    className="w-full text-right px-5 md:px-6 py-3.5 md:py-4 flex items-center justify-between gap-3 md:gap-4"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-[13px] md:text-[14px] font-bold text-brand-dark leading-snug">
                      {item.q}
                    </span>
                    <HelpCircle
                      size={18}
                      className={`shrink-0 transition-colors ${
                        openFaq === i ? "text-brand-dark" : "text-brand-dark/30"
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 md:px-6 pb-4 md:pb-5 text-[12px] md:text-[13px] text-brand-dark/70 leading-relaxed font-medium border-t border-brand-light pt-3 md:pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <WhatsAppFloat />
      <ScrollToTop />
    </div>
  );
}
