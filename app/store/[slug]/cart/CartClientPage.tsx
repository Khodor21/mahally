"use client";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Loader2,
  StickyNote,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useShop } from "../../context";
import { useAuth } from "@/hooks/useAuth";
import {
  checkoutTranslations,
  type Language,
} from "@/lib/checkout-translations";
import { getStoreLanguage, type Store } from "@/lib/store-types";
import EmptyCartState from "./components/EmptyCartState";
import CartItemsList from "./components/CartItemsList";
import OrderSummary from "./components/OrderSummary";
import ShippingForm from "./components/ShippingForm";

type Props = {
  store: Store | null;
};

const getSelectableVariants = (variantDescription?: string): string => {
  if (!variantDescription) return "";
  try {
    return variantDescription;
  } catch {
    return variantDescription || "";
  }
};

export default function CartClientPage({ store }: Props) {
  const router = useRouter();
  const language = getStoreLanguage(store) as Language;
  const t = checkoutTranslations[language];
  const isArabic = language === "ar";

  // Pull cart management from Context
  const { cartItems, cartTotal, updateCartQty, removeFromCart, clearCart } =
    useShop();

  const currencySymbol = store?.currency_symbol || "$";
  const storeDeliveryCost = parseFloat(store?.delivery_cost as string) || 0;
  const paymentMethods = store?.payment_methods
    ? typeof store.payment_methods === "string"
      ? (JSON.parse(store.payment_methods) as string[])
      : Array.isArray(store.payment_methods)
        ? store.payment_methods
        : []
    : [];

  const { customer, loading: authLoading } = useAuth(store?.id);

  const [step, setStep] = useState<"cart" | "shipping">("cart");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [toastState, setToastState] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });
  const [toastProgress, setToastProgress] = useState(0);

  const showCustomToast = (type: "success" | "error", message: string) => {
    setToastState({ show: true, type, message });
    setToastProgress(0);
    setTimeout(() => {
      setToastProgress(100);
    }, 50);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (toastState.show) {
      timeoutId = setTimeout(() => {
        setToastState((prev) => ({ ...prev, show: false }));
        setToastProgress(0);
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [toastState.show]);

  const [isMounted, setIsMounted] = useState(false);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const tempItem = sessionStorage.getItem("TEMP_BUY_NOW_ITEM");
    if (tempItem) {
      try {
        setBuyNowItem(JSON.parse(tempItem));
        setIsBuyNow(true);
      } catch (e) {
        sessionStorage.removeItem("TEMP_BUY_NOW_ITEM");
      }
    }
  }, []);

  const activeItems = useMemo(() => {
    return isBuyNow && buyNowItem ? [buyNowItem] : cartItems;
  }, [isBuyNow, buyNowItem, cartItems]);

  // SAFE DISCOUNT CALCULATION FOR BUY NOW MODE
  const activeSubtotal = useMemo(() => {
    if (isBuyNow && buyNowItem) {
      const basePrice = Number(buyNowItem.product.price || 0);
      const discountPrice = Number(buyNowItem.product.discount_price || 0);
      const hasDiscount = discountPrice > 0 && discountPrice < basePrice;
      const activePrice = hasDiscount ? discountPrice : basePrice;

      return activePrice * buyNowItem.qty;
    }
    return cartTotal; // cartTotal from Context is now fully discount-aware
  }, [isBuyNow, buyNowItem, cartTotal]);

  const handleUpdateActiveQty = (id: string | number, qty: number) => {
    if (isBuyNow && buyNowItem) {
      const updated = { ...buyNowItem, qty };
      setBuyNowItem(updated);
      sessionStorage.setItem("TEMP_BUY_NOW_ITEM", JSON.stringify(updated));
    } else {
      updateCartQty(String(id), qty);
    }
  };

  const handleRemoveActiveItem = (id: string | number) => {
    if (isBuyNow) {
      sessionStorage.removeItem("TEMP_BUY_NOW_ITEM");
      setIsBuyNow(false);
      setBuyNowItem(null);
    } else {
      removeFromCart(String(id));
    }
  };

  const clearBuyNowSession = () => {
    if (isBuyNow) {
      sessionStorage.removeItem("TEMP_BUY_NOW_ITEM");
      setIsBuyNow(false);
      setBuyNowItem(null);
    }
  };

  const switchToCartView = () => setIsBuyNow(false);
  const switchToBuyNowView = () => setIsBuyNow(true);

  useEffect(() => {
    if (customer) {
      setCustomerName(`${customer.first_name} ${customer.last_name}`.trim());
      setCustomerPhone(customer.phone || "");
      setCity(customer.governorate || "");
    }
  }, [customer]);

  const subtotal = useMemo(() => activeSubtotal, [activeSubtotal]);
  const shipping = subtotal > 0 ? storeDeliveryCost : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discountAmount) + shipping;

  useEffect(() => {
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCouponMessage({
        type: "error",
        text: t.cartChanged,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !store?.id) return;

    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const res = await fetch(
        `/api/coupons?action=validate&storeId=${store.id}&code=${couponInput}&cartTotal=${subtotal}`,
      );
      const data = await res.json();

      if (data.success) {
        setAppliedCoupon({
          code: data.data.coupon.code,
          discountAmount: data.data.discount,
        });
        setCouponMessage({
          type: "success",
          text: t.couponSuccess,
        });
        setCouponInput("");
      } else {
        setCouponMessage({
          type: "error",
          text: data.message || t.couponInvalid,
        });
      }
    } catch (err) {
      setCouponMessage({
        type: "error",
        text: t.couponValidationFailed,
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage(null);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError("");

      if (!store?.id) {
        const errorMsg =
          t.storeNotFound ||
          (isArabic ? "المتجر غير موجود" : "Store not found");
        setError(errorMsg);
        showCustomToast("error", errorMsg);
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: store.id,
          customerName,
          customerPhone,
          city,
          address,
          notes,
          shipping,
          paymentMethod: selectedPaymentMethod,
          couponCode: appliedCoupon?.code || "",
          items: activeItems.map((item) => ({
            productId: item.product.id,
            qty: item.qty,
            variantSelections: item.variantSelections || undefined,
            variantDescription: item.product.variantDescription || "",
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg =
          data.message ||
          t.checkoutFailed ||
          (isArabic ? "فشل إتمام الطلب" : "Checkout failed");

        if (
          typeof data.message === "string" &&
          data.message.toLowerCase().includes("out of stock")
        ) {
          const outOfStockItem = activeItems.find((item) =>
            data.message.includes(String(item.product.id)),
          );

          if (outOfStockItem) {
            const productName = isArabic
              ? outOfStockItem.product.name_ar || outOfStockItem.product.name
              : outOfStockItem.product.name;

            errorMsg = isArabic
              ? `عذراً، المنتج "${productName}" غير متوفر بالكمية المطلوبة`
              : `Sorry, the product "${productName}" is out of stock.`;
          }
        }

        setError(errorMsg);
        showCustomToast("error", errorMsg);
        clearBuyNowSession();
        return;
      }

      showCustomToast(
        "success",
        isArabic ? "تم تأكيد الطلب بنجاح!" : "Order placed successfully!",
      );

      setTimeout(() => {
        if (isBuyNow) {
          clearBuyNowSession();
        } else {
          clearCart();
        }
        router.push(`/`);
      }, 1500);
    } catch (err) {
      console.error(err);
      const errorMsg =
        t.somethingWentWrong ||
        (isArabic ? "حدث خطأ ما" : "Something went wrong");
      setError(errorMsg);
      showCustomToast("error", errorMsg);
      clearBuyNowSession();
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  if (activeItems.length === 0) {
    return (
      <EmptyCartState
        title={t.emptyCartTitle}
        description={t.emptyCartDesc}
        continueShoppingLabel={t.continueShopping}
        onContinueShopping={() => router.push(`/`)}
        isArabic={isArabic}
      />
    );
  }

  const canCheckout =
    customerName.trim() &&
    customerPhone.trim() &&
    city &&
    address.trim() &&
    selectedPaymentMethod &&
    activeItems.length > 0;

  const ProceedIcon = isArabic ? ArrowLeft : ArrowRight;
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;

  return (
    <div
      className={`w-full bg-white py-8 px-4 sm:px-6 md:px-8 pb-40 ${isArabic ? "rtl" : "ltr"}`}
    >
      {toastState.show && (
        <div
          className={`fixed top-4 ${
            isArabic ? "right-4" : "left-4"
          } z-[100] w-[calc(100vw-2rem)] md:w-[320px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 transition-all animate-in slide-in-from-top-4 fade-in duration-300`}
          dir={isArabic ? "rtl" : "ltr"}
        >
          <div
            className={`h-1 ease-linear ${
              toastState.type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}
            style={{
              width: `${toastProgress}%`,
              transitionDuration: toastState.show ? "2950ms" : "0ms",
              transitionProperty: "width",
            }}
          />
          <div className="flex items-center justify-between px-4 py-3">
            {isArabic ? (
              <>
                <div className="flex items-center gap-3">
                  {toastState.type === "success" ? (
                    <CheckCircle2
                      className="flex-shrink-0 text-emerald-500"
                      size={18}
                    />
                  ) : (
                    <AlertCircle
                      className="flex-shrink-0 text-red-500"
                      size={18}
                    />
                  )}
                  <span className="text-sm font-semibold text-gray-900">
                    {toastState.message}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setToastState((prev) => ({ ...prev, show: false }))
                  }
                  className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() =>
                    setToastState((prev) => ({ ...prev, show: false }))
                  }
                  className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {toastState.message}
                  </span>
                  {toastState.type === "success" ? (
                    <CheckCircle2
                      className="flex-shrink-0 text-emerald-500"
                      size={18}
                    />
                  ) : (
                    <AlertCircle
                      className="flex-shrink-0 text-red-500"
                      size={18}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {step === "cart" && isBuyNow && cartItems.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={switchToBuyNowView}
              className="flex-1 py-3.5 rounded-xl bg-brand-primary/5 border-2 border-brand-primary/40 font-semibold text-sm text-brand-primary flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-4 h-4" />
              {isArabic
                ? `قائمة الشراء السريع (${buyNowItem?.qty || 1})`
                : `Quick Buy List (${buyNowItem?.qty || 1})`}
            </button>
            <button
              onClick={switchToCartView}
              className="flex-1 py-3.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              {isArabic
                ? `منتجات السلة (${cartItems.length})`
                : `Cart Items (${cartItems.length})`}
            </button>
          </div>
        )}

        {step === "cart" && !isBuyNow && cartItems.length > 0 && buyNowItem && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={switchToBuyNowView}
              className="flex-1 py-3.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-4 h-4" />
              {isArabic
                ? `قائمة الشراء السريع (${buyNowItem?.qty || 1})`
                : `Quick Buy List (${buyNowItem?.qty || 1})`}
            </button>
            <button
              onClick={switchToCartView}
              className="flex-1 py-3.5 rounded-xl bg-brand-primary/5 border-2 border-brand-primary/40 font-semibold text-sm text-brand-primary flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              {isArabic
                ? `منتجات السلة (${cartItems.length})`
                : `Cart Items (${cartItems.length})`}
            </button>
          </div>
        )}

        <div className="mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {step === "cart"
                ? isBuyNow
                  ? isArabic
                    ? "قائمة الشراء السريع"
                    : "Quick Buy List"
                  : t.cart
                : t.shippingInfo}
            </h3>
            <p className="mt-1.5 text-sm text-gray-500 font-medium">
              {step === "cart"
                ? isBuyNow
                  ? isArabic
                    ? "📦 منتج واحد جاهز للشراء"
                    : "📦 1 item ready to purchase"
                  : ` ${t.products}: ${activeItems.length}`
                : t.fillDetailsBelow}
            </p>
          </div>
        </div>

        {step === "cart" && (
          <div className="space-y-6 animate-fade-in">
            <CartItemsList
              items={activeItems}
              currencySymbol={currencySymbol}
              isArabic={isArabic}
              onUpdateQty={handleUpdateActiveQty}
              onRemoveItem={handleRemoveActiveItem}
            />

            <OrderSummary
              t={t}
              currencySymbol={currencySymbol}
              subtotal={subtotal}
              shipping={shipping}
              discountAmount={discountAmount}
              total={total}
              appliedCoupon={appliedCoupon}
              couponInput={couponInput}
              couponLoading={couponLoading}
              couponMessage={couponMessage}
              onCouponInputChange={setCouponInput}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
            />

            <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 z-[100] pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setStep("shipping")}
                  className="w-full sm:flex-[2] py-3 px-4 rounded-xl bg-brand-primary text-white font-medium text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm order-1 sm:order-2"
                >
                  {isArabic ? "المتابعة للتوصيل" : "Proceed to Delivery"}
                  <ProceedIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    clearBuyNowSession();
                    router.back();
                  }}
                  className="w-full sm:flex-1 py-2 px-2 rounded-xl border border-gray-200 text-gray-700 bg-white font-medium text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm order-2 sm:order-1"
                >
                  <BackIcon className="w-3 h-3" />
                  {isBuyNow
                    ? isArabic
                      ? "العودة للمتجر"
                      : "Back to Store"
                    : isArabic
                      ? "العودة للتسوق"
                      : "Back To Shopping"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "shipping" && (
          <div className="space-y-6 animate-fade-in">
            <ShippingForm
              t={t}
              isArabic={isArabic}
              authLoading={authLoading}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              city={city}
              setCity={setCity}
              address={address}
              notes={notes}
              setNotes={setNotes}
              currencySymbol={currencySymbol}
              subtotal={subtotal}
              shipping={shipping}
              discountAmount={discountAmount}
              total={total}
              appliedCoupon={appliedCoupon}
              activeItems={activeItems}
              paymentMethods={paymentMethods}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodChange={setSelectedPaymentMethod}
              setAddress={setAddress}
            />

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-xl px-4 py-4 border border-red-100 flex items-center justify-center shadow-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}

            <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 z-[100] pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCheckout}
                  disabled={!canCheckout || loading}
                  className="w-full sm:flex-[2] py-3 px-4 rounded-xl bg-brand-primary text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm order-1 sm:order-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.processing}
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      {isArabic ? "تأكيد وإتمام الطلب" : "Complete Order"}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep("cart")}
                  className="w-full sm:flex-1 py-2 px-2 rounded-xl border border-brand-primary/20 text-brand-primary bg-brand-primary/5 font-medium text-xs hover:bg-brand-primary/10 transition-all flex items-center justify-center gap-2 order-2 sm:order-1"
                >
                  <BackIcon className="w-3 h-3" />
                  {isArabic ? "تعديل السلة" : "Back to Cart"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
