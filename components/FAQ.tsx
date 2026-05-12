"use client";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const faqs = [
  {
    q: "شو بدي أعرف تقنياً لأفتح متجري؟",
    a: "ولا شي! المنصة مصممة لحدا ما عنده أي خلفية تقنية أو تصميم. إذا بتعرف تحط صورة على واتساب — بتعرف تشغل منصتنا.",
  },
  {
    q: "كيف بدفع؟ في إمكانية الدفع بالليرة اللبنانية؟",
    a: "آه طبعاً! بتقدر تدفع اشتراكك بالليرة اللبنانية أو الدولار — حسب ما يريحك.",
  },
  {
    q: "شو إذا مش عاجبني بعد ما جربت؟",
    a: "عندك 14 يوم تجربة مجانية كاملة بدون بطاقة ائتمانية. وإذا اشتركت ومش راضي — بترجع-لك مصاريك كاملة خلال 30 يوم.",
  },
  {
    q: "بيشتغل المتجر صح على الموبايل؟",
    a: "طبعاً! كل المتاجر responsive وبتبان تمام على الموبايل، التابلت، والكمبيوتر — من غير ما تعمل أي شي إضافي.",
  },
  {
    q: "في دعم فني بالعربي اللبناني؟",
    a: "فريقنا لبناني 100٪ وجاهز يساعدك بالواتساب، الشات، والإيميل — مش رح تحكي مع bot أو ترجمة.",
  },
  {
    q: "بقدر أربط دومين خاص باسم متجري؟",
    a: "آه! بالباقة المدفوعة بتقدر تربط دومينك الخاص (مثل: متجرك.com) بسهولة كاملة من لوحة التحكم.",
  },
  {
    q: "شو إذا عندي أكتر من متجر؟",
    a: "الباقة الاحترافية بتدعم متاجر متعددة من نفس الحساب — تواصل معنا وبنحكيك عن التفاصيل.",
  },
  {
    q: "بيانات متجري وزبائني آمنة؟",
    a: "كاملاً. SSL مجاني، تشفير كامل للبيانات، ونسخ احتياطي تلقائي — بياناتك ما بتروح وما بتوصلها أي حدا.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="py-20 md:py-28 bg-white" id="faq">
      <div className="max-w-[800px] mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-[#C8392B]/10 text-[#C8392B] rounded-full px-5 py-2 text-sm font-semibold mb-5">
            الأسئلة الشائعة
          </span>
          <h2
            className="text-[32px] md:text-[38px] font-bold text-[#1E1E1E] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            أسئلة كتير — جاوبنا عليها
          </h2>
          <p className="text-[18px] text-[#6B6B6B] font-medium">
            ما لاقيت جوابك؟{" "}
            <a
              href="https://wa.me/9611234567"
              className="text-[#C8392B] underline hover:text-[#a82e22] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              تواصل معنا بالواتساب
            </a>
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                openIndex === i
                  ? "border-[#C8392B] shadow-md shadow-[#C8392B]/10"
                  : "border-[#E8E0D5] hover:border-[#C8392B]/40"
              }`}
            >
              <button
                className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-right"
                onClick={() => toggle(i)}
              >
                <span
                  className={`text-[15px] md:text-[16px] font-semibold leading-[1.6] text-right flex-1 ${
                    openIndex === i ? "text-[#C8392B]" : "text-[#1E1E1E]"
                  }`}
                >
                  {faq.q}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    openIndex === i
                      ? "bg-[#C8392B] text-white rotate-180"
                      : "bg-[#FDF6EC] text-[#6B6B6B]"
                  }`}
                >
                  <FiChevronDown size={16} />
                </div>
              </button>

              <div
                className={`transition-all duration-300 ${
                  openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="px-5 md:px-6 pb-5 md:pb-6">
                  <div className="h-px bg-[#E8E0D5] mb-4" />
                  <p className="text-[15px] text-[#6B6B6B] leading-[1.85]">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
