"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface HeroBanner {
  id: string;
  title_en: string;
  title_ar: string;
  subtitle_en: string;
  subtitle_ar: string;
  image: string;
  cta_text_en: string;
  cta_text_ar: string;
  cta_link: string;
  bg_color: string;
  text_color: string;
  active: boolean;
  order: number;
}

interface HeroSectionProps {
  storeId: string;
  lang?: "en" | "ar";
}

export default function HeroSection({ storeId, lang = "en" }: HeroSectionProps) {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const dir = lang === "ar" ? "rtl" : "ltr";

  // Fetch banners from API
  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch(`/api/hero?storeId=${storeId}`);
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
          setBanners(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch hero banners:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBanners();
  }, [storeId]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-brand-grey animate-pulse rounded-3xl" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const title = lang === "ar" ? currentBanner.title_ar : currentBanner.title_en;
  const subtitle = lang === "ar" ? currentBanner.subtitle_ar : currentBanner.subtitle_en;
  const ctaText = lang === "ar" ? currentBanner.cta_text_ar : currentBanner.cta_text_en;

  // Single banner - no slider
  if (banners.length === 1) {
    return (
      <section
        dir={dir}
        className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-lg"
        style={{ backgroundColor: currentBanner.bg_color }}
      >
        <div className="absolute inset-0">
          <Image
            src={currentBanner.image}
            alt={title}
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>

        <div className="relative h-full flex flex-col justify-center px-6 md:px-16 max-w-2xl">
          <h1
            className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
            style={{ color: currentBanner.text_color, fontFamily: "Lalezar, cursive" }}
          >
            {title}
          </h1>
          
          <p
            className="text-lg md:text-xl mb-8 opacity-90"
            style={{ color: currentBanner.text_color }}
          >
            {subtitle}
          </p>

          <Link
            href={currentBanner.cta_link}
            className="inline-flex items-center justify-center px-8 py-3 rounded-2xl font-semibold text-white bg-brand-dark hover:opacity-90 transition-all w-fit"
          >
            {ctaText}
          </Link>
        </div>
      </section>
    );
  }

  // Multiple banners - with slider
  return (
    <section dir={dir} className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-lg group">
      {/* Slides */}
      <div className="relative h-full">
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          const bannerTitle = lang === "ar" ? banner.title_ar : banner.title_en;
          const bannerSubtitle = lang === "ar" ? banner.subtitle_ar : banner.subtitle_en;
          const bannerCta = lang === "ar" ? banner.cta_text_ar : banner.cta_text_en;

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ${
                isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
              }`}
              style={{ backgroundColor: banner.bg_color }}
            >
              <div className="absolute inset-0">
                <Image
                  src={banner.image}
                  alt={bannerTitle}
                  fill
                  className="object-cover opacity-20"
                  priority={index === 0}
                />
              </div>

              <div className="relative h-full flex flex-col justify-center px-6 md:px-16 max-w-2xl">
                <h1
                  className="text-4xl md:text-6xl font-bold mb-4 leading-tight"
                  style={{ color: banner.text_color, fontFamily: "Lalezar, cursive" }}
                >
                  {bannerTitle}
                </h1>
                
                <p
                  className="text-lg md:text-xl mb-8 opacity-90"
                  style={{ color: banner.text_color }}
                >
                  {bannerSubtitle}
                </p>

                <Link
                  href={banner.cta_link}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-2xl font-semibold text-white bg-brand-dark hover:opacity-90 transition-all w-fit"
                >
                  {bannerCta}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-brand-dark" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-brand-dark" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}