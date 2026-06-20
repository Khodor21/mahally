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
  openGraph: {
    title: "محلّي | أنشئ متجرك الإلكتروني خلال دقائق",
    description:
      "أنشئ متجرك الإلكتروني بسهولة واحصل على رابط جاهز للبدء بالبيع خلال دقائق.",
    type: "website",
    locale: "ar_AR",
    siteName: "mahally",
  },
  twitter: {
    card: "summary_large_image",
    title: "محلّي | أنشئ متجرك الإلكتروني خلال دقائق",
    description:
      "أنشئ متجرك الإلكتروني بسهولة واحصل على رابط جاهز للبدء بالبيع خلال دقائق.",
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
