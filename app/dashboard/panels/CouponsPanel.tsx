"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Copy,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  X,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  TrendingUp,
  Zap,
  Gift,
  Clock,
} from "lucide-react";

import { useDashboard } from "../DashboardContext";
import Toast from "../components/Toast";
import type { StoreData } from "../types";

interface Coupon {
  id: string;
  store_id: string;
  code: string;
  type: "percentage" | "fixed";
  discount: number;
  description?: string;
  min_purchase: number;
  max_uses: number;
  max_uses_per_customer: number;
  expiry_date: string;
  is_active: boolean;
  used_count: number;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

interface ToastState {
  message: string;
  type: "success" | "error";
}

interface CouponsPanelProps {
  store?: StoreData;
}

export default function CouponsPanel({ store }: CouponsPanelProps) {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    discount: 10,
    description: "",
    minPurchase: 0,
    maxUses: 999999,
    maxUsesPerCustomer: 1,
    expiryDate: "",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // 1. Fetching no longer needs the query param
  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/coupons`); // Cleaned up
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data || []);
      } else {
        showToast(data.message || "Failed to load coupons", "error");
      }
    } catch (error) {
      showToast("Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  }, []); // Removed store dependency

  // 2. Submit no longer sends storeId
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast(
        lang === "ar" ? "يرجى التحقق من الحقول" : "Please check the fields",
        "error",
      );
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = "/api/coupons";
      const method = editingCoupon ? "PATCH" : "POST";

      const basePayload = {
        ...formData,
        discount: parseFloat(formData.discount.toString()),
        minPurchase: parseFloat(formData.minPurchase.toString()),
        maxUses: parseInt(formData.maxUses.toString()),
        maxUsesPerCustomer: parseInt(formData.maxUsesPerCustomer.toString()),
        expiryDate: new Date(formData.expiryDate).toISOString(),
      };

      const payload = editingCoupon
        ? { couponId: editingCoupon.id, ...basePayload }
        : basePayload;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        showToast(
          editingCoupon
            ? lang === "ar"
              ? "تم تحديث الكوبون"
              : "Coupon updated"
            : lang === "ar"
              ? "تم إنشاء الكوبون"
              : "Coupon created",
          "success",
        );
        closeModal();
        fetchCoupons();
      } else {
        showToast(data.message || "Failed to save coupon", "error");
      }
    } catch (error) {
      showToast("Failed to save coupon", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Delete no longer sends storeId
  const handleDelete = async (couponId: string) => {
    if (!window.confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?"))
      return;

    try {
      const res = await fetch(`/api/coupons?couponId=${couponId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        showToast("Coupon deleted successfully", "success");
        fetchCoupons();
      } else {
        showToast(data.message || "Failed to delete coupon", "error");
      }
    } catch (error) {
      showToast("Failed to delete coupon", "error");
    }
  };

  // 4. Toggle Active no longer sends storeId
  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch("/api/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponId: coupon.id,
          isActive: !coupon.is_active,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Coupon status updated", "success");
        fetchCoupons();
      } else {
        showToast(data.message || "Failed to update coupon", "error");
      }
    } catch (error) {
      showToast("Failed to update coupon", "error");
    }
  };
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      type: "percentage",
      discount: 10,
      description: "",
      minPurchase: 0,
      maxUses: 999999,
      maxUsesPerCustomer: 1,
      expiryDate: "",
      isActive: true,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount,
      description: coupon.description || "",
      minPurchase: coupon.min_purchase,
      maxUses: coupon.max_uses,
      maxUsesPerCustomer: coupon.max_uses_per_customer,
      expiryDate: coupon.expiry_date.split("T")[0],
      isActive: coupon.is_active,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setEditingCoupon(null), 300);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) {
      errors.code = "Code is required";
    }

    if (formData.type === "percentage") {
      if (formData.discount <= 0 || formData.discount > 100) {
        errors.discount = "Percentage must be between 1 and 100";
      }
    } else {
      if (formData.discount <= 0) {
        errors.discount = "Discount amount must be greater than 0";
      }
    }

    // NEW: Check if the date is empty first
    if (!formData.expiryDate) {
      errors.expiryDate = "Expiry date is required";
    } else if (new Date(formData.expiryDate) <= new Date()) {
      errors.expiryDate = "Expiry date must be in the future";
    }

    if (formData.minPurchase < 0) {
      errors.minPurchase = "Minimum purchase cannot be negative";
    }

    if (formData.maxUses <= 0) {
      errors.maxUses = "Max uses must be greater than 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const stats = useMemo(() => {
    const activeCoupons = coupons.filter((c) => c.is_active).length;
    const totalUsage = coupons.reduce((sum, c) => sum + c.used_count, 0);
    const expiringCoupons = coupons.filter(
      (c) =>
        new Date(c.expiry_date) <=
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
        new Date(c.expiry_date) > new Date(),
    ).length;

    return [
      {
        label: lang === "ar" ? "إجمالي الكوبونات" : "Total Coupons",
        value: coupons.length,
        icon: Gift,
        color: "bg-[rgb(60_28_84)]",
        text: "text-white",
      },
      {
        label: lang === "ar" ? "نشطة" : "Active",
        value: activeCoupons,
        icon: Zap,
        color: "bg-emerald-50",
        text: "text-emerald-700",
      },
      {
        label: lang === "ar" ? "استخدامات" : "Total Uses",
        value: totalUsage,
        icon: TrendingUp,
        color: "bg-blue-50",
        text: "text-blue-700",
      },
      {
        label: lang === "ar" ? "تنتهي قريباً" : "Expiring Soon",
        value: expiringCoupons,
        icon: Clock,
        color: "bg-amber-50",
        text: "text-amber-700",
      },
    ];
  }, [coupons, lang]);

  const chartKey = lang === "ar" ? "month" : "monthEn";

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h2 className="text-2xl font-bold text-[rgb(60_28_84)]">
            {lang === "ar" ? "إدارة الكوبونات" : "Manage Coupons"}
          </h2>
          <p className="text-sm text-[rgb(60_28_84)]/50 mt-1">
            {lang === "ar"
              ? "أنشئ وأدر أكواد الخصم الخاصة بك"
              : "Create and manage your discount codes"}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[rgb(60_28_84)] to-[rgb(80_40_110)] text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-[rgb(60_28_84)]/30 transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          {lang === "ar" ? "كوبون جديد" : "New Coupon"}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-100">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`${stat.color} rounded-xl p-6 ${stat.text} transition-all duration-300 transform hover:scale-105`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-70 font-medium mt-2">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[rgb(60_28_84)]/40 animate-spin" />
          <p className="text-sm text-gray-500">
            {lang === "ar" ? "جاري التحميل..." : "Loading coupons..."}
          </p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            {lang === "ar" ? "لا توجد كوبونات" : "No Coupons Yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {lang === "ar"
              ? "ابدأ بإنشاء كوبون خصم أول لك"
              : "Start by creating your first discount coupon"}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(60_28_84)] text-white rounded-lg font-bold hover:bg-[rgb(60_28_84)]/90 transition-all"
          >
            <Plus className="w-5 h-5" />
            {lang === "ar" ? "إنشاء كوبون" : "Create Coupon"}
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up delay-200">
          {coupons.map((coupon) => {
            const usagePercent = Math.min(
              (coupon.used_count / coupon.max_uses) * 100,
              100,
            );
            const isExpired = new Date(coupon.expiry_date) < new Date();
            const isExpiringSoon =
              new Date(coupon.expiry_date) <=
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && !isExpired;

            return (
              <div
                key={coupon.id}
                className={`bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg p-6 ${
                  coupon.is_active
                    ? "border-gray-200 hover:border-[rgb(60_28_84)]"
                    : "border-gray-100 opacity-60"
                } ${isExpired ? "ring-2 ring-red-200" : ""}`}
              >
                {/* Status Badge */}
                {isExpired && (
                  <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {lang === "ar" ? "انتهت صلاحيته" : "Expired"}
                  </div>
                )}
                {isExpiringSoon && (
                  <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    {lang === "ar" ? "تنتهي قريباً" : "Expiring Soon"}
                  </div>
                )}

                {/* Code and Copy */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-xl font-bold text-[rgb(60_28_84)] tracking-wider select-all">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => copyCode(coupon.id, coupon.code)}
                      className="p-2 rounded-lg hover:bg-[rgb(244_242_245)] text-gray-400 hover:text-[rgb(60_28_84)] transition-all"
                      title={lang === "ar" ? "نسخ الكود" : "Copy code"}
                    >
                      {copiedId === coupon.id ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {coupon.description && (
                    <p className="text-xs text-gray-600 italic">
                      {coupon.description}
                    </p>
                  )}
                </div>

                {/* Discount Info */}
                <div className="mb-4 p-3 bg-gradient-to-r from-[rgb(60_28_84)]/5 to-[rgb(80_40_110)]/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">
                      {lang === "ar" ? "الخصم" : "Discount"}
                    </span>
                    <span className="font-bold text-[rgb(60_28_84)]">
                      {coupon.type === "percentage"
                        ? `${coupon.discount}%`
                        : `$${coupon.discount.toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}`}
                    </span>
                  </div>
                  {coupon.min_purchase > 0 && (
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                      <span>Min. Purchase</span>
                      <span className="font-medium">
                        $
                        {coupon.min_purchase.toLocaleString("en-US", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Usage Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                    <span>
                      {lang === "ar" ? "الاستخدام" : "Usage"}:{" "}
                      <span className="font-bold text-gray-900">
                        {coupon.used_count}/{coupon.max_uses}
                      </span>
                    </span>
                    <span className="font-bold">
                      {Math.round(usagePercent)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePercent >= 100
                          ? "bg-red-500"
                          : usagePercent >= 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      {lang === "ar" ? "انتهاء الصلاحية" : "Expires"}:
                    </span>
                    <span className="font-medium text-gray-900">
                      {new Date(coupon.expiry_date).toLocaleDateString(
                        dir === "rtl" ? "ar-SA" : "en-US",
                      )}
                    </span>
                  </div>
                  {coupon.last_used_at && (
                    <div className="flex justify-between text-gray-600">
                      <span>
                        {lang === "ar" ? "آخر استخدام" : "Last Used"}:
                      </span>
                      <span className="font-medium text-gray-900">
                        {new Date(coupon.last_used_at).toLocaleDateString(
                          dir === "rtl" ? "ar-SA" : "en-US",
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: coupon.is_active
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(107, 114, 128, 0.1)",
                      color: coupon.is_active ? "#10b981" : "#6b7280",
                    }}
                  >
                    {coupon.is_active ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    <span className="text-xs font-bold">
                      {coupon.is_active
                        ? lang === "ar"
                          ? "نشط"
                          : "Active"
                        : lang === "ar"
                          ? "معطل"
                          : "Inactive"}
                    </span>
                  </button>

                  <button
                    onClick={() => openEditModal(coupon)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all font-bold text-xs"
                  >
                    <Edit2 className="w-4 h-4" />
                    {lang === "ar" ? "تعديل" : "Edit"}
                  </button>

                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all font-bold text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    {lang === "ar" ? "حذف" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[rgb(60_28_84)] to-[rgb(80_40_110)] px-8 py-6 flex items-center justify-between text-white sticky top-0 z-10">
              <h2 className="text-2xl font-bold">
                {editingCoupon
                  ? lang === "ar"
                    ? "تعديل كوبون"
                    : "Edit Coupon"
                  : lang === "ar"
                    ? "كوبون جديد"
                    : "Create New Coupon"}
              </h2>
              <button
                onClick={closeModal}
                disabled={submitting}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Code */}
              <div>
                <label className="block text-sm font-bold text-[rgb(60_28_84)] mb-2">
                  {lang === "ar" ? "كود الكوبون" : "Coupon Code"}
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SUMMER2025"
                  disabled={!!editingCoupon}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-mono font-bold tracking-wider focus:border-[rgb(60_28_84)] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {formErrors.code && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.code}</p>
                )}
              </div>

              {/* Type and Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[rgb(60_28_84)] mb-2">
                    {lang === "ar" ? "نوع الخصم" : "Discount Type"}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[rgb(60_28_84)] focus:outline-none"
                  >
                    <option value="percentage">
                      {lang === "ar" ? "نسبة مئوية (%)" : "Percentage (%)"}
                    </option>
                    <option value="fixed">
                      {lang === "ar" ? "مبلغ ثابت ($)" : "Fixed Amount ($)"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[rgb(60_28_84)] mb-2">
                    {lang === "ar" ? "مقدار الخصم" : "Discount Amount"}
                  </label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount: parseFloat(e.target.value),
                      })
                    }
                    min="0.01"
                    max={formData.type === "percentage" ? "100" : undefined}
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[rgb(60_28_84)] focus:outline-none"
                  />
                  {formErrors.discount && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.discount}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-[rgb(60_28_84)] mb-2">
                  {lang === "ar" ? "الوصف (اختياري)" : "Description (Optional)"}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={
                    lang === "ar" ? "وصف الكوبون..." : "Describe the coupon..."
                  }
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[rgb(60_28_84)] focus:outline-none resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500
                </p>
              </div>

              {/* Min Purchase */}
              <div>
                <label className="block text-sm font-bold text-[rgb(60_28_84)] mb-2">
                  {lang === "ar"
                    ? "الحد الأدنى للشراء ($)"
                    : "Minimum Purchase ($)"}
                </label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minPurchase: parseFloat(e.target.value),
                    })
                  }
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[rgb(60_28_84)] focus:outline-none"
                />
                {formErrors.minPurchase && (
                  <p className="text-xs text-red-600 mt-1">
                    {formErrors.minPurchase}
                  </p>
                )}
              </div>

              {/* Max Uses and Per Customer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[rgb(60_28_84)] mb-2">
                    {lang === "ar" ? "الحد الأقصى للاستخدام" : "Max Uses"}
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxUses: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[rgb(60_28_84)] focus:outline-none"
                  />
                  {formErrors.maxUses && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.maxUses}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[rgb(60_28_84)] mb-2">
                    {lang === "ar" ? "لكل عميل" : "Per Customer"}
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsesPerCustomer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxUsesPerCustomer: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[rgb(60_28_84)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-bold text-[rgb(60_28_84)] mb-2">
                  {lang === "ar" ? "تاريخ انتهاء الصلاحية" : "Expiry Date"}
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[rgb(60_28_84)] focus:outline-none"
                />
                {formErrors.expiryDate && (
                  <p className="text-xs text-red-600 mt-1">
                    {formErrors.expiryDate}
                  </p>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 text-[rgb(60_28_84)] rounded cursor-pointer"
                />
                <label
                  htmlFor="isActive"
                  className="flex-1 text-sm font-bold text-[rgb(60_28_84)] cursor-pointer"
                >
                  {lang === "ar" ? "تفعيل الكوبون" : "Activate Coupon"}
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[rgb(60_28_84)] to-[rgb(80_40_110)] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCoupon
                    ? lang === "ar"
                      ? "تحديث"
                      : "Update"
                    : lang === "ar"
                      ? "إنشاء"
                      : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
