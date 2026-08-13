"use client";

import React from "react";
import { Instagram, Facebook, Twitter, Music2, Ghost } from "lucide-react";

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
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
  snapchatUrl?: string;
};

// 🔧 HELPER: Formats handles into proper URLs to prevent broken 404 links
const formatSocialUrl = (platform: string, input?: string) => {
  if (!input) return undefined;
  const trimmed = input.trim();

  // If it already looks like a valid link, return it
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Otherwise, construct the URL based on the platform
  const handle = trimmed.replace(/^@/, ""); // Remove @ if they typed it
  switch (platform) {
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "facebook":
      return `https://facebook.com/${handle}`;
    case "tiktok":
      return `https://tiktok.com/@${handle}`;
    case "twitter":
      return `https://twitter.com/${handle}`;
    case "snapchat":
      return `https://snapchat.com/add/${handle}`;
    default:
      return trimmed;
  }
};

export default function SocialMediaIcons({
  instagram,
  instagram_url,
  instagramUrl,
  facebook,
  facebook_url,
  facebookUrl,
  tiktok,
  tiktok_url,
  tiktokUrl,
  whatsapp,
  whatsapp_number,
  twitter,
  twitter_url,
  twitterUrl,
  snapchat,
  snapchat_url,
  snapchatUrl,
  lang = "en",
}: SocialMediaIconsProps) {
  const isRtl = lang === "ar";
  const titleText = isRtl ? "تواصل معنا" : "Connect with us";

  // Safely fallback to whichever prop name was provided (checking all 3 common patterns)
  const rawInstagram = instagram || instagram_url || instagramUrl;
  const rawFacebook = facebook || facebook_url || facebookUrl;
  const rawTiktok = tiktok || tiktok_url || tiktokUrl;
  const rawWhatsapp = whatsapp || whatsapp_number;
  const rawTwitter = twitter || twitter_url || twitterUrl;
  const rawSnapchat = snapchat || snapchat_url || snapchatUrl;

  // 🔍 DEBUG: Log the props to verify the parent is successfully passing data
  console.log("🔍 [SocialMediaIcons] Debugging Props:", {
    rawTwitterReceived: { twitter, twitter_url, twitterUrl },
    finalRawTwitter: rawTwitter,
  });

  // Filter configured social media links with clean tailwind classes
  const socialLinks = [
    {
      name: "Instagram",
      url: formatSocialUrl("instagram", rawInstagram),
      icon: Instagram,
      activeBg: "group-hover:bg-pink-50",
      activeText: "group-hover:text-pink-600",
      activeBorder: "group-hover:border-pink-200",
    },
    {
      name: "Facebook",
      url: formatSocialUrl("facebook", rawFacebook),
      icon: Facebook,
      activeBg: "group-hover:bg-blue-50",
      activeText: "group-hover:text-blue-600",
      activeBorder: "group-hover:border-blue-200",
    },
    {
      name: "TikTok",
      url: formatSocialUrl("tiktok", rawTiktok),
      icon: Music2,
      activeBg: "group-hover:bg-gray-100",
      activeText: "group-hover:text-black",
      activeBorder: "group-hover:border-gray-300",
    },
    {
      name: "WhatsApp",
      // WhatsApp needs special regex to strip non-numeric characters (e.g. +, spaces, dashes)
      url: rawWhatsapp
        ? `https://wa.me/${rawWhatsapp.replace(/[^\d+]/g, "")}`
        : undefined,
      icon: WhatsAppIcon,
      activeBg: "group-hover:bg-emerald-50",
      activeText: "group-hover:text-emerald-600",
      activeBorder: "group-hover:border-emerald-200",
    },
    {
      name: "Twitter",
      url: formatSocialUrl("twitter", rawTwitter),
      icon: Twitter,
      activeBg: "group-hover:bg-sky-50",
      activeText: "group-hover:text-sky-500",
      activeBorder: "group-hover:border-sky-200",
    },
    {
      name: "Snapchat",
      url: formatSocialUrl("snapchat", rawSnapchat),
      icon: Ghost,
      activeBg: "group-hover:bg-yellow-50",
      activeText: "group-hover:text-yellow-500",
      activeBorder: "group-hover:border-yellow-200",
    },
  ].filter((link) => link.url && link.url.trim() !== "");

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="flex flex-col items-center justify-center gap-5 py-6"
    >
      {/* Refined Section Title */}
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400/80">
        {titleText}
      </h3>

      {/* Icons Grid */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {socialLinks.map((social) => {
          const IconComponent = social.icon;
          return (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit us on ${social.name}`}
              className={`group flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-400 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-200 ${social.activeBg} ${social.activeBorder}`}
            >
              <IconComponent
                className={`h-4 w-4 sm:h-4 sm:w-4 transition-colors duration-300 ${social.activeText}`}
                {...(social.name !== "WhatsApp" ? { strokeWidth: 2 } : {})}
              />
            </a>
          );
        })}
      </div>
    </div>
  );
}
