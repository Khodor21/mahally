"use client"
import { useState } from 'react'
import { Plus, Copy, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import { useDashboard } from '../DashboardContext'
import { mockCoupons } from '../data'

export default function CouponsPanel() {
  const { tr, lang } = useDashboard()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header action */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <p className="text-sm text-[rgb(60_28_84)]/50">{tr.coupons}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[rgb(60_28_84)] text-white rounded-xl text-sm font-semibold hover:bg-[rgb(60_28_84)]/90 transition-all shadow-md shadow-[rgb(60_28_84)]/20">
          <Plus className="w-4 h-4" />
          {tr.createNewCoupon}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 animate-fade-up delay-100">
        {[
          { label: lang === 'ar' ? 'إجمالي الكوبونات' : 'Total Coupons', value: mockCoupons.length, color: 'bg-[rgb(60_28_84)] text-white' },
          { label: tr.enabled, value: mockCoupons.filter(c => c.active).length, color: 'bg-emerald-50 text-emerald-700' },
          { label: tr.disabled, value: mockCoupons.filter(c => !c.active).length, color: 'bg-[rgb(244_242_245)] text-[rgb(60_28_84)]' },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl p-5 ${c.color}`}>
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-sm mt-1 opacity-70">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Coupons grid */}
      <div className="grid md:grid-cols-2 gap-4 animate-fade-up delay-200">
        {mockCoupons.map((coupon) => {
          const usagePercent = Math.round((coupon.uses / coupon.maxUses) * 100)
          return (
            <div
              key={coupon.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
                coupon.active ? 'border-[rgb(244_242_245)]' : 'border-[rgb(244_242_245)] opacity-60'
              }`}
            >
              {/* Top */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-lg font-bold text-[rgb(60_28_84)] tracking-wider">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => copyCode(coupon.id, coupon.code)}
                      className="p-1 rounded-lg hover:bg-[rgb(244_242_245)] text-[rgb(60_28_84)]/40 hover:text-[rgb(60_28_84)] transition-colors"
                    >
                      {copiedId === coupon.id
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        : <Copy className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    coupon.type === 'percentage'
                      ? 'bg-[rgb(60_28_84)]/10 text-[rgb(60_28_84)]'
                      : 'bg-[rgb(207_195_223)] text-[rgb(60_28_84)]'
                  }`}>
                    {coupon.type === 'percentage'
                      ? `${coupon.discount}% ${tr.percentage}`
                      : `${coupon.discount} ${tr.sar} ${tr.fixed}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {coupon.active
                    ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                    : <ToggleLeft className="w-6 h-6 text-[rgb(60_28_84)]/30" />
                  }
                  <span className={`text-xs font-semibold ${
                    coupon.active ? 'text-emerald-600' : 'text-[rgb(60_28_84)]/40'
                  }`}>
                    {coupon.active ? tr.enabled : tr.disabled}
                  </span>
                </div>
              </div>

              {/* Usage bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-[rgb(60_28_84)]/50 mb-1.5">
                  <span>{lang === 'ar' ? 'الاستخدام' : 'Usage'}: {coupon.uses}/{coupon.maxUses}</span>
                  <span>{usagePercent}%</span>
                </div>
                <div className="h-2 bg-[rgb(244_242_245)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercent >= 100 ? 'bg-red-400' : usagePercent >= 75 ? 'bg-amber-400' : 'bg-[rgb(60_28_84)]'
                    }`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Expiry */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[rgb(60_28_84)]/40">
                  {tr.expiry}: <span className="text-[rgb(60_28_84)] font-medium">{coupon.expiry}</span>
                </span>
                <button className="text-xs px-3 py-1.5 rounded-lg bg-[rgb(244_242_245)] text-[rgb(60_28_84)] hover:bg-[rgb(207_195_223)] transition-colors font-medium">
                  {tr.edit}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
