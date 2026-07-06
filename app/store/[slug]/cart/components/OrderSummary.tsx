"use client";

import { Loader2, Tag, X } from "lucide-react";

type CouponMessage = {
  type: "success" | "error";
  text: string;
} | null;

type AppliedCoupon = {
  code: string;
  discountAmount: number;
} | null;

type Props = {
  t: any;
  currencySymbol: string;
  subtotal: number;
  shipping: number;
  discountAmount: number;
  total: number;
  appliedCoupon: AppliedCoupon;
  couponInput: string;
  couponLoading: boolean;
  couponMessage: CouponMessage;
  onCouponInputChange: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
};

export default function OrderSummary({
  t,
  currencySymbol,
  subtotal,
  shipping,
  discountAmount,
  total,
  appliedCoupon,
  couponInput,
  couponLoading,
  couponMessage,
  onCouponInputChange,
  onApplyCoupon,
  onRemoveCoupon,
}: Props) {
  return (
    // Reduced base padding to p-4 for mobile, scaled back to p-6 for sm+
    <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-4 sm:p-6">
      {/* Reduced vertical spacing on mobile */}
      <div className="space-y-3 sm:space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">{t.subtotal}</span>
          <span className="font-bold text-gray-900">
            {currencySymbol}
            {subtotal.toLocaleString()}
          </span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-brand-primary font-bold">
            <span>
              {t.discount} ({appliedCoupon.code})
            </span>
            <span>
              -{currencySymbol}
              {discountAmount.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600 font-medium">{t.shipping}</span>
          <span className="font-bold text-gray-900">
            {shipping === 0 ? (
              "Free"
            ) : (
              <>
                {currencySymbol}
                {shipping.toLocaleString()}
              </>
            )}
          </span>
        </div>
        <div className="h-px bg-gray-200" />
        {/* Scaled the total text size down slightly for mobile */}
        <div className="flex justify-between font-black text-base sm:text-lg">
          <span className="text-gray-900">{t.total}</span>
          <span className="text-brand-primary">
            {currencySymbol}
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Coupon Section - Scaled down top margin and padding for mobile */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
        {!appliedCoupon ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Tag className="w-4 h-4 text-gray-400" />
              </div>
              <input
                value={couponInput}
                onChange={(e) =>
                  onCouponInputChange(e.target.value.toUpperCase())
                }
                placeholder={t.discountCode}
                // Reduced input height from h-11 to h-10 on mobile
                className="w-full h-10 sm:h-11 rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-medium outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all bg-white uppercase"
              />
            </div>
            <button
              onClick={onApplyCoupon}
              disabled={!couponInput.trim() || couponLoading}
              // Reduced button height from h-11 to h-10 on mobile
              className="h-10 sm:h-11 px-4 sm:px-5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px] sm:min-w-[90px]"
            >
              {couponLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t.apply
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 sm:p-3.5 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-brand-primary flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-primary">
                  {appliedCoupon.code}
                </p>
                <p className="text-[11px] sm:text-xs font-medium text-brand-primary/70">
                  {t.couponApplied}
                </p>
              </div>
            </div>
            <button
              onClick={onRemoveCoupon}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-brand-primary hover:bg-brand-primary/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {couponMessage && (
          <p
            className={`text-xs mt-3 font-bold ${
              couponMessage.type === "success"
                ? "text-brand-primary"
                : "text-red-500"
            }`}
          >
            {couponMessage.text}
          </p>
        )}
      </div>
    </div>
  );
}
