"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Store,
  User,
  Bell,
  Globe,
  Check,
  ShieldCheck,
  Image as ImageIcon,
  Plus,
  Trash2,
  Power,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { useDashboard } from "../DashboardContext";
import { STORE_TYPE_LABELS } from "../data";

type StoreData = {
  id: string;
  admin_name: string;
  admin_email: string;
  store_name: string;
  slug: string;
  location: string | null;
  phone: string | null;
  store_type: string | null;
  created_at: string;
  is_active: boolean;
  primary_color?: string;
  privacy_policy?: string;
  shipping_policy?: string;
  return_policy?: string;
  logo_url?: string;
};

export type HeroBanner = {
  id: string;
  image: string;
  active: boolean;
  order: number;
};

export default function SettingsPanel() {
  const { tr, lang, setLang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // <-- Added state for main form saving

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  const [store, setStore] = useState<StoreData | null>(null);

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Hero Banners State
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [newBanner, setNewBanner] = useState<Partial<HeroBanner>>({
    image: "",
    active: true,
    order: 1,
  });

  // Modal State for Confirming Banner Actions (Delete/Toggle)
  const [bannerConfirm, setBannerConfirm] = useState<{
    isOpen: boolean;
    action: "delete" | "toggle";
    banner: HeroBanner | null;
    loading: boolean;
  }>({
    isOpen: false,
    action: "delete",
    banner: null,
    loading: false,
  });

  const [activeTab, setActiveTab] = useState<
    "store" | "account" | "notifications" | "appearance" | "policies"
  >("store");

  const [formData, setFormData] = useState({
    store_name: "",
    location: "",
    phone: "",
    store_type: "",
    admin_name: "",
    admin_email: "",
    primary_color: "#3C1C54",
    privacy_policy: "",
    shipping_policy: "",
    return_policy: "",
    logo_url: "",
  });

  // Helper function to show toasts
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Auto dismiss after 3s
  };

  async function fetchStore() {
    try {
      setLoading(true);
      const res = await fetch("/api/stores", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || !data.store) return;

      setStore(data.store);
      setFormData({
        store_name: data.store.store_name || "",
        location: data.store.location || "",
        phone: data.store.phone || "",
        store_type: data.store.store_type || "",
        admin_name: data.store.admin_name || "",
        admin_email: data.store.admin_email || "",
        primary_color: data.store.primary_color || "#3C1C54",
        privacy_policy: data.store.privacy_policy || "",
        shipping_policy: data.store.shipping_policy || "",
        return_policy: data.store.return_policy || "",
        logo_url: data.store.logo_url || "",
      });

      const bannerRes = await fetch(
        `/api/hero?storeId=${data.store.id}&admin=true`,
      );
      const bannerData = await bannerRes.json();
      if (bannerData.success) {
        setBanners(bannerData.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStore();
  }, []);

  const handleSave = async () => {
    if (!store) return;
    setIsSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/stores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: store.id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update store");
      }

      setSaved(true);
      showToast(
        lang === "ar"
          ? "تم حفظ التغييرات بنجاح!"
          : "Settings saved successfully!",
        "success",
      );

      // ✅ REFETCH data after successful save to display updated values
      await fetchStore();

      setTimeout(() => setSaved(false), 2500);
    } catch (error: any) {
      console.error(error);
      showToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      showToast(
        lang === "ar"
          ? "فشل رفع الصورة (تأكد من وجود رابط الرفع في الخادم)"
          : "Failed to upload image (Ensure /api/upload-image route exists)",
        "error",
      );
      return null;
    }
  };

  const handleSaveBanner = async () => {
    if (!store) return;
    setIsSavingBanner(true);
    try {
      const res = await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newBanner, store_id: store.id }),
      });
      const result = await res.json();
      if (result.success) {
        setBanners([...banners, result.data]);
        setIsAddingBanner(false);
        setNewBanner({ image: "", active: true, order: 1 });
        showToast(
          lang === "ar"
            ? "تم نشر اللافتة بنجاح!"
            : "Banner published successfully!",
          "success",
        );
      } else {
        throw new Error(result.message || "Failed to save banner");
      }
    } catch (e) {
      console.error(e);
      showToast(
        lang === "ar"
          ? "حدث خطأ أثناء نشر اللافتة."
          : "Error publishing banner.",
        "error",
      );
    } finally {
      setIsSavingBanner(false);
    }
  };

  const executeBannerAction = async () => {
    const { action, banner } = bannerConfirm;
    if (!banner) return;

    setBannerConfirm((prev) => ({ ...prev, loading: true }));

    try {
      if (action === "delete") {
        const res = await fetch(`/api/hero?id=${banner.id}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (result.success) {
          setBanners(banners.filter((b) => b.id !== banner.id));
          showToast(
            lang === "ar"
              ? "تم حذف اللافتة بنجاح!"
              : "Banner deleted successfully!",
            "success",
          );
        }
      } else if (action === "toggle") {
        const res = await fetch("/api/hero", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: banner.id, active: !banner.active }),
        });
        const result = await res.json();
        if (result.success) {
          setBanners(
            banners.map((b) => (b.id === banner.id ? result.data : b)),
          );
          showToast(
            lang === "ar" ? "تم تحديث حالة اللافتة!" : "Banner status updated!",
            "success",
          );
        }
      }
    } catch (e) {
      console.error(e);
      showToast(
        lang === "ar"
          ? "حدث خطأ، يرجى المحاولة مرة أخرى."
          : "An error occurred.",
        "error",
      );
    } finally {
      setBannerConfirm({
        isOpen: false,
        action: "delete",
        banner: null,
        loading: false,
      });
    }
  };

  const tabs = [
    { id: "store" as const, label: tr.storeSettings, icon: Store },
    { id: "account" as const, label: tr.accountSettings, icon: User },
    {
      id: "notifications" as const,
      label: tr.notificationSettings,
      icon: Bell,
    },
    { id: "appearance" as const, label: tr.appearance, icon: Globe },
    {
      id: "policies" as const,
      label: lang === "ar" ? "السياسات" : "Policies",
      icon: ShieldCheck,
    },
  ];

  const createdDate = store?.created_at
    ? new Date(store.created_at).toLocaleDateString(
        lang === "ar" ? "ar-SA" : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      )
    : "";

  const SkeletonBox = ({ className }: { className: string }) => (
    <div
      className={`animate-pulse bg-[rgb(244_242_245)] rounded-xl ${className}`}
    />
  );

  if (loading) {
    return (
      <div className="space-y-6 w-full" dir={dir}>
        <div className="flex gap-1 bg-[rgb(244_242_245)] rounded-xl p-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBox key={i} className="h-10 flex-1" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm p-6 space-y-6">
          <SkeletonBox className="h-5 w-48" />
          <div className="grid md:grid-cols-2 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonBox className="h-3 w-20" />
                <SkeletonBox className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <SkeletonBox className="h-3 w-24" />
            <SkeletonBox className="h-10 w-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[rgb(244_242_245)]">
            <SkeletonBox className="h-16 w-full" />
            <SkeletonBox className="h-16 w-full" />
          </div>
          <SkeletonBox className="h-10 w-40" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div
        className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-10 text-center text-sm text-red-500"
        dir={dir}
      >
        Failed to load store data
      </div>
    );
  }

  // Reusable Save Button Component for all tabs
  const SaveButton = () => (
    <button
      onClick={handleSave}
      disabled={isSaving}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50 ${
        saved
          ? "bg-emerald-500 text-white shadow-emerald-200"
          : "bg-[rgb(60_28_84)] text-white hover:bg-[rgb(60_28_84)]/90 shadow-[rgb(60_28_84)]/20"
      }`}
    >
      {isSaving ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <Check className="w-4 h-4" />
      ) : (
        <Save className="w-4 h-4" />
      )}
      {isSaving
        ? lang === "ar"
          ? "جاري الحفظ..."
          : "Saving..."
        : saved
          ? lang === "ar"
            ? "تم الحفظ!"
            : "Saved!"
          : tr.saveChanges}
    </button>
  );

  return (
    <div className="space-y-6 w-full relative" dir={dir}>
      {toast && (
        <div
          className={`fixed top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl text-sm font-bold text-white z-50 animate-fade-up flex items-center gap-2 ${
            toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      {bannerConfirm.isOpen && bannerConfirm.banner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-up space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  bannerConfirm.action === "delete"
                    ? "bg-red-50 text-red-500"
                    : "bg-amber-50 text-amber-500"
                }`}
              >
                {bannerConfirm.action === "delete" ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <Power className="w-6 h-6" />
                )}
              </div>
              <h3 className="font-bold text-[rgb(60_28_84)] text-lg">
                {bannerConfirm.action === "delete"
                  ? lang === "ar"
                    ? "حذف اللافتة؟"
                    : "Delete Banner?"
                  : bannerConfirm.banner.active
                    ? lang === "ar"
                      ? "تعطيل اللافتة؟"
                      : "Disable Banner?"
                    : lang === "ar"
                      ? "تفعيل اللافتة؟"
                      : "Enable Banner?"}
              </h3>
              <p className="text-sm text-[rgb(60_28_84)]/60">
                {bannerConfirm.action === "delete"
                  ? lang === "ar"
                    ? "هل أنت متأكد من حذف هذه اللافتة نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
                    : "Are you sure you want to permanently delete this banner? This action cannot be undone."
                  : bannerConfirm.banner.active
                    ? lang === "ar"
                      ? "هل أنت متأكد من تعطيل هذه اللافتة؟ سيتم إخفاؤها من واجهة المتجر."
                      : "Are you sure you want to disable this banner? It will be hidden from the storefront."
                    : lang === "ar"
                      ? "هل أنت متأكد من تفعيل هذه اللافتة؟ ستظهر للعملاء في المتجر."
                      : "Are you sure you want to enable this banner? It will be visible to customers."}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() =>
                  setBannerConfirm({ ...bannerConfirm, isOpen: false })
                }
                disabled={bannerConfirm.loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-[rgb(60_28_84)] bg-[rgb(244_242_245)] hover:bg-[rgb(207_195_223)] transition-colors disabled:opacity-50"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={executeBannerAction}
                disabled={bannerConfirm.loading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 ${
                  bannerConfirm.action === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-[rgb(60_28_84)] hover:bg-[rgb(60_28_84)]/90"
                }`}
              >
                {bannerConfirm.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : bannerConfirm.action === "delete" ? (
                  lang === "ar" ? (
                    "حذف"
                  ) : (
                    "Delete"
                  )
                ) : bannerConfirm.banner.active ? (
                  lang === "ar" ? (
                    "تعطيل"
                  ) : (
                    "Disable"
                  )
                ) : lang === "ar" ? (
                  "تفعيل"
                ) : (
                  "Enable"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-[rgb(244_242_245)] rounded-xl p-1 animate-fade-up overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 justify-center whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-[rgb(60_28_84)] shadow-sm"
                : "text-[rgb(60_28_84)]/50 hover:text-[rgb(60_28_84)]"
            }`}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "store" && (
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
            <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
              <Store className="w-5 h-5" />
              {tr.storeSettings}
            </h3>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: tr.storeName, key: "store_name", type: "text" },
                { label: tr.location, key: "location", type: "text" },
                { label: tr.phone, key: "phone", type: "tel" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="w-full bg-[rgb(244_242_245)] rounded-xl px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                    dir={dir}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                  {lang === "ar" ? "شعار المتجر (Logo)" : "Store Logo"}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIsUploadingLogo(true);
                        const url = await handleImageUpload(file);
                        if (url)
                          setFormData((prev) => ({ ...prev, logo_url: url }));
                        setIsUploadingLogo(false);
                      }
                    }}
                    className="w-full bg-[rgb(244_242_245)] rounded-xl px-4 py-2 text-sm text-[rgb(60_28_84)] file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[rgb(60_28_84)] file:text-white hover:file:bg-[rgb(60_28_84)]/90 outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all cursor-pointer"
                  />
                  {isUploadingLogo && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>
                {formData.logo_url && (
                  <div className="mt-3 p-2 bg-[rgb(244_242_245)] rounded-xl inline-block">
                    <img
                      src={formData.logo_url}
                      alt="Logo"
                      className="h-10 object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                  {tr.storeType}
                </label>
                <select
                  value={formData.store_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      store_type: e.target.value,
                    }))
                  }
                  className="w-full bg-[rgb(244_242_245)] rounded-xl px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                  dir={dir}
                >
                  {Object.entries(STORE_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {lang === "ar" ? v.ar : v.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-[rgb(244_242_245)] grid md:grid-cols-2 gap-4">
              <div className="bg-[rgb(244_242_245)] rounded-xl px-4 py-3">
                <p className="text-xs text-[rgb(60_28_84)]/40 mb-1">
                  {tr.storeId}
                </p>
                <p className="text-sm font-bold text-[rgb(60_28_84)] font-mono">
                  #{store.id.slice(0, 8).toUpperCase()}
                </p>
              </div>

              <div className="bg-[rgb(244_242_245)] rounded-xl px-4 py-3">
                <p className="text-xs text-[rgb(60_28_84)]/40 mb-1">
                  {tr.memberSince}
                </p>
                <p className="text-sm font-bold text-[rgb(60_28_84)]">
                  {createdDate}
                </p>
              </div>
            </div>

            <SaveButton />
          </div>
        </div>
      )}

      {activeTab === "account" && (
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
            <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
              <User className="w-5 h-5" />
              {tr.accountSettings}
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[rgb(60_28_84)] flex items-center justify-center text-white font-bold text-2xl">
                {store.admin_name?.[0]}
              </div>
              <div>
                <p className="font-bold text-[rgb(60_28_84)]">
                  {store.admin_name}
                </p>
                <p className="text-sm text-[rgb(60_28_84)]/50">
                  {store.admin_email}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: tr.adminName, key: "admin_name" },
                { label: tr.email, key: "admin_email" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="w-full bg-[rgb(244_242_245)] rounded-xl px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                    dir={dir}
                  />
                </div>
              ))}
            </div>

            <SaveButton />
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
            <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {tr.notificationSettings}
            </h3>
          </div>
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-[rgb(244_242_245)] rounded-full flex items-center justify-center">
              <Bell className="w-10 h-10 text-[rgb(60_28_84)]/30" />
            </div>
            <div>
              <h4 className="font-bold text-[rgb(60_28_84)] text-lg">
                {lang === "ar"
                  ? "لا توجد إعدادات للإشعارات حالياً"
                  : "No Notification Settings Yet"}
              </h4>
              <p className="text-sm text-[rgb(60_28_84)]/50 mt-2 max-w-sm mx-auto leading-relaxed">
                {lang === "ar"
                  ? "ستتمكن قريباً من إدارة تفضيلات التنبيهات والبريد الإلكتروني الخاصة بمتجرك من هذا القسم."
                  : "You will soon be able to manage your store's alert and email preferences from this section."}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "appearance" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
            <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
              <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {tr.appearance}
              </h3>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">
                  {lang === "ar"
                    ? "اللون الرئيسي (Hex Code)"
                    : "Primary Brand Color (Hex)"}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primary_color: e.target.value,
                      })
                    }
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primary_color: e.target.value,
                      })
                    }
                    className="w-full max-w-[200px] bg-[rgb(244_242_245)] rounded-xl px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] uppercase"
                    dir="ltr"
                  />
                </div>
              </div>

              <SaveButton />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
            <div className="px-6 py-5 border-b border-[rgb(244_242_245)] flex justify-between items-center">
              <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                {lang === "ar" ? "لافتات العرض (Hero Banners)" : "Hero Banners"}
              </h3>
              {!isAddingBanner && (
                <button
                  onClick={() => setIsAddingBanner(true)}
                  className="flex items-center gap-1 text-sm bg-[rgb(244_242_245)] hover:bg-[rgb(207_195_223)] text-[rgb(60_28_84)] px-3 py-1.5 rounded-lg transition-colors font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  {lang === "ar" ? "إضافة لافتة" : "Add Banner"}
                </button>
              )}
            </div>

            <div className="p-6">
              {isAddingBanner && (
                <div className="bg-[rgb(244_242_245)] rounded-xl p-5 mb-6 space-y-4">
                  <h4 className="font-bold text-sm text-[rgb(60_28_84)] border-b border-[rgb(207_195_223)] pb-2">
                    {lang === "ar" ? "إضافة لافتة جديدة" : "Add New Banner"}
                  </h4>

                  <div className="w-full relative">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-[rgb(60_28_84)]/60">
                        {lang === "ar"
                          ? "صورة اللافتة (Banner Image)"
                          : "Banner Image"}
                      </label>
                      {isUploadingBanner && (
                        <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {lang === "ar" ? "جاري الرفع..." : "Uploading..."}
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingBanner(true);
                          const url = await handleImageUpload(file);
                          if (url) setNewBanner({ ...newBanner, image: url });
                          setIsUploadingBanner(false);
                        }
                      }}
                      className="w-full bg-white rounded-lg px-4 py-2 text-sm text-[rgb(60_28_84)] file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[rgb(60_28_84)] file:text-white hover:file:bg-[rgb(60_28_84)]/90 cursor-pointer"
                    />

                    {newBanner.image && (
                      <div className="mt-3 w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={newBanner.image}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsAddingBanner(false)}
                      className="px-4 py-2 text-sm font-semibold text-[rgb(60_28_84)]/60 hover:bg-[rgb(207_195_223)] rounded-lg transition-colors"
                      disabled={isSavingBanner}
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </button>

                    <button
                      onClick={handleSaveBanner}
                      disabled={
                        isUploadingBanner || isSavingBanner || !newBanner.image
                      }
                      className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-[rgb(60_28_84)] text-white rounded-lg disabled:opacity-50 transition-all hover:bg-[rgb(60_28_84)]/90"
                    >
                      {isSavingBanner ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {lang === "ar" ? "جاري النشر..." : "Publishing..."}
                        </>
                      ) : lang === "ar" ? (
                        "نشر اللافتة"
                      ) : (
                        "Save Banner"
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {banners.length === 0 && !isAddingBanner ? (
                  <p className="text-sm text-[rgb(60_28_84)]/50 text-center py-4">
                    {lang === "ar"
                      ? "لا توجد لافتات مضافة بعد."
                      : "No hero banners added yet."}
                  </p>
                ) : (
                  banners.map((banner, index) => (
                    <div
                      key={banner.id}
                      className="flex items-center justify-between bg-[rgb(244_242_245)] p-3 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-12 rounded-lg bg-cover bg-center border border-gray-200"
                          style={{ backgroundImage: `url(${banner.image})` }}
                        />
                        <div>
                          <p className="font-semibold text-sm text-[rgb(60_28_84)]">
                            {lang === "ar"
                              ? `لافتة ${index + 1}`
                              : `Banner ${index + 1}`}
                          </p>
                          <p
                            className={`text-xs ${banner.active ? "text-emerald-500" : "text-red-400"}`}
                          >
                            {banner.active
                              ? lang === "ar"
                                ? "نشط"
                                : "Active"
                              : lang === "ar"
                                ? "معطل"
                                : "Disabled"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setBannerConfirm({
                              isOpen: true,
                              action: "toggle",
                              banner,
                              loading: false,
                            })
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            banner.active
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                          }`}
                          title={banner.active ? "Deactivate" : "Activate"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setBannerConfirm({
                              isOpen: true,
                              action: "delete",
                              banner,
                              loading: false,
                            })
                          }
                          className="p-2 bg-red-100 text-red-500 hover:bg-red-200 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "policies" && (
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
            <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              {lang === "ar" ? "السياسات والمعلومات" : "Policies & Information"}
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {[
              {
                label: lang === "ar" ? "معلومات الشحن" : "Shipping Policy",
                key: "shipping_policy",
                placeholder:
                  lang === "ar"
                    ? "أدخل تفاصيل الشحن والمدة المتوقعة..."
                    : "Enter shipping details and timeframe...",
              },
              {
                label:
                  lang === "ar"
                    ? "الاسترجاع والتبديل"
                    : "Return & Exchange Policy",
                key: "return_policy",
                placeholder:
                  lang === "ar"
                    ? "شروط استرجاع أو استبدال المنتجات..."
                    : "Conditions for returning products...",
              },
              {
                label: lang === "ar" ? "سياسات الخصوصية" : "Privacy Policy",
                key: "privacy_policy",
                placeholder:
                  lang === "ar"
                    ? "كيفية تعاملك مع بيانات العملاء..."
                    : "How you handle customer data...",
              },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-bold text-[rgb(60_28_84)] mb-2">
                  {field.label}
                </label>
                <textarea
                  value={formData[field.key as keyof typeof formData]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: e.target.value })
                  }
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full bg-[rgb(244_242_245)] rounded-xl px-4 py-3 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all resize-y"
                  dir={dir}
                />
              </div>
            ))}

            <SaveButton />
          </div>
        </div>
      )}
    </div>
  );
}
