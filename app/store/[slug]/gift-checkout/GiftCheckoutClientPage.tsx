"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/app/store/context";
import GiftCheckoutForm from "./GiftCheckoutForm";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Emoji } from "emoji-picker-react";

type Props = {
  store: any;
  lang: "en" | "ar";
};

export default function GiftCheckoutClientPage({ store, lang }: Props) {
  const router = useRouter();
  const { giftOrder, clearGiftOrder, isConfigLoading } = useShop();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [cityRates, setCityRates] = useState<Record<string, number>>({});
  const [hasCityRates, setHasCityRates] = useState(false);

  const isArabic = lang === "ar";
  const storeDeliveryCost = parseFloat(store?.delivery_cost as string) || 0;

  const t = {
    ar: {
      giftCheckout: "طلب الهدية",
      processing: "جاري المعالجة...",
      orderConfirmed: "تم تأكيد طلبك بنجاح! ",
      confirmationMessage: "تمَ استلام طلب إرسال الهدية، سنتواصل معك قريباً.",
      orderNumber: "رقم الطلب",
      backToStoreBtn: "حسناً، العودة للمتجر",
      errorSubmitting: "خطأ في إرسال الطلب",
      tryAgain: "حاول مرة أخرى",
      noGiftOrder: "لا يوجد هدية للطلب",
      noGiftMessage: "يرجى اختيار منتج أولاً قبل المتابعة",
      backToStore: "العودة للمتجر",
      loadingConfig: "جاري تحميل البيانات...",
    },
    en: {
      giftCheckout: "Gift Checkout",
      processing: "Processing...",
      orderConfirmed: "Your order has been confirmed!",
      confirmationMessage: "Gift Order Confirmed, we will contact you soon.",
      orderNumber: "Order ID",
      backToStoreBtn: "OK, Back to Store",
      errorSubmitting: "Error submitting order",
      tryAgain: "Try Again",
      noGiftOrder: "No gift to order",
      noGiftMessage: "Please select a product first before proceeding",
      backToStore: "Back to Store",
      loadingConfig: "Loading data...",
    },
  };

  const labels = isArabic ? t.ar : t.en;

  // Redirect to home only on mount if no gift order (not after successful submit)
  useEffect(() => {
    if (isConfigLoading || successModalOpen) return;

    // Only redirect if we're on page load with empty cart (not after clearGiftOrder)
    if (!giftOrder || giftOrder.items.length === 0) {
      if (!createdOrderId) {
        const timer = setTimeout(() => {}, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isConfigLoading, successModalOpen, createdOrderId]);

  // Scroll to top when modal opens
  useEffect(() => {
    if (successModalOpen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [successModalOpen]);

  // Fetch delivery rates from API
  useEffect(() => {
    if (!store?.id) return;
    fetch(`/api/delivery-rates?storeId=${store.id}`)
      .then((r) => r.json())
      .then((data) => {
        const ratesArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.rates)
            ? data.rates
            : Array.isArray(data?.data)
              ? data.data
              : [];

        const map: Record<string, number> = {};
        let hasValidRates = false;

        ratesArray.forEach((r: any) => {
          if (!r.governorate) return;
          const gov = String(r.governorate).trim();
          const cost = Number(r.delivery_cost);
          map[gov] = cost;
          if (cost > 0) hasValidRates = true;
        });

        setCityRates(map);
        setHasCityRates(hasValidRates);
      })
      .catch(console.error);
  }, [store?.id]);
  const handleSubmitGift = async (formData: any) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const storeId = store.id;

      if (!storeId) {
        throw new Error("Store ID not found");
      }

      // Use deliveryRate from form (already calculated there)
      const deliveryShipping = formData.deliveryRate || 0;
      console.log("🎁 Submit Debug:", {
        recipientCity: formData.recipientCity,
        deliveryRate: formData.deliveryRate,
        deliveryShipping,
      });

      const payload = {
        storeId,
        senderName: formData.senderName,
        senderPhone: formData.senderPhone,
        customerName: formData.recipientName,
        customerPhone: formData.recipientPhone,
        city: formData.recipientCity,
        address: formData.recipientAddress,
        isGift: true,
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        recipientAddress: formData.recipientAddress,
        recipientCity: formData.recipientCity,
        giftMessage: formData.giftMessage || "",
        giftOccasion: formData.giftOccasion,
        deliveryDate:
          formData.deliveryDate && formData.deliveryDate.trim()
            ? formData.deliveryDate
            : null,
        items: formData.items.map((item: any) => ({
          productId: item.product.id,
          qty: item.qty,
          variantSelections: item.variantSelections || undefined,
        })),
        shipping: deliveryShipping,
        paymentMethod: "cash_on_delivery",
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create gift order");
      }

      // Show success modal and clear order
      setCreatedOrderId(data.orderId);
      clearGiftOrder();
      setSuccessModalOpen(true);
      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Gift checkout error:", error);
      setSubmitError(error.message || labels.errorSubmitting);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isConfigLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-gray-600 font-medium">{labels.loadingConfig}</p>
        </div>
      </div>
    );
  }

  // If no gift order and modal not open, show empty state
  if (!successModalOpen && (!giftOrder || giftOrder.items.length === 0)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {labels.noGiftOrder}
          </h3>
          <p className="text-gray-600 mb-6">{labels.noGiftMessage}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-2 px-4 rounded-sm bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-colors"
          >
            {labels.backToStore}
          </button>
        </div>
      </div>
    );
  }

  // Show loading spinner during submission
  if (isSubmitting) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-gray-600 font-medium">{labels.processing}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (submitError) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-red-600 mb-2">
            {labels.errorSubmitting}
          </h3>
          <p className="text-gray-600 mb-6">{submitError}</p>
          <button
            onClick={() => {
              setSubmitError(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full py-2 px-4 rounded-sm bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-colors"
          >
            {labels.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={isArabic ? "rtl" : "ltr"}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-start text-center gap-1">
          <Emoji unified="1f381" size={20} />
          <h3 className="font-medium text-primary mt-3 text-lg md:text-xl mb-2">
            {labels.giftCheckout}
          </h3>
        </div>
        <GiftCheckoutForm
          isArabic={isArabic}
          loading={isSubmitting}
          onSubmit={handleSubmitGift}
          cityRates={cityRates}
          hasCityRates={hasCityRates}
          storeDeliveryCost={storeDeliveryCost}
        />
      </div>

      {/* SUCCESS MODAL */}
      {successModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
          dir={isArabic ? "rtl" : "ltr"}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center animate-fade-up">
            <div className="flex items-center justify-center text-center gap-0.5">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {labels.orderConfirmed}
              </h3>
              <Emoji unified="1f389" />
            </div>

            <p className="text-sm text-gray-500 mb-6">
              {labels.confirmationMessage}
            </p>

            <button
              onClick={() => {
                setSuccessModalOpen(false);
                router.push("/");
              }}
              className="w-full bg-brand-primary text-white py-2 rounded-sm font-medium hover:bg-primary/70 transition-colors"
            >
              {labels.backToStoreBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
