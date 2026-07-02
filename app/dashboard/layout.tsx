import { ReactNode } from "react";
import { Metadata } from "next";
import { DashboardProvider } from "./DashboardContext";
import { getCurrentStoreMeta } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = {
  children: ReactNode;
};

export async function generateMetadata(): Promise<Metadata> {
  const store = await getCurrentStoreMeta();

  if (!store) {
    return {
      title: "لوحة التحكم",
    };
  }

  const storeName = store.store_name;
  const storeTypeLabel: Record<string, string> = {
    books: "كتب",
    clothes: "ملابس",
    electronics: "إلكترونيات",
    food: "أطعمة",
    general: "عام",
  };

  return {
    title: {
      default: `لوحة التحكم | ${storeName}`,
      template: `%s | ${storeName}`,
    },
    description: `إدارة متجر ${storeName} - ${storeTypeLabel[store.store_type] || store.store_type} في ${store.location}`,
    openGraph: {
      title: `${storeName} - لوحة التحكم`,
      description: `لوحة تحكم متجر ${storeName}`,
      type: "website",
      locale: store.language === "ar" ? "ar_SA" : "en_US",
      siteName: storeName,
    },
    robots: {
      index: false,
      follow: false,
    },
    other: {
      "store-slug": store.slug,
      "store-type": store.store_type,
    },
  };
}

export default function DashboardLayout({ children }: Props) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
