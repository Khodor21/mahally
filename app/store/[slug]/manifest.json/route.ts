import { getCachedStoreData } from "@/lib/store-queries";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const data = await getCachedStoreData(params.slug);
  const store = Array.isArray(data?.store) ? data.store[0] : data?.store || {};
  const settings = Array.isArray(data?.settings)
    ? data.settings[0]
    : data?.settings || {};

  const manifest = {
    name: store.store_name || "Store",
    short_name: store.store_name || "Store",
    display: "standalone",
    start_url: `/store/${params.slug}`,
    scope: `/store/${params.slug}`,
    background_color: "#ffffff",
    theme_color: settings.primary_color || "#000000",
    icons: [
      {
        src: settings.logo_url || "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: settings.logo_url || "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
