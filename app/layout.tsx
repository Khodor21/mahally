import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "محلّي | أنشئ متجرك الإلكتروني خلال دقائق",
  description:
    "أنشئ متجرك الإلكتروني بسهولة من خلال نموذج واحد فقط. أضف منتجاتك واحصل على رابط متجرك فورًا وابدأ البيع عبر الإنترنت.",
  keywords: [
    "إنشاء متجر إلكتروني",
    "متجر إلكتروني",
    "منصة متاجر",
    "متجر اونلاين",
    "SaaS",
    "Ecommerce",
    "Store Builder",
    "بيع عبر الإنترنت",
    "متاجر عربية",
  ],
  metadataBase: new URL("https://mahally.app"),

  // 1. Added icons for browsers and devices
  icons: {
    icon: "/icon.png", // Replace with your actual standard logo path
    shortcut: "/shortcut-icon.png",
    apple: "/apple-icon.png", // Specifically for iOS home screens
  },

  openGraph: {
    title: "محلّي | أنشئ متجرك الإلكتروني خلال دقائق",
    description:
      "أنشئ متجرك الإلكتروني بسهولة واحصل على رابط جاهز للبدء بالبيع خلال دقائق.",
    type: "website",
    locale: "ar_AR",
    siteName: "mahally",
    // 2. Added images for general social sharing (WhatsApp, Facebook, etc.)
    images: [
      {
        url: "/opengraph-image.png", // Recommended size: 1200x630px
        width: 1200,
        height: 630,
        alt: "محلّي - أنشئ متجرك الإلكتروني",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "محلّي | أنشئ متجرك الإلكتروني خلال دقائق",
    description:
      "أنشئ متجرك الإلكتروني بسهولة واحصل على رابط جاهز للبدء بالبيع خلال دقائق.",
    // 3. Added images for Twitter/X sharing
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" className="scroll-smooth">
      <head>
        {/* FONT PRELOAD - ADD THIS */}
        <link
          rel="preload"
          href="https://mahally.app/fonts/Montserrat-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://mahally.app/fonts/Montserrat-Medium.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://mahally.app/fonts/Montserrat-Bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://mahally.app/fonts/Lalezar-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://mahally.app/fonts/IBMPlexSansArabic-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://mahally.app/fonts/IBMPlexSansArabic-Medium.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://mahally.app/fonts/IBMPlexSansArabic-Bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-ink text-paper font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
