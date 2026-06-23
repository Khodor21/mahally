"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { usePolicyData } from "@/hooks/usePolicyData";
import PolicyPage from "../components/PolicyPage";

export default function PrivacyRoute() {
  const data = usePolicyData();
  const dir = data.language === "ar" ? "rtl" : "ltr";

  // 1. Premium Loading State (Skeleton mimics the exact PolicyPage layout)
  if (data.isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col pb-24" dir={dir}>
        {/* Hero Skeleton */}
        <div className="pt-20 pb-24 px-4 text-center bg-gray-900 animate-pulse transition-colors duration-700">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl border border-white/5"></div>
            <div className="h-9 w-64 bg-white/10 rounded-lg"></div>
            <div className="h-5 w-48 bg-white/5 rounded-md mt-2"></div>
          </div>
        </div>

        {/* Document Skeleton */}
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 lg:p-16 space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-4 bg-gray-100 rounded-md w-full animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded-md w-11/12 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded-md w-5/6 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Premium Error State
  if (data.error) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center"
        dir={dir}
      >
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 ring-8 ring-red-50/50">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          {data.language === "ar"
            ? "عذراً، حدث خطأ ما"
            : "Oops, something went wrong"}
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed text-sm">
          {data.error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-md shadow-gray-900/10 active:scale-95"
        >
          {data.language === "ar" ? "إعادة المحاولة" : "Try again"}
        </button>
      </div>
    );
  }

  // Ensure strict adherence to the expected language type
  const currentLang = data.language === "en" ? "en" : "ar";

  // Extract the actual privacy content from your hook's data
  // (Adjust the property name below if your database field is called something else, e.g., data.privacyText)
  const privacyContent = data.privacyPolicy || data.privacyPolicy || null;

  // 3. Render the Actual Page
  return (
    <PolicyPage
      type="privacy"
      lang={currentLang}
      storeName={data.storeName || ""}
      primaryColor={data.primaryColor || null}
      dbContent={privacyContent}
    />
  );
}
