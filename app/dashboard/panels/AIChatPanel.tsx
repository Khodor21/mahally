"use client";

import { Suspense } from "react";
import AIChatWindow from "../components/AIChatWindow";
import { useDashboard } from "../DashboardContext";

export default function AIChatPanel() {
  const { lang } = useDashboard();

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div
      className="h-[calc(100vh-64px)] bg-[#f7f7f8] flex justify-center"
      dir={dir}
    >
      <div className="w-full max-w-4xl flex flex-col">
        <Suspense fallback={<div className="h-full w-full bg-[#f7f7f8]" />}>
          <AIChatWindow />
        </Suspense>
      </div>
    </div>
  );
}
