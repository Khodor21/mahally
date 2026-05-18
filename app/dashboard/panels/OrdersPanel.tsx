"use client"
import { useState } from 'react'
import { Search, Filter, Eye } from 'lucide-react'
import { useDashboard } from '../DashboardContext'
import { mockOrders } from '../data'

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  processing: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersPanel() {
  const { tr, lang } = useDashboard()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const statusLabel: Record<string, string> = {
    completed: tr.completed,
    processing: tr.processing,
    pending: tr.pending,
    cancelled: tr.cancelled,
  }

  const filters = [
    { key: 'all', label: tr.allOrders },
    { key: 'pending', label: tr.pending },
    { key: 'processing', label: tr.processing },
    { key: 'completed', label: tr.completed },
    { key: 'cancelled', label: tr.cancelled },
  ]

  const filtered = mockOrders.filter((o) => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  const totalRevenue = mockOrders.reduce((s, o) => s + o.amount, 0)

  return (
    <div className="space-y-6" dir={dir}>
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up">
        {[
          { label: tr.allOrders, value: mockOrders.length, color: 'bg-[rgb(60_28_84)] text-white' },
          { label: tr.pending, value: mockOrders.filter(o => o.status === 'pending').length, color: 'bg-amber-50 text-amber-700' },
          { label: tr.processing, value: mockOrders.filter(o => o.status === 'processing').length, color: 'bg-blue-50 text-blue-700' },
          { label: tr.completed, value: mockOrders.filter(o => o.status === 'completed').length, color: 'bg-emerald-50 text-emerald-700' },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl p-5 ${c.color} transition-all`}>
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-sm mt-1 opacity-70">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up delay-100">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 px-5 py-4 border-b border-[rgb(244_242_245)]">
          <div className="flex items-center gap-2 bg-[rgb(244_242_245)] rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search className="w-4 h-4 text-[rgb(60_28_84)]/40" />
            <input
              type="text"
              placeholder={tr.searchOrders}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-[rgb(60_28_84)] placeholder-[rgb(60_28_84)]/40 outline-none w-full"
              dir={dir}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-[rgb(60_28_84)]/40" />
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === f.key
                    ? 'bg-[rgb(60_28_84)] text-white shadow-md'
                    : 'bg-[rgb(244_242_245)] text-[rgb(60_28_84)]/60 hover:bg-[rgb(207_195_223)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Revenue banner */}
        <div className="px-5 py-3 bg-[rgb(60_28_84)]/[0.03] border-b border-[rgb(244_242_245)] flex items-center gap-2">
          <span className="text-xs text-[rgb(60_28_84)]/50">{tr.totalRevenue}:</span>
          <span className="text-sm font-bold text-[rgb(60_28_84)]">
            {totalRevenue.toLocaleString()} {tr.sar}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(244_242_245)]">
                {[tr.orderId, tr.customer, tr.items, tr.amount, tr.status, tr.date, ''].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-start text-xs font-semibold text-[rgb(60_28_84)]/40 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[rgb(60_28_84)]/40 text-sm">
                    {tr.noData}
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="border-b border-[rgb(244_242_245)] last:border-0 hover:bg-[rgb(244_242_245)]/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-[rgb(60_28_84)]">{order.id}</td>
                    <td className="px-5 py-4 font-medium text-[rgb(60_28_84)] whitespace-nowrap">{order.customer}</td>
                    <td className="px-5 py-4 text-[rgb(60_28_84)]/60 text-center">{order.items}</td>
                    <td className="px-5 py-4 font-bold text-[rgb(60_28_84)] whitespace-nowrap">
                      {order.amount.toLocaleString()} {tr.sar}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[rgb(60_28_84)]/50 text-xs whitespace-nowrap">{order.date}</td>
                    <td className="px-5 py-4">
                      <button className="p-1.5 rounded-lg hover:bg-[rgb(244_242_245)] text-[rgb(60_28_84)]/40 hover:text-[rgb(60_28_84)] transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
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
