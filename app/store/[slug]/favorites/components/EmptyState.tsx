"use client";

import { Heart, ShoppingBag } from "lucide-react";

type Props = {
  title: string;
  description: string;
  continueShoppingLabel: string;
  onContinueShopping: () => void;
  isArabic?: boolean;
};

export default function EmptyCartState({
  title,
  description,
  continueShoppingLabel,
  onContinueShopping,
  isArabic = false,
}: Props) {
  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="w-full min-h-screen flex flex-col items-center justify-center text-center py-16 px-4 animate-in fade-in zoom-in-95 duration-300"
    >
      <Heart className="w-8 h-8 mb-3 text-gray-400 stroke-[1.5]" />

      <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>

      <p className="text-[15px] sm:text-sm text-gray-500 mx-auto mb-8 leading-relaxed">
        {description}
      </p>

      <button
        onClick={onContinueShopping}
        className="h-7 px-7 rounded bg-brand-primary text-white font-medium text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
      >
        <ShoppingBag className="w-3 h-3" />
        {continueShoppingLabel}
      </button>
    </div>
  );
}
