"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaStar } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useShop } from "@/app/store/context";

type Product = {
  id: string | number;
  title: string;
  image: string;
  price?: number;
  rating?: number;
  badge?: keyof typeof BADGE_STYLES;
};

type ProductCardProps = {
  product: Product;
};

const BADGE_STYLES = {
  New: "bg-[rgb(60_28_84)] text-white",
  "Best Seller": "bg-[rgb(207_195_223)] text-[rgb(60_28_84)]",
  Hot: "bg-rose-100 text-rose-700",
  Sale: "bg-emerald-100 text-emerald-700",
};

function formatPrice(value: number) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

  return formatted.replace(/\.00$/, "");
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const { addToCart, toggleFavorite, isFavorite, cartItems } = useShop();

  const favorited = isFavorite(product.id);

  const inCart = cartItems.some(
    (i: { product: Product }) => i.product.id === product.id,
  );

  const [added, setAdded] = useAddedFlash();

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product);
  };

  const badgeStyle =
    BADGE_STYLES[product.badge ?? "New"] ||
    "bg-[rgb(244_242_245)] text-[rgb(60_28_84)]";

  const formattedPrice = formatPrice(product.price ?? 0);

  if (!product) return null;

  return (
    <article
      aria-label={product.title}
      onClick={() => router.push(`/product`)}
      className="
        group
        flex
        flex-col
        bg-white
        rounded-2xl
        border
        border-[rgb(244_242_245)]
        overflow-hidden
        h-full
        cursor-pointer
        transition-all
        hover:shadow-md
        hover:border-[rgb(207_195_223)]
      "
    >
      {/* Image */}
      <div className="relative w-full h-52 overflow-hidden bg-[rgb(244_242_245)]/[0.35]">
        {product.badge && (
          <span
            className={`
              absolute top-3 left-3 z-10
              text-[10px]
              font-bold
              tracking-wide
              px-2.5 py-1
              rounded-full
              ${badgeStyle}
            `}
          >
            {product.badge}
          </span>
        )}

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite();
          }}
          aria-label={`${favorited ? "Remove from" : "Add to"} favorites`}
          className="
            absolute
            top-3
            right-3
            z-10
            w-9
            h-9
            rounded-xl
            bg-white/90
            backdrop-blur
            border
            border-[rgb(244_242_245)]
            flex
            items-center
            justify-center
            transition-all
            hover:bg-[rgb(244_242_245)]
          "
        >
          {favorited ? (
            <AiFillHeart size={18} className="text-rose-500" />
          ) : (
            <AiOutlineHeart size={18} className="text-[rgb(60_28_84)]/40" />
          )}
        </button>

        <Image
          src={product.image}
          alt={product.title}
          fill
          className="
            object-contain
            p-5
            transition-transform
            duration-300
            group-hover:scale-105
          "
          sizes="
            (max-width: 640px) 78vw,
            (max-width: 768px) 45vw,
            (max-width: 1024px) 31vw,
            (max-width: 1280px) 25vw,
            20vw
          "
        />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Add To Cart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          aria-label={`Add ${product.title} to cart`}
          className={`
            w-full
            flex
            items-center
            justify-center
            gap-2
            py-2.5
            rounded-xl
            text-sm
            font-semibold
            transition-all
            ${
              added || inCart
                ? "bg-emerald-100 text-emerald-700"
                : "bg-[rgb(60_28_84)] text-white hover:opacity-90"
            }
          `}
        >
          <HiOutlineShoppingBag size={16} />
          {added || inCart ? "Added" : "Add to Cart"}
        </button>

        {/* Title */}
        <h3
          className="
            text-sm
            font-bold
            leading-6
            text-[rgb(60_28_84)]
            line-clamp-2
          "
          style={{ minHeight: "3rem" }}
        >
          {product.title}
        </h3>

        {/* Bottom */}
        <div className="flex items-center justify-between mt-auto">
          <p className="text-lg font-bold text-[rgb(60_28_84)]">
            {formattedPrice}
          </p>

          <div className="flex items-center gap-1">
            <FaStar size={11} className="text-amber-400" />

            <span className="text-sm font-semibold text-[rgb(60_28_84)]">
              {(product.rating ?? 0).toFixed(1)}
            </span>

            <span className="text-xs text-[rgb(60_28_84)]/40">/5.0</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function useAddedFlash(duration = 1400): [boolean, (val: boolean) => void] {
  const [added, setAddedRaw] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const setAdded = (val: boolean) => {
    if (val) {
      setAddedRaw(true);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setAddedRaw(false);
      }, duration);
    } else {
      setAddedRaw(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return [added, setAdded];
}
