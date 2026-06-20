// app/dashboard/page.tsx
import React from "react";
import Dashboard from "./Dashboard";
import { getCurrentStore } from "@/lib/store";
import { redirect } from "next/navigation";

const Page = async () => {
  const store = await getCurrentStore();

  if (!store) {
    redirect("/login");
  }

  return (
    <div className="w-full">
      <Dashboard store={store} /> 
    </div>
  );
};

export default Page;