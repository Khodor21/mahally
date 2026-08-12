"use client";

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
  // Abstracted SVG paths to clean up JSX
  const socialLinks = [
    {
      url: instagram,
      name: "Instagram",
      colorClass: "hover:text-pink-500",
      path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z",
    },
    {
      url: facebook,
      name: "Facebook",
      colorClass: "hover:text-blue-500",
      path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    },
    {
      url: tiktok,
      name: "TikTok",
      colorClass: "hover:text-white",
      path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.96-.1z",
    },
    {
      url: twitter,
      name: "Twitter",
      colorClass: "hover:text-blue-400",
      path: "M23.953 4.57a10 10 0 002.856-3.57A10 10 0 0121.12 7.88a6.46 6.46 0 001.27-1.86A6.48 6.48 0 0119.63 4a6.37 6.37 0 00-6.37 6.37v1.61A9.06 9.06 0 012.2 9c-.8 0-1.56.1-2.3.3a6.37 6.37 0 009.08-6.3c0-.5-.06-1-.17-1.48A6.37 6.37 0 0021.12 2a6.38 6.38 0 001.87.51 6.37 6.37 0 001.95-.48v1.54z",
    },
  ];

  const hasSocials = socialLinks.some((social) => social.url);

  return (
    <footer
      dir={isRtl ? "rtl" : "ltr"}
      className="bg-brand-primary text-white py-16 px-4 sm:px-6 md:px-10 border-t-4 border-[rgb(var(--color-brand-primary))]"
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
                      className="text-white hover:text-[rgb(var(--color-brand-primary))] transition-colors inline-block"
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
                      className="text-white hover:text-[rgb(var(--color-brand-primary))] transition-colors inline-block"
                      dir="ltr"
                    >
                      {storePhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Social Media Links & Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-white/90 order-2 md:order-1">
            &copy; {new Date().getFullYear()} {storeName}.{" "}
            {lang === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}.
          </p>

          {hasSocials && (
            <div className="flex items-center gap-5 order-1 md:order-2">
              <span className="text-sm font-medium text-white/90 mr-2 hidden md:block">
                {t.followUs}
              </span>
              {socialLinks.map((social) => {
                if (!social.url) return null;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-white/90 ${social.colorClass} transition-colors transform hover:scale-110`}
                    aria-label={social.name}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={social.path} />
                    </svg>
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
