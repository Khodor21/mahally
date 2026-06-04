"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface HeroBanner {
  id: string;
  image: string;
  active: boolean;
  order: number;
}

interface HeroSectionProps {
  storeId: string;
  lang?: "en" | "ar";
}

export default function HeroSection({
  storeId,
  lang = "en",
}: HeroSectionProps) {
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

  // Single banner - no slider
  if (banners.length === 1) {
    return (
      <section
        dir={dir}
        className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-lg bg-[rgb(244_242_245)]"
      >
        <div className="absolute inset-0">
          <Image
            src={currentBanner.image}
            alt="Hero Banner"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>
    );
  }

  // Multiple banners - with slider
  return (
    <section
      dir={dir}
      className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-lg group bg-[rgb(244_242_245)]"
    >
      {/* Slides */}
      <div className="relative h-full">
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ${
                isActive
                  ? "opacity-100 translate-x-0 z-10"
                  : "opacity-0 translate-x-full z-0"
              }`}
            >
              <div className="absolute inset-0">
                <Image
                  src={banner.image}
                  alt={`Hero Banner ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-brand-dark" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-brand-dark" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all shadow-sm ${
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
