"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Ghost,
  Music,
  MessageCircle,
  Banknote,
  Wallet,
} from "lucide-react";

interface FooterProps {
  lang?: "en" | "ar";
  storeName?: string;
  storeSlug?: string;
  storeId?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  whatsappNumber?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  twitterUrl?: string | null;
  snapchatUrl?: string | null;
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
  description,
  whatsappNumber,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  twitterUrl,
  snapchatUrl,
}: FooterProps) {
  // 🔍 DEBUG: Log the received language
  console.log("Footer received lang prop:", lang);

  const dir = lang === "ar" ? "rtl" : "ltr";
  const isArabic = lang === "ar";

  console.log("Footer calculated dir:", dir);
  console.log("Footer isArabic:", isArabic);

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
        description ||
        "علامة تجارية، تأسست في عام 2021. رسالتنا هي التصميم البسيط والجودة العالية، ونسعى دائماً لتطوير مهاراتنا في التصميم وتحسين جودة المنتجات. أولويتنا رضا العملاء وتقديم تجربة فريدة ومميزة لهم.",
      importantLinks: "روابط مهمة",
      contactUs: "تواصل معنا",
      commercialId: "الرقم التجاري:",
      rights: "جميع الحقوق محفوظة",
      cashOnDelivery: "الدفع عند الاستلام",
      whishMoney: "Whish Money",
      links: [
        { label: "سياسة الخصوصية", href: "/privacy" },
        { label: "الشروط و الأحكام", href: "/terms" },
        { label: "سياسة الإسترجاع و الاستبدال", href: "/return-policy" },
        { label: "الشحن والتوصيل", href: "/shipping" },
        { label: "الأسئلة الشائعة", href: "/faq" },
      ],
    },
    en: {
      description:
        description ||
        "A brand established in 2021. Our mission is simple design and high quality. We constantly strive to develop our skills and improve product quality. Customer satisfaction is our priority.",
      importantLinks: "Important Links",
      contactUs: "Contact Us",
      commercialId: "Commercial ID:",
      rights: "All rights reserved",
      cashOnDelivery: "Cash on Delivery",
      whishMoney: "Whish Money",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Returns & Exchange Policy", href: "/return-policy" },
        { label: "Shipping & Delivery", href: "/shipping" },
        { label: "FAQs", href: "/faq" },
      ],
    },
  };

  const t = content[lang];

  // 🔍 DEBUG: Log the selected content object
  console.log("Footer using content:", lang, t);

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
            <Link
              href={buildUrl("")}
              className="flex items-center gap-3 w-fit group"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="h-10 sm:h-12 w-auto max-w-[140px] md:max-w-[180px] object-contain transition-opacity group-hover:opacity-90"
                />
              ) : (
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl text-white flex items-center justify-center font-black text-xl shadow-sm"
                  style={{ backgroundColor: primaryColor || "#111827" }}
                >
                  {storeName?.[0]?.toUpperCase() || "S"}
                </div>
              )}
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
                    <Phone size={16} /> <span dir="ltr">{displayPhone}</span>
                  </a>
                )}
                <a
                  href={`mailto:${displayEmail}`}
                  className="flex items-center gap-3 text-sm text-brand-black/60 hover:text-brand-black font-medium transition-colors"
                >
                  <Mail size={16} />
                  <span>{displayEmail}</span>
                </a>
              </div>

              {/* Social Media Icons */}
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    title="WhatsApp"
                    className="w-9 h-9 rounded-xl bg-brand-grey border border-transparent flex items-center justify-center text-brand-black/60 hover:text-brand-black hover:border-brand-light hover:bg-white transition-all duration-200"
                  >
                    <MessageCircle size={15} />
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    title="Instagram"
                    className="w-9 h-9 rounded-xl bg-brand-grey border border-transparent flex items-center justify-center text-brand-black/60 hover:text-brand-black hover:border-brand-light hover:bg-white transition-all duration-200"
                  >
                    <Instagram size={15} />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    title="Facebook"
                    className="w-9 h-9 rounded-xl bg-brand-grey border border-transparent flex items-center justify-center text-brand-black/60 hover:text-brand-black hover:border-brand-light hover:bg-white transition-all duration-200"
                  >
                    <Facebook size={15} />
                  </a>
                )}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    title="TikTok"
                    className="w-9 h-9 rounded-xl bg-brand-grey border border-transparent flex items-center justify-center text-brand-black/60 hover:text-brand-black hover:border-brand-light hover:bg-white transition-all duration-200"
                  >
                    <Music size={15} />
                  </a>
                )}
                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter/X"
                    title="Twitter/X"
                    className="w-9 h-9 rounded-xl bg-brand-grey border border-transparent flex items-center justify-center text-brand-black/60 hover:text-brand-black hover:border-brand-light hover:bg-white transition-all duration-200"
                  >
                    <Twitter size={15} />
                  </a>
                )}
                {snapchatUrl && (
                  <a
                    href={snapchatUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Snapchat"
                    title="Snapchat"
                    className="w-9 h-9 rounded-xl bg-brand-grey border border-transparent flex items-center justify-center text-brand-black/60 hover:text-brand-black hover:border-brand-light hover:bg-white transition-all duration-200"
                  >
                    <Ghost size={15} />
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
              <Banknote className="text-emerald-600" size={16} />
              <span className="text-xs font-bold text-brand-black">
                {t.cashOnDelivery}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#E1251B]/10 px-3 py-1.5 rounded-lg border border-[#E1251B]/20">
              <Wallet className="text-[#E1251B]" size={16} />
              <span className="text-xs font-bold text-[#E1251B]">
                {t.whishMoney}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER COPYRIGHT */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-brand-light text-sm font-medium text-brand-black/50">
          <p>
            {storeName} © {new Date().getFullYear()} {t.rights}.
          </p>
        </div>
      </div>
    </footer>
  );
}
