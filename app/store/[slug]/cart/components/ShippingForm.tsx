"use client";

import { Loader2 } from "lucide-react";

const LEBANON_GOVERNORATES_EN = [
  "Beirut",
  "Mount Lebanon",
  "North",
  "Akkar",
  "Bekaa",
  "Baalbek-Hermel",
  "South",
  "Nabatieh",
];

const LEBANON_GOVERNORATES_AR = [
  "بيروت",
  "جبل لبنان",
  "الشمال",
  "عكار",
  "البقاع",
  "بعلبك-الهرمل",
  "الجنوب",
  "النبطية",
];

// Canonical value stored in the DB is always the English name (see
// LEBANON_GOVERNORATES_EN). We pair each EN value with its AR label here so
// the <select> can show translated text while keeping option values in
// English — this is what lets a saved customer.governorate (e.g.
// "Baalbek-Hermel") match the selected <option> even when the store
// language is Arabic.
const LEBANON_GOVERNORATES = LEBANON_GOVERNORATES_EN.map((en, i) => ({
  value: en,
  label: en,
  labelAr: LEBANON_GOVERNORATES_AR[i],
}));

type CartItem = {
  product: {
    id: string | number;
    title: string;
  };
  qty: number;
};

type AppliedCoupon = {
  code: string;
  discountAmount: number;
} | null;

type Props = {
  t: any;
  isArabic: boolean;
  authLoading: boolean;
  customerName: string;
  setCustomerName: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  currencySymbol: string;
  subtotal: number;
  shipping: number;
  discountAmount: number;
  total: number;
  appliedCoupon: AppliedCoupon;
  activeItems: CartItem[];
};

export default function ShippingForm({
  t,
  isArabic,
  authLoading,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  city,
  setCity,
  address,
  setAddress,
  notes,
  setNotes,
  currencySymbol,
  subtotal,
  shipping,
  discountAmount,
  total,
  appliedCoupon,
  activeItems,
}: Props) {
  return (
    <>
      {/* Customer Info Form */}
      <div className="bg-white">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">
            {isArabic ? " تفاصيل الطلب" : " Order Details"}
          </h3>
          {authLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
          )}
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {t.fullName}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm font-medium outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all bg-gray-50 hover:bg-white focus:bg-white"
              placeholder={t.fullName}
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {t.phoneNumber}
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm font-medium outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all bg-gray-50 hover:bg-white focus:bg-white"
              placeholder={t.phoneNumber}
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {t.city}
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm font-medium outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all bg-gray-50 hover:bg-white focus:bg-white cursor-pointer"
              dir={isArabic ? "rtl" : "ltr"}
            >
              <option value="">{t.selectCity}</option>
              {LEBANON_GOVERNORATES.map((gov) => (
                <option key={gov.value} value={gov.value}>
                  {isArabic ? gov.labelAr : gov.label}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {t.fullAddress}
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-24 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none bg-gray-50 hover:bg-white focus:bg-white"
              placeholder={t.fullAddress}
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {t.orderNotes}{" "}
              <span className="text-gray-400 font-medium">
                ({isArabic ? "اختياري" : "Optional"})
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none bg-gray-50 hover:bg-white focus:bg-white"
              placeholder={t.orderNotes}
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>
        </div>
      </div>

      {/* Quick Order Review */}
      <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">{t.orderSummary}</h3>
        <div className="space-y-3 text-sm mb-6">
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
          <div className="flex justify-between font-black text-lg">
            <span className="text-gray-900">{t.total}</span>
            <span className="text-brand-primary">
              {currencySymbol}
              {total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Minimal Items List */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-900 mb-3">{t.products}</p>
          <div className="space-y-2">
            {activeItems.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between text-xs"
              >
                <span className="text-gray-600 truncate font-medium">
                  {item.product.title}
                </span>
                <span className="text-brand-primary font-bold ml-2 flex-shrink-0">
                  ×{item.qty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
