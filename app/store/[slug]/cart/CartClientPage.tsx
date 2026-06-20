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
  MapPin,
  User,
  Phone,
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
import {
  getStoreLanguage,
  getCurrencySymbol,
  type Store,
} from "@/lib/store-types";

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
  const currencySymbol = getCurrencySymbol(store);
  const isArabic = language === "ar";
  const { cartItems, cartTotal, updateCartQty, removeFromCart, clearCart } =
    useShop();

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
  const shipping = subtotal > 0 ? 15 : 0;
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
          shipping,
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
      router.push(`/store/${store.slug}/success?order=${data.orderId}`);
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
      // 👉 Removed min-h-screen so the recommendations underneath are visible
      <div className="w-full bg-white flex flex-col items-center justify-center pt-8 px-4">
        {/* 👉 Removed border-gray-200 */}
        <div className="bg-white rounded-sm p-8 max-w-md w-full text-center">
          {/* 👉 Removed bg-gray-100 and added Emoji */}
          <div className="flex items-center justify-center gap-1">
            <h3 className="text-xl mt-1 font-bold text-gray-900">
              {t.emptyCartTitle}
            </h3>{" "}
            <Emoji unified="1f915" size={34} />
          </div>

          <p className="mt-2 text-sm text-gray-500">{t.emptyCartDesc}</p>
          <button
            onClick={() => router.push(`/`)} // 👉 Changed route to '/'
            className="w-full mt-6 h-11 rounded-xs text-brand-primary underline font-medium transition flex items-center justify-center gap-2"
          >
            <ArrowRight />
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
    // 👉 Removed min-h-screen from here as well to allow natural flow
    <div className={`w-full bg-white py-8 px-4 ${isArabic ? "rtl" : "ltr"}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">
            {step === "cart" ? t.cart : t.shippingInfo}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {step === "cart"
              ? ` ${t.products}: ${cartItems.length}`
              : t.fillDetailsBelow}
          </p>
        </div>

        {/* STEP 1: CART VIEW */}
        {step === "cart" && (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="bg-white">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                  >
                    {/* Product Image */}
                    {item.product.image && (
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xs overflow-hidden">
                        <Image
                          src={item.product.image}
                          alt={item.product.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          {/* Product Title - ALWAYS VISIBLE */}
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {item.product.title}
                          </p>

                          {/* Price */}
                          <p className="text-sm font-semibold text-gray-900 mt-2">
                            {currencySymbol}
                            {item.product.price !== undefined
                              ? item.product.price.toLocaleString()
                              : "0"}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-600 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() =>
                            updateCartQty(
                              item.product.id,
                              Math.max(1, item.qty - 1),
                            )
                          }
                          className="w-7 h-7 rounded-xs bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition text-gray-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900 text-sm">
                          {item.qty}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQty(item.product.id, item.qty + 1)
                          }
                          className="w-7 h-7 rounded-xs bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition text-gray-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.subtotal}</span>
                  <span className="font-semibold text-gray-900">
                    {currencySymbol}
                    {subtotal.toLocaleString()}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-semibold">
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
                  <span className="text-gray-600">{t.shipping}</span>
                  <span className="font-semibold text-gray-900">
                    {currencySymbol}
                    {shipping.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-gray-300" />
                <div className="flex justify-between font-bold text-base">
                  <span className="text-gray-900">{t.total}</span>
                  <span className="text-gray-900">
                    {currencySymbol}
                    {total.toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Coupon Section */}
              <div className="mt-4">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="w-3 h-3 text-gray-400" />
                      </div>
                      <input
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                        placeholder={t.discountCode}
                        className="w-full h-8 rounded-xs border border-gray-200 pl-10 pr-4 text-sm outline-none focus:border-gray-400 transition bg-white"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || couponLoading}
                      className="h-8 px-4 bg-gray-900 text-white rounded-xs font-medium text-xs hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t.apply
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xs border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xs bg-green-100 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-800">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-600">
                          {t.couponApplied}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-100 rounded-xs transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {couponMessage && (
                  <p
                    className={`text-xs mt-2 font-medium ${
                      couponMessage.type === "success"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep("shipping")}
                className="flex-1 h-11 rounded-xs bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                <ArrowIcon className="w-4 h-4" />
                {isArabic ? "المتابعة" : "Continue"}
              </button>
              <button
                onClick={() => router.back()}
                className="flex-1 h-11 rounded-xs border border-gray-300 text-gray-900 font-medium text-sm hover:bg-gray-50 transition flex items-center justify-center"
              >
                {isArabic ? "العودة" : "Back"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SHIPPING FORM */}
        {step === "shipping" && (
          <div className="space-y-6">
            {/* Customer Info Form */}
            <div className="">
              <div className="flex items-center justify-between mb-6">
                {authLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    {t.fullName}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full h-11 rounded-xs border border-gray-200 px-4 text-sm outline-none focus:border-gray-400 transition bg-white"
                    placeholder={t.fullName}
                    dir={isArabic ? "rtl" : "ltr"}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    {t.phoneNumber}
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full h-11 rounded-xs border border-gray-200 px-4 text-sm outline-none focus:border-gray-400 transition bg-white"
                    placeholder={t.phoneNumber}
                    dir={isArabic ? "rtl" : "ltr"}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    {t.city}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-11 rounded-xs border border-gray-200 px-4 text-sm outline-none focus:border-gray-400 transition bg-white"
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
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    {t.fullAddress}
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-24 rounded-xs border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400 transition resize-none bg-white"
                    placeholder={t.fullAddress}
                    dir={isArabic ? "rtl" : "ltr"}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    {t.orderNotes}{" "}
                    <span className="text-gray-500 font-normal">
                      ({isArabic ? "اختياري" : "Optional"})
                    </span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-20 rounded-xs border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400 transition resize-none bg-white"
                    placeholder={t.orderNotes}
                    dir={isArabic ? "rtl" : "ltr"}
                  />
                </div>
              </div>
            </div>

            {/* Order Review */}
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">{t.orderSummary}</h2>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.subtotal}</span>
                  <span className="font-semibold text-gray-900">
                    {currencySymbol}
                    {subtotal.toLocaleString()}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-semibold">
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
                  <span className="text-gray-600">{t.shipping}</span>
                  <span className="font-semibold text-gray-900">
                    {currencySymbol}
                    {shipping.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-gray-300" />
                <div className="flex justify-between font-bold text-base">
                  <span className="text-gray-900">{t.total}</span>
                  <span className="text-gray-900">
                    {currencySymbol}
                    {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Quick Review of Items */}
              <div className="bg-white rounded-xs p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-3">
                  {t.products}
                </p>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between text-xs"
                    >
                      <span className="text-gray-600 truncate">
                        {item.product.title}
                      </span>
                      <span className="text-gray-900 font-semibold ml-2 flex-shrink-0">
                        ×{item.qty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm font-medium rounded-xs px-4 py-3 border border-red-200">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep("cart")}
                className="flex-1 h-11 rounded-xs border border-gray-300 text-gray-900 font-medium text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <ArrowIcon className="w-4 h-4 rotate-180" />
                {isArabic ? "العودة" : "Back"}
              </button>
              <button
                onClick={handleCheckout}
                disabled={!canCheckout || loading}
                className="flex-1 h-11 rounded-xs bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
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

            <div className="text-center text-xs font-medium text-gray-500 flex items-center justify-center gap-2">
              <StickyNote className="w-3 h-3" />
              {t.secureCheckout}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
