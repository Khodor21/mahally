"use client";

import { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { Testimonial } from "@/types/api";

interface TestimonialsSectionProps {
  lang?: "ar" | "en";
  storeSlug: string;
}

export default function TestimonialsSection({
  lang = "ar",
  storeSlug,
}: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Fetch testimonials on mount
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/testimonials?store_slug=${storeSlug}&public=true`,
          {
            cache: "no-store",
          },
        );
        const data = await res.json();

        if (data.success) {
          setTestimonials(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [storeSlug]);

  // Helper to generate initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);
  };

  if (loading) {
    return (
      <section className="py-20 lg:py-24 bg-gray-50" dir={dir}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-gray-200 rounded-full animate-pulse mx-auto mb-4" />
            <div className="h-4 w-64 bg-gray-200 rounded-full animate-pulse mx-auto" />
          </div>
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col items-center text-center">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
              <div className="h-6 w-full bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-10" />
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-4" />
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="py-8 lg:py-12 relative overflow-hidden" dir={dir}>
      {/* Subtle Background Pattern/Shape for premium feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -right-24 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}

        <div className="text-center mb-4">
          <p className="text-2xl md:text-4xl font-bold text-brand-black mb-2">
            {lang === "ar" ? "ماذا يقول عملاؤنا؟" : "What our customers say"}
          </p>
          <p className="text-sm md:text-base text-brand-black/90 font-medium">
            {lang === "ar"
              ? "تجارب حقيقية من عملائنا الذين نعتز بثقتهم"
              : "Real experiences from our valued customers"}
          </p>
          {/* UPDATED COLOR */}
          <div className="w-12 h-[3px] bg-[rgb(var(--color-brand-primary))] mx-auto rounded-full mt-3" />
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Main Card */}
          <div className=" relative overflow-hidden transition-all duration-300 ease-in-out">
            {/* Decorative Quote Icon */}
            <Quote className="absolute top-6 right-8 w-24 h-24 text-gray-50 opacity-50 transform -scale-x-100 rotate-180" />

            <div className="relative flex flex-col items-center text-center">
              {/* Stars */}
              <div className="flex items-center gap-1.5 mb-8">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                      i < (activeTestimonial.rating || 5)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-100 text-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Quote Content */}
              <blockquote className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-800 leading-relaxed mb-10 min-h-[120px] flex items-center justify-center">
                &quot;{activeTestimonial.content}&quot;
              </blockquote>

              {/* Author Info */}
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="mb-4">
                  {/* @ts-ignore - Handle possible missing avatar_url in types */}
                  {activeTestimonial.avatar_url ? (
                    <img
                      // @ts-ignore
                      src={activeTestimonial.avatar_url}
                      alt={activeTestimonial.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-sm ring-4 ring-gray-50"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xl sm:text-2xl font-bold ring-4 ring-white shadow-sm">
                      {getInitials(activeTestimonial.name)}
                    </div>
                  )}
                </div>

                {/* Name & Role */}
                <h3 className=" sm:text-lg font-bold text-gray-900">
                  {activeTestimonial.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                  {activeTestimonial.role ||
                    (lang === "ar" ? "عميل موثوق" : "Verified Customer")}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Arrows (Absolute positioned outside the card) */}
          <button
            onClick={lang === "ar" ? nextSlide : prevSlide}
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -left-6 xl:-left-12 w-14 h-14 rounded-full bg-white shadow-[0_4px_20px_rgb(0,0,0,0.08)] hover:shadow-[0_4px_25px_rgb(60,28,84,0.15)] text-gray-600 hover:text-brand-primary items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 z-10"
            aria-label="Previous"
          >
            {lang === "ar" ? (
              <ChevronRight className="w-6 h-6" />
            ) : (
              <ChevronLeft className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={lang === "ar" ? prevSlide : nextSlide}
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -right-6 xl:-right-12 w-14 h-14 rounded-full bg-white shadow-[0_4px_20px_rgb(0,0,0,0.08)] hover:shadow-[0_4px_25px_rgb(60,28,84,0.15)] text-gray-600 hover:text-brand-primary items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 z-10"
            aria-label="Next"
          >
            {lang === "ar" ? (
              <ChevronLeft className="w-6 h-6" />
            ) : (
              <ChevronRight className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Controls & Desktop Dots */}
        <div className="flex items-center justify-center mt-10 gap-6">
          {/* Mobile Prev */}
          <button
            onClick={lang === "ar" ? nextSlide : prevSlide}
            className="lg:hidden w-12 h-12 rounded-full bg-white shadow-sm text-gray-600 hover:text-brand-primary flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
            aria-label="Previous"
          >
            {lang === "ar" ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2.5">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? "bg-brand-primary w-8"
                    : "bg-gray-300 hover:bg-gray-400 w-2.5"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>

          {/* Mobile Next */}
          <button
            onClick={lang === "ar" ? prevSlide : nextSlide}
            className="lg:hidden w-12 h-12 rounded-full bg-white shadow-sm text-gray-600 hover:text-brand-primary flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
            aria-label="Next"
          >
            {lang === "ar" ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
