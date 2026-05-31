"use client"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, ShoppingCart, Users, MousePointer } from 'lucide-react'
import { useDashboard } from '../DashboardContext'
import { chartData } from '../data'

export default function AnalyticsPanel() {
  const { tr, lang } = useDashboard()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const chartKey = lang === 'ar' ? 'month' : 'monthEn'

  const kpis = [
    { label: tr.totalRevenue, value: '52,490', unit: tr.sar, change: '+18.2%', icon: TrendingUp, good: true },
    { label: tr.ordersCount, value: '284', unit: tr.order, change: '+12.5%', icon: ShoppingCart, good: true },
    { label: tr.visits, value: '12,450', unit: '', change: '+24.1%', icon: MousePointer, good: true },
    { label: tr.newCustomers, value: '142', unit: '', change: '-3.2%', icon: Users, good: false },
  ]

  const tooltipStyle = {
    background: 'white',
    border: '1px solid rgb(244,242,245)',
    borderRadius: '12px',
    fontSize: '12px',
    fontFamily: 'Cairo, sans-serif',
    color: 'rgb(60,28,84)',
    boxShadow: '0 4px 24px rgba(60,28,84,0.08)',
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[rgb(244_242_245)] flex items-center justify-center">
                <kpi.icon className="w-5 h-5 text-[rgb(60_28_84)]" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                kpi.good ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-[rgb(60_28_84)]">
              {kpi.value}
              {kpi.unit && <span className="text-sm font-normal ms-1 text-[rgb(60_28_84)]/50">{kpi.unit}</span>}
            </p>
            <p className="text-xs text-[rgb(60_28_84)]/50 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm animate-fade-up delay-100">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-[rgb(60_28_84)] text-base">{tr.salesOverview}</h3>
            <p className="text-xs text-[rgb(60_28_84)]/40 mt-0.5">{tr.last7Months}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(60,28,84)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="rgb(60,28,84)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(244,242,245)" vertical={false} />
            <XAxis
              dataKey={chartKey}
              tick={{ fontSize: 11, fill: 'rgba(60,28,84,0.5)', fontFamily: 'Cairo' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'rgba(60,28,84,0.5)', fontFamily: 'Cairo' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 700 }} />
            <Area
              type="monotone"
              dataKey="sales"
              name={tr.revenue}
              stroke="rgb(60,28,84)"
              strokeWidth={2.5}
              fill="url(#gradRevenue)"
              dot={{ fill: 'rgb(60,28,84)', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders + Visits Bar Chart */}
      <div className="grid md:grid-cols-2 gap-6 animate-fade-up delay-200">
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm">
          <h3 className="font-bold text-[rgb(60_28_84)] text-base mb-5">{tr.ordersOverview}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(244,242,245)" vertical={false} />
              <XAxis
                dataKey={chartKey}
                tick={{ fontSize: 10, fill: 'rgba(60,28,84,0.5)', fontFamily: 'Cairo' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(60,28,84,0.5)', fontFamily: 'Cairo' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 700 }} />
              <Bar
                dataKey="orders"
                name={tr.ordersCount}
                fill="rgb(60,28,84)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm">
          <h3 className="font-bold text-[rgb(60_28_84)] text-base mb-5">{tr.visits}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(244,242,245)" vertical={false} />
              <XAxis
                dataKey={chartKey}
                tick={{ fontSize: 10, fill: 'rgba(60,28,84,0.5)', fontFamily: 'Cairo' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'rgba(60,28,84,0.5)', fontFamily: 'Cairo' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 700 }} />
              <Bar
                dataKey="visits"
                name={tr.visits}
                fill="rgb(207,195,223)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion + Avg */}
      <div className="grid grid-cols-2 gap-4 animate-fade-up delay-300">
        {[
          { label: tr.conversionRate, value: '2.28%', sub: lang === 'ar' ? 'من الزيارات إلى طلبات' : 'From visits to orders' },
          { label: tr.avgOrderValue, value: `184 ${tr.sar}`, sub: lang === 'ar' ? 'متوسط قيمة كل طلب' : 'Average per order' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-[rgb(244_242_245)] p-5 shadow-sm">
            <p className="text-xs text-[rgb(60_28_84)]/40 mb-2">{item.label}</p>
            <p className="text-3xl font-bold text-[rgb(60_28_84)]">{item.value}</p>
            <p className="text-xs text-[rgb(60_28_84)]/40 mt-1">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
