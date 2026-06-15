"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "@/types/api";

interface TestimonialsSectionProps {
  lang?: "ar" | "en";
  storeSlug?: string; // For fetching store-specific testimonials
  testimonials?: Testimonial[]; // Optional: passed from parent instead of fetching
}

export default function TestimonialsSection({
  lang = "ar",
  storeSlug,
  testimonials: passedTestimonials,
}: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(!passedTestimonials);
  const dir = lang === "ar" ? "rtl" : "ltr";

  // ✅ NEW: Fetch testimonials from API if not passed as prop
  useEffect(() => {
    if (passedTestimonials) {
      setTestimonials(passedTestimonials);
      setLoading(false);
      return;
    }

    // Only fetch if we have a slug (we're on the storefront)
    if (!storeSlug) {
      setLoading(false);
      return;
    }

    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stores`);
        const data = await response.json();

        if (data.store?.testimonials?.testimonials) {
          setTestimonials(data.store.testimonials.testimonials);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [storeSlug, passedTestimonials]);

  // If no testimonials, don't render
  if (loading) {
    return (
      <section className="py-16" dir={dir}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-black/60">Loading testimonials...</p>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null; // Don't show empty testimonials section
  }

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const activeTestimonial = testimonials[activeIndex];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={14}
        className={
          index < rating ? "text-[#94A3B8] fill-current" : "text-brand-light/50"
        }
      />
    ));
  };

  // Translation object for static text
  const content = {
    ar: {
      title: "ماذا يقول عملاؤنا؟",
      prevLabel: "السابق",
      nextLabel: "التالي",
    },
    en: {
      title: "What our customers say",
      prevLabel: "Previous",
      nextLabel: "Next",
    },
  };
  const t = content[lang];

  return (
    <section className="py-16 overflow-hidden" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-2xl md:text-3xl font-bold text-brand-black">
            {t.title}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 w-full transition-all">
          {/* VISUAL PREVIOUS CARD */}
          <button
            onClick={prevSlide}
            aria-label={t.prevLabel}
            className="hidden md:flex flex-col items-center justify-center w-40 lg:w-56 min-h-[280px] rounded-2xl border border-brand-light bg-brand-white/50 opacity-50 hover:opacity-100 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-brand-light/40 flex items-center justify-center mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[#94A3B8]/90 flex items-center justify-center text-white transition-opacity">
                <ChevronLeft size={24} />
              </div>
            </div>
            <div className="w-20 h-1.5 bg-brand-light rounded-full mb-3"></div>
            <div className="w-12 h-1.5 bg-brand-light rounded-full"></div>
          </button>

          {/* CENTER ACTIVE CARD */}
          <div className="relative w-full max-w-2xl p-8 lg:p-12 min-h-[280px] flex flex-col transition-all duration-500 ease-in-out transform">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between flex-1">
              {/* Avatar */}
              {activeTestimonial.avatar && (
                <div className="w-16 h-16 rounded-full flex-shrink-0 order-1 sm:order-2 bg-brand-grey overflow-hidden">
                  <img
                    src={activeTestimonial.avatar}
                    alt={activeTestimonial.name[lang]}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content Side */}
              <div className="flex flex-col gap-4 flex-1 order-2 sm:order-1">
                <p className="text-base sm:text-lg text-brand-black/90 font-medium leading-relaxed">
                  &quot;{activeTestimonial.content[lang]}&quot;
                </p>
                <div className="mt-auto pt-4 flex flex-col gap-1.5">
                  <h4 className="font-semibold text-brand-black text-sm">
                    {activeTestimonial.name[lang]}
                  </h4>
                  <p className="text-xs text-brand-black/60">
                    {activeTestimonial.role[lang]}
                  </p>
                </div>
                {/* Stars */}
                <div className="flex items-center gap-1 mt-2">
                  {renderStars(activeTestimonial.rating)}
                </div>
              </div>
            </div>
          </div>

          {/* VISUAL NEXT CARD */}
          <button
            onClick={nextSlide}
            aria-label={t.nextLabel}
            className="hidden md:flex flex-col items-center justify-center w-40 lg:w-56 min-h-[280px] rounded-2xl border border-brand-light bg-brand-white/50 opacity-50 hover:opacity-100 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-brand-light/40 flex items-center justify-center mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[#94A3B8]/90 flex items-center justify-center text-white transition-opacity">
                <ChevronRight size={24} />
              </div>
            </div>
            <div className="w-20 h-1.5 bg-brand-light rounded-full mb-3"></div>
            <div className="w-12 h-1.5 bg-brand-light rounded-full"></div>
          </button>
        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex md:hidden items-center justify-center gap-4 mt-8">
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-brand-grey text-brand-dark flex items-center justify-center hover:bg-brand-light transition-colors"
            aria-label={t.prevLabel}
          >
            <ChevronLeft size={20} />
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
            onClick={nextSlide}
            className="w-10 h-10 rounded-full bg-brand-grey text-brand-dark flex items-center justify-center hover:bg-brand-light transition-colors"
            aria-label={t.nextLabel}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
