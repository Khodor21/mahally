"use client";

import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import type { Feature } from "@/types/api";

interface FeaturesSectionProps {
  lang?: "ar" | "en";
  storeSlug: string;
}

export default function FeaturesSection({
  lang = "ar",
  storeSlug,
}: FeaturesSectionProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setLoading(true);
        // Added public=true parameter
        const res = await fetch(
          `/api/features?store_slug=${storeSlug}&public=true`,
          { cache: "no-store" },
        );
        const data = await res.json();
        if (data.success) {
          setFeatures(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch features:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [storeSlug]);

  if (loading || features.length === 0) return null;

  return (
    <section className="py-6 bg-white" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Section matching image_8e8947.png */}

        <div className="text-center mb-4">
          <p className="text-2xl md:text-3xl font-bold text-brand-black mb-2">
            {lang === "ar" ? "لماذا يفضلنا عملاؤنا؟" : "Store Features"}
          </p>
          <p className="text-sm md:text-base text-brand-black/90 font-medium">
            {lang === "ar"
              ? "تجربة تسوق مضمونة ترقى لتوقعاتكم"
              : "Real experiences from our valued customers"}
          </p>
          {/* UPDATED COLOR */}
          <div className="w-12 h-[3px] bg-[rgb(var(--color-brand-primary))] mx-auto rounded-full mt-3" />
        </div>
        {/* Features Grid - 2x2 on mobile, 4x1 or 2x2 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature) => {
            // Dynamically load the icon from lucide-react
            const IconComponent =
              (LucideIcons as any)[feature.icon_name] || LucideIcons.Box;

            return (
              <div
                key={feature.id}
                className="flex flex-col items-center text-center space-y-4 mt-3"
              >
                <div className="flex items-center justify-center text-brand-primary">
                  <IconComponent
                    className="w-8 h-8 md:w-10 md:h-10"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-black text-base md:text-lg leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-brand-primary/80 text-sm md:text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
