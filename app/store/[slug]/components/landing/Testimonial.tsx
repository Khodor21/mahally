"use client";

import { useEffect, useState, useCallback } from "react";
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
        if (data.success) setTestimonials(data.data || []);
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, [storeSlug]);

  // 👉 Auto-scroll logic
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  }, [testimonials.length]);

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);
  };

  if (loading || testimonials.length === 0) return null;

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="py-8 lg:py-12 relative overflow-hidden" dir={dir}>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -right-24 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <p className="text-2xl md:text-4xl font-bold text-brand-black mb-2">
            {lang === "ar" ? "ماذا يقول عملاؤنا؟" : "What our customers say"}
          </p>
          <p className="text-sm md:text-base text-brand-black/90 font-medium">
            {lang === "ar"
              ? "تجارب حقيقية من عملائنا"
              : "Real experiences from our customers"}
          </p>
          <div className="w-12 h-[3px] bg-[rgb(var(--color-brand-primary))] mx-auto rounded-full mt-3" />
        </div>

        <div className="relative flex items-center justify-center">
          {/* 👉 TESTIMONIAL CARD WITH NEW STRUCTURE */}
          <div className="w-full max-w-2xl transition-opacity duration-700 ease-in-out opacity-100">
            <div className="relative  p-8 sm:p-12  flex flex-col items-center text-center">
              {/* 1. Icon (Avatar) */}
              <div className="mb-4">
                {/* {activeTestimonial.avatar_url ? (
                  <img src={activeTestimonial.avatar_url} alt={activeTestimonial.name} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xl font-bold">
                    {getInitials(activeTestimonial.name)}
                  </div>
                )} */}
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xl font-bold">
                  {getInitials(activeTestimonial.name)}
                </div>
              </div>
              {/* 2. Name */}
              <h3 className="text-lg font-bold text-gray-900">
                {activeTestimonial.name}
              </h3>
              {/* 3. Role */}
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">
                {activeTestimonial.role ||
                  (lang === "ar" ? "عميل موثوق" : "Verified Customer")}
              </p>
              {/* 5. Content */}
              <blockquote className="text-lg sm:text-xl font-medium text-gray-800 leading-relaxed">
                &quot;{activeTestimonial.content}&quot;
              </blockquote>
              {/* 4. Stars */}
              <div className="flex gap-1.5 mt-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < (activeTestimonial.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                  />
                ))}
              </div>{" "}
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={prevSlide}
            className="hidden lg:flex absolute left-0 xl:-left-12 w-14 h-14 rounded-full bg-white items-center justify-center hover:text-brand-primary transition-all z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden lg:flex absolute right-0 xl:-right-12 w-14 h-14 rounded-full bg-white items-center justify-center hover:text-brand-primary transition-all z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center mt-10 gap-2.5">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${activeIndex === idx ? "bg-brand-primary w-8" : "bg-gray-300 w-2.5"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
