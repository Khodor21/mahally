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
  storeSlug = "", // Prop maintained to prevent breaking parent component signatures
}: {
  lang?: "en" | "ar";
  storeSlug?: string;
}) {
  const pathname = usePathname();
  const { cartCount } = useShop();
  const t = translations[lang];

  // 👉 FIX 1: Root-level URL generation (removing /store/${storeSlug})
  const base = (path: string) => {
    if (path === "") return `/?lang=${lang}`;
    // 👉 FIX 2: Ensure hash links append properly after the query string
    if (path.startsWith("#")) return `/?lang=${lang}${path}`;
    return `${path}?lang=${lang}`;
  };

  const decodedPathname = decodeURIComponent(pathname || "");
  const normalizedPath = decodedPathname.replace(/\/$/, "") || "/";

  const handleOpenSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-search-modal"));
  };

  // 👉 FIX 3: Update isActive for root-level and hash-based navigation
  const isActive = (path: string) => {
    if (path.startsWith("#")) return false; // Ignore hash and search modal for routing active states

    if (!path || path === "/") {
      return normalizedPath === "/";
    }

    // Match exact path OR any sub-route (e.g., /cart/checkout keeps /cart active)
    return normalizedPath === path || normalizedPath.startsWith(`${path}/`);
  };

  const navItems = [
    {
      label: t.home,
      icon: <Home size={18} className="stroke-[1.5]" />,
      activeIcon: (
        <Home size={18} fill="currentColor" className="stroke-[1.5]" />
      ),
      href: "",
    },
    {
      label: t.categories,
      icon: <LayoutGrid size={18} className="stroke-[1.5]" />,
      activeIcon: (
        <LayoutGrid size={18} fill="currentColor" className="stroke-[1.5]" />
      ),
      // 👉 FIX 4: Changed to hash link to navigate to section on home page
      href: "#categories",
    },
    {
      label: t.search,
      icon: <Search size={18} className="stroke-[1.5]" />,
      activeIcon: <Search size={18} className="stroke-[2.5]" />, // Search usually looks better bolded rather than filled
      href: "#",
      onClick: handleOpenSearch,
    },
    {
      label: t.cart,
      href: "/cart",
      icon: (
        <span className="relative flex items-center justify-center leading-none">
          <ShoppingBag size={18} className="stroke-[1.5]" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-brand-primary text-white text-[8px] font-bold px-0.5 leading-none ring-1 ring-white">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </span>
      ),
      activeIcon: (
        <span className="relative flex items-center justify-center leading-none">
          <ShoppingBag size={18} fill="currentColor" className="stroke-[1.5]" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-brand-primary text-white text-[8px] font-bold px-0.5 leading-none ring-1 ring-white">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </span>
      ),
    },
    {
      label: t.profile,
      icon: <User size={18} className="stroke-[1.5]" />,
      activeIcon: (
        <User size={18} fill="currentColor" className="stroke-[1.5]" />
      ),
      href: "/profile",
    },
  ];

  return (
    <nav
      className="fixed md:hidden bottom-0 left-0 right-0 z-[60] bg-white border-t border-brand-primary/30 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-safe rounded-t-2xl overflow-hidden"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex justify-around items-center rounded-t-xl h-20 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href ? base(item.href) : base("")}
              onClick={item.onClick}
              className="flex flex-col items-center justify-center w-full h-full gap-1 tap-highlight-transparent group"
            >
              <div
                className={`transition-colors duration-200 text-lg ${
                  active
                    ? "text-brand-primary"
                    : "text-gray-800 group-hover:text-gray-600"
                }`}
              >
                {active ? item.activeIcon : item.icon}
              </div>

              <span
                className={`text-xs font-regular transition-colors duration-200 ${
                  active
                    ? "text-brand-primary font-semibold"
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
