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
  coverImage?: string;
}

export default function HeroSection({
  storeId,
  lang = "en",
  coverImage,
}: HeroSectionProps) {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const dir = lang === "ar" ? "rtl" : "ltr";

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

  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

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
      <div className="w-full aspect-[2.2/1] md:aspect-[3/1] bg-gray-100 animate-pulse rounded-none md:rounded-xs" />
    );
  }

  // If API returned banners, use carousel (multi-banner mode)
  if (banners.length > 0) {
    const currentBanner = banners[currentIndex];

    // Single banner from API
    if (banners.length === 1) {
      return (
        <section
          dir={dir}
          className="relative w-full aspect-[2.2/1] md:aspect-[3/1] rounded-none md:rounded-xs overflow-hidden bg-gray-50"
        >
          <Image
            src={currentBanner.image}
            alt="Hero Banner"
            fill
            className="object-cover object-center"
            priority
          />
        </section>
      );
    }

    // Multiple banners - Slider
    return (
      <section
        dir={dir}
        className="relative w-full aspect-[2.2/1] md:aspect-[3/1] rounded-none md:rounded-xs overflow-hidden group bg-gray-50"
      >
        {/* Slides */}
        <div className="relative w-full h-full">
          {banners.map((banner, index) => {
            const isActive = index === currentIndex;

            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  isActive
                    ? "opacity-100 translate-x-0 z-10"
                    : "opacity-0 translate-x-full z-0"
                }`}
              >
                <Image
                  src={banner.image}
                  alt={`Hero Banner ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                />
              </div>
            );
          })}
        </div>

        {/* Prev Button - Hidden on mobile, hover on desktop */}
        <button
          onClick={goToPrev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 z-20 shadow-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        {/* Next Button - Hidden on mobile, hover on desktop */}
        <button
          onClick={goToNext}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 z-20 shadow-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>

        {/* Dots - Enhanced touch targets for mobile */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="p-2 cursor-pointer group/dot"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-6 md:w-8 bg-white shadow-sm"
                    : "w-1.5 md:w-2 bg-white/50 group-hover/dot:bg-white/80"
                }`}
              />
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (coverImage) {
    return (
      <section
        dir={dir}
        className="relative w-full aspect-[2.2/1] md:aspect-[3/1] rounded-none md:rounded-xs overflow-hidden bg-gray-50"
      >
        <Image
          src={coverImage}
          alt="Store Cover Image"
          fill
          className="object-cover object-center"
          priority
        />
      </section>
    );
  }

  return null;
}
