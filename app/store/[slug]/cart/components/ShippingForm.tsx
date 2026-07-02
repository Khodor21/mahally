"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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

type ValidationErrors = {
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
};

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
  onValidityChange?: (isValid: boolean) => void;
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
  onValidityChange,
}: Props) {
  const [errors, setErrors] = useState<ValidationErrors>({
    customerName: "",
    customerPhone: "",
    city: "",
    address: "",
  });

  const [touched, setTouched] = useState({
    customerName: false,
    customerPhone: false,
    city: false,
    address: false,
  });

  // Lebanese phone validation (starts with +961 or 0, followed by valid number)
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s\-]/g, "");
    // Lebanese numbers: +961XXXXXXXXX or 0LXXXXXXXXX (8 digits after prefix)
    const phoneRegex = /^(\+961|0)[1-9]\d{7}$/;
    return phoneRegex.test(cleaned);
  };

  // Validation function
  const validateField = (
    field: keyof ValidationErrors,
    value: string,
  ): string => {
    switch (field) {
      case "customerName":
        if (!value?.trim()) {
          return isArabic ? "الاسم مطلوب" : "Name is required";
        }
        if (value.trim().length < 2) {
          return isArabic
            ? "الاسم يجب أن يكون حرفين على الأقل"
            : "Name must be at least 2 characters";
        }
        return "";

      case "customerPhone":
        if (!value?.trim()) {
          return isArabic ? "رقم الهاتف مطلوب" : "Phone number is required";
        }
        if (!validatePhoneNumber(value)) {
          return isArabic
            ? "رقم هاتف لبناني صحيح (مثال: +961 3 123 456)"
            : "Valid Lebanese phone required (e.g., +961 3 123 456)";
        }
        return "";

      case "city":
        if (!value) {
          return isArabic ? "يجب اختيار محافظة" : "City selection required";
        }
        return "";

      case "address":
        if (!value?.trim()) {
          return isArabic ? "العنوان مطلوب" : "Address is required";
        }
        if (value.trim().length < 5) {
          return isArabic
            ? "العنوان يجب أن يكون أطول"
            : "Please provide a more detailed address";
        }
        return "";

      default:
        return "";
    }
  };

  // Real-time validation as user types
  const handleFieldChange = (field: keyof ValidationErrors, value: string) => {
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Mark field as touched when user leaves it
  const handleFieldBlur = (field: keyof ValidationErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Check if form is valid
  const isFormValid = Boolean(
    !errors.customerName &&
    !errors.customerPhone &&
    !errors.city &&
    !errors.address &&
    customerName.trim() &&
    customerPhone.trim() &&
    city &&
    address.trim(),
  );

  // Notify parent of validity changes
  useEffect(() => {
    onValidityChange?.(isFormValid);
  }, [isFormValid, onValidityChange]);

  const renderError = (fieldName: keyof ValidationErrors) => {
    if (touched[fieldName] && errors[fieldName]) {
      return (
        <p className="text-red-500 text-xs mt-1 font-medium">
          {errors[fieldName]}
        </p>
      );
    }
    return null;
  };

  const getInputClasses = (fieldName: keyof ValidationErrors) => {
    const hasError = touched[fieldName] && errors[fieldName];
    const baseClasses =
      "w-full h-11 rounded-xl border px-4 text-sm font-medium outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white";

    if (hasError) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-200`;
    }
    return `${baseClasses} border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary`;
  };

  const getTextareaClasses = (fieldName: keyof ValidationErrors) => {
    const hasError = touched[fieldName] && errors[fieldName];
    const baseClasses =
      "w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition-all resize-none bg-gray-50 hover:bg-white focus:bg-white";

    if (hasError) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-200`;
    }
    return `${baseClasses} border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary`;
  };

  return (
    <>
      {/* Customer Info Form */}
      <div className="bg-white">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">
            {isArabic ? "تفاصيل الطلب" : "Order Details"}
          </h3>
          {authLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
          )}
        </div>

        {/* Form Required Notice */}
        <p className="text-xs text-gray-500 mb-4">
          {isArabic
            ? "حقول مع علامة * مطلوبة"
            : "Fields marked with * are required"}
        </p>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {t.fullName}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                handleFieldChange("customerName", e.target.value);
              }}
              onBlur={() => handleFieldBlur("customerName")}
              className={getInputClasses("customerName")}
              placeholder={t.fullName}
              dir={isArabic ? "rtl" : "ltr"}
              autoComplete="name"
            />
            {renderError("customerName")}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {t.phoneNumber}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value);
                handleFieldChange("customerPhone", e.target.value);
              }}
              onBlur={() => handleFieldBlur("customerPhone")}
              className={getInputClasses("customerPhone")}
              placeholder={isArabic ? "+961 3 123 456" : "+961 3 123 456"}
              dir={isArabic ? "rtl" : "ltr"}
              autoComplete="tel"
            />
            {renderError("customerPhone")}
            <p className="text-gray-400 text-xs mt-1">
              {isArabic
                ? "مثال: +961 3 123 456 أو 03 123 456"
                : "Example: +961 3 123 456 or 03 123 456"}
            </p>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {t.city}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                handleFieldChange("city", e.target.value);
              }}
              onBlur={() => handleFieldBlur("city")}
              className={`w-full h-11 rounded-xl border px-4 text-sm font-medium outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white cursor-pointer ${
                touched.city && errors.city
                  ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  : "border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              }`}
              dir={isArabic ? "rtl" : "ltr"}
            >
              <option value="">{t.selectCity}</option>
              {LEBANON_GOVERNORATES.map((gov) => (
                <option key={gov.value} value={gov.value}>
                  {isArabic ? gov.labelAr : gov.label}
                </option>
              ))}
            </select>
            {renderError("city")}
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {t.fullAddress}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                handleFieldChange("address", e.target.value);
              }}
              onBlur={() => handleFieldBlur("address")}
              className={`${getTextareaClasses("address")} h-24`}
              placeholder={t.fullAddress}
              dir={isArabic ? "rtl" : "ltr"}
              autoComplete="street-address"
            />
            {renderError("address")}
            <p className="text-gray-400 text-xs mt-1">
              {isArabic
                ? "يجب أن يتضمن الحي والشارع والبناية"
                : "Include neighborhood, street, and building number"}
            </p>
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
                isArabic ? (
                  "مجاني"
                ) : (
                  "Free"
                )
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

      {/* Form Validity Status */}
      <div className="mt-4">
        {!isFormValid && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium">
              {isArabic
                ? "⚠️ يرجى ملء جميع الحقول المطلوبة قبل المتابعة"
                : "⚠️ Please fill in all required fields to continue"}
            </p>
            {(touched.customerName ||
              touched.customerPhone ||
              touched.city ||
              touched.address) && (
              <ul className="text-xs text-red-600 mt-2 ml-4 space-y-1">
                {errors.customerName && (
                  <li>• {isArabic ? "الاسم" : "Name"}</li>
                )}
                {errors.customerPhone && (
                  <li>• {isArabic ? "رقم الهاتف" : "Phone number"}</li>
                )}
                {errors.city && <li>• {isArabic ? "المحافظة" : "City"}</li>}
                {errors.address && (
                  <li>• {isArabic ? "العنوان" : "Address"}</li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}
