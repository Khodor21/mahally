export default function supabaseLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // إذا كانت الصورة قادمة من Supabase أو رابط خارجي
  if (src.includes("supabase.co") || src.startsWith("http")) {
    const q = quality || 75;
    return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${width}&q=${q}&output=webp`;
  }

  // للصور المحلية داخل مجلد public
  return src;
}
