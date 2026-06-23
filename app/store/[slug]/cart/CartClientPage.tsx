"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  Loader2,
  StickyNote,
  Tag,
  X,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Emoji } from "emoji-picker-react";
import { useShop } from "../../context";
import { useAuth } from "@/hooks/useAuth";
import {
  checkoutTranslations,
  type Language,
} from "@/lib/checkout-translations";
import { getStoreLanguage, type Store } from "@/lib/store-types";

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

  // ── Auto-fill from authenticated customer ──────────────
  useEffect(() => {
    if (customer) {
      setCustomerName(`${customer.first_name} ${customer.last_name}`.trim());
      setCustomerPhone(customer.phone || "");
      setCity(customer.governorate || "");
    }
  }, [customer]);

  // ── Totals ──────────────────────────────────────────
  const subtotal = useMemo(() => cartTotal, [cartTotal]);

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
          items: cartItems.map((item) => ({
            productId: item.product.id,
            qty: item.qty,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t.checkoutFailed);
        return;
      }

      clearCart();
      router.push(`/`);
    } catch (err) {
      console.error(err);
      setError(t.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  };

  // ── Empty Cart ──────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="w-full bg-white flex flex-col items-center justify-center pt-8 px-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center border border-gray-100 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {t.emptyCartTitle}
            </h3>
            <Emoji unified="1f915" size={32} />
          </div>

          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            {t.emptyCartDesc}
          </p>
          <button
            onClick={() => router.push(`/`)}
            className="w-full h-12 rounded-xl bg-brand-primary text-white font-bold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            {t.continueShopping}
          </button>
        </div>
      </div>
    );
  }

  const canCheckout =
    customerName.trim() &&
    customerPhone.trim() &&
    city &&
    address.trim() &&
    cartItems.length > 0;

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
                ? ` ${t.products}: ${cartItems.length}`
                : t.fillDetailsBelow}
            </p>
          </div>
        </div>

        {/* STEP 1: CART VIEW */}
        {step === "cart" && (
          <div className="space-y-6 animate-fade-in">
            {/* Cart Items */}
            <div className="bg-white">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                  >
                    {/* Product Image */}
                    {item.product.image && (
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative">
                        <Image
                          src={item.product.image}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          {/* Product Title */}
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {item.product.title}
                          </p>

                          {/* Price */}
                          <p className="text-sm font-bold text-brand-primary mt-1">
                            {currencySymbol}
                            {item.product.price !== undefined
                              ? item.product.price.toLocaleString()
                              : "0"}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() =>
                            updateCartQty(
                              item.product.id,
                              Math.max(1, item.qty - 1),
                            )
                          }
                          className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary transition-all text-gray-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900 text-sm">
                          {item.qty}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQty(item.product.id, item.qty + 1)
                          }
                          className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-brand-primary hover:text-brand-primary transition-all text-gray-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-6">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">
                    {t.subtotal}
                  </span>
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
                  <span className="text-gray-600 font-medium">
                    {t.shipping}
                  </span>
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

              {/* Coupon Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Tag className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                        placeholder={t.discountCode}
                        className="w-full h-11 rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-medium outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all bg-white uppercase"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || couponLoading}
                      className="h-11 px-5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[90px]"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t.apply
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center">
                        <Tag className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-primary">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs font-medium text-brand-primary/70">
                          {t.couponApplied}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="w-9 h-9 flex items-center justify-center text-brand-primary hover:bg-brand-primary/20 rounded-lg transition-colors"
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

            {/* Navigation - Enhanced UI */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => router.back()}
                className="flex-1 h-12 rounded-xl border-2 border-brand-primary text-brand-primary bg-transparent font-bold text-sm hover:bg-brand-primary hover:text-white transition-colors flex items-center justify-center"
              >
                {isArabic ? "العودة" : "Back"}
              </button>
              <button
                onClick={() => setStep("shipping")}
                className="flex-[2] h-12 rounded-xl bg-brand-primary text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {isArabic ? "المتابعة للعنوان" : "Continue to Shipping"}
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SHIPPING FORM */}
        {step === "shipping" && (
          <div className="space-y-6 animate-fade-in">
            {/* Customer Info Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
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
                    {(isArabic
                      ? LEBANON_GOVERNORATES_AR
                      : LEBANON_GOVERNORATES_EN
                    ).map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
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
                  <span className="text-gray-600 font-medium">
                    {t.subtotal}
                  </span>
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
                  <span className="text-gray-600 font-medium">
                    {t.shipping}
                  </span>
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
                <p className="text-xs font-bold text-gray-900 mb-3">
                  {t.products}
                </p>
                <div className="space-y-2">
                  {cartItems.map((item) => (
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

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-bold rounded-xl px-4 py-4 border border-red-200 flex items-center justify-center">
                {error}
              </div>
            )}

            {/* Navigation - Enhanced UI */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setStep("cart")}
                className="flex-1 h-12 rounded-xl border-2 border-brand-primary text-brand-primary bg-transparent font-bold text-sm hover:bg-brand-primary hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <ArrowIcon className="w-4 h-4 rotate-180" />
                {isArabic ? "تعديل السلة" : "Back to Cart"}
              </button>
              <button
                onClick={handleCheckout}
                disabled={!canCheckout || loading}
                className="flex-[2] h-12 rounded-xl bg-brand-primary text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
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
