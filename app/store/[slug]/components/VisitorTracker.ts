"use client";

import { useTrackVisitor } from "@/hooks/useTrackVisitor";

export default function VisitorTracker({ storeId }: { storeId: string }) {
  useTrackVisitor(storeId);
  return null;
}
