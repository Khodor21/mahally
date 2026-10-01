"use client";

import { Loader2, ChevronDown, ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/app/store/context";

const LEBANON_GOVERNORATES_EN = [
  "Beirut",
  "Mount Lebanon",
  "North",
  "Akkar",
  "Bekaa",
  "Baalbek-Hermel",
  "South",
  "Nabatieh",
  "Keserwan-Jbeil",
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
  "كسروان-جبيل",
];

const LEBANON_GOVERNORATES = LEBANON_GOVERNORATES_EN.map((en, i) => ({
  value: en,
  label: en,
  labelAr: LEBANON_GOVERNORATES_AR[i],
}));

const GIFT_OCCASIONS = [
  { value: "birthday", en: "Birthday", ar: "عيد ميلاد" },
  { value: "wedding", en: "Wedding", ar: "زفاف" },
  { value: "anniversary", en: "Anniversary", ar: "ذكرى سنوية" },
  { value: "graduation", en: "Graduation", ar: "تخرج" },
  { value: "congratulations", en: "Congratulations", ar: "تهاني" },
  { value: "thank_you", en: "Thank You", ar: "شكر" },
  { value: "get_well", en: "Get Well", ar: "للتعافي" },
  { value: "other", en: "Other", ar: "أخرى" },
];

type ValidationErrors = {
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  giftMessage: string;
  giftOccasion: string;
  deliveryDate: string;
};

type Props = {
  isArabic: boolean;
  loading?: boolean;
  onSubmit: (giftData: any) => void;
  cityRates?: Record<string, number>;
  hasCityRates?: boolean;
  storeDeliveryCost?: number;
};

export default function GiftCheckoutForm({
  isArabic,
  loading = false,
  onSubmit,
  cityRates = {},
  hasCityRates = false,
  storeDeliveryCost = 0,
}: Props) {
  const router = useRouter();
  const { giftOrder, currencySymbol } = useShop();

  const t = {
    ar: {
      senderInfo: "معلومات المرسِل",
      recipientInfo: "معلومات المتلقي",
      giftDetails: "تفاصيل الهدية",
      fullName: "الاسم الكامل",
      phoneNumber: "رقم الهاتف",
      city: "المحافظة",
      selectCity: "اختر المحافظة",
      fullAddress: "العنوان الكامل",
      giftMessage: "رسالة الهدية",
      giftOccasion: "مناسبة الهدية",
      selectOccasion: "اختر المناسبة",
      deliveryDate: "تاريخ التسليم",
      optional: "اختياري",
      orderSummary: "ملخص الطلب",
      subtotal: "المجموع الفرعي",
      shipping: "الشحن",
      total: "الإجمالي",
      products: "المنتجات",
      requiredFields: "حقول مع علامة * مطلوبة",
      fillAllFields: "⚠️ يرجى ملء جميع الحقول المطلوبة قبل المتابعة",
      confirmGift: "تأكيد الهدية",
      backToProduct: "العودة للمنتج",
      mobileOnly: "مجاني",
    },
    en: {
      senderInfo: "Sender Information",
      recipientInfo: "Recipient Information",
      giftDetails: "Gift Details",
      fullName: "Full Name",
      phoneNumber: "Phone Number",
      city: "City",
      selectCity: "Select City",
      fullAddress: "Full Address",
      giftMessage: "Gift Message",
      giftOccasion: "Gift Occasion",
      selectOccasion: "Select Occasion",
      deliveryDate: "Delivery Date",
      optional: "Optional",
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      total: "Total",
      products: "Products",
      requiredFields: "Fields marked with * are required",
      fillAllFields: "⚠️ Please fill in all required fields to continue",
      confirmGift: "Confirm Gift",
      backToProduct: "Back to Product",
      mobileOnly: "Free",
    },
  };

  const labels = isArabic ? t.ar : t.en;

  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "+961 ",
    recipientName: "",
    recipientPhone: "+961 ",
    recipientAddress: "",
    recipientCity: "",
    giftMessage: "",
    giftOccasion: "",
    deliveryDate: "",
  });

  const getDeliveryRate = () => {
    if (!formData.recipientCity) return 0;

    // If store has city-based rates, use them; otherwise use store default
    if (hasCityRates) {
      return cityRates[formData.recipientCity] || 0;
    } else {
      // Use store's default delivery cost for all cities
      return storeDeliveryCost;
    }
  };

  const deliveryRate = getDeliveryRate();
  const [errors, setErrors] = useState<Partial<ValidationErrors>>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof typeof formData, boolean>>
  >({});
  const [isOccasionDropdownOpen, setIsOccasionDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [cityDisplayName, setCityDisplayName] = useState("");

  // useEffect(() => {
  //   if (!giftOrder || giftOrder.items.length === 0) {
  //     router.push("/");
  //   }
  // }, [giftOrder, router]);

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-]/g, "");
    const phoneRegex = /^(\+[1-9]\d{7,14}|0[1-9]\d{7})$/;
    return phoneRegex.test(cleaned);
  };

  const validateField = (
    field: keyof typeof formData,
    value: string,
  ): string => {
    switch (field) {
      case "senderName":
      case "recipientName":
        if (!value?.trim()) {
          return isArabic ? "الاسم مطلوب" : "Name is required";
        }
        if (value.trim().length < 2) {
          return isArabic
            ? "الاسم يجب أن يكون حرفين على الأقل"
            : "Name must be at least 2 characters";
        }
        return "";

      case "senderPhone":
      case "recipientPhone":
        if (!value?.trim() || value.trim() === "+961") {
          return isArabic ? "رقم الهاتف مطلوب" : "Phone number is required";
        }
        if (!validatePhoneNumber(value)) {
          return isArabic ? "رقم هاتف صحيح مطلوب" : "Valid phone required";
        }
        return "";

      case "recipientAddress":
        if (!value?.trim()) {
          return isArabic ? "العنوان مطلوب" : "Address is required";
        }
        if (value.trim().length < 5) {
          return isArabic
            ? "العنوان يجب أن يكون أطول"
            : "Please provide a more detailed address";
        }
        return "";

      case "recipientCity":
        if (!value) {
          return isArabic ? "يجب اختيار محافظة" : "City selection required";
        }
        return "";

      case "giftOccasion":
        if (!value) {
          return isArabic ? "يجب اختيار مناسبة" : "Occasion selection required";
        }
        return "";

      default:
        return "";
    }
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleFieldBlur = (field: keyof typeof formData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isFormValid =
    !errors.senderName &&
    !errors.senderPhone &&
    !errors.recipientName &&
    !errors.recipientPhone &&
    !errors.recipientAddress &&
    !errors.recipientCity &&
    !errors.giftOccasion &&
    formData.senderName.trim() &&
    formData.senderPhone.trim() &&
    formData.senderPhone.trim() !== "+961" &&
    formData.recipientName.trim() &&
    formData.recipientPhone.trim() &&
    formData.recipientPhone.trim() !== "+961" &&
    formData.recipientAddress.trim() &&
    formData.recipientCity &&
    formData.giftOccasion;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && giftOrder) {
      onSubmit({
        ...formData,
        items: giftOrder.items,
        deliveryRate: deliveryRate,
      });
    }
  };

  const renderError = (field: keyof typeof formData) => {
    if (touched[field] && errors[field]) {
      return (
        <p className="text-red-500 text-xs mt-1 font-medium">{errors[field]}</p>
      );
    }
    return null;
  };

  const getInputClasses = (field: keyof typeof formData) => {
    const hasError = touched[field] && errors[field];
    const baseClasses =
      "w-full h-11 rounded-xl border px-4 text-sm font-medium outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white";

    if (hasError) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-200`;
    }
    return `${baseClasses} border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary`;
  };

  const getTextareaClasses = () => {
    const baseClasses =
      "w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition-all resize-none bg-gray-50 hover:bg-white focus:bg-white";
    return `${baseClasses} border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary`;
  };

  if (!giftOrder) return null;

  const totalPrice = giftOrder.items.reduce((sum, item) => {
    const basePrice = Number(item.product.price || 0);
    const discountPrice = Number(item.product.discount_price || 0);
    const hasDiscount = discountPrice > 0 && discountPrice < basePrice;
    const activePrice = hasDiscount ? discountPrice : basePrice;
    return sum + activePrice * item.qty;
  }, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sender Info */}
      <div className="p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-4">
          {labels.senderInfo}
        </h3>
        <p className="text-xs text-gray-500 mb-4">{labels.requiredFields}</p>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {labels.fullName}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.senderName}
              onChange={(e) => handleFieldChange("senderName", e.target.value)}
              onBlur={() => handleFieldBlur("senderName")}
              className={getInputClasses("senderName")}
              placeholder={labels.fullName}
              dir={isArabic ? "rtl" : "ltr"}
            />
            {renderError("senderName")}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {labels.phoneNumber}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="tel"
              value={formData.senderPhone}
              onChange={(e) => handleFieldChange("senderPhone", e.target.value)}
              onBlur={() => handleFieldBlur("senderPhone")}
              className={getInputClasses("senderPhone")}
              placeholder="+961 3 123 456"
              dir="ltr"
            />
            {renderError("senderPhone")}
          </div>
        </div>
      </div>

      {/* Recipient Info */}
      <div className="bg-white rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-4">
          {labels.recipientInfo}
        </h3>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {labels.fullName}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) =>
                handleFieldChange("recipientName", e.target.value)
              }
              onBlur={() => handleFieldBlur("recipientName")}
              className={getInputClasses("recipientName")}
              placeholder={labels.fullName}
              dir={isArabic ? "rtl" : "ltr"}
            />
            {renderError("recipientName")}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {labels.phoneNumber}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="tel"
              value={formData.recipientPhone}
              onChange={(e) =>
                handleFieldChange("recipientPhone", e.target.value)
              }
              onBlur={() => handleFieldBlur("recipientPhone")}
              className={getInputClasses("recipientPhone")}
              placeholder="+961 3 123 456"
              dir="ltr"
            />
            {renderError("recipientPhone")}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {labels.city}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className={`w-full h-11 rounded-xl border px-4 text-sm font-medium outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white flex items-center justify-between ${
                  touched.recipientCity && errors.recipientCity
                    ? "border-red-300"
                    : "border-gray-200"
                }`}
                dir={isArabic ? "rtl" : "ltr"}
              >
                <span
                  className={
                    cityDisplayName ? "text-gray-900" : "text-gray-500"
                  }
                >
                  {cityDisplayName ||
                    (isArabic ? "اختر المحافظة" : "Select City")}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isCityDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                  {LEBANON_GOVERNORATES.map((gov) => (
                    <button
                      key={gov.value}
                      type="button"
                      onClick={() => {
                        handleFieldChange("recipientCity", gov.value);
                        setCityDisplayName(isArabic ? gov.labelAr : gov.label);
                        setIsCityDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50"
                      dir={isArabic ? "rtl" : "ltr"}
                    >
                      {isArabic ? gov.labelAr : gov.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {renderError("recipientCity")}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {labels.fullAddress}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={formData.recipientAddress}
              onChange={(e) =>
                handleFieldChange("recipientAddress", e.target.value)
              }
              onBlur={() => handleFieldBlur("recipientAddress")}
              className={`${getTextareaClasses()} h-24`}
              placeholder={labels.fullAddress}
              dir={isArabic ? "rtl" : "ltr"}
            />
            {renderError("recipientAddress")}
          </div>
        </div>
      </div>

      {/* Gift Details */}
      <div className="bg-white rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-4">
          {labels.giftDetails}
        </h3>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {labels.giftOccasion}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setIsOccasionDropdownOpen(!isOccasionDropdownOpen)
                }
                className={`w-full h-11 rounded-xl border px-4 text-sm font-medium outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white flex items-center justify-between ${
                  touched.giftOccasion && errors.giftOccasion
                    ? "border-red-300"
                    : "border-gray-200"
                }`}
                dir={isArabic ? "rtl" : "ltr"}
              >
                <span
                  className={
                    formData.giftOccasion ? "text-gray-900" : "text-gray-500"
                  }
                >
                  {formData.giftOccasion
                    ? GIFT_OCCASIONS.find(
                        (o) => o.value === formData.giftOccasion,
                      )?.[isArabic ? "ar" : "en"]
                    : labels.selectOccasion}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isOccasionDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOccasionDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                  {GIFT_OCCASIONS.map((occasion) => (
                    <button
                      key={occasion.value}
                      type="button"
                      onClick={() => {
                        handleFieldChange("giftOccasion", occasion.value);
                        setIsOccasionDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50"
                      dir={isArabic ? "rtl" : "ltr"}
                    >
                      {isArabic ? occasion.ar : occasion.en}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {renderError("giftOccasion")}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {labels.giftMessage}{" "}
              <span className="text-gray-400 font-medium">
                ({labels.optional})
              </span>
            </label>
            <textarea
              value={formData.giftMessage}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  giftMessage: e.target.value,
                }))
              }
              className={`${getTextareaClasses()} h-24`}
              placeholder={labels.giftMessage}
              dir={isArabic ? "rtl" : "ltr"}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {labels.deliveryDate}{" "}
              <span className="text-gray-400 font-medium">
                ({labels.optional})
              </span>
            </label>
            <input
              type="date"
              value={formData.deliveryDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deliveryDate: e.target.value,
                }))
              }
              className={`${getInputClasses("deliveryDate")}`}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">{labels.orderSummary}</h3>
        <div className="space-y-3 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">{labels.subtotal}</span>
            <span className="font-bold text-gray-900">
              {currencySymbol}
              {totalPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">{labels.shipping}</span>
            <span className="font-bold text-gray-900">
              {deliveryRate > 0
                ? `${currencySymbol}${deliveryRate.toLocaleString()}`
                : isArabic
                  ? labels.mobileOnly
                  : "Free"}
            </span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between font-black text-lg">
            <span className="text-gray-900">{labels.total}</span>
            <span className="text-brand-primary">
              {currencySymbol}
              {(totalPrice + (deliveryRate || 0)).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-900 mb-3">
            {labels.products}
          </p>
          <div className="space-y-2">
            {giftOrder.items.map((item) => (
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

      {/* Validation Warning */}
      {!isFormValid && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700 font-medium">
            {labels.fillAllFields}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 px-4 rounded-sm border border-gray-200 text-gray-900 font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          {isArabic ? (
            <ArrowRight className="w-4 h-4" />
          ) : (
            <ArrowLeft className="w-4 h-4" />
          )}
          {labels.backToProduct}
        </button>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="flex-1 py-3 px-4 rounded-sm bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {labels.confirmGift}
        </button>
      </div>
    </form>
  );
}
