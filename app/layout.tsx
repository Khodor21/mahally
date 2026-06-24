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
  icons: {
    icon: "/icon.png",
    shortcut: "/shortcut-icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "محلّي | أنشئ متجرك الإلكتروني خلال دقائق",
    description:
      "أنشئ متجرك الإلكتروني بسهولة واحصل على رابط جاهز للبدء بالبيع خلال دقائق.",
    type: "website",
    locale: "ar_AR",
    siteName: "mahally",
    images: [
      {
        url: "/opengraph-image.png",
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
      <body className="bg-ink text-paper font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
