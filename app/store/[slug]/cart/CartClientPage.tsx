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
  Mail,
  StickyNote,
  Tag,
  X,
} from "lucide-react";

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

  // ── Form State ──────────────────────────────────────
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
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
          customerEmail,
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
      <div className="min-h-screen bg-[rgb(250_250_252)] flex items-center justify-center px-4">
        <div className="bg-white border border-[rgb(244_242_245)] rounded-3xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-[rgb(244_242_245)] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-9 h-9 text-[rgb(60_28_84)]/30" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[rgb(60_28_84)]">
            {t.emptyCartTitle}
          </h1>

          <p className="mt-2 text-sm text-[rgb(60_28_84)]/50">
            {t.emptyCartDesc}
          </p>

          <button
            onClick={() => router.push(`/store/${store?.slug}`)}
            className="w-full mt-6 h-12 rounded-2xl bg-[rgb(60_28_84)] text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {t.continueShopping}
          </button>
        </div>
      </div>
    );
  }

  // ── Main Checkout ──────────────────────────────────
  return (
    <div
      className={`min-h-screen bg-[rgb(250_250_252)] py-12 px-4 ${
        isArabic ? "rtl" : "ltr"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Cart Items + Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-white border border-[rgb(244_242_245)] rounded-3xl p-6">
              <h2 className="font-bold text-[rgb(60_28_84)] mb-5">
                {t.orderSummary}
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 pb-4 border-b border-[rgb(244_242_245)] last:border-0"
                  >
                    {/* Product Image */}
                    {item.product.image && (
                      <div className="flex-shrink-0 w-20 h-20 bg-[rgb(244_242_245)] rounded-xl overflow-hidden">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[rgb(60_28_84)]">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-[rgb(60_28_84)]/60 mt-1">
                            {currencySymbol}
                            {item.product.price !== undefined
                              ? item.product.price.toLocaleString()
                              : "0"}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-600"
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
                          className="w-8 h-8 rounded-lg bg-[rgb(244_242_245)] flex items-center justify-center hover:bg-[rgb(60_28_84)]/10"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="w-8 text-center font-medium text-[rgb(60_28_84)]">
                          {item.qty}
                        </span>

                        <button
                          onClick={() =>
                            updateCartQty(item.product.id, item.qty + 1)
                          }
                          className="w-8 h-8 rounded-lg bg-[rgb(244_242_245)] flex items-center justify-center hover:bg-[rgb(60_28_84)]/10"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white border border-[rgb(244_242_245)] rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-[rgb(60_28_84)]">
                  {t.customerInfoTitle}
                </h2>

                {authLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-[rgb(60_28_84)]/40" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  icon={<User className="w-4 h-4" />}
                  placeholder={t.fullName}
                  value={customerName}
                  onChange={setCustomerName}
                  isArabic={isArabic}
                />

                <Input
                  icon={<Phone className="w-4 h-4" />}
                  placeholder={t.phoneNumber}
                  value={customerPhone}
                  onChange={setCustomerPhone}
                  isArabic={isArabic}
                />

                <Input
                  icon={<Mail className="w-4 h-4" />}
                  placeholder={t.emailAddress}
                  value={customerEmail}
                  onChange={setCustomerEmail}
                  isArabic={isArabic}
                  type="email"
                />

                <div className="h-12 rounded-2xl border border-[rgb(244_242_245)] px-4 flex items-center gap-3 focus-within:border-[rgb(60_28_84)] transition">
                  <div className="text-[rgb(60_28_84)]/40">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm font-medium text-[rgb(60_28_84)]"
                  >
                    <option value="">{t.city}</option>
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
              </div>

              <textarea
                placeholder={t.fullAddress}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-4 h-28 rounded-2xl border border-[rgb(244_242_245)] px-4 py-3 outline-none resize-none focus:border-[rgb(60_28_84)]"
                style={{ direction: isArabic ? "rtl" : "ltr" }}
              />

              <textarea
                placeholder={t.orderNotes}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-4 h-24 rounded-2xl border border-[rgb(244_242_245)] px-4 py-3 outline-none resize-none focus:border-[rgb(60_28_84)]"
                style={{ direction: isArabic ? "rtl" : "ltr" }}
              />
            </div>
          </div>

          {/* Right Column: Summary */}
          <div>
            <div className="bg-white border border-[rgb(244_242_245)] rounded-3xl p-6 sticky top-6">
              <h2 className="font-bold text-[rgb(60_28_84)] mb-5">
                {t.orderSummary}
              </h2>

              {/* Coupon Section */}
              {!appliedCoupon ? (
                <div className="mb-6 border-b border-[rgb(244_242_245)] pb-6">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="w-4 h-4 text-[rgb(60_28_84)]/40" />
                      </div>
                      <input
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                        placeholder={t.discountCode}
                        className="w-full h-11 rounded-xl border border-[rgb(244_242_245)] pl-10 pr-4 text-sm outline-none focus:border-[rgb(60_28_84)] transition"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || couponLoading}
                      className="h-11 px-5 bg-[rgb(244_242_245)] text-[rgb(60_28_84)] rounded-xl font-bold text-sm hover:bg-[rgb(60_28_84)] hover:text-white transition disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t.apply
                      )}
                    </button>
                  </div>
                  {couponMessage && (
                    <p
                      className={`text-xs mt-2 font-medium ${
                        couponMessage.type === "success"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-6 border-b border-[rgb(244_242_245)] pb-6">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-800">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs font-medium text-emerald-600">
                          {t.couponApplied}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-200 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Totals Breakdown */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[rgb(60_28_84)]/60">{t.subtotal}</span>
                  <span>
                    {currencySymbol}
                    {subtotal.toLocaleString()}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
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
                  <span className="text-[rgb(60_28_84)]/60">{t.shipping}</span>
                  <span>
                    {currencySymbol}
                    {shipping.toLocaleString()}
                  </span>
                </div>

                <div className="h-px bg-[rgb(244_242_245)]" />

                <div className="flex justify-between font-bold text-base text-[rgb(60_28_84)]">
                  <span>{t.total}</span>
                  <span>
                    {currencySymbol}
                    {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-5 bg-red-50 text-red-600 text-sm font-medium rounded-2xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={
                  loading || !customerName || !customerPhone || !address
                }
                className="w-full mt-6 h-12 rounded-2xl bg-[rgb(60_28_84)] text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

              <div className="mt-4 text-xs font-medium text-[rgb(60_28_84)]/40 flex items-center justify-center gap-2">
                <StickyNote className="w-3 h-3" />
                {t.secureCheckout}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({
  icon,
  placeholder,
  value,
  onChange,
  isArabic,
  type = "text",
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isArabic?: boolean;
  type?: string;
}) {
  return (
    <div className="h-12 rounded-2xl border border-[rgb(244_242_245)] px-4 flex items-center gap-3 focus-within:border-[rgb(60_28_84)] transition">
      {!isArabic && <div className="text-[rgb(60_28_84)]/40">{icon}</div>}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm font-medium text-[rgb(60_28_84)] placeholder:text-[rgb(60_28_84)]/30"
        style={{ direction: isArabic ? "rtl" : "ltr" }}
      />

      {isArabic && <div className="text-[rgb(60_28_84)]/40">{icon}</div>}
    </div>
  );
}
