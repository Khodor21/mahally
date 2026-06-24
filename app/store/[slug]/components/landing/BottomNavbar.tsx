"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, Search, User } from "lucide-react";
import { useShop } from "@/app/store/context";

const translations = {
  en: {
    home: "Home",
    categories: "Categories",
    search: "Search",
    cart: "Cart",
    profile: "Profile",
  },
  ar: {
    home: "الرئيسية",
    categories: "الأقسام",
    search: "البحث",
    cart: "السلة",
    profile: "الحساب",
  },
} as const;

export default function BottomNavbar({
  lang = "en",
  storeSlug = "",
}: {
  lang?: "en" | "ar";
  storeSlug?: string;
}) {
  const pathname = usePathname();
  const { cartCount } = useShop();
  const t = translations[lang];

  const base = (path: string) => `/store/${storeSlug}${path}?lang=${lang}`;

  // Emit a custom event so the Top Navbar knows to open the Search Modal
  const handleOpenSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-search-modal"));
  };

  const navItems = [
    {
      label: t.home,
      icon: <Home size={22} className="stroke-[1.5]" />,
      href: "",
    },
    {
      label: t.categories,
      icon: <LayoutGrid size={22} className="stroke-[1.5]" />,
      href: "/categories",
    },
    {
      label: t.search,
      icon: <Search size={22} className="stroke-[1.5]" />,
      href: "#",
      onClick: handleOpenSearch,
    },
    {
      label: t.cart,
      href: "/cart",
      icon: (
        <span className="relative flex items-center justify-center leading-none">
          <ShoppingBag size={22} className="stroke-[1.5]" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 w-4 h-4 flex items-center justify-center rounded-full bg-brand-primary text-white text-[9px] font-bold px-0.5 leading-none ring-2 ring-white">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </span>
      ),
    },
    {
      label: t.profile,
      icon: <User size={22} className="stroke-[1.5]" />,
      href: "/profile",
    },
  ];

  return (
    <nav
      className="fixed md:hidden bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-safe"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex justify-around items-center rounded-t-xl h-20 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href && item.href !== "#";

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={item.onClick}
              className="flex flex-col items-center justify-center w-full h-full gap-1.5 tap-highlight-transparent group"
            >
              <div
                className={`transition-colors duration-200 text-xl ${
                  isActive
                    ? "text-brand-primary"
                    : "text-gray-800 group-hover:text-gray-600"
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-brand-primary"
                    : "text-gray-800 group-hover:text-gray-700"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
