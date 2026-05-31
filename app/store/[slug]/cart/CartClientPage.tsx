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

type Store = {
  id: string;
  store_name: string;
  slug: string;
};

type Props = {
  store: Store | null;
};

export default function CartClientPage({ store }: Props) {
  const router = useRouter();

  const { cartItems, cartTotal, updateCartQty, removeFromCart, clearCart } =
    useShop();

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
  const [customerLoading, setCustomerLoading] = useState(true); // new

  // ── Auto-fill from session ──────────────────────────
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!store?.id) {
        setCustomerLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/store-customers/me");
        const data = await res.json();

        if (data.success && data.customer) {
          const c = data.customer;

          // Only pre-fill if the session belongs to this store
          if (c.store_id === store.id) {
            setCustomerName(
              `${c.first_name} ${c.last_name}`.trim(),
            );
            setCustomerPhone(c.phone || "");
            setCity(c.governorate || "");
          }
        }
      } catch (err) {
        // Not logged in or error – that's fine, user fills manually
        console.error("Failed to fetch customer session:", err);
      } finally {
        setCustomerLoading(false);
      }
    };

    fetchCustomer();
  }, [store?.id]);

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
        text: "Cart changed. Please re-apply your coupon.",
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
          text: "Coupon applied successfully!",
        });
        setCouponInput("");
      } else {
        setCouponMessage({
          type: "error",
          text: data.message || "Invalid coupon",
        });
      }
    } catch (err) {
      setCouponMessage({
        type: "error",
        text: "Failed to validate coupon",
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
        setError("Store not found");
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
        setError(data.message || "Checkout failed");
        return;
      }

      clearCart();

      router.push(`/store/${store.slug}/success?order=${data.orderId}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
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
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm text-[rgb(60_28_84)]/50">
            Add products to continue checkout
          </p>

          <button
            onClick={() => router.push(`/store/${store?.slug}`)}
            className="mt-6 w-full bg-[rgb(60_28_84)] text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(250_250_252)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(60_28_84)]">
              Checkout
            </h1>

            <p className="text-sm text-[rgb(60_28_84)]/50 mt-1">
              {store?.store_name}
            </p>
          </div>

          <button
            onClick={clearCart}
            className="px-4 py-2 rounded-2xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left */}
          <div className="xl:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white border border-[rgb(244_242_245)] rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-[rgb(244_242_245)]">
                <h2 className="font-bold text-[rgb(60_28_84)]">Order Items</h2>
              </div>

              <div className="divide-y divide-[rgb(244_242_245)]">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-5 flex flex-col sm:flex-row gap-4"
                  >
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[rgb(244_242_245)] shrink-0">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-7 h-7 text-[rgb(60_28_84)]/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-[rgb(60_28_84)]">
                          {item.product.name}
                        </h3>

                        <p className="text-sm text-[rgb(60_28_84)]/50 mt-1">
                          {item.product.price.toLocaleString()} SAR
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateCartQty(item.product.id, item.qty - 1)
                            }
                            className="w-9 h-9 rounded-xl bg-[rgb(244_242_245)] flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <span className="w-8 text-center text-sm font-semibold">
                            {item.qty}
                          </span>

                          <button
                            onClick={() =>
                              updateCartQty(item.product.id, item.qty + 1)
                            }
                            className="w-9 h-9 rounded-xl bg-[rgb(244_242_245)] flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <p className="font-bold text-[rgb(60_28_84)]">
                            {(item.product.price * item.qty).toLocaleString()}{" "}
                            SAR
                          </p>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                  Customer Information
                </h2>

                {customerLoading && (
                  <Loader2 className="w-4 h-4 animate-spin text-[rgb(60_28_84)]/40" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  icon={<User className="w-4 h-4" />}
                  placeholder="Full Name"
                  value={customerName}
                  onChange={setCustomerName}
                />

                <Input
                  icon={<Phone className="w-4 h-4" />}
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={setCustomerPhone}
                />

                <Input
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="Email Address"
                  value={customerEmail}
                  onChange={setCustomerEmail}
                />

                <Input
                  icon={<MapPin className="w-4 h-4" />}
                  placeholder="City"
                  value={city}
                  onChange={setCity}
                />
              </div>

              <textarea
                placeholder="Full Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-4 h-28 rounded-2xl border border-[rgb(244_242_245)] px-4 py-3 outline-none resize-none focus:border-[rgb(60_28_84)]"
              />

              <textarea
                placeholder="Order Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-4 h-24 rounded-2xl border border-[rgb(244_242_245)] px-4 py-3 outline-none resize-none focus:border-[rgb(60_28_84)]"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white border border-[rgb(244_242_245)] rounded-3xl p-6 sticky top-6">
              <h2 className="font-bold text-[rgb(60_28_84)] mb-5">
                Order Summary
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
                        placeholder="Discount code"
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
                        "Apply"
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
                          Coupon applied
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
                  <span className="text-[rgb(60_28_84)]/60">Subtotal</span>
                  <span>{subtotal.toLocaleString()} SAR</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{discountAmount.toLocaleString()} SAR</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-[rgb(60_28_84)]/60">Shipping</span>
                  <span>{shipping.toLocaleString()} SAR</span>
                </div>

                <div className="h-px bg-[rgb(244_242_245)]" />

                <div className="flex justify-between font-bold text-base text-[rgb(60_28_84)]">
                  <span>Total</span>
                  <span>{total.toLocaleString()} SAR</span>
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
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Complete Checkout
                  </>
                )}
              </button>

              <div className="mt-4 text-xs font-medium text-[rgb(60_28_84)]/40 flex items-center justify-center gap-2">
                <StickyNote className="w-3 h-3" />
                Secure checkout experience
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
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="h-12 rounded-2xl border border-[rgb(244_242_245)] px-4 flex items-center gap-3 focus-within:border-[rgb(60_28_84)] transition">
      <div className="text-[rgb(60_28_84)]/40">{icon}</div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm font-medium text-[rgb(60_28_84)] placeholder:text-[rgb(60_28_84)]/30"
      />
    </div>
  );
}