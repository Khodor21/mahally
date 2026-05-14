"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const faqs = [
  {
    q: "شو بدي أعرف تقنياً لأفتح متجري؟",
    a: "ولا شي! المنصة مصممة لحدا ما عنده أي خلفية تقنية أو تصميم. إذا بتعرف تحط صورة على واتساب — بتعرف تشغل منصتنا.",
  },
  {
    q: "شو إذا مش عاجبني بعد ما جربت؟",
    a: "إذا اشتركت ومش راضي — بترجعلك مصاريك كاملة خلال 30 يوم.",
  },
  {
    q: "بيشتغل المتجر صح على الموبايل؟",
    a: "طبعاً! كل المتاجر responsive وبتبان ممتاز على الموبايل، التابلت، والكمبيوتر بدون أي إعدادات إضافية.",
  },
  {
    q: "في دعم فني بالعربي اللبناني؟",
    a: "فريقنا لبناني 100٪ وجاهز يساعدك عبر الواتساب، الشات، والإيميل — بدون bots أو ترجمة.",
  },
  {
    q: "بقدر أربط دومين خاص باسم متجري؟",
    a: "أكيد! بالباقة المدفوعة بتقدر تربط دومينك الخاص بسهولة كاملة من لوحة التحكم.",
  },
  {
    q: "شو إذا عندي أكتر من متجر؟",
    a: "الباقة الاحترافية بتدعم إدارة عدة متاجر من نفس الحساب بكل سهولة.",
  },
  {
    q: "بيانات متجري وزبائني آمنة؟",
    a: "SSL مجاني، تشفير كامل للبيانات، ونسخ احتياطي تلقائي لحماية متجرك وزبائنك.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-brand-grey overflow-hidden">
      <div className="mx-auto px-5 md:px-10 w-full">
        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-brand-light text-brand-dark text-xs font-medium mb-6">
            الأسئلة الشائعة
          </span>

          <h2
            className="text-[28px] md:text-[60px] leading-[1.2] text-brand-dark mb-4"
            style={{ fontFamily: "Lalezar, cursive" }}
          >
            جاوبنا على كل شي تقريباً
          </h2>

          <p className="text-brand-light text-[13px] md:text-[15px]  max-w-[620px] mx-auto">
            وإذا بعد عندك أي سؤال — فريقنا جاهز يساعدك بأي وقت.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const open = openIndex === index;

            return (
              <div
                key={index}
                className={`group rounded-[20px] md:rounded-[28px] border bg-brand-white transition-all duration-300 overflow-hidden ${
                  open
                    ? "border-brand-dark shadow-[0_10px_40px_rgba(0,0,0,0.05)]"
                    : "border-brand-light hover:border-brand-dark/30"
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-start md:items-center justify-between gap-4 text-right p-5 md:p-7"
                >
                  {/* Question */}
                  <span
                    className={`flex-1 text-[14px] md:text-[16px] leading-[1.9] font-bold transition-colors duration-200 ${
                      open ? "text-brand-dark" : "text-brand-dark/85"
                    }`}
                  >
                    {faq.q}
                  </span>

                  {/* Icon */}
                  <div
                    className={`shrink-0 w-8 md:w-10 h-8 md:h-10 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
                      open
                        ? "bg-brand-dark border-brand-dark text-brand-white rotate-180"
                        : "bg-brand-grey border-brand-light text-brand-dark"
                    }`}
                  >
                    <FiChevronDown size={18} />
                  </div>
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    open
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 md:px-7 pb-6 md:pb-7">
                      <div className="h-[1px] bg-brand-light mb-5" />

                      <p className="text-[13px] md:text-[15px] leading-[1.5] text-brand-dark/70 max-w-[95%]">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center mt-6 md:mt-10">
          <a
            href="https://wa.me/9611234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-[50px] md:h-[56px] px-6 md:px-8 r md:rounded-2xl bg-brand-dark text-brand-white text-[15px] md:text-[16px] font-bold transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
          >
            تواصل معنا على واتساب
          </a>
        </div>
      </div>
    </section>
  );
}
