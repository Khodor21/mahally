"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaInstagram,
  FaTiktok,
  FaSnapchatGhost,
  FaFacebookF,
  FaMoneyBillWave,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoWalletOutline } from "react-icons/io5";
import { FiPhone, FiMail } from "react-icons/fi";
import { Globe } from "lucide-react";
import { setLanguage } from "@/lib/setLanguage";

interface FooterProps {
  lang?: "en" | "ar";
  storeName?: string;
  storeSlug?: string;
  storeId?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  phone?: string | null;
  email?: string | null;
  instagramUrl?: string | null;
}

export default function Footer({
  lang = "ar",
  storeName = "Store",
  storeSlug = "",
  storeId = "",
  logoUrl,
  primaryColor,
  phone,
  email,
  instagramUrl,
}: FooterProps) {
  const router = useRouter();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const toggleLang = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLanguage(newLang);
    router.refresh();
  };

  const buildUrl = (path: string) => {
    if (!storeSlug) return `${path}?lang=${lang}`;
    return `/store/${storeSlug}${path}?lang=${lang}`;
  };

  // Fallbacks for contact info
  const displayEmail = email || `info@${storeSlug || "store"}.com`;
  const displayPhone = phone || "";

  const content = {
    ar: {
      description:
        "علامة تجارية، تأسست في عام 2021. رسالتنا هي التصميم البسيط والجودة العالية، ونسعى دائماً لتطوير مهاراتنا في التصميم وتحسين جودة المنتجات. أولويتنا رضا العملاء وتقديم تجربة فريدة ومميزة لهم.",
      importantLinks: "روابط مهمة",
      contactUs: "تواصل معنا",
      commercialId: "الرقم التجاري:",
      rights: "جميع الحقوق محفوظة",
      cashOnDelivery: "الدفع عند الاستلام",
      whishMoney: "Whish Money",
      links: [
        { label: "سياسة الإستبدال و الإسترجاع", href: "/return-policy" },
        { label: "الشحن والتوصيل", href: "/shipping" },
        { label: "الأسئلة الشائعة", href: "/faq" },
        { label: "الشروط و الأحكام", href: "/terms" },
        { label: "سياسة الخصوصية", href: "/privacy" },
        { label: "الشكاوى و الإقتراحات", href: "/complaints" },
      ],
    },
    en: {
      description:
        "A brand established in 2021. Our mission is simple design and high quality. We constantly strive to develop our skills and improve product quality. Customer satisfaction is our priority.",
      importantLinks: "Important Links",
      contactUs: "Contact Us",
      commercialId: "Commercial ID:",
      rights: "All rights reserved",
      cashOnDelivery: "Cash on Delivery",
      whishMoney: "Whish Money",
      links: [
        { label: "Return & Exchange Policy", href: "/return-policy" },
        { label: "Shipping & Delivery", href: "/shipping" },
        { label: "FAQs", href: "/faq" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Complaints & Suggestions", href: "/complaints" },
      ],
    },
  };

  const t = content[lang];

  return (
    <footer
      dir={dir}
      className="border-t border-brand-light bg-brand-white mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        {/* MAIN COLUMNS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 mb-12">
          {/* BRAND SECTION */}
          <div className="flex flex-col gap-5">
            <Link href={buildUrl("")} className="flex items-center gap-3 w-fit">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl text-white flex items-center justify-center font-black text-xl"
                  style={{ backgroundColor: primaryColor || "#111827" }}
                >
                  {storeName?.[0]?.toUpperCase() || "S"}
                </div>
              )}
              <span className="text-xl font-bold text-brand-black tracking-tight">
                {storeName}
              </span>
            </Link>
            <p className="text-sm text-brand-black/60 leading-relaxed font-medium max-w-sm">
              {t.description}
            </p>
          </div>

          {/* IMPORTANT LINKS */}
          <div className="flex flex-col gap-5 md:items-center">
            <div className="flex flex-col gap-4">
              <p className="font-bold text-brand-black text-lg">
                {t.importantLinks}
              </p>
              <div className="flex flex-col gap-3">
                {t.links.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={buildUrl(href)}
                    className="text-sm text-brand-black/80 hover:text-brand-black/50 transition-colors font-medium w-fit"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* CONTACT SECTION */}
          <div className="flex flex-col gap-5 md:items-end">
            <div className="flex flex-col gap-4">
              <p className="font-bold text-brand-black text-base">
                {t.contactUs}
              </p>

              <div className="flex flex-col gap-3">
                {displayPhone && (
                  <a
                    href={`tel:${displayPhone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-3 text-sm text-brand-black/60 hover:text-brand-black font-medium transition-colors"
                  >
                    <FiPhone size={16} /> <span dir="ltr">{displayPhone}</span>
                  </a>
                )}
                <a
                  href={`mailto:${displayEmail}`}
                  className="flex items-center gap-3 text-sm text-brand-black/60 hover:text-brand-black font-medium transition-colors"
                >
                  <FiMail size={16} />
                  <span>{displayEmail}</span>
                </a>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 rounded-xl bg-brand-grey border border-transparent flex items-center justify-center text-brand-black/60 hover:text-brand-black hover:border-brand-light hover:bg-white transition-all duration-200"
                  >
                    <FaInstagram className="text-[15px]" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT & COMMERCIAL ID ROW */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-t border-brand-light">
          {storeId && (
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-black">
              <span>{t.commercialId}</span>
              <span className="text-brand-black/60 bg-brand-grey px-2 py-1 rounded-md text-xs">
                {storeId}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-brand-grey px-3 py-1.5 rounded-lg border border-brand-light/50">
              <FaMoneyBillWave className="text-emerald-600" size={16} />
              <span className="text-xs font-bold text-brand-black">
                {t.cashOnDelivery}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#E1251B]/10 px-3 py-1.5 rounded-lg border border-[#E1251B]/20">
              <IoWalletOutline className="text-[#E1251B]" size={16} />
              <span className="text-xs font-bold text-[#E1251B]">
                {t.whishMoney}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-brand-light text-sm font-medium text-brand-black/50">
          <p>
            {storeName} © {new Date().getFullYear()} {t.rights}.
          </p>

          <button
            onClick={toggleLang}
            className="flex items-center gap-2 hover:text-brand-black transition-colors bg-brand-grey px-3 py-1.5 rounded-xl"
          >
            <Globe size={16} />
            <span className="font-semibold">العربية | English</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
