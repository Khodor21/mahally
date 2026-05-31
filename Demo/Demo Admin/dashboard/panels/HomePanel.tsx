"use client"
import { useState } from 'react'
import {
  TrendingUp, ShoppingCart, Users, Package,
  Copy, CheckCircle, ExternalLink, ArrowUpRight, ArrowDownRight,
  Plus, Eye, Ticket, Store
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useDashboard } from '../DashboardContext'
import { mockStore, mockOrders, chartData } from '../data'
import type { NavItem } from '../types'

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  processing: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function HomePanel({ setActiveNav }: { setActiveNav: (n: NavItem) => void }) {
  const { tr, lang } = useDashboard()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const [copied, setCopied] = useState(false)

  const store = mockStore
  const storeUrl = `${store.slug}.mysaas.com`

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusLabel: Record<string, string> = {
    completed: tr.completed,
    processing: tr.processing,
    pending: tr.pending,
    cancelled: tr.cancelled,
  }

  const stats = [
    {
      label: tr.totalRevenue,
      value: '52,490',
      unit: tr.sar,
      change: 18.2,
      icon: TrendingUp,
      color: 'bg-[rgb(60_28_84)]',
      iconColor: 'text-white',
    },
    {
      label: tr.totalOrders,
      value: '284',
      unit: tr.order,
      change: 12.5,
      icon: ShoppingCart,
      color: 'bg-[rgb(244_242_245)]',
      iconColor: 'text-[rgb(60_28_84)]',
    },
    {
      label: tr.totalCustomers,
      value: '1,204',
      unit: '',
      change: 8.1,
      icon: Users,
      color: 'bg-[rgb(244_242_245)]',
      iconColor: 'text-[rgb(60_28_84)]',
    },
    {
      label: tr.totalProducts,
      value: '6',
      unit: tr.piece,
      change: -3.4,
      icon: Package,
      color: 'bg-[rgb(244_242_245)]',
      iconColor: 'text-[rgb(60_28_84)]',
    },
  ]

  const quickActions = [
    { label: tr.addProduct, icon: Plus, nav: 'products' as NavItem, color: 'bg-[rgb(60_28_84)] text-white hover:bg-[rgb(60_28_84)]/90' },
    { label: tr.viewOrders, icon: Eye, nav: 'orders' as NavItem, color: 'bg-[rgb(244_242_245)] text-[rgb(60_28_84)] hover:bg-[rgb(207_195_223)]' },
    { label: tr.createCoupon, icon: Ticket, nav: 'coupons' as NavItem, color: 'bg-[rgb(244_242_245)] text-[rgb(60_28_84)] hover:bg-[rgb(207_195_223)]' },
    { label: tr.manageStore, icon: Store, nav: 'settings' as NavItem, color: 'bg-[rgb(244_242_245)] text-[rgb(60_28_84)] hover:bg-[rgb(207_195_223)]' },
  ]

  const chartKey = lang === 'ar' ? 'month' : 'monthEn'

  return (
    <div className="space-y-6" dir={dir}>
      {/* Welcome */}
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-[rgb(60_28_84)]">
          {tr.welcomeBack} {store.admin_name.split(' ')[0]} 👋
        </h2>
        <p className="text-[rgb(60_28_84)]/50 text-sm mt-0.5">{tr.overviewDesc}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-100">
        {stats.map((stat, i) => {
          const isPositive = stat.change >= 0
          return (
            <div
              key={i}
              className={`rounded-2xl p-5 ${stat.color} transition-all hover:scale-[1.02] cursor-default`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === 'bg-[rgb(60_28_84)]'
                    ? 'bg-white/20'
                    : 'bg-[rgb(60_28_84)]/10'
                }`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${
                  isPositive
                    ? stat.color === 'bg-[rgb(60_28_84)]' ? 'text-emerald-300' : 'text-emerald-600'
                    : stat.color === 'bg-[rgb(60_28_84)]' ? 'text-red-300' : 'text-red-500'
                }`}>
                  {isPositive
                    ? <ArrowUpRight className="w-3 h-3" />
                    : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(stat.change)}%
                </span>
              </div>
              <p className={`text-2xl font-bold ${
                stat.color === 'bg-[rgb(60_28_84)]' ? 'text-white' : 'text-[rgb(60_28_84)]'
              }`}>
                {stat.value}
                {stat.unit && <span className="text-sm font-normal ms-1">{stat.unit}</span>}
              </p>
              <p className={`text-xs mt-1 ${
                stat.color === 'bg-[rgb(60_28_84)]' ? 'text-white/60' : 'text-[rgb(60_28_84)]/50'
              }`}>
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 animate-fade-up delay-200">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-[rgb(60_28_84)] text-base">{tr.revenueChart}</h3>
              <p className="text-xs text-[rgb(60_28_84)]/40 mt-0.5">{tr.last7Months}</p>
            </div>
            <span className="text-xs bg-[rgb(244_242_245)] text-[rgb(60_28_84)]/60 px-3 py-1.5 rounded-lg font-medium">
              {tr.sar}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(60,28,84)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="rgb(60,28,84)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(244,242,245)" vertical={false} />
              <XAxis
                dataKey={chartKey}
                tick={{ fontSize: 11, fill: 'rgb(60,28,84,0.5)', fontFamily: 'Cairo, sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'rgba(60,28,84,0.5)', fontFamily: 'Cairo, sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid rgb(244,242,245)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontFamily: 'Cairo, sans-serif',
                  color: 'rgb(60,28,84)',
                  boxShadow: '0 4px 24px rgba(60,28,84,0.08)',
                }}
                labelStyle={{ fontWeight: 700, color: 'rgb(60,28,84)' }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="rgb(60,28,84)"
                strokeWidth={2.5}
                fill="url(#colorSales)"
                dot={{ fill: 'rgb(60,28,84)', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm">
          <h3 className="font-bold text-[rgb(60_28_84)] text-base mb-4">{tr.quickActions}</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setActiveNav(action.nav)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03] ${action.color}`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-center text-xs leading-tight">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Store Link */}
          <div className="mt-4 p-4 bg-[rgb(244_242_245)] rounded-xl">
            <p className="text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">{tr.storeLink}</p>
            <p className="text-xs font-mono text-[rgb(60_28_84)] font-bold mb-3 break-all">{storeUrl}</p>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgb(60_28_84)]/20 text-[rgb(60_28_84)] hover:bg-white transition-all text-xs font-semibold flex-1 justify-center"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? tr.copied : tr.copyLink}
              </button>
              <a
                href={`https://${storeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[rgb(60_28_84)] text-white hover:bg-[rgb(60_28_84)]/90 transition-all text-xs font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up delay-300">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(244_242_245)]">
          <h3 className="font-bold text-[rgb(60_28_84)] text-base">{tr.recentOrders}</h3>
          <button
            onClick={() => setActiveNav('orders')}
            className="text-xs font-semibold text-[rgb(60_28_84)]/60 hover:text-[rgb(60_28_84)] transition-colors flex items-center gap-1"
          >
            {tr.viewAll}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir={dir}>
            <thead>
              <tr className="border-b border-[rgb(244_242_245)]">
                {[tr.orderId, tr.customer, tr.amount, tr.status, tr.date].map((h) => (
                  <th key={h} className="px-5 py-3 text-start text-xs font-semibold text-[rgb(60_28_84)]/40 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-[rgb(244_242_245)] last:border-0 hover:bg-[rgb(244_242_245)]/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-[rgb(60_28_84)]">{order.id}</td>
                  <td className="px-5 py-3.5 font-medium text-[rgb(60_28_84)] whitespace-nowrap">{order.customer}</td>
                  <td className="px-5 py-3.5 font-bold text-[rgb(60_28_84)] whitespace-nowrap">
                    {order.amount.toLocaleString()} {tr.sar}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[rgb(60_28_84)]/50 text-xs whitespace-nowrap">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
