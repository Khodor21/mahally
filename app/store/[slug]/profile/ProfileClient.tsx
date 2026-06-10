"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Package,
  Heart,
  LogOut,
  ChevronRight,
  Globe,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import Toast from "../components/Toast";
import ConfirmModal from "./components/ConfirmModal";
import SidebarItem from "./components/SidebarItem";
import InfoCard from "./components/InfoCard";
import InputField from "./components/InputField";
import SelectField from "./components/SelectField";

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  governorate: string;
  store_id: string;
};

type Order = {
  id: string;
  date: string;
  total: string;
  status: string;
  statusAr: string;
};

type Props = {
  customer: Customer;
  lang: "en" | "ar";
  slug: string;
};

const translations = {
  en: {
    account: "Account",
    orders: "Orders",
    wishlist: "Wishlist",
    addresses: "Addresses",
    security: "Security",
    language: "Language",
    logout: "Logout",
    accountInfo: "Account Information",
    manageAccount: "Manage your personal account information",
    edit: "Edit",
    cancel: "Cancel",
    save: "Save Changes",
    fullName: "Full Name",
    firstName: "First Name",
    lastName: "Last Name",
    phoneNumber: "Phone Number",
    governorate: "Governorate",
    currentPassword: "Current Password",
    newPassword: "New Password",
    recentOrders: "Recent Orders",
    viewLatest: "View your latest orders",
    viewAll: "View All",
    updateSuccess: "Profile updated successfully",
    updateError: "Failed to update profile",
    logoutConfirm: "Are you sure you want to logout?",
    deleteConfirm:
      "Are you sure you want to delete your account? This action cannot be undone.",
    deleteAccount: "Delete Account",
    deleting: "Deleting...",
    saving: "Saving...",
    loggingOut: "Logging out...",
    optional: "Optional",
    selectGovernorate: "Select Governorate",
    logoutTitle: "Logout",
  },
  ar: {
    account: "الحساب",
    orders: "طلباتي",
    wishlist: "المفضلة",
    addresses: "العناوين",
    security: "الأمان",
    language: "اللغة",
    logout: "تسجيل الخروج",
    accountInfo: "معلومات الحساب",
    manageAccount: "قم بإدارة معلومات حسابك الشخصية",
    edit: "تعديل",
    cancel: "إلغاء",
    save: "حفظ التغييرات",
    fullName: "الاسم الكامل",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    phoneNumber: "رقم الهاتف",
    governorate: "المحافظة",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    recentOrders: "آخر الطلبات",
    viewLatest: "عرض آخر الطلبات الخاصة بك",
    viewAll: "عرض الكل",
    updateSuccess: "تم تحديث الملف الشخصي بنجاح",
    updateError: "فشل تحديث الملف الشخصي",
    logoutConfirm: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
    deleteConfirm:
      "هل أنت متأكد أنك تريد حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.",
    deleteAccount: "حذف الحساب",
    deleting: "جاري الحذف...",
    saving: "جاري الحفظ...",
    loggingOut: "جاري تسجيل الخروج...",
    optional: "اختياري",
    selectGovernorate: "اختر المحافظة",
    logoutTitle: "تسجيل الخروج",
  },
};

const governorates = [
  "Beirut",
  "Mount Lebanon",
  "North",
  "Akkar",
  "Bekaa",
  "Baalbek-Hermel",
  "South",
  "Nabatieh",
];

const orders = [
  {
    id: "#5821",
    status: "Delivered",
    statusAr: "تم التوصيل",
    total: "$120.00",
    date: "12 May 2026",
  },
  {
    id: "#5820",
    status: "Processing",
    statusAr: "قيد المعالجة",
    total: "$84.00",
    date: "10 May 2026",
  },
];

