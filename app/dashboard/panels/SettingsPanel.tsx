"use client";

import { useState, useCallback } from "react";
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
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  Music,
  Camera,
  ChevronDown,
} from "lucide-react";
import AppearanceTab from "../settings-tabs/AppearanceTab";
import StoreTab from "../settings-tabs/StoreTab";
import AccountTab from "../settings-tabs/AccountTab";
import PoliciesTab from "../settings-tabs/PoliciesTab";
import NotificationsTab from "../settings-tabs/NotificationsTab";
import { useDashboard } from "../DashboardContext";
import { STORE_TYPE_LABELS } from "../data";
import { StoreData, HeroBanner, Feature } from "@/types/api";
import {
  useStore,
  useStoreUpdate,
  useHeroBanners,
  useHeroBannerCreate,
  useHeroBannerDelete,
  useHeroBannerToggle,
} from "@/hooks/useApi";
import { useFeatures } from "@/hooks/useFeatures";
export default function SettingsPanel() {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [saved, setSaved] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const [formData, setFormData] = useState({
    store_name: "",
    location: "",
    phone: "",
    store_type: "",
    admin_name: "",
    admin_email: "",
    language: "ar",
    primary_color: "#3C1C54",
    promo_text: "",
    privacy_policy: "",
    shipping_policy: "",
    return_policy: "",
    logo_url: "",
    description: "",
    whatsapp_number: "",
    instagram_url: "",
    facebook_url: "",
    tiktok_url: "",
    twitter_url: "",
    snapchat_url: "",
  });

  const handleStoreSuccess = useCallback((data: StoreData) => {
    setFormData({
      store_name: data.store_name || "",
      location: data.location || "",
      phone: data.phone || "",
      store_type: data.store_type || "",
      admin_name: data.admin_name || "",
      admin_email: data.admin_email || "",
      language: data.language || "ar",
      primary_color: data.primary_color || "#3C1C54",
      privacy_policy: data.privacy_policy || "",
      shipping_policy: data.shipping_policy || "",
      return_policy: data.return_policy || "",
      logo_url: data.logo_url || "",
      promo_text: data.promo_text || "",
      description: data.description || "",
      whatsapp_number: data.whatsapp_number || "",
      instagram_url: data.instagram_url || "",
      facebook_url: data.facebook_url || "",
      tiktok_url: data.tiktok_url || "",
      twitter_url: data.twitter_url || "",
      snapchat_url: data.snapchat_url || "",
    });
  }, []);

  const {
    data: store,
    loading,
    retry: refetchStore,
  } = useStore({
    onSuccess: handleStoreSuccess,
  });

  const storeId = store?.id || "";

  const { data: bannersData, retry: refetchBanners } = useHeroBanners(storeId, {
    skip: !storeId,
  });
  const banners = bannersData ?? [];

  const { data: features = [], retry: refetchFeatures } = useFeatures(storeId, {
    skip: !storeId,
  });

  const { execute: updateStore, loading: isSaving } = useStoreUpdate();
  const { execute: createHeroBanner, loading: isSavingBanner } =
    useHeroBannerCreate();
  const { execute: toggleHeroBanner } = useHeroBannerToggle();
  const { execute: deleteHeroBanner } = useHeroBannerDelete();

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [appearanceActive, setAppearanceActive] = useState<
    "promo" | "color" | "language" | "sections" | "banners" | "testimonials"
  >("promo");

  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [newBanner, setNewBanner] = useState<Partial<HeroBanner>>({
    image: "",
    active: true,
    order: 1,
  });

  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [expandedBanner, setExpandedBanner] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

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
    "appearance" | "store" | "account" | "notifications" | "policies"
  >("appearance");

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);

  // ============================================
  // HANDLERS
  // ============================================

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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
        lang === "ar" ? "فشل رفع الصورة" : "Failed to upload image",
        "error",
      );
      return null;
    }
  };

  const handleSave = async () => {
    if (!store) return;
    setSaved(false);

    try {
      await updateStore({ ...formData, id: store.id });
      setSaved(true);
      showToast(
        lang === "ar"
          ? "تم حفظ التغييرات بنجاح!"
          : "Settings saved successfully!",
        "success",
      );
      await refetchStore();
      setTimeout(() => setSaved(false), 2500);
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Failed to update store", "error");
    }
  };

  const handleSaveBanner = async () => {
    if (!storeId) return;
    try {
      await createHeroBanner(storeId, {
        image: newBanner.image || "",
        active: newBanner.active,
        order: newBanner.order,
      });

      setIsAddingBanner(false);
      setNewBanner({ image: "", active: true, order: 1 });
      showToast(
        lang === "ar"
          ? "تم نشر اللافتة بنجاح!"
          : "Banner published successfully!",
        "success",
      );
      refetchBanners();
    } catch (e) {
      console.error(e);
      showToast(
        lang === "ar"
          ? "حدث خطأ أثناء نشر اللافتة."
          : "Error publishing banner.",
        "error",
      );
    }
  };

  const executeBannerAction = async () => {
    const { action, banner } = bannerConfirm;
    if (!banner) return;

    setBannerConfirm((prev) => ({ ...prev, loading: true }));

    try {
      if (action === "delete") {
        await deleteHeroBanner(banner.id);
        showToast(
          lang === "ar"
            ? "تم حذف اللافتة بنجاح!"
            : "Banner deleted successfully!",
          "success",
        );
      } else if (action === "toggle") {
        await toggleHeroBanner(banner.id, !banner.active);
        showToast(
          lang === "ar" ? "تم تحديث حالة اللافتة!" : "Banner status updated!",
          "success",
        );
      }
      refetchBanners();
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

  const handleSendNotification = async () => {
    try {
      if (!notificationTitle.trim() || !notificationMessage.trim()) return;

      setSendingNotification(true);

      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notificationTitle,
          body: notificationMessage,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send notification");
      }

      setNotificationTitle("");
      setNotificationMessage("");

      if (typeof window !== "undefined") {
        alert(
          lang === "ar"
            ? `تم إرسال الإشعار بنجاح إلى ${result.sentCount ?? 0} عميل`
            : `Notification sent successfully to ${result.sentCount ?? 0} customers`,
        );
      }
    } catch (error) {
      console.error(error);
      if (typeof window !== "undefined") {
        alert(
          lang === "ar" ? "فشل إرسال الإشعار" : "Failed to send notification",
        );
      }
    } finally {
      setSendingNotification(false);
    }
  };

  // ============================================
  // UI CONFIGURATION
  // ============================================

  const tabs = [
    { id: "appearance" as const, label: tr.appearance, icon: Globe },
    { id: "store" as const, label: tr.storeSettings, icon: Store },
    { id: "account" as const, label: tr.accountSettings, icon: User },
    {
      id: "notifications" as const,
      label: tr.notificationSettings,
      icon: Bell,
    },
    {
      id: "policies" as const,
      label: lang === "ar" ? "روابط هامة" : "Important Links",
      icon: ShieldCheck,
    },
  ];

  const appearanceSections = [
    {
      id: "promo" as const,
      label: lang === "ar" ? "الشريط الإعلاني" : "Promo Bar",
    },
    { id: "color" as const, label: lang === "ar" ? "الألوان" : "Colors" },
    { id: "language" as const, label: lang === "ar" ? "اللغة" : "Language" },
    {
      id: "sections" as const,
      label: lang === "ar" ? "أقسام الموقع" : "Site Sections",
    },
    {
      id: "banners" as const,
      label: lang === "ar" ? "اللافتات" : "Banners",
    },
    {
      id: "testimonials" as const,
      label: lang === "ar" ? "الشهادات" : "Testimonials",
    },
  ];

  const socialMediaFields = [
    {
      label: lang === "ar" ? "واتساب" : "WhatsApp",
      key: "whatsapp_number",
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      label: lang === "ar" ? "إنستجرام" : "Instagram",
      key: "instagram_url",
      icon: <Instagram className="w-4 h-4" />,
    },
    {
      label: lang === "ar" ? "فيسبوك" : "Facebook",
      key: "facebook_url",
      icon: <Facebook className="w-4 h-4" />,
    },
    {
      label: lang === "ar" ? "تيك توك" : "TikTok",
      key: "tiktok_url",
      icon: <Music className="w-4 h-4" />,
    },
    {
      label: lang === "ar" ? "تويتر (X)" : "Twitter (X)",
      key: "twitter_url",
      icon: <Twitter className="w-4 h-4" />,
    },
    {
      label: lang === "ar" ? "سناب شات" : "Snapchat",
      key: "snapchat_url",
      icon: <Camera className="w-4 h-4" />,
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

  // ============================================
  // LOADING & ERROR STATES
  // ============================================

  const SkeletonBox = ({ className }: { className: string }) => (
    <div
      className={`animate-pulse bg-[rgb(244_242_245)] rounded-sm ${className}`}
    />
  );

  if (loading) {
    return (
      <div className="space-y-6 w-full" dir={dir}>
        <div className="flex gap-1 bg-[rgb(244_242_245)] rounded-sm p-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBox key={i} className="h-10 flex-1" />
          ))}
        </div>
        <div className="bg-white rounded-sm border border-[rgb(244_242_245)] shadow-sm p-6 space-y-6">
          <SkeletonBox className="h-5 w-48" />
          <div className="grid md:grid-cols-2 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonBox className="h-3 w-20" />
                <SkeletonBox className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div
        className="bg-white rounded-sm border border-[rgb(244_242_245)] p-10 text-center text-sm text-red-500"
        dir={dir}
      >
        Failed to load store data
      </div>
    );
  }

  // ============================================
  // REUSABLE COMPONENTS
  // ============================================

  const SaveButton = () => (
    <button
      onClick={handleSave}
      disabled={isSaving}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-sm text-sm font-semibold transition-all shadow-md disabled:opacity-50 ${
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

  const TabButton = ({
    id,
    label,
    icon: Icon,
    isActive,
    onClick,
  }: {
    id: string;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 justify-center whitespace-nowrap ${
        isActive
          ? "bg-white text-[rgb(60_28_84)] shadow-sm"
          : "text-[rgb(60_28_84)]/50 hover:text-[rgb(60_28_84)]"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="space-y-6 w-full relative" dir={dir}>
      {/* Toast Notifications */}
      {toast && (
        <div
          className={`fixed top-8 ${
            dir === "rtl" ? "right-8" : "left-8"
          } px-6 py-3 rounded-sm text-sm font-bold text-white z-50 animate-fade-up flex items-center gap-2 ${
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

      {/* Confirmation Modal */}
      {bannerConfirm.isOpen && bannerConfirm.banner && (
        <ConfirmationModal
          action={bannerConfirm.action}
          banner={bannerConfirm.banner}
          loading={bannerConfirm.loading}
          lang={lang}
          onConfirm={executeBannerAction}
          onCancel={() => setBannerConfirm({ ...bannerConfirm, isOpen: false })}
        />
      )}

      {/* Main Tabs */}
      <div className="flex gap-1 bg-[rgb(244_242_245)] rounded-sm p-1 animate-fade-up overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* APPEARANCE TAB */}
      {activeTab === "appearance" && (
        <AppearanceTab
          lang={lang}
          dir={dir}
          appearanceActive={appearanceActive}
          setAppearanceActive={setAppearanceActive}
          appearanceSections={appearanceSections}
          formData={formData}
          setFormData={setFormData}
          isAddingBanner={isAddingBanner}
          setIsAddingBanner={setIsAddingBanner}
          newBanner={newBanner}
          setNewBanner={setNewBanner}
          banners={banners}
          expandedBanner={expandedBanner}
          setExpandedBanner={setExpandedBanner}
          isUploadingBanner={isUploadingBanner}
          setIsUploadingBanner={setIsUploadingBanner}
          isAddingFeature={isAddingFeature}
          setIsAddingFeature={setIsAddingFeature}
          features={features}
          expandedSection={expandedSection}
          setExpandedSection={setExpandedSection}
          storeId={storeId}
          refetchFeatures={refetchFeatures}
          refetchBanners={refetchBanners}
          handleImageUpload={handleImageUpload}
          handleSaveBanner={handleSaveBanner}
          isSavingBanner={isSavingBanner}
          SaveButton={SaveButton}
          showToast={showToast}
          setBannerConfirm={setBannerConfirm}
        />
      )}

      {/* STORE TAB */}
      {activeTab === "store" && (
        <StoreTab
          lang={lang}
          dir={dir}
          tr={tr}
          formData={formData}
          setFormData={setFormData}
          store={store}
          isUploadingLogo={isUploadingLogo}
          setIsUploadingLogo={setIsUploadingLogo}
          handleImageUpload={handleImageUpload}
          socialMediaFields={socialMediaFields}
          createdDate={createdDate}
          SaveButton={SaveButton}
        />
      )}

      {/* ACCOUNT TAB */}
      {activeTab === "account" && (
        <AccountTab
          lang={lang}
          dir={dir}
          tr={tr}
          store={store}
          formData={formData}
          setFormData={setFormData}
          SaveButton={SaveButton}
        />
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <NotificationsTab
          lang={lang}
          notificationTitle={notificationTitle}
          setNotificationTitle={setNotificationTitle}
          notificationMessage={notificationMessage}
          setNotificationMessage={setNotificationMessage}
          sendingNotification={sendingNotification}
          handleSendNotification={handleSendNotification}
        />
      )}

      {/* POLICIES TAB */}
      {activeTab === "policies" && (
        <PoliciesTab
          lang={lang}
          dir={dir}
          formData={formData}
          setFormData={setFormData}
          SaveButton={SaveButton}
        />
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS (EXTRACTED FOR READABILITY)
// ============================================

interface ConfirmationModalProps {
  action: "delete" | "toggle";
  banner: HeroBanner;
  loading: boolean;
  lang: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationModal({
  action,
  banner,
  loading,
  lang,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-sm p-6 w-full max-w-sm shadow-xl animate-scale-up space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              action === "delete"
                ? "bg-red-50 text-red-500"
                : "bg-amber-50 text-amber-500"
            }`}
          >
            {action === "delete" ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <Power className="w-6 h-6" />
            )}
          </div>
          <h3 className="font-bold text-[rgb(60_28_84)] text-lg">
            {action === "delete"
              ? lang === "ar"
                ? "حذف اللافتة؟"
                : "Delete Banner?"
              : banner.active
                ? lang === "ar"
                  ? "تعطيل اللافتة؟"
                  : "Disable Banner?"
                : lang === "ar"
                  ? "تفعيل اللافتة؟"
                  : "Enable Banner?"}
          </h3>
          <p className="text-sm text-[rgb(60_28_84)]/60">
            {action === "delete"
              ? lang === "ar"
                ? "هل أنت متأكد من حذف هذه اللافتة نهائياً؟"
                : "Are you sure you want to delete this banner?"
              : banner.active
                ? lang === "ar"
                  ? "سيتم إخفاؤها من واجهة المتجر."
                  : "It will be hidden from the storefront."
                : lang === "ar"
                  ? "ستظهر للعملاء في المتجر."
                  : "It will be visible to customers."}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-sm text-sm font-semibold text-[rgb(60_28_84)] bg-[rgb(244_242_245)] hover:bg-[rgb(207_195_223)] transition-colors disabled:opacity-50"
          >
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-sm font-semibold text-white transition-all disabled:opacity-50 ${
              action === "delete"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[rgb(60_28_84)] hover:bg-[rgb(60_28_84)]/90"
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : action === "delete" ? (
              lang === "ar" ? (
                "حذف"
              ) : (
                "Delete"
              )
            ) : banner.active ? (
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
  );
}
