"use client";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Loader2,
  StickyNote,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
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

export default function CartClientPage({ store }: Props) {
  const router = useRouter();
  const language = getStoreLanguage(store) as Language;
  const t = checkoutTranslations[language];
  const isArabic = language === "ar";

  // Pull cart management from Context
  const { cartItems, cartTotal, updateCartQty, removeFromCart, clearCart } =
    useShop();

  // ✅ GUARANTEED DATA EXTRACTION: Pull directly from the verified Server Component prop
  const currencySymbol = store?.currency_symbol || "$";
  const storeDeliveryCost = parseFloat(store?.delivery_cost as string) || 0;
  const paymentMethods = store?.payment_methods
    ? typeof store.payment_methods === "string"
      ? (JSON.parse(store.payment_methods) as string[])
      : Array.isArray(store.payment_methods)
        ? store.payment_methods
        : []
    : [];
  // ── Auth & Auto-fill ────────────────────────────────────
  const { customer, loading: authLoading } = useAuth(store?.id);

  // ── Step Navigation ────────────────────────────────────
  const [step, setStep] = useState<"cart" | "shipping">("cart");

  // ── Form State ──────────────────────────────────────
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  // ── Coupon State ────────────────────────────────────
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

  // ── UI State ────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Custom Toast State ──────────────────────────────
  const [toastState, setToastState] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });
  const [toastProgress, setToastProgress] = useState(0);

  const showCustomToast = (type: "success" | "error", message: string) => {
    setToastState({ show: true, type, message });
    setToastProgress(0);
    // Slight delay to allow DOM to register the 0% before transitioning to 100%
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
      }, 3000); // 3 seconds matching the 2950ms CSS transition
    }
    return () => clearTimeout(timeoutId);
  }, [toastState.show]);

  // ── Buy Now Isolated State ────────────────────────────
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

  // ── Proxy Cart Data ───────────────────────────────────
  const activeItems = useMemo(() => {
    return isBuyNow && buyNowItem ? [buyNowItem] : cartItems;
  }, [isBuyNow, buyNowItem, cartItems]);

  const activeSubtotal = useMemo(() => {
    return isBuyNow && buyNowItem
      ? (buyNowItem.product.price || 0) * buyNowItem.qty
      : cartTotal;
  }, [isBuyNow, buyNowItem, cartTotal]);

  // ── Proxy Cart Handlers ───────────────────────────────
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

  // ── Cart/Buy Now Switcher ────────────────────────────
  const switchToCartView = () => {
    setIsBuyNow(false);
  };

  const switchToBuyNowView = () => {
    setIsBuyNow(true);
  };

  // ── Auto-fill from authenticated customer ──────────────
  useEffect(() => {
    if (customer) {
      setCustomerName(`${customer.first_name} ${customer.last_name}`.trim());
      setCustomerPhone(customer.phone || "");
      setCity(customer.governorate || "");
    }
  }, [customer]);

  // ── Totals ──────────────────────────────────────────
  const subtotal = useMemo(() => activeSubtotal, [activeSubtotal]);

  // ✅ ACCURATE SHIPPING CALCULATION
  const shipping = subtotal > 0 ? storeDeliveryCost : 0;

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discountAmount) + shipping;

  // ── Safety: Clear coupon if cart contents change ────
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

  // ── Apply Coupon Logic ──────────────────────────────
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

  // ── Checkout ────────────────────────────────────────
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
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg =
          data.message ||
          t.checkoutFailed ||
          (isArabic ? "فشل إتمام الطلب" : "Checkout failed");

        // ✅ INTERCEPT OUT OF STOCK MESSAGE
        // We catch the backend message if it includes "out of stock" and map the ID to the Product Name
        if (
          typeof data.message === "string" &&
          data.message.toLowerCase().includes("out of stock")
        ) {
          const outOfStockItem = activeItems.find((item) =>
            data.message.includes(String(item.product.id)),
          );

          if (outOfStockItem) {
            // Check for localized name if your product schema supports name_ar, fallback to standard name
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

  // Prevent hydration mismatch layout shift
  if (!isMounted) return null;

  // ── Empty Cart ──────────────────────────────────────
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

  const ArrowIcon = isArabic ? ChevronRight : ChevronLeft;

  return (
    <div className={`w-full bg-white py-8 px-4 ${isArabic ? "rtl" : "ltr"}`}>
      {/* ── CUSTOM TOAST INJECTION ── */}
      {toastState.show && (
        <div
          className={`fixed top-4 ${
            isArabic ? "right-4" : "left-4"
          } z-[100] w-[calc(100vw-2rem)] md:w-[320px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100 transition-all animate-in slide-in-from-top-4 fade-in duration-300`}
          dir={isArabic ? "rtl" : "ltr"}
        >
          {/* PROGRESS BAR */}
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
                <div className="flex items-center gap-2.5">
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
                  <span className="text-sm font-medium text-gray-900">
                    {toastState.message}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setToastState((prev) => ({ ...prev, show: false }))
                  }
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() =>
                    setToastState((prev) => ({ ...prev, show: false }))
                  }
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-medium text-gray-900">
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
      {/* ── END CUSTOM TOAST ── */}

      <div className="max-w-2xl mx-auto">
        {/* Cart/Buy Now Switcher - On cart view with both items available */}
        {step === "cart" && isBuyNow && cartItems.length > 0 && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={switchToBuyNowView}
              className="flex-1 py-3 rounded bg-brand-primary/5 border-[2px] border-brand-primary/40 font-medium text-sm text-brand-primary flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isArabic
                ? `قائمة الشراء السريع  (${buyNowItem?.qty || 1})`
                : `Quick Buy List (${buyNowItem?.qty || 1})`}
            </button>
            <button
              onClick={switchToCartView}
              className="flex-1 py-3 rounded bg-black/5 opacity-80 font-medium text-sm text-black/90 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isArabic
                ? `منتجات السلة (${cartItems.length})`
                : `Cart Items(${cartItems.length})`}
            </button>
          </div>
        )}

        {step === "cart" && !isBuyNow && cartItems.length > 0 && buyNowItem && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={switchToBuyNowView}
              className="flex-1 py-3 rounded bg-black/5 opacity-80 font-medium text-sm text-black/90 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isArabic
                ? `قائمة الشراء السريع  (${buyNowItem?.qty || 1})`
                : `Quick Buy List (${buyNowItem?.qty || 1})`}
            </button>
            <button
              onClick={switchToCartView}
              className="flex-1 py-3 rounded bg-brand-primary/5 border-[2px] border-brand-primary/40 font-medium text-sm text-brand-primary flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isArabic
                ? `منتجات السلة (${cartItems.length})`
                : `Cart Items(${cartItems.length})`}
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {step === "cart"
                ? isBuyNow
                  ? isArabic
                    ? "قائمة الشراء السريع"
                    : "Quick Buy List"
                  : t.cart
                : t.shippingInfo}
            </h3>
            <p className="mt-1 text-xs text-gray-500 font-medium">
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

        {/* STEP 1: CART VIEW */}
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

            {/* Navigation - Enhanced UI */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setStep("shipping")}
                className="flex-[2] h-12 rounded bg-brand-primary text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <ArrowIcon className="w-4 h-4" />
                {isArabic ? "المتابعة للعنوان" : "Continue to Shipping"}
              </button>{" "}
              <button
                onClick={() => {
                  clearBuyNowSession();
                  router.back();
                }}
                className="flex-1 h-12 rounded border border-gray-300 text-gray-700 bg-white font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                {isBuyNow
                  ? isArabic
                    ? "← العودة للمتجر"
                    : "← Back to Store"
                  : isArabic
                    ? "← تابع التسوق"
                    : "← Continue Shopping"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SHIPPING FORM */}
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
              <div className="bg-red-50 text-red-600 text-sm font-bold rounded-xl px-4 py-4 border border-red-200 flex items-center justify-center">
                {error}
              </div>
            )}

            {/* Navigation - Enhanced UI */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={handleCheckout}
                disabled={!canCheckout || loading}
                className="flex-[2] h-12 rounded bg-brand-primary text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    {t.completeCheckout}
                  </>
                )}
              </button>{" "}
              <button
                onClick={() => setStep("cart")}
                className="flex-1 h-12 rounded border border-brand-primary text-brand-primary bg-transparent font-bold text-sm hover:bg-brand-primary hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                {isArabic ? "تعديل السلة" : "Back to Cart"}
                <ArrowIcon className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <div className="text-center text-xs font-bold text-gray-400 flex items-center justify-center gap-2">
              <StickyNote className="w-3.5 h-3.5" />
              {t.secureCheckout}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
