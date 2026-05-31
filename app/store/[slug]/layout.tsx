import { cookies } from "next/headers";
import { ShopProvider } from "../context";
import Navbar from "./components/landing/Navbar";
import BottomNavbar from "./components/landing/BottomNavbar";

export default function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const cookieStore = cookies();

  const langCookie = cookieStore.get("lang")?.value;
  const lang = langCookie === "ar" ? "ar" : "en";

  return (
    <ShopProvider>
      <Navbar lang={lang} storeSlug={params.slug} />

      <div dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
        {children}
      </div>

      <BottomNavbar lang={lang} storeSlug={params.slug} />
    </ShopProvider>
  );
}
