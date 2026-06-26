"use client";

import {
  User,
  MapPin,
  Package,
  Heart,
  LogOut,
  Globe,
  ShieldCheck,
  Loader2,
} from "lucide-react";

type MenuItem = {
  id: string;
  icon: React.ReactNode;
  label: { en: string; ar: string };
  section: string;
  danger?: boolean;
};

type Props = {
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  activeSection: string;
  loading?: boolean;
  lang?: "en" | "ar";
  onMenuItemClick: (section: string, isDanger?: boolean) => void;
};

export default function ProfileSidebar({
  customer,
  activeSection,
  loading = false,
  lang = "en",
  onMenuItemClick,
}: Props) {
  const fullName = `${customer.first_name} ${customer.last_name}`;
  const firstInitial = customer.first_name.charAt(0).toUpperCase();
  const lastInitial = customer.last_name.charAt(0).toUpperCase();

  const menuItems: MenuItem[] = [
    {
      id: "account",
      icon: <User size={20} />,
      label: { en: "Account", ar: "الحساب" },
      section: "account",
    },
    {
      id: "orders",
      icon: <Package size={20} />,
      label: { en: "Orders", ar: "الطلبات" },
      section: "orders",
    },
    {
      id: "wishlist",
      icon: <Heart size={20} />,
      label: { en: "Wishlist", ar: "المفضلة" },
      section: "wishlist",
    },
    {
      id: "addresses",
      icon: <MapPin size={20} />,
      label: { en: "Addresses", ar: "العناوين" },
      section: "addresses",
    },
    {
      id: "security",
      icon: <ShieldCheck size={20} />,
      label: { en: "Security", ar: "الأمان" },
      section: "security",
    },
    {
      id: "language",
      icon: <Globe size={20} />,
      label: { en: "Language", ar: "اللغة" },
      section: "language",
    },
    {
      id: "logout",
      icon: <LogOut size={20} />,
      label: { en: "Logout", ar: "تسجيل الخروج" },
      section: "logout",
      danger: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-5 sticky top-4">
      {/* User Profile */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 flex items-center justify-center text-lg font-bold text-brand-primary shrink-0">
          {firstInitial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {fullName}
          </p>
          <p className="text-xs text-gray-500 truncate">{customer.phone}</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuItemClick(item.section, item.danger)}
            disabled={loading}
            className={`h-11 px-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              activeSection === item.section
                ? "bg-brand-primary text-white"
                : item.danger
                  ? "text-red-500 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.id === "logout" && loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              item.icon
            )}
            <span>{item.label[lang]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
