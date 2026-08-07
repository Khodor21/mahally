"use client";

import React from "react";
import {
  Instagram,
  Facebook,
  MessageCircle,
  Twitter,
  Music2,
} from "lucide-react";

type SocialMediaIconsProps = {
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  whatsapp_number?: string;
  twitter_url?: string;
  snapchat_url?: string;
  lang?: "ar" | "en";
};

export default function SocialMediaIcons({
  instagram_url,
  facebook_url,
  tiktok_url,
  whatsapp_number,
  twitter_url,
  snapchat_url,
  lang = "en",
}: SocialMediaIconsProps) {
  const isRtl = lang === "ar";

  // Filter configured social media links
  const socialLinks = [
    {
      name: "Instagram",
      url: instagram_url,
      icon: Instagram,
      color: "hover:text-pink-600",
    },
    {
      name: "Facebook",
      url: facebook_url,
      icon: Facebook,
      color: "hover:text-blue-600",
    },
    {
      name: "TikTok",
      url: tiktok_url,
      icon: Music2,
      color: "hover:text-black dark:hover:text-white",
    },
    {
      name: "WhatsApp",
      url: whatsapp_number
        ? `https://wa.me/${whatsapp_number.replace(/[^\d+]/g, "")}`
        : undefined,
      icon: MessageCircle,
      color: "hover:text-green-600",
    },
    {
      name: "Twitter",
      url: twitter_url,
      icon: Twitter,
      color: "hover:text-blue-400",
    },
  ].filter((link) => link.url);

  if (socialLinks.length === 0) {
    return null; // Don't render anything if no social links configured
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="flex items-center justify-center gap-4 md:gap-6 py-4"
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
            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-600 transition-colors duration-200 ${social.color}`}
          >
            <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
          </a>
        );
      })}
    </div>
  );
}
