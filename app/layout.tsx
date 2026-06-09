import type { Metadata } from "next";
import { Providers } from "./providers";
// TypeScript may complain about side-effect CSS imports if no declaration is present.
// Ignore the next line to allow importing global CSS.
// @ts-ignore
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
    <html lang="en">
      <body className="bg-ink text-paper font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
