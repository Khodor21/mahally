"use client";

import { useEffect, useRef } from "react";
import { getOrCreateVisitorId } from "@/lib/visitorId";

export function useTrackVisitor(storeId: string) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!storeId || typeof window === "undefined" || trackedRef.current) {
      return;
    }

    const trackVisitor = async () => {
      try {
        const visitorId = getOrCreateVisitorId();

        const response = await fetch("/api/track-visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId,
            visitorId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.warn("Visitor tracking warning:", error.error);
          return;
        }

        const data = await response.json();
        if (data.tracked) {
          console.log("✓ Visitor tracked successfully");
          trackedRef.current = true;
        } else {
          console.log("ℹ Visitor already tracked today");
          trackedRef.current = true;
        }
      } catch (error) {
        console.error("Failed to track visitor:", error);
      }
    };

    trackVisitor();
  }, [storeId]);
}
