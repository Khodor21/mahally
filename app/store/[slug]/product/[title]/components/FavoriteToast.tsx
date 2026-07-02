"use client";

import { Heart, X } from "lucide-react";

export interface FavoriteToastProps {
  favToast: boolean;
  setFavToast: (val: boolean) => void;
  favAction: "added" | "removed";
  favProgress: number;
  lang: "ar" | "en";
  t: { addedToFav: string; removedFromFav: string };
}

export default function FavoriteToast({
  favToast,
  setFavToast,
  favAction,
  favProgress,
  lang,
  t,
}: FavoriteToastProps) {
  if (!favToast) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-2rem)] md:w-[320px] bg-white rounded-lg shadow overflow-hidden border border-gray-100 transition-all animate-in slide-in-from-top-4 fade-in duration-300"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* PROGRESS BAR */}
      <div
        className={`h-1 ease-linear ${
          favAction === "added" ? "bg-rose-500" : "bg-gray-400"
        }`}
        style={{
          width: `${favProgress}%`,
          transitionDuration: favToast ? "2950ms" : "0ms",
          transitionProperty: "width",
        }}
      />
      <div className="flex items-center justify-between px-4 py-3">
        {lang === "ar" ? (
          <>
            <div className="flex items-center gap-2.5">
              <Heart
                className={`flex-shrink-0 ${
                  favAction === "added"
                    ? "text-rose-500 fill-rose-500"
                    : "text-gray-400"
                }`}
                size={18}
              />
              <span className="text-sm font-medium text-gray-900">
                {favAction === "added" ? t.addedToFav : t.removedFromFav}
              </span>
            </div>
            <button
              onClick={() => setFavToast(false)}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setFavToast(false)}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-medium text-gray-900">
                {favAction === "added" ? t.addedToFav : t.removedFromFav}
              </span>
              <Heart
                className={`flex-shrink-0 ${
                  favAction === "added"
                    ? "text-rose-500 fill-rose-500"
                    : "text-gray-400"
                }`}
                size={18}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
