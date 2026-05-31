"use client";

import { Suspense } from "react";
import AIChatWindow from "../components/AIChatWindow";

export default function AIChatPanel() {
  return (
    <div className="h-[calc(100vh-64px)]">
      <Suspense fallback={<div className="h-full bg-white" />}>
        <AIChatWindow />
      </Suspense>
    </div>
  );
}