export default function ProfileClient({ customer, lang, slug }: Props) {
  const router = useRouter();
  const tr = translations[lang] as any;
  const isArabic = lang === "ar";

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [logoutModal, setLogoutModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [form, setForm] = useState({
    firstName: customer.first_name,
    lastName: customer.last_name,
    phone: customer.phone,
    governorate: customer.governorate,
    currentPassword: "",
    newPassword: "",
  });

  const fullName = `${customer.first_name} ${customer.last_name}`;

  async function handleUpdate() {
    try {
      setLoading(true);

      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        governorate: form.governorate,
      };

      if (form.newPassword) {
        if (!form.currentPassword) {
          setToast({
            message: isArabic
              ? "يرجى إدخال كلمة المرور الحالية"
              : "Please enter current password",
            type: "error",
          });
          return;
        }
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        setToast({ message: data.message || tr.updateError, type: "error" });
        return;
      }

      // Update local storage to match the new database state
      localStorage.setItem(
        "store_customer",
        JSON.stringify({
          ...customer,
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          governorate: form.governorate,
        }),
      );

      setToast({ message: tr.updateSuccess, type: "success" });
      setIsEditing(false);
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      router.refresh(); // Crucial: syncs the new data with the Server Component
    } catch {
      setToast({ message: tr.updateError, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function confirmLogout() {
    try {
      setLoading(true);
      await fetch("/api/store-customers/logout", { method: "POST" });
      localStorage.removeItem("store_customer");

      // Absolute path to respect middleware domains
      router.push("/auth");
      router.refresh();
    } catch {
      setToast({
        message: isArabic ? "فشل تسجيل الخروج" : "Logout failed",
        type: "error",
      });
    } finally {
      setLoading(false);
      setLogoutModal(false);
    }
  }

  async function confirmDeleteAccount() {
    try {
      setLoading(true);
      const res = await fetch("/api/profile", { method: "DELETE" });
      const data = await res.json();

      if (!data.success) {
        setToast({
          message: data.message || "Failed to delete account",
          type: "error",
        });
        return;
      }

      localStorage.removeItem("store_customer");

      // Absolute path to respect middleware domains
      router.push("/");
      router.refresh();
    } catch {
      setToast({ message: "Failed to delete account", type: "error" });
    } finally {
      setLoading(false);
      setDeleteModal(false);
    }
  }

  // Safe checks for initials to prevent app crashes if name is empty
  const firstInitial = customer.first_name?.[0] || "";
  const lastInitial = customer.last_name?.[0] || "";

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        open={logoutModal}
        title={tr.logoutTitle}
        description={tr.logoutConfirm}
        confirmText={tr.logout}
        cancelText={tr.cancel}
        loading={loading}
        onConfirm={confirmLogout}
        onClose={() => setLogoutModal(false)}
      />

      <ConfirmModal
        open={deleteModal}
        title={tr.deleteAccount}
        description={tr.deleteConfirm}
        confirmText={tr.deleteAccount}
        cancelText={tr.cancel}
        loading={loading}
        danger
        onConfirm={confirmDeleteAccount}
        onClose={() => setDeleteModal(false)}
      />

      <div
        dir={isArabic ? "rtl" : "ltr"}
        className="min-h-screen bg-brand-grey/30"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <aside className="bg-white rounded-3xl border border-brand-light p-4 h-fit lg:sticky lg:top-24">
              <div className="flex items-center gap-3 pb-5 border-b border-brand-light">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-brand-grey shrink-0">
                  <div className="w-full h-full flex items-center justify-center bg-brand-dark text-white text-xl font-bold">
                    {firstInitial}
                    {lastInitial}
                  </div>
                </div>

                <div className="overflow-hidden">
                  <h2 className="text-sm font-bold text-brand-dark truncate">
                    {fullName}
                  </h2>
                  <p className="text-xs text-brand-dark/50 truncate">
                    {customer.phone}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-4">
                <SidebarItem
                  active
                  icon={<User size={18} />}
                  label={tr.account}
                />
                <SidebarItem icon={<Package size={18} />} label={tr.orders} />
                <SidebarItem icon={<Heart size={18} />} label={tr.wishlist} />
                <SidebarItem icon={<MapPin size={18} />} label={tr.addresses} />
                <SidebarItem
                  icon={<ShieldCheck size={18} />}
                  label={tr.security}
                />
                <SidebarItem icon={<Globe size={18} />} label={tr.language} />
                <SidebarItem
                  danger
                  disabled={loading}
                  onClick={() => setLogoutModal(true)}
                  icon={
                    loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <LogOut size={18} />
                    )
                  }
                  label={loading ? tr.loggingOut : tr.logout}
                />
              </div>
            </aside>

            <div className="flex flex-col gap-6">
              <section className="bg-white rounded-3xl border border-brand-light p-5 md:p-7">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-brand-dark">
                      {tr.accountInfo}
                    </h1>
                    <p className="text-sm text-brand-dark/50 mt-1">
                      {tr.manageAccount}
                    </p>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="h-10 px-4 rounded-xl bg-brand-dark text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      {tr.edit}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        disabled={loading}
                        onClick={() => {
                          setIsEditing(false);
                          setForm({
                            firstName: customer.first_name,
                            lastName: customer.last_name,
                            phone: customer.phone,
                            governorate: customer.governorate,
                            currentPassword: "",
                            newPassword: "",
                          });
                        }}
                        className="h-10 px-4 rounded-xl border border-brand-light text-brand-dark text-sm font-medium hover:bg-brand-grey/50 transition-colors disabled:opacity-50"
                      >
                        {tr.cancel}
                      </button>

                      <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="h-10 px-4 rounded-xl bg-brand-dark text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading && (
                          <Loader2 size={16} className="animate-spin" />
                        )}
                        {loading ? tr.saving : tr.save}
                      </button>
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard label={tr.fullName} value={fullName} />
                    <InfoCard label={tr.phoneNumber} value={customer.phone} />
                    <InfoCard
                      label={tr.governorate}
                      value={customer.governorate}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      required
                      label={tr.firstName}
                      value={form.firstName}
                      onChange={(v) =>
                        setForm((prev) => ({ ...prev, firstName: v }))
                      }
                    />
                    <InputField
                      required
                      label={tr.lastName}
                      value={form.lastName}
                      onChange={(v) =>
                        setForm((prev) => ({ ...prev, lastName: v }))
                      }
                    />
                    <InputField
                      required
                      label={tr.phoneNumber}
                      value={form.phone}
                      onChange={(v) =>
                        setForm((prev) => ({ ...prev, phone: v }))
                      }
                    />
                    <SelectField
                      required
                      options={governorates}
                      label={tr.governorate}
                      value={form.governorate}
                      placeholder={tr.selectGovernorate}
                      onChange={(v) =>
                        setForm((prev) => ({ ...prev, governorate: v }))
                      }
                    />
                    <InputField
                      type="password"
                      label={`${tr.currentPassword} (${tr.optional})`}
                      value={form.currentPassword}
                      onChange={(v) =>
                        setForm((prev) => ({ ...prev, currentPassword: v }))
                      }
                    />
                    <InputField
                      type="password"
                      label={`${tr.newPassword} (${tr.optional})`}
                      value={form.newPassword}
                      onChange={(v) =>
                        setForm((prev) => ({ ...prev, newPassword: v }))
                      }
                    />
                  </div>
                )}

                {isEditing && (
                  <div className="mt-6 pt-6 border-t border-brand-light">
                    <button
                      disabled={loading}
                      onClick={() => setDeleteModal(true)}
                      className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? tr.deleting : tr.deleteAccount}
                    </button>
                  </div>
                )}
              </section>

              <section className="bg-white rounded-3xl border border-brand-light p-5 md:p-7">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-brand-dark">
                      {tr.recentOrders}
                    </h2>
                    <p className="text-sm text-brand-dark/50 mt-1">
                      {tr.viewLatest}
                    </p>
                  </div>
                  <button className="text-sm text-brand-dark font-medium hover:opacity-70 transition-opacity">
                    {tr.viewAll}
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-brand-light rounded-2xl p-4 flex items-center justify-between hover:bg-brand-grey/40 transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-brand-dark">
                          {order.id}
                        </span>
                        <span className="text-xs text-brand-dark/50">
                          {order.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-brand-dark">
                          {order.total}
                        </span>
                        <span className="text-xs px-3 py-1 rounded-full bg-brand-grey text-brand-dark">
                          {isArabic ? order.statusAr : order.status}
                        </span>
                        <ChevronRight
                          size={18}
                          className="text-brand-dark/40"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
