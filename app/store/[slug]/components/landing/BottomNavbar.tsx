"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiUserFill } from "react-icons/ri";
import { PiMonitorFill } from "react-icons/pi";
import { MdHomeFilled } from "react-icons/md";
import { PiPackageFill } from "react-icons/pi";
import { RiShoppingBag3Fill } from "react-icons/ri";
import { useShop } from "@/app/store/context";

const translations = {
  en: {
    home: "Home",
    categories: "Categories",
    cart: "Cart",
    orders: "My Orders",
    account: "Account",
  },
  ar: {
    home: "الرئيسية",
    categories: "الأقسام",
    cart: "السلة",
    orders: "طلباتي",
    account: "حسابي",
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

  const navItems = [
    { label: t.home, icon: <MdHomeFilled size={23} />, href: base("") },
    {
      label: t.categories,
      icon: <PiMonitorFill size={23} />,
      href: base("/categories"),
    },
    {
      label: t.cart,
      href: base("/cart"),
      icon: (
        <span className="relative flex items-center justify-center leading-none">
          <RiShoppingBag3Fill size={23} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-0.5 leading-none">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </span>
      ),
    },
    {
      label: t.orders,
      icon: <PiPackageFill size={23} />,
      href: base("/orders"),
    },
    {
      label: t.account,
      icon: <RiUserFill size={23} />,
      href: base("/account"),
    },
  ];

  return (
    <nav
      className="fixed md:hidden bottom-0 left-0 right-0 z-50 bg-white border-t border-secondary rounded-t-xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-center w-full h-full"
            >
              <div className="flex flex-col items-center justify-center w-full h-full gap-1">
                <div className={isActive ? "text-primary" : "text-black/75"}>
                  {item.icon}
                </div>
                <span
                  className={`text-[12px] ${
                    isActive ? "text-primary" : "text-black/75"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
