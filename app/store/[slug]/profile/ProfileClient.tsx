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
  Loader2,
  Edit2,
  X,
  Check,
} from "lucide-react";

import Toast from "../components/Toast";
import ConfirmModal from "./components/ConfirmModal";
import InfoCard from "./components/InfoCard";
import InputField from "./components/InputField";
import SelectField from "./components/SelectField";
import { useShop } from "../../context";
import ProductCard from "../components/landing/ProductCard";

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

type MenuItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  labelAr: string;
  section: "account" | "orders" | "wishlist";
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
    accountInfo: "Account Information",
    manageAccount: "Manage your personal information",
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
    viewLatest: "View your latest orders and track shipments",
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
    noOrders: "No orders yet",
    startShopping: "Start shopping to see your orders here",
    password: "Password",
    noWishlist: "No items in wishlist",
    noWishlistDesc: "Add items to your wishlist to see them here",
    noAddresses: "No addresses saved",
    noAddressesDesc: "Add your addresses for faster checkout",
    logout: "Logout",
  },
  ar: {
    account: "الحساب",
    orders: "طلباتي",
    wishlist: "المفضلة",
    addresses: "العناوين",
    accountInfo: "معلومات الحساب",
    manageAccount: "إدارة معلومات حسابك الشخصية",
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
    viewLatest: "عرض وتتبع آخر طلباتك",
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
    noOrders: "لا توجد طلبات حتى الآن",
    startShopping: "ابدأ التسوق لرؤية طلباتك هنا",
    password: "كلمة المرور",
    noWishlist: "لا توجد عناصر في المفضلة",
    noWishlistDesc: "أضف عناصر إلى المفضلة لرؤيتها هنا",
    noAddresses: "لا توجد عناوين محفوظة",
    noAddressesDesc: "أضف عناوينك لتسهيل عملية الدفع",
    logout: "تسجيل الخروج",
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

export default function ProfileClient({ customer, lang, slug }: Props) {
  const router = useRouter();
  const tr = translations[lang] as any;
  const isArabic = lang === "ar";
  const { favorites } = useShop();

  const [activeSection, setActiveSection] = useState<
    "account" | "orders" | "wishlist"
  >("account");
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

  // Mock orders data - replace with API call
  const [orders] = useState<Order[]>([
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
  ]);

  const fullName = `${customer.first_name} ${customer.last_name}`;
  const firstInitial = customer.first_name.charAt(0).toUpperCase();
  const lastInitial = customer.last_name.charAt(0).toUpperCase();

  const menuItems: MenuItem[] = [
    {
      id: "account",
      icon: <User size={20} />,
      label: tr.account,
      labelAr: tr.account,
      section: "account",
    },
    {
      id: "orders",
      icon: <Package size={20} />,
      label: tr.orders,
      labelAr: tr.orders,
      section: "orders",
    },
    {
      id: "wishlist",
      icon: <Heart size={20} />,
      label: tr.wishlist,
      labelAr: tr.wishlist,
      section: "wishlist",
    },
  ];

  // Map context favorites to perfectly match ProductCard expectations
  const mappedFavorites = (favorites || []).map((item: any) => ({
    id: item.id,
    title: item.title || "Untitled Product",
    image:
      item.image ||
      item.images?.[0] ||
      "https://placehold.co/600x600/png?text=No+Image",
    price: item.price ?? 0,
    discount_price: item.discount_price ?? null,
    stock: item.stock ?? 1,
  }));

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
          setLoading(false);
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
        setLoading(false);
        return;
      }

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
    } catch (error) {
      console.error("Update error:", error);
      setToast({ message: tr.updateError, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      setLoading(true);
      await fetch("/api/store-customers/logout", { method: "POST" });
      router.push("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      setToast({ message: "Failed to logout", type: "error" });
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setLoading(true);
      const res = await fetch("/api/profile", { method: "DELETE" });
      const data = await res.json();
      if (data.success) router.push("/auth");
      else setToast({ message: data.message, type: "error" });
    } catch (error) {
      console.error("Delete error:", error);
      setToast({ message: "Failed to delete account", type: "error" });
      setLoading(false);
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Header with Logout */}
          <div className="mb-6 sm:mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 flex items-center justify-center text-2xl sm:text-3xl font-bold text-brand-primary">
                {firstInitial}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {fullName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{customer.phone}</p>
              </div>
            </div>

            <button
              onClick={() => setLogoutModal(true)}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-medium bg-red-600 text-white rounded-base px-2 py-1 hover:text-red-600 hover:bg-white transition-colors disabled:opacity-50"
            >
              <span className="inline">{tr.logout}</span>
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogOut size={18} />
              )}
            </button>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Sidebar - Mobile: Horizontal Scroll, Desktop: Vertical */}
            <aside className="lg:col-span-1">
              <div className="lg:bg-white lg:rounded lg:border lg:border-gray-200 lg:p-4 lg:sticky lg:top-4">
                {/* Mobile: Horizontal Menu */}
                <div className="lg:hidden mb-6 max-w-7xl">
                  <div className="grid grid-cols-3 gap-2 pb-2 px-3 sm:px-4">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.section)}
                        className={`w-full h-10 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                          activeSection === item.section
                            ? "bg-brand-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {isArabic ? item.labelAr : item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop: Vertical Menu */}
                <div className="hidden lg:flex flex-col gap-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.section)}
                      className={`h-11 px-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all ${
                        activeSection === item.section
                          ? "bg-brand-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      <span>{isArabic ? item.labelAr : item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3 flex flex-col gap-4 sm:gap-6">
              {/* Account Section */}
              {activeSection === "account" && (
                <>
                  <section className="bg-white rounded sm:rounded border border-gray-200 p-4 sm:p-6 md:p-7">
                    <div className="flex justify-between mb-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          {tr.accountInfo}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {tr.manageAccount}
                        </p>
                      </div>

                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-fit h-9 md:h-10 px-4 sm:px-4 rounded bg-brand-primary text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 "
                        >
                          <Edit2 size={16} />
                          {tr.edit}
                        </button>
                      )}
                    </div>

                    {!isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <InfoCard
                          label={tr.firstName}
                          value={customer.first_name}
                        />
                        <InfoCard
                          label={tr.lastName}
                          value={customer.last_name}
                        />
                        <InfoCard
                          label={tr.phoneNumber}
                          value={customer.phone}
                        />
                        <InfoCard
                          label={tr.governorate}
                          value={customer.governorate}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
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
                              setForm((prev) => ({
                                ...prev,
                                currentPassword: v,
                              }))
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

                        <div className="flex gap-3 mb-6">
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
                            className="flex-1 h-10 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <X size={16} />
                            {tr.cancel}
                          </button>
                          <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="flex-1 h-10 px-4 rounded-xl bg-brand-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {loading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                {tr.saving}
                              </>
                            ) : (
                              <>
                                <Check size={16} />
                                {tr.save}
                              </>
                            )}
                          </button>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                          <button
                            disabled={loading}
                            onClick={() => setDeleteModal(true)}
                            className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                          >
                            {tr.deleteAccount}
                          </button>
                        </div>
                      </>
                    )}
                  </section>

                  {/* Addresses Section (Merged into Account) */}
                  <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 md:p-7">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
                      {tr.addresses}
                    </h3>
                    <div className="text-center py-12">
                      <MapPin
                        size={40}
                        className="mx-auto text-gray-300 mb-3"
                      />
                      <p className="text-sm font-medium text-gray-900">
                        {tr.noAddresses}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {tr.noAddressesDesc}
                      </p>
                    </div>
                  </section>
                </>
              )}

              {/* Orders Section */}
              {activeSection === "orders" && (
                <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 md:p-7">
                  <div className="mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {tr.recentOrders}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {tr.viewLatest}
                    </p>
                  </div>

                  {orders.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {orders.map((order) => (
                        <button
                          key={order.id}
                          onClick={() => {
                            /* Handle order click */
                          }}
                          className="text-left border border-gray-200 rounded-2xl p-3 sm:p-4 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {order.id}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {order.date}
                              </p>
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-medium whitespace-nowrap">
                              {isArabic ? order.statusAr : order.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-900">
                              {order.total}
                            </span>
                            <ChevronRight size={18} className="text-gray-300" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package
                        size={40}
                        className="mx-auto text-gray-300 mb-3"
                      />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {tr.noOrders}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tr.startShopping}
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* Wishlist Section */}
              {activeSection === "wishlist" && (
                <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 md:p-7">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
                    {tr.wishlist}
                  </h3>

                  {mappedFavorites.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {mappedFavorites.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          storeSlug={slug}
                          lang={lang}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-sm font-medium text-gray-900">
                        {tr.noWishlist}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {tr.noWishlistDesc}
                      </p>
                    </div>
                  )}
                </section>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Confirm Modals */}
      <ConfirmModal
        open={logoutModal}
        title={tr.logoutTitle}
        description={tr.logoutConfirm}
        confirmText={tr.logout}
        cancelText={tr.cancel}
        loading={loading}
        onConfirm={handleLogout}
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
        onConfirm={handleDelete}
        onClose={() => setDeleteModal(false)}
      />
    </>
  );
}
