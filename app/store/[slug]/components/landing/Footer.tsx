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
  Banknote,
  Wallet,
  CreditCard,
} from "lucide-react";

// Custom WhatsApp Icon to match Lucide's style
const WhatsAppIcon = ({
  size = 15,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

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
  payment_methods?: string[];
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
  payment_methods = [],
}: FooterProps) {
  const dir = lang === "ar" ? "rtl" : "ltr";

  const buildUrl = (path: string) => {
    if (!storeSlug) return `${path}?lang=${lang}`;
    return `/${storeSlug}${path}?lang=${lang}`;
  };

  // Fallbacks for contact info
  const displayEmail = email || `info@${storeSlug || "store"}.com`;
  const displayPhone = phone || "";

  const content = {
    ar: {
      description:
        description ||
        "وجهتك الأولى للمنتجات عالية الجودة والقيمة الاستثنائية. نحن ملتزمون بتقديم تجربة تسوق سلسة مع اختيارات منتقاة بعناية، مما يضمن رضا العملاء والتميز في كل طلب.",
      importantLinks: "روابط مهمة",
      contactUs: "تواصل معنا",
      commercialId: "الرقم التجاري:",
      rights: "جميع الحقوق محفوظة",
      cashOnDelivery: "الدفع عند الاستلام",
      whishMoney: "Whish Money",
      bobFinance: "بوب فاينانس",
      links: [
        { label: "سياسة الخصوصية", href: "/privacy" },
        { label: "سياسة الإسترجاع و الاستبدال", href: "/return-policy" },
        { label: "الشحن والتوصيل", href: "/shipping" },
        { label: "الأسئلة الشائعة", href: "/faq" },
      ],
    },
    en: {
      description:
        description ||
        "Your premier destination for high-quality products and exceptional value. We are dedicated to providing a seamless shopping experience with carefully curated selections, ensuring customer satisfaction and excellence in every order.",
      importantLinks: "Important Links",
      contactUs: "Contact Us",
      commercialId: "Commercial ID:",
      rights: "All rights reserved",
      cashOnDelivery: "Cash on Delivery",
      whishMoney: "Whish Money",
      bobFinance: "BoB Finance",
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

  return (
    <footer
      dir={dir}
      className="bg-brand-primary text-white mt-auto border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* MAIN COLUMNS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-12 mb-14">
          {/* BRAND SECTION */}
          <div className="flex flex-col gap-6">
            <Link
              href={buildUrl("")}
              className="flex items-center gap-3 w-fit group"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="h-10 sm:h-12 w-auto max-w-[140px] md:max-w-[180px] object-contain transition-opacity group-hover:opacity-80 drop-shadow-sm"
                />
              ) : (
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-sm bg-white/10 border border-white/20 text-white transition-colors group-hover:bg-white/20">
                  {storeName?.[0]?.toUpperCase() || "S"}
                </div>
              )}
            </Link>
            <p className="text-sm text-white/90 leading-relaxed font-medium max-w-sm">
              {t.description}
            </p>
          </div>

          {/* IMPORTANT LINKS */}
          <div className="flex flex-col gap-5 md:items-center">
            <div className="flex flex-col gap-5 w-full md:w-auto">
              <p className="font-bold text-white text-lg tracking-tight">
                {t.importantLinks}
              </p>
              <div className="flex flex-col gap-3.5">
                {t.links.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={buildUrl(href)}
                    className="text-sm text-white/90 hover:text-white transition-colors font-medium w-fit"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* CONTACT SECTION */}
          <div className="flex flex-col gap-5 md:items-end">
            <div className="flex flex-col gap-5 w-full md:w-auto">
              <p className="font-bold text-white text-lg tracking-tight">
                {t.contactUs}
              </p>

              <div className="flex flex-col gap-3.5">
                {displayPhone && (
                  <a
                    href={`tel:${displayPhone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-3 text-sm text-white/90 hover:text-white font-medium transition-colors w-fit"
                  >
                    <Phone size={16} className="opacity-80" />
                    <span dir="ltr">{displayPhone}</span>
                  </a>
                )}
                <a
                  href={`mailto:${displayEmail}`}
                  className="flex items-center gap-3 text-sm text-white/90 hover:text-white font-medium transition-colors w-fit"
                >
                  <Mail size={16} className="opacity-80" />
                  <span>{displayEmail}</span>
                </a>
              </div>

              {/* Social Media Icons */}
              <div className="flex items-center gap-2.5 pt-3 flex-wrap">
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    title="WhatsApp"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
                  >
                    <WhatsAppIcon size={18} />
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    title="Instagram"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
                  >
                    <Instagram size={17} />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    title="Facebook"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
                  >
                    <Facebook size={17} />
                  </a>
                )}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    title="TikTok"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
                  >
                    <Music size={17} />
                  </a>
                )}
                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter/X"
                    title="Twitter/X"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
                  >
                    <Twitter size={17} />
                  </a>
                )}
                {snapchatUrl && (
                  <a
                    href={snapchatUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Snapchat"
                    title="Snapchat"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
                  >
                    <Ghost size={17} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT & COMMERCIAL ID ROW */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-6 border-t border-white/10">
          {storeId ? (
            <div className="flex items-center gap-2.5 text-sm font-semibold text-white/90">
              <span>{t.commercialId}</span>
              <span className="text-white/80 bg-white/10 px-2.5 py-1 rounded-md text-xs tracking-wide">
                {storeId}
              </span>
            </div>
          ) : (
            <div className="hidden lg:block"></div>
          )}

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
            {payment_methods.includes("cash_on_delivery") && (
              <div className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                <Banknote className="text-emerald-400" size={18} />
                <span className="text-xs font-bold text-white/90">
                  {t.cashOnDelivery}
                </span>
              </div>
            )}

            {payment_methods.includes("whish_money") && (
              <div className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                <Wallet className="text-red-400" size={18} />
                <span className="text-xs font-bold text-white/90">
                  {t.whishMoney}
                </span>
              </div>
            )}

            {payment_methods.includes("bob_finance") && (
              <div className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                <CreditCard className="text-blue-400" size={18} />
                <span className="text-xs font-bold text-white/90">
                  {t.bobFinance}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER COPYRIGHT */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-center sm:justify-between gap-4 pt-6 border-t border-white/10 text-sm font-medium text-white/50 text-center sm:text-left">
          <p>
            {storeName} © {new Date().getFullYear()} {t.rights}.
          </p>
        </div>
      </div>
    </footer>
  );
}
