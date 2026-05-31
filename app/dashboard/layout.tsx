"use client";

import { ReactNode } from "react";
import { DashboardProvider } from "./DashboardContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
