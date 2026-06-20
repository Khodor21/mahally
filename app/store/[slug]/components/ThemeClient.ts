"use client";

import { useEffect } from "react";

export default function ThemeClient({
  primaryColor,
}: {
  primaryColor: string | null | undefined;
}) {
  useEffect(() => {
    if (!primaryColor) return;

    // Convert primaryColor to RGB space-separated format
    const rgbValue = hexToRgbSpaceSeparated(primaryColor);

    if (rgbValue) {
      // Set the CSS variable on the root element
      document.documentElement.style.setProperty(
        "--color-brand-primary",
        rgbValue,
      );
    }
  }, [primaryColor]);

  return null; // Renders nothing visually
}

function hexToRgbSpaceSeparated(color: string): string | null {
  const trimmed = color.trim();

  // Case 1: Already space-separated RGB ("60 28 84")
  if (/^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/.test(trimmed)) {
    return trimmed;
  }

  // Case 2: Comma-separated RGB ("rgb(60, 28, 84)")
  const rgbCommaMatch = trimmed.match(
    /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/,
  );
  if (rgbCommaMatch) {
    return `${rgbCommaMatch[1]} ${rgbCommaMatch[2]} ${rgbCommaMatch[3]}`;
  }

  // Case 3: Space-separated RGB function ("rgb(60 28 84)")
  const rgbSpaceMatch = trimmed.match(
    /rgb\(\s*(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s*\)/,
  );
  if (rgbSpaceMatch) {
    return `${rgbSpaceMatch[1]} ${rgbSpaceMatch[2]} ${rgbSpaceMatch[3]}`;
  }

  // Case 4: Hex color ("#3C1C54" or "#3c1c54")
  const hexMatch = trimmed.match(/^#?([A-Fa-f0-9]{6})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r} ${g} ${b}`;
  }

  // Invalid format
  console.warn(`[ThemeClient] Invalid color format: "${color}"`);
  return null;
}
