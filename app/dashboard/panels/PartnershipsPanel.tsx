"use client";

import { useState, useEffect } from "react";
import {
  Handshake,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  Store,
  Loader2,
  ShieldCheck,
  Users,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
  Info,
} from "lucide-react";
import { useDashboard } from "../DashboardContext";
import type { StoreData } from "../types";
import Toast from "../components/Toast";

interface Props {
  store: StoreData;
}

interface LinkedStore {
  id: string;
  store_name: string;
  slug: string;
}

interface ToastState {
  message: string;
  type: "success" | "error";
}

export default function PartnershipsPanel({ store }: Props) {
  const { lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [isWholesale, setIsWholesale] = useState(
    store?.store_tier === "wholesale",
  );

  const [tierLoading, setTierLoading] = useState(false);
  const [linkedStores, setLinkedStores] = useState<LinkedStore[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [newStoreId, setNewStoreId] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // New UI States
  const [isIdVisible, setIsIdVisible] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [storeToRemove, setStoreToRemove] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const t = {
    title: lang === "ar" ? "الشراكات" : "Partnerships",
    desc:
      lang === "ar"
        ? "تحكم في نوع متجرك وأدر علاقاتك مع المتاجر الأخرى"
        : "Control your store type and manage relationships with other stores",
    tierSection: lang === "ar" ? "نوع المتجر" : "Store Type",
    retailLabel: lang === "ar" ? "متجر مفرق" : "Retail Store",
    wholesaleLabel: lang === "ar" ? "متجر جملة" : "Wholesale Store",
    retailDesc:
      lang === "ar"
        ? "يبيع مباشرة للعملاء. يمكنه الاستيراد من متاجر الجملة."
        : "Sells directly to customers. Can import from wholesale stores.",
    wholesaleDesc:
      lang === "ar"
        ? "يورد منتجات لمتاجر أخرى. يمكنه إدارة المتاجر المرتبطة به."
        : "Supplies products to other stores. Can manage linked retail stores.",
    switchToWholesale:
      lang === "ar" ? "تفعيل وضع الجملة" : "Enable Wholesale Mode",
    switchToRetail: lang === "ar" ? "التحويل لمتجر مفرق" : "Switch to Retail",
    linkedStores: lang === "ar" ? "المتاجر المرتبطة" : "Linked Stores",
    linkedDesc:
      lang === "ar"
        ? "هذه المتاجر تستطيع عرض منتجاتك وبيعها"
        : "These stores can display and sell your products",
    addStore: lang === "ar" ? "إضافة متجر" : "Add Store",
    storeIdPlaceholder: lang === "ar" ? "أدخل Store ID" : "Enter Store ID",
    yourId: lang === "ar" ? "معرف المتجر الخاص بك (Store ID)" : "Your Store ID",
    idWarningTitle: lang === "ar" ? "معلومات حساسة" : "Sensitive Information",
    idWarningDesc:
      lang === "ar"
        ? "هذا المعرف يُستخدم لربط متجرك بمتاجر أخرى. لا تشاركه علناً."
        : "This ID is used to link your store with others. Do not share it publicly.",
    copyId: lang === "ar" ? "نسخ المعرف" : "Copy ID",
    copied: lang === "ar" ? "تم النسخ" : "Copied",
    show: lang === "ar" ? "إظهار" : "Show",
    hide: lang === "ar" ? "إخفاء" : "Hide",
    noStores:
      lang === "ar" ? "لا توجد متاجر مرتبطة بعد" : "No linked stores yet",
    remove: lang === "ar" ? "إزالة" : "Remove",
    confirmSwitchTitle:
      lang === "ar" ? "تغيير نوع المتجر" : "Change Store Type",
    confirmSwitchDesc:
      lang === "ar"
        ? "هل أنت متأكد من تغيير نوع المتجر؟ قد يؤثر ذلك على المتاجر المرتبطة حالياً وعمليات الاستيراد."
        : "Are you sure you want to change the store type? This may affect currently linked stores and imports.",
    confirmRemoveTitle:
      lang === "ar" ? "إزالة المتجر المرتبط" : "Remove Linked Store",
    confirmRemoveDesc:
      lang === "ar"
        ? "هل أنت متأكد من إزالة هذا المتجر؟ لن يتمكن من الوصول إلى منتجاتك بعد الآن."
        : "Are you sure you want to remove this store? They will no longer have access to your products.",
    cancel: lang === "ar" ? "إلغاء" : "Cancel",
    confirm: lang === "ar" ? "تأكيد" : "Confirm",
  };

  useEffect(() => {
    if (isWholesale) fetchLinkedStores();
  }, [isWholesale]);

  async function fetchLinkedStores() {
    setLoadingStores(true);
    try {
      const res = await fetch("/api/partnerships/linked-stores");
      const json = await res.json();
      setLinkedStores(json.stores ?? []);
    } finally {
      setLoadingStores(false);
    }
  }

  async function toggleTier() {
    setTierLoading(true);
    try {
      const newTier = isWholesale ? "retail" : "wholesale";
      const res = await fetch("/api/partnerships/tier", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: newTier }),
      });
      if (!res.ok) throw new Error();
      setIsWholesale(!isWholesale);
      setIsTierModalOpen(false);
      setToast({
        message: lang === "ar" ? "تم تحديث نوع المتجر" : "Store type updated",
        type: "success",
      });
    } catch {
      setToast({
        message: lang === "ar" ? "حدث خطأ" : "An error occurred",
        type: "error",
      });
    } finally {
      setTierLoading(false);
    }
  }

  async function addStore() {
    if (!newStoreId.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/partnerships/linked-stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retail_store_id: newStoreId.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setNewStoreId("");
      fetchLinkedStores();
      setToast({
        message: lang === "ar" ? "تم إضافة المتجر" : "Store added",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        message: err.message || (lang === "ar" ? "حدث خطأ" : "Error"),
        type: "error",
      });
    } finally {
      setAddLoading(false);
    }
  }

  async function removeStore() {
    if (!storeToRemove) return;
    setRemoveLoading(true);
    try {
      const res = await fetch("/api/partnerships/linked-stores", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retail_store_id: storeToRemove }),
      });
      if (!res.ok) throw new Error();
      setLinkedStores((prev) => prev.filter((s) => s.id !== storeToRemove));
      setStoreToRemove(null);
      setToast({
        message: lang === "ar" ? "تم إزالة المتجر" : "Store removed",
        type: "success",
      });
    } catch {
      setToast({
        message: lang === "ar" ? "حدث خطأ" : "Error",
        type: "error",
      });
    } finally {
      setRemoveLoading(false);
    }
  }

  function copyStoreId() {
    if (!store?.id) return;
    navigator.clipboard.writeText(store.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  // Helper to mask ID securely visually
  const getMaskedId = (id: string) => {
    if (!id) return "";
    if (isIdVisible) return id;
    if (id.length <= 8) return "••••••••";
    return `••••••••••••••••${id.slice(-4)}`;
  };

  return (
    <div className="space-y-6 md:space-y-8" dir={dir}>
      {/* Header */}
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-[rgb(60_28_84)] tracking-tight">
          {t.title}
        </h3>
        <p className="text-gray-500 text-sm md:text-base mt-1.5">{t.desc}</p>
      </div>

      {/* Security Warning & Store ID Section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-100/50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            {/* <p className="text-sm font-bold text-amber-800">
              {t.idWarningTitle}
            </p> */}
            <p className="text-xs md:text-sm text-amber-700/80 mt-0.5 leading-relaxed">
              {t.idWarningDesc}
            </p>
          </div>
        </div>

        {/* ID Display */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-gray-600">{t.yourId}</p>
            <div className="flex items-center gap-3">
              <code
                dir="ltr"
                className="font-mono text-sm md:text-base font-semibold text-[rgb(60_28_84)] bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm"
              >
                {getMaskedId(store?.id || "")}
              </code>
              <button
                onClick={() => setIsIdVisible(!isIdVisible)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-md hover:bg-gray-100"
                title={isIdVisible ? t.hide : t.show}
              >
                {isIdVisible ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={copyStoreId}
            className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[rgb(60_28_84)] text-white hover:bg-[rgb(60_28_84)]/90 transition-all text-sm font-bold shadow-sm active:scale-[0.98]"
          >
            {copiedId ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copiedId ? t.copied : t.copyId}
          </button>
        </div>
      </div>

      {/* Store Tier Selection */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[rgb(60_28_84)]" />
          <h3 className="text-base font-bold text-gray-900">{t.tierSection}</h3>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/30">
          {[
            {
              key: "retail",
              icon: Store,
              label: t.retailLabel,
              desc: t.retailDesc,
            },
            {
              key: "wholesale",
              icon: Users,
              label: t.wholesaleLabel,
              desc: t.wholesaleDesc,
            },
          ].map((option) => {
            const active = isWholesale
              ? option.key === "wholesale"
              : option.key === "retail";
            return (
              <div
                key={option.key}
                className={`relative rounded-2xl p-5 border-2 transition-all duration-200 ${
                  active
                    ? "border-[rgb(60_28_84)] bg-[rgb(60_28_84)]/5 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl shrink-0 transition-colors ${
                      active
                        ? "bg-[rgb(60_28_84)] text-white shadow-md shadow-[rgb(60_28_84)]/20"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <option.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p
                      className={`text-base font-bold mb-1 ${
                        active ? "text-[rgb(60_28_84)]" : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {option.desc}
                    </p>
                  </div>
                  {active && (
                    <div className="absolute top-5 right-5 w-3 h-3 rounded-full bg-[rgb(60_28_84)] ring-4 ring-[rgb(60_28_84)]/10" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 pb-5 bg-gray-50/30">
          <button
            onClick={() => setIsTierModalOpen(true)}
            className="w-full py-3 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.99]"
          >
            {isWholesale ? t.switchToRetail : t.switchToWholesale}
          </button>
        </div>
      </div>

      {/* Linked Stores (Wholesale Only) */}
      {isWholesale && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {t.linkedStores}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{t.linkedDesc}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[rgb(60_28_84)]/10 flex items-center justify-center shrink-0">
              <Handshake className="w-5 h-5 text-[rgb(60_28_84)]" />
            </div>
          </div>

          {/* Add Store Input */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  value={newStoreId}
                  onChange={(e) => setNewStoreId(e.target.value)}
                  placeholder={t.storeIdPlaceholder}
                  className="w-full pl-4 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-[rgb(60_28_84)] focus:ring-4 focus:ring-[rgb(60_28_84)]/10 font-mono transition-all bg-gray-50 focus:bg-white"
                  onKeyDown={(e) => e.key === "Enter" && addStore()}
                  dir="ltr"
                />
              </div>
              <button
                onClick={addStore}
                disabled={addLoading || !newStoreId.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[rgb(60_28_84)] text-white text-sm font-bold rounded-xl hover:bg-[rgb(60_28_84)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 active:scale-[0.98]"
              >
                {addLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {t.addStore}
              </button>
            </div>
          </div>

          {/* Stores List */}
          <div className="divide-y divide-gray-100">
            {loadingStores ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-[rgb(60_28_84)]" />
                <p className="text-sm text-gray-400">Loading stores...</p>
              </div>
            ) : linkedStores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                  <Store className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">
                  {t.noStores}
                </h4>
                <p className="text-sm text-gray-500 max-w-sm">{t.linkedDesc}</p>
              </div>
            ) : (
              linkedStores.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-gray-50/80 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(60_28_84)]/10 to-[rgb(60_28_84)]/5 border border-[rgb(60_28_84)]/10 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-[rgb(60_28_84)]" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">
                        {s.store_name}
                      </p>
                      <p
                        className="text-sm text-gray-500 font-mono mt-0.5"
                        dir="ltr"
                      >
                        {s.slug}.mahally.app
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStoreToRemove(s.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors w-full md:w-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t.remove}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- Custom Modals --- */}

      {/* Tier Switch Modal */}
      {isTierModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          dir={dir}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t.confirmSwitchTitle}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t.confirmSwitchDesc}
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex flex-col md:flex-row gap-3 border-t border-gray-100">
              <button
                onClick={() => setIsTierModalOpen(false)}
                disabled={tierLoading}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={toggleTier}
                disabled={tierLoading}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-[rgb(60_28_84)] hover:bg-[rgb(60_28_84)]/90 flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
              >
                {tierLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Store Modal */}
      {storeToRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          dir={dir}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start p-6 pb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <button
                onClick={() => setStoreToRemove(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t.confirmRemoveTitle}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t.confirmRemoveDesc}
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex flex-col md:flex-row gap-3 border-t border-gray-100">
              <button
                onClick={() => setStoreToRemove(null)}
                disabled={removeLoading}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={removeStore}
                disabled={removeLoading}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
              >
                {removeLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.remove}
              </button>
            </div>
          </div>
        </div>
      )}

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
