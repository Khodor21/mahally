// @/app/components/ThemeClient.tsx
"use client";

import { useDynamicColor } from "@/hooks/useDynamicColor";

export default function ThemeClient({
  primaryColor,
}: {
  primaryColor?: string;
}) {
  useDynamicColor(primaryColor);
  return null;
}
