import React from "react";
import Dashboard from "./Dashboard";
import { getCurrentStore } from "@/lib/store";
import { redirect } from "next/navigation";
import { DashboardClientWrapper } from "./DashboardClientWrapper";

const Page = async () => {
  const store = await getCurrentStore();

  if (!store) {
    redirect("/login");
  }

  return (
    <DashboardClientWrapper>
      <div className="w-full">
        <Dashboard store={store} />
      </div>
    </DashboardClientWrapper>
  );
};

export default Page;
