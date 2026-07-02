"use client";

import { Facebook, Twitter, Mail, Copy } from "lucide-react";
import { useState } from "react";

export interface ShareIconsProps {
  productTitle: string;
  productUrl: string;
  lang?: "ar" | "en";
}

// Custom SVG for WhatsApp since lucide-react doesn't include brand logos
const WhatsAppIcon = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

export default function ShareIcons({
  productTitle,
  productUrl,
  lang = "ar",
}: ShareIconsProps) {
  const [activeShare, setActiveShare] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const t = {
    ar: { title: "شارك هذا المنتج" },
    en: { title: "Share this product" },
  }[lang];

  const handleShare = async (platform: string) => {
    setActiveShare(platform);

    // Reset after 2 seconds
    setTimeout(() => setActiveShare(null), 2000);

    switch (platform) {
      case "facebook":
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          productUrl
        )}`;
        window.open(fbUrl, "_blank", "width=600,height=400");
        break;
      case "twitter":
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `Check out: ${productTitle}`
        )}&url=${encodeURIComponent(productUrl)}`;
        window.open(tweetUrl, "_blank", "width=600,height=400");
        break;
      case "whatsapp":
        const waUrl = `https://wa.me/?text=${encodeURIComponent(
          `Check out this product: ${productTitle} ${productUrl}`
        )}`;
        window.open(waUrl, "_blank");
        break;
      case "email":
        const mailUrl = `mailto:?subject=${encodeURIComponent(
          productTitle
        )}&body=${encodeURIComponent(`Check out this product:\n\n${productUrl}`)}`;
        window.location.href = mailUrl;
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(productUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
        break;
    }
  };

  const platforms = [
    { id: "facebook", icon: Facebook, label: "Facebook" },
    { id: "twitter", icon: Twitter, label: "X" },
    { id: "whatsapp", icon: WhatsAppIcon, label: "WhatsApp" },
    { id: "email", icon: Mail, label: "Email" },
    { id: "copy", icon: Copy, label: "Copy" },
  ];

  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <span className="text-sm font-semibold text-gray-800 shrink-0">
        {t.title}
      </span>
      <div className="flex items-center gap-2.5 flex-wrap">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isActive = activeShare === platform.id;
          const isCopied = copied && platform.id === "copy";

          return (
            <button
              key={platform.id}
              onClick={() => handleShare(platform.id)}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive || isCopied
                  ? "bg-brand-primary text-white shadow-md scale-110"
                  : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-brand-primary"
              }`}
              title={platform.label}
              aria-label={platform.label}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>
    </div>
  );
}