"use client";

import React from "react";
import {
  Instagram,
  Facebook,
  Twitter,
  Music2,
  Ghost,
} from "lucide-react";

// Custom WhatsApp Icon to perfectly match the brand logo
const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// ✅ Accept BOTH naming conventions to prevent future mismatches
type SocialMediaIconsProps = {
  instagram?: string;
  instagram_url?: string;
  facebook?: string;
  facebook_url?: string;
  tiktok?: string;
  tiktok_url?: string;
  whatsapp?: string;
  whatsapp_number?: string;
  twitter?: string;
  twitter_url?: string;
  snapchat?: string;
  snapchat_url?: string;
  lang?: "ar" | "en";
};

export default function SocialMediaIcons({
  instagram,
  instagram_url,
  facebook,
  facebook_url,
  tiktok,
  tiktok_url,
  whatsapp,
  whatsapp_number,
  twitter,
  twitter_url,
  snapchat,
  snapchat_url,
  lang = "en",
}: SocialMediaIconsProps) {
  const isRtl = lang === "ar";

  // Premium UX Copy for the title
  const titleText = isRtl ? "تواصل معنا" : "Connect with us";

  // Safely fallback to whichever prop name was provided
  const activeInstagram = instagram || instagram_url;
  const activeFacebook = facebook || facebook_url;
  const activeTiktok = tiktok || tiktok_url;
  const activeWhatsapp = whatsapp || whatsapp_number;
  const activeTwitter = twitter || twitter_url;
  const activeSnapchat = snapchat || snapchat_url;

  // Filter configured social media links
  const socialLinks = [
    {
      name: "Instagram",
      url: activeInstagram,
      icon: Instagram,
      hoverClass: "group-hover:text-pink-600 group-hover:bg-pink-50",
    },
    {
      name: "Facebook",
      url: activeFacebook,
      icon: Facebook,
      hoverClass: "group-hover:text-blue-600 group-hover:bg-blue-50",
    },
    {
      name: "TikTok",
      url: activeTiktok,
      icon: Music2,
      hoverClass: "group-hover:text-black group-hover:bg-gray-200",
    },
    {
      name: "WhatsApp",
      url: activeWhatsapp
        ? `https://wa.me/${activeWhatsapp.replace(/[^\d+]/g, "")}`
        : undefined,
      icon: WhatsAppIcon,
      hoverClass: "group-hover:text-emerald-500 group-hover:bg-emerald-50",
    },
    {
      name: "Twitter",
      url: activeTwitter,
      icon: Twitter,
      hoverClass: "group-hover:text-sky-500 group-hover:bg-sky-50",
    },
    {
      name: "Snapchat",
      url: activeSnapchat,
      icon: Ghost,
      hoverClass: "group-hover:text-yellow-500 group-hover:bg-yellow-50",
    },
  ].filter((link) => link.url && link.url.trim() !== "");

  if (socialLinks.length === 0) {
    return null; 
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="flex flex-col items-center justify-center gap-3 py-4"
    >
      {/* Refined Section Title */}
      <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">
        {titleText}
      </h3>
      
      {/* Icons Grid */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {socialLinks.map((social) => {
          const IconComponent = social.icon;
          return (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit us on ${social.name}`}
              className="group relative flex w-10 h-10 sm:w-11 sm:h-11 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-500 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            >
              {/* Background Hover Layer */}
              <div 
                className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 ${
                  social.hoverClass.split(' ')[1].replace('group-hover:', '')
                } group-hover:opacity-100`} 
              />
              
              {/* Icon */}
              <IconComponent 
                className={`w-4 h-4 sm:w-5 sm:h-5 relative z-10 transition-colors duration-300 ${
                  social.hoverClass.split(' ')[0]
                }`} 
                {...(social.name !== 'WhatsApp' ? { strokeWidth: 2.2 } : {})}
              />
            </a>
          );
        })}
      </div>
    </div>
  );
}