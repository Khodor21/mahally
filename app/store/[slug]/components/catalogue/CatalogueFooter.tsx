"use client";

import { Instagram, Facebook, Video, Twitter } from "lucide-react";

interface CatalogueFooterProps {
  storeName: string;
  storeDescription?: string;
  storeHours?: string;
  storeLocation?: string;
  storeEmail?: string;
  storePhone?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  twitter?: string;
  lang: "en" | "ar";
  t: Record<string, string>;
  isRtl: boolean;
}

export default function CatalogueFooter({
  storeName,
  storeDescription,
  storeHours,
  storeLocation,
  storeEmail,
  storePhone,
  instagram,
  facebook,
  tiktok,
  twitter,
  lang,
  t,
  isRtl,
}: CatalogueFooterProps) {
  // Configured with standard Lucide React icons
  const socialLinks = [
    {
      url: instagram,
      name: "Instagram",
      icon: Instagram,
    },
    {
      url: facebook,
      name: "Facebook",
      icon: Facebook,
    },
    {
      url: tiktok,
      name: "TikTok",
      icon: Video,
    },
    {
      url: twitter,
      name: "Twitter",
      icon: Twitter,
    },
  ];

  const hasSocials = socialLinks.some((social) => social.url);

  return (
    <footer
      dir={isRtl ? "rtl" : "ltr"}
      className="bg-brand-primary text-white pt-16 pb-32 md:pb-16 px-4 sm:px-6 md:px-10 border-t-4 border-[rgb(var(--color-brand-primary))]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Store Info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {storeName}
            </h3>
            {storeDescription && (
              <p className="text-sm text-white/90 leading-relaxed max-w-sm">
                {storeDescription}
              </p>
            )}
          </div>

          {/* Store Hours */}
          {storeHours && (
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-white/80 tracking-wide uppercase text-sm">
                {t.storeHours}
              </h3>
              <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                {storeHours}
              </p>
            </div>
          )}

          {/* Location */}
          {storeLocation && (
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-white/80 tracking-wide uppercase text-sm">
                {t.location}
              </h3>
              <p className="text-sm text-white/90 leading-relaxed">
                {storeLocation}
              </p>
            </div>
          )}

          {/* Contact */}
          {(storeEmail || storePhone) && (
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-white/80 tracking-wide uppercase text-sm">
                {t.contact}
              </h3>
              <div className="space-y-3 text-sm text-white/90">
                {storeEmail && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-white/90 uppercase font-medium">
                      {t.email}
                    </span>
                    <a
                      href={`mailto:${storeEmail}`}
                      className="text-white hover:text-white/70 transition-colors inline-block"
                    >
                      {storeEmail}
                    </a>
                  </div>
                )}
                {storePhone && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-white/90 uppercase font-medium">
                      {t.phone}
                    </span>
                    <a
                      href={`tel:${storePhone}`}
                      className="text-white hover:text-white/70 transition-colors inline-block w-fit"
                    >
                      <span
                        dir="ltr"
                        style={{ direction: "ltr", display: "inline-block" }}
                        className="leading-relaxed whitespace-nowrap text-left"
                      >
                        &lrm;{storePhone}
                      </span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Social Media Links & Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-white/70 order-2 md:order-1 font-medium">
            &copy; {new Date().getFullYear()} {storeName}.{" "}
            {lang === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}.
          </p>

          {hasSocials && (
            <div className="flex items-center gap-5 order-1 md:order-2">
              {socialLinks.map((social) => {
                if (!social.url) return null;
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="
    group flex items-center justify-center
    w-8 h-8
    rounded-full
    border border-white/20
    bg-white/10
    text-white
    backdrop-blur-sm
    transition-all duration-300
    hover:bg-white
    hover:text-brand-primary
    hover:-translate-y-1
  "
                  >
                    <IconComponent className="w-[14px] h-[14px] stroke-[2] transition-transform duration-300 group-hover:scale-110" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
