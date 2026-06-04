"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight, FiUser } from "react-icons/fi";

type Testimonial = {
  id: number;
  name: { ar: string; en: string };
  role: { ar: string; en: string };
  content: { ar: string; en: string };
  rating: number;
  avatar?: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: { ar: "أحمد خالد", en: "Ahmed Khaled" },
    role: { ar: "صاحب متجر", en: "Store Owner" },
    content: {
      ar: "منصة رائعة جداً وسهلة الاستخدام. ساعدتني في نقل متجري إلى مستوى آخر من الاحترافية، الدعم الفني متجاوب وسريع.",
      en: "A wonderful and easy-to-use platform. It helped me take my store to another level of professionalism. Support is fast.",
    },
    rating: 5,
  },
  {
    id: 2,
    name: { ar: "سارة محمد", en: "Sarah Mohammed" },
    role: { ar: "مديرة تسويق", en: "Marketing Manager" },
    content: {
      ar: "التصميم الواجهة ممتاز وتجربة المستخدم سلسة للغاية. وفرت علينا الكثير من الوقت في إدارة المنتجات والطلبات اليومية.",
      en: "The UI design is excellent and the UX is very smooth. It saved us a lot of time managing daily products and orders.",
    },
    rating: 5,
  },
  {
    id: 3,
    name: { ar: "عمر عبدالله", en: "Omar Abdullah" },
    role: { ar: "رائد أعمال", en: "Entrepreneur" },
    content: {
      ar: "أفضل استثمار قمت به لمشروعي التقني. الميزات تتحدث عن نفسها والتحديثات مستمرة. أنصح به بشدة لكل صاحب عمل.",
      en: "The best investment I made for my tech project. The features speak for themselves. Highly recommended.",
    },
    rating: 4,
  },
];

export default function TestimonialsSection({
  lang = "ar",
}: {
  lang?: "ar" | "en";
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dir = lang === "ar" ? "rtl" : "ltr";

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  // Logic to handle RTL visual placement
  // In RTL, the "Next" item visually appears on the Left, and "Prev" on the Right.
  const visualLeftIndex =
    dir === "rtl"
      ? (activeIndex + 1) % testimonials.length // Next item
      : activeIndex === 0
        ? testimonials.length - 1 // Prev item
        : activeIndex - 1;

  const visualRightIndex =
    dir === "rtl"
      ? activeIndex === 0
        ? testimonials.length - 1 // Prev item
        : activeIndex - 1
      : (activeIndex + 1) % testimonials.length; // Next item

  const activeTestimonial = testimonials[activeIndex];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <FaStar
        key={index}
        size={14}
        className={index < rating ? "text-[#94A3B8]" : "text-brand-light/50"}
      />
    ));
  };

  return (
    <section className="py-16 bg-white overflow-hidden" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header (Optional) */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-dark">
            {lang === "ar" ? "ماذا يقول عملاؤنا" : "What Our Clients Say"}
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 w-full transition-all">
          {/* VISUAL LEFT CARD (Prev in LTR, Next in RTL) */}
          <button
            onClick={dir === "rtl" ? nextSlide : prevSlide}
            aria-label="Previous Testimonial"
            className="hidden md:flex flex-col items-center justify-center w-40 lg:w-56 min-h-[280px] rounded-2xl border border-brand-light bg-brand-white/50 opacity-50 hover:opacity-100 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-brand-light/40 flex items-center justify-center mb-6 relative overflow-hidden">
              <FiUser size={24} className="text-brand-dark/20" />
              {/* Arrow Overlay matched to image style */}
              <div className="absolute inset-0 bg-[#94A3B8]/90 flex items-center justify-center text-white transition-opacity">
                <FiChevronLeft size={24} />
              </div>
            </div>
            {/* Placeholder Lines matching the image */}
            <div className="w-20 h-1.5 bg-brand-light rounded-full mb-3"></div>
            <div className="w-12 h-1.5 bg-brand-light rounded-full"></div>
          </button>

          {/* CENTER ACTIVE CARD */}
          <div className="relative w-full max-w-2xl bg-white border border-brand-light rounded-2xl p-8 lg:p-12 shadow-[0_4px_40px_rgb(0,0,0,0.04)] min-h-[280px] flex flex-col transition-all duration-500 ease-in-out transform">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between flex-1">
              {/* Content Side */}
              <div className="flex flex-col gap-4 flex-1 order-2 sm:order-1">
                <p className="text-base sm:text-lg text-brand-dark/70 font-medium leading-relaxed italic">
                  &quot;{activeTestimonial.content[lang]}&quot;
                </p>
                <div className="mt-auto pt-4 flex flex-col gap-1.5">
                  <h4 className="font-bold text-brand-dark text-sm">
                    {activeTestimonial.name[lang]}
                  </h4>
                  <span className="text-xs text-brand-dark/50 font-medium">
                    {activeTestimonial.role[lang]}
                  </span>
                </div>
                {/* Stars Side (Aligned to bottom as in image) */}
                <div className="flex items-center gap-1 mt-2">
                  {renderStars(activeTestimonial.rating)}
                </div>
              </div>

              {/* Avatar Side */}
              <div className="flex-shrink-0 order-1 sm:order-2 self-start sm:self-center bg-brand-grey w-20 h-20 rounded-full flex items-center justify-center text-brand-dark/20 border-4 border-white shadow-sm">
                <FiUser size={32} />
              </div>
            </div>
          </div>

          {/* VISUAL RIGHT CARD (Next in LTR, Prev in RTL) */}
          <button
            onClick={dir === "rtl" ? prevSlide : nextSlide}
            aria-label="Next Testimonial"
            className="hidden md:flex flex-col items-center justify-center w-40 lg:w-56 min-h-[280px] rounded-2xl border border-brand-light bg-brand-white/50 opacity-50 hover:opacity-100 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-brand-light/40 flex items-center justify-center mb-6 relative overflow-hidden">
              <FiUser size={24} className="text-brand-dark/20" />
              {/* Arrow Overlay matched to image style */}
              <div className="absolute inset-0 bg-[#94A3B8]/90 flex items-center justify-center text-white transition-opacity">
                <FiChevronRight size={24} />
              </div>
            </div>
            {/* Placeholder Lines matching the image */}
            <div className="w-20 h-1.5 bg-brand-light rounded-full mb-3"></div>
            <div className="w-12 h-1.5 bg-brand-light rounded-full"></div>
          </button>
        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex md:hidden items-center justify-center gap-4 mt-8">
          <button
            onClick={dir === "rtl" ? nextSlide : prevSlide}
            className="w-10 h-10 rounded-full bg-brand-grey text-brand-dark flex items-center justify-center hover:bg-brand-light transition-colors"
          >
            <FiChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            {testimonials.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeIndex === idx ? "bg-brand-dark w-4" : "bg-brand-light"
                }`}
              />
            ))}
          </div>

          <button
            onClick={dir === "rtl" ? prevSlide : nextSlide}
            className="w-10 h-10 rounded-full bg-brand-grey text-brand-dark flex items-center justify-center hover:bg-brand-light transition-colors"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
