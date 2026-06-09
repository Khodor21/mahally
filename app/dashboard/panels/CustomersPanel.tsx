"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { useDashboard } from "../DashboardContext";
import { useCustomers } from "@/hooks/useApi";

export default function CustomersPanel() {
  const { tr, lang } = useDashboard();
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Using the hook to manage data and loading state
  const { data, loading } = useCustomers();
  const customers = data ?? [];

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return customers.filter((customer) => {
      const fullName =
        `${customer.first_name} ${customer.last_name}`.toLowerCase();
      return (
        fullName.includes(search.toLowerCase()) ||
        customer.phone.includes(search)
      );
    });
  }, [customers, search]);

  // Derived metrics
  const activeCustomers = customers.length;
  const inactiveCustomers = 0;

  return (
    <div className="space-y-6" dir={dir}>
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-up">
        {loading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-5 bg-[rgb(244_242_245)] animate-pulse"
              />
            ))
          : [
              {
                label: tr.totalCustomers,
                value: customers.length,
                color: "bg-[rgb(60_28_84)] text-white",
              },
              {
                label: tr.active,
                value: activeCustomers,
                color: "bg-emerald-50 text-emerald-700",
              },
              {
                label: tr.inactive,
                value: inactiveCustomers,
                color: "bg-[rgb(244_242_245)] text-[rgb(60_28_84)]",
              },
            ].map((c) => (
              <div key={c.label} className={`rounded-2xl p-5 ${c.color}`}>
                <p className="text-3xl font-bold">{c.value}</p>
                <p className="text-sm mt-1 opacity-70">{c.label}</p>
              </div>
            ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up delay-100">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgb(244_242_245)]">
          {loading ? (
            <div className="h-10 w-full max-w-xs bg-[rgb(244_242_245)] rounded-xl animate-pulse"></div>
          ) : (
            <div className="flex items-center gap-2 bg-[rgb(244_242_245)] rounded-xl px-3 py-2 flex-1 max-w-xs">
              <Search className="w-4 h-4 text-[rgb(60_28_84)]/40" />
              <input
                type="text"
                placeholder={tr.searchCustomers}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/40 outline-none w-full"
                dir={dir}
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(244_242_245)]">
                {[tr.customerName, tr.phone, tr.governorate, tr.joinDate].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-start text-xs font-semibold text-[rgb(60_28_84)]/40 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-[rgb(244_242_245)] last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-200 animate-pulse flex-shrink-0"></div>
                        <div className="h-4 w-28 rounded bg-gray-200 animate-pulse"></div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-24 rounded bg-gray-200 animate-pulse"></div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-20 rounded bg-gray-200 animate-pulse"></div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-24 rounded bg-gray-200 animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-[rgb(60_28_84)]/40 text-sm"
                  >
                    {tr.noData}
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => {
                  const fullName = `${customer.first_name} ${customer.last_name}`;
                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-[rgb(244_242_245)] last:border-0 hover:bg-[rgb(244_242_245)]/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[rgb(60_28_84)] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {fullName[0]}
                          </div>
                          <span className="font-semibold text-[rgb(60_28_84)] whitespace-nowrap">
                            {fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[rgb(60_28_84)]/60 font-mono text-xs whitespace-nowrap">
                        {customer.phone}
                      </td>
                      <td className="px-5 py-4 text-[rgb(60_28_84)] whitespace-nowrap">
                        {customer.governorate}
                      </td>
                      <td className="px-5 py-4 text-[rgb(60_28_84)]/50 text-xs whitespace-nowrap">
                        {new Date(customer.created_at).toLocaleDateString(
                          lang === "ar" ? "ar-LB" : "en-US",
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
