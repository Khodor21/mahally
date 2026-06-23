// File: lib/hooks/usePolicyData.ts

"use client";

import { useState, useEffect } from "react";

export interface PolicyData {
  storeName: string;
  language: "en" | "ar";
  primaryColor: string;
  privacyPolicy: string | null;
  shippingPolicy: string | null;
  returnPolicy: string | null;
  isLoading: boolean;
  error: string | null;
}

export function usePolicyData(): PolicyData {
  const [data, setData] = useState<PolicyData>({
    storeName: "متجرك",
    language: "ar",
    primaryColor: "#131944",
    privacyPolicy: null,
    shippingPolicy: null,
    returnPolicy: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function loadPolicyData() {
      try {
        console.log("Fetching policy data...");

        const response = await fetch("/api/storefront/policy", {
          method: "GET",
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error:", errorData);
          throw new Error(errorData.error || "Failed to fetch");
        }

        const result = await response.json();
        console.log("API Response:", result);

        setData({
          storeName: result.storeName || "متجرك",
          language: (result.language as "en" | "ar") || "ar",
          primaryColor: result.primaryColor || "#131944",
          privacyPolicy: result.privacyPolicy || null,
          shippingPolicy: result.shippingPolicy || null,
          returnPolicy: result.returnPolicy || null,
          isLoading: false,
          error: null,
        });

        console.log("Data set successfully");
      } catch (err) {
        console.error("Hook error:", err);
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    }

    loadPolicyData();
  }, []);

  return data;
}
