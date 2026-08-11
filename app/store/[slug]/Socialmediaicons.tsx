"use client";

import React from "react";
import {
  Instagram,
  Facebook,
  MessageCircle,
  Twitter,
  Music2,
  Ghost,
} from "lucide-react";

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
      icon: MessageCircle,
      hoverClass: "group-hover:text-green-600 group-hover:bg-green-50",
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
      className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2"
    >
      {socialLinks.map((social) => {
        const IconComponent = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit us on ${social.name}`}
            className="group relative flex w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded border border-gray-100 text-gray-500  transition-all duration-300  hover:-translate-y-1 active:translate-y-0  focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          >
            {/* Background Hover Layer */}
            <div
              className={`absolute inset-0 rounded opacity-0 transition-opacity duration-300 ${social.hoverClass.split(" ")[1].replace("group-hover:", "")} group-hover:opacity-100`}
            />

            {/* Icon */}
            <IconComponent
              className={`w-4 h-4 sm:w-5 sm:h-5 relative z-10 transition-colors duration-300 ${social.hoverClass.split(" ")[0]}`}
              strokeWidth={2}
            />
          </a>
        );
      })}
    </div>
  );
}
