"use client";

import { ArrowRight } from "lucide-react";
import { Emoji } from "emoji-picker-react";

type Props = {
  title: string;
  description: string;
  continueShoppingLabel: string;
  onContinueShopping: () => void;
};

export default function EmptyCartState({
  title,
  description,
  continueShoppingLabel,
  onContinueShopping,
}: Props) {
  return (
    <div className="w-full flex flex-col items-center justify-center pt-[40%] sm:pt-[15%] px-4">
      <div className="p-8 max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <Emoji unified="1f915" size={32} />
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          {description}
        </p>
        <button
          onClick={onContinueShopping}
          className="w-full h-12 rounded-xl text-brand-primary font-bold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          {continueShoppingLabel}
        </button>
      </div>
    </div>
  );
}
