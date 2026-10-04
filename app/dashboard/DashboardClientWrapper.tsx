"use client";

import { ReactNode, useEffect } from "react";
import { DashboardProvider } from "./DashboardContext";
import { useRegisterAdminDevice } from "@/hooks/useRegisterAdminDevice";

export function DashboardClientWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/firebase-messaging-sw.js");
    }
  }, []);

  useRegisterAdminDevice();
  return <DashboardProvider>{children}</DashboardProvider>;
}
