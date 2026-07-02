"use client";

import { ReactNode } from "react";
import { DashboardProvider } from "./DashboardContext";

interface DashboardClientWrapperProps {
  children: ReactNode;
}

export function DashboardClientWrapper({
  children,
}: DashboardClientWrapperProps) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
