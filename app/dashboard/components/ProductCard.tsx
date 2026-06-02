import { Edit2, Trash2, Package } from "lucide-react";
import type { Translations } from "../i18n";

interface Product {
  id: string;
  store_id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  created_at: string;
}

interface Props {
  product: Product;
  tr: Translations;
  lang: "ar" | "en";
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

export default function ProductCard({
  product,
  tr,
  lang,
  onEdit,
  onDelete,
}: Props) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const t = tr;

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { label: t.outOfStock, cls: "bg-red-100 text-red-700" };
    if (stock <= 10)
      return { label: t.lowStock, cls: "bg-amber-100 text-amber-700" };
    return { label: t.inStock, cls: "bg-emerald-100 text-emerald-700" };
  };

  const stockStatus = getStockStatus(product.stock);
  const mainImage = product.images?.[0];

  const formattedPrice =
    lang === "ar"
      ? `${product.price.toLocaleString("ar-SA")} ر.س`
      : `SAR ${product.price.toLocaleString("en-US")}`;

  return (
    <div
      className="border border-[rgb(244_242_245)] rounded-2xl p-4 hover:border-[rgb(207_195_223)] hover:shadow-md transition-all group"
      dir={dir}
    >
      {/* Product image + name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-[rgb(244_242_245)] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = "none";
                el.parentElement!.innerHTML =
                  '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[rgb(60_28_84)]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>';
              }}
            />
          ) : (
            <Package className="w-6 h-6 text-[rgb(60_28_84)]/30" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-[rgb(60_28_84)] text-sm leading-tight line-clamp-2">
            {product.title}
          </p>
          {product.description && (
            <p className="text-xs text-[rgb(60_28_84)]/50 mt-0.5 line-clamp-1">
              {product.description}
            </p>
          )}
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${stockStatus.cls}`}
        >
          {stockStatus.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-[rgb(244_242_245)] rounded-xl">
          <p className="text-[10px] text-[rgb(60_28_84)]/40">{t.price}</p>
          <p className="text-xs font-bold text-[rgb(60_28_84)] leading-tight mt-0.5">
            {formattedPrice}
          </p>
        </div>

        <div className="text-center p-2 bg-[rgb(244_242_245)] rounded-xl">
          <p className="text-[10px] text-[rgb(60_28_84)]/40">{t.stock}</p>
          <p className="text-sm font-bold text-[rgb(60_28_84)]">
            {product.stock}
          </p>
        </div>

        <div className="text-center p-2 bg-[rgb(244_242_245)] rounded-xl">
          <p className="text-[10px] text-[rgb(60_28_84)]/40">{t.sales}</p>
          <p className="text-sm font-bold text-[rgb(60_28_84)]">—</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[rgb(244_242_245)] text-[rgb(60_28_84)] text-xs font-semibold hover:bg-[rgb(207_195_223)] transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          {t.edit}
        </button>

        <button
          onClick={() => onDelete(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t.delete}
        </button>
      </div>
    </div>
  );
}
