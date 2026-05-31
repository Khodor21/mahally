"use client"
import { useState } from 'react'
import { Search } from 'lucide-react'
import { useDashboard } from '../DashboardContext'
import { mockCustomers } from '../data'

export default function CustomersPanel() {
  const { tr, lang } = useDashboard()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const [search, setSearch] = useState('')

  const filtered = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6" dir={dir}>
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-up">
        {[
          { label: tr.totalCustomers, value: mockCustomers.length, color: 'bg-[rgb(60_28_84)] text-white' },
          { label: tr.active, value: mockCustomers.filter(c => c.status === 'active').length, color: 'bg-emerald-50 text-emerald-700' },
          { label: tr.inactive, value: mockCustomers.filter(c => c.status === 'inactive').length, color: 'bg-[rgb(244_242_245)] text-[rgb(60_28_84)]' },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl p-5 ${c.color}`}>
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-sm mt-1 opacity-70">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up delay-100">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgb(244_242_245)]">
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(244_242_245)]">
                {[tr.customerName, tr.email, tr.customerTotalOrders, tr.totalSpent, tr.joinDate, tr.status].map((h) => (
                  <th key={h} className="px-5 py-3 text-start text-xs font-semibold text-[rgb(60_28_84)]/40 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[rgb(60_28_84)]/40 text-sm">
                    {tr.noData}
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="border-b border-[rgb(244_242_245)] last:border-0 hover:bg-[rgb(244_242_245)]/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[rgb(60_28_84)] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {customer.name[0]}
                        </div>
                        <span className="font-semibold text-[rgb(60_28_84)] whitespace-nowrap">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[rgb(60_28_84)]/60 font-mono text-xs">{customer.email}</td>
                    <td className="px-5 py-4 text-center font-bold text-[rgb(60_28_84)]">{customer.orders}</td>
                    <td className="px-5 py-4 font-bold text-[rgb(60_28_84)] whitespace-nowrap">
                      {customer.totalSpent.toLocaleString()} {tr.sar}
                    </td>
                    <td className="px-5 py-4 text-[rgb(60_28_84)]/50 text-xs whitespace-nowrap">{customer.joinDate}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        customer.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-[rgb(244_242_245)] text-[rgb(60_28_84)]/50'
                      }`}>
                        {customer.status === 'active' ? tr.active : tr.inactive}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
