import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "StoreForge — Build Your Store in Minutes",
  description:
    "Create your online store with a single form. Get your link instantly.",
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
