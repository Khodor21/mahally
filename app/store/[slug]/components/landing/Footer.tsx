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
  primaryColor, // Intentionally left to preserve prop signature, even if unused directly here
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
      commercialId: "الرقم التجاري",
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
      commercialId: "Commercial ID",
      rights: "All rights reserved",
      cashOnDelivery: "Cash on Delivery",
      whishMoney: "Whish Money",
      bobFinance: "BoB Finance",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
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
      className="bg-brand-primary pb-32 text-white mt-auto border-t border-white/10"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 xl:gap-16">
          {/* BRAND & SOCIAL SECTION (Spans 5 cols on Desktop) */}
          <div className="flex flex-col gap-6 lg:col-span-5 text-start">
            <Link href="/" className="inline-block w-fit group">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="h-12 w-auto max-w-[180px] object-contain transition-opacity duration-300 group-hover:opacity-80 drop-shadow-sm bg-white px-3 py-1.5 rounded-md"
                />
              ) : (
                <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl shadow-sm bg-white/10 border border-white/20 text-white transition-colors duration-300 group-hover:bg-white/20">
                  {storeName?.[0]?.toUpperCase() || "S"}
                </div>
              )}
            </Link>

            <p className="text-sm text-white/80 leading-relaxed font-medium max-w-md">
              {t.description}
            </p>

            {/* Social Media Icons (Moved under brand for premium SaaS feel) */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white hover:-translate-y-0.5"
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
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white hover:-translate-y-0.5"
                >
                  <Instagram size={18} />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white hover:-translate-y-0.5"
                >
                  <Facebook size={18} />
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white hover:-translate-y-0.5"
                >
                  <Music size={18} />
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter/X"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white hover:-translate-y-0.5"
                >
                  <Twitter size={18} />
                </a>
              )}
              {snapchatUrl && (
                <a
                  href={snapchatUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Snapchat"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white hover:-translate-y-0.5"
                >
                  <Ghost size={18} />
                </a>
              )}
            </div>
          </div>

          {/* IMPORTANT LINKS SECTION (Spans 3 cols on Desktop) */}
          <div className="flex flex-col gap-6 lg:col-span-3 text-start">
            <h3 className="text-xs font-bold tracking-wider uppercase text-white/50">
              {t.importantLinks}
            </h3>
            <ul className="flex flex-col gap-4">
              {t.links.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm font-medium text-white/80 transition-colors duration-200 hover:text-white inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT SECTION (Spans 4 cols on Desktop) */}
          <div className="flex flex-col gap-6 lg:col-span-4 text-start">
            <h3 className="text-xs font-bold tracking-wider uppercase text-white/50">
              {t.contactUs}
            </h3>
            <ul className="flex flex-col gap-5">
              {displayPhone && (
                <li>
                  <a
                    href={`tel:${displayPhone.replace(/\s+/g, "")}`}
                    className="group flex items-start gap-4 text-sm font-medium text-white/80 transition-colors duration-200 hover:text-white w-fit"
                  >
                    <div className="mt-0.5 flex-shrink-0 text-white/50 transition-colors group-hover:text-white">
                      <Phone size={18} />
                    </div>
                    <span dir="ltr" className="leading-relaxed">
                      {displayPhone}
                    </span>
                  </a>
                </li>
              )}
              {displayEmail && (
                <li>
                  <a
                    href={`mailto:${displayEmail}`}
                    className="group flex items-start gap-4 text-sm font-medium text-white/80 transition-colors duration-200 hover:text-white w-fit"
                  >
                    <div className="mt-0.5 flex-shrink-0 text-white/50 transition-colors group-hover:text-white">
                      <Mail size={18} />
                    </div>
                    <span className="leading-relaxed break-all">
                      {displayEmail}
                    </span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <hr className="my-10 w-full border-white/10 lg:my-12" />

        {/* BOTTOM AREA: PAYMENT, COMMERCIAL ID & COPYRIGHT */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row text-center md:text-start">
          {/* Payment Methods */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start order-2 md:order-1">
            {payment_methods.includes("cash_on_delivery") && (
              <div className="flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-2 backdrop-blur-sm shadow-sm transition-colors hover:bg-white/10">
                <Banknote className="text-emerald-400" size={16} />
                <span className="text-xs font-bold text-white/90">
                  {t.cashOnDelivery}
                </span>
              </div>
            )}

            {payment_methods.includes("whish_money") && (
              <div className="flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-2 backdrop-blur-sm shadow-sm transition-colors hover:bg-white/10">
                <Wallet className="text-rose-400" size={16} />
                <span className="text-xs font-bold text-white/90">
                  {t.whishMoney}
                </span>
              </div>
            )}

            {payment_methods.includes("bob_finance") && (
              <div className="flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-2 backdrop-blur-sm shadow-sm transition-colors hover:bg-white/10">
                <CreditCard className="text-sky-400" size={16} />
                <span className="text-xs font-bold text-white/90">
                  {t.bobFinance}
                </span>
              </div>
            )}
          </div>

          {/* Copyright & Commercial ID */}
          <div className="flex flex-col items-center gap-4 md:items-end order-1 md:order-2">
            {storeId && (
              <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10">
                <span className="text-xs font-medium text-white/60">
                  {t.commercialId}:
                </span>
                <span className="text-xs font-bold tracking-widest text-white/90">
                  {storeId}
                </span>
              </div>
            )}
            <p className="text-sm text-white/50 font-medium">
              © {new Date().getFullYear()} {storeName}. {t.rights}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
