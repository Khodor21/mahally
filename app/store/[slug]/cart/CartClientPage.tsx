"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Loader2,
  StickyNote,
  ChevronRight,
  ChevronLeft,
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
        setError(t.storeNotFound);
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
          shipping, // ✅ Dynamic delivery fee correctly sent
          couponCode: appliedCoupon?.code || "",
          items: activeItems.map((item) => ({
            productId: item.product.id,
            qty: item.qty,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t.checkoutFailed);
        clearBuyNowSession(); // Clear session on failure
        return;
      }

      if (isBuyNow) {
        clearBuyNowSession(); // Clear BuyNow instead of global cart
      } else {
        clearCart();
      }

      router.push(`/`);
    } catch (err) {
      console.error(err);
      setError(t.somethingWentWrong);
      clearBuyNowSession(); // Clear session on failure
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
      />
    );
  }

  const canCheckout =
    customerName.trim() &&
    customerPhone.trim() &&
    city &&
    address.trim() &&
    activeItems.length > 0;

  const ArrowIcon = isArabic ? ChevronRight : ChevronLeft;

  return (
    <div className={`w-full bg-white py-8 px-4 ${isArabic ? "rtl" : "ltr"}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {step === "cart" ? t.cart : t.shippingInfo}
            </h3>
            <p className="mt-1 text-sm text-gray-500 font-medium">
              {step === "cart"
                ? ` ${t.products}: ${activeItems.length}`
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
                className="flex-1 h-12 rounded border border-brand-primary text-brand-primary bg-transparent font-bold text-sm hover:bg-brand-primary hover:text-white transition-colors flex items-center justify-center"
              >
                {isArabic ? "العودة" : "Back"}
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
              setAddress={setAddress}
              notes={notes}
              setNotes={setNotes}
              currencySymbol={currencySymbol}
              subtotal={subtotal}
              shipping={shipping}
              discountAmount={discountAmount}
              total={total}
              appliedCoupon={appliedCoupon}
              activeItems={activeItems}
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
