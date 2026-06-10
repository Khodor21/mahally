// @/hooks/useDynamicColor.ts
"use client";

import { useEffect } from "react";

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r} ${g} ${b}`;
  }
  return "";
}

export function useDynamicColor(primaryColor?: string) {
  useEffect(() => {
    if (!primaryColor) return;

    // Convert hex to RGB if needed
    const rgbColor = primaryColor.startsWith("#")
      ? hexToRgb(primaryColor)
      : primaryColor; // Assume already in RGB format

    if (rgbColor) {
      document.documentElement.style.setProperty("--color-dark", rgbColor);
    }
  }, [primaryColor]);
}
