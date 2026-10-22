// app/store/[slug]/components/shared/EmptyState.tsx
"use client";

import { ShoppingCart, Heart, Tag, ShoppingBag } from "lucide-react";

type Variant = "cart" | "wishlist" | "category";

type Props = {
  variant: Variant;
  title: string;
  description: string;
  ctaLabel: string;
  onCta: () => void;
  isArabic?: boolean;
};

const ICONS: Record<Variant, React.ReactNode> = {
  cart: <ShoppingCart className="w-10 h-10 text-gray-300 stroke-[1.2]" />,
  wishlist: <Heart className="w-10 h-10 text-gray-300 stroke-[1.2]" />,
  category: <Tag className="w-10 h-10 text-gray-300 stroke-[1.2]" />,
};

export default function EmptyState({
  variant,
  title,
  description,
  ctaLabel,
  onCta,
  isArabic = false,
}: Props) {
  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="w-full flex flex-col items-center justify-center text-center py-20 px-6 animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Icon container */}
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
        {ICONS[variant]}
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed mb-7">
        {description}
      </p>

      {/* CTA */}
      <button
        onClick={onCta}
        className="inline-flex items-center justify-center gap-2 h-8 md:h-10 px-4 md:px-6 rounded-sm bg-brand-primary text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm"
      >
        <ShoppingBag className="w-4 h-4" />
        {ctaLabel}
      </button>
    </div>
  );
}
