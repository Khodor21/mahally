"use client"

import { Plus, Star, Calendar } from 'lucide-react'
import { useDashboard } from '../DashboardContext'

const occasions = [
  { emoji: '🌙', labelAr: 'رمضان', labelEn: 'Ramadan', descAr: 'عروض شهر رمضان المبارك', descEn: 'Holy Ramadan month offers', dateAr: 'يبدأ مارس 2025', dateEn: 'Starts March 2025', color: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  { emoji: '🎊', labelAr: 'عيد الفطر', labelEn: 'Eid Al-Fitr', descAr: 'عروض وخصومات عيد الفطر', descEn: 'Eid Al-Fitr discounts & offers', dateAr: 'أبريل 2025', dateEn: 'April 2025', color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  { emoji: '🇸🇦', labelAr: 'اليوم الوطني', labelEn: 'National Day', descAr: 'احتفل باليوم الوطني مع عملائك', descEn: 'Celebrate National Day with customers', dateAr: 'سبتمبر 2025', dateEn: 'September 2025', color: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700' },
  { emoji: '🎆', labelAr: 'رأس السنة', labelEn: "New Year's", descAr: 'عروض نهاية السنة والبداية الجديدة', descEn: 'Year-end and new year special offers', dateAr: 'يناير 2026', dateEn: 'January 2026', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  { emoji: '💝', labelAr: 'يوم الحب', labelEn: "Valentine's Day", descAr: 'هدايا وعروض يوم الحب', descEn: "Valentine's Day gifts & offers", dateAr: 'فبراير 2025', dateEn: 'February 2025', color: 'bg-pink-50 border-pink-200', badge: 'bg-pink-100 text-pink-700' },
  { emoji: '🎓', labelAr: 'موسم الدراسة', labelEn: 'Back to School', descAr: 'عروض بداية الفصل الدراسي', descEn: 'Back to school season offers', dateAr: 'سبتمبر 2025', dateEn: 'September 2025', color: 'bg-violet-50 border-violet-200', badge: 'bg-violet-100 text-violet-700' },
]

export default function OccasionsPanel() {
  const { tr, lang } = useDashboard()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <p className="text-sm text-[rgb(60_28_84)]/50">
            {lang === 'ar' ? tr.occasionsDesc : tr.occasionsDesc}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[rgb(60_28_84)] text-white rounded-xl text-sm font-semibold hover:bg-[rgb(60_28_84)]/90 transition-all shadow-md shadow-[rgb(60_28_84)]/20">
          <Plus className="w-4 h-4" />
          {tr.createOccasion}
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-[rgb(60_28_84)] rounded-2xl p-5 text-white animate-fade-up delay-100">
        <div className="flex items-center gap-3 mb-2">
          <Star className="w-5 h-5 text-[rgb(207_195_223)]" />
          <h3 className="font-bold text-base">{tr.occasionsTitle}</h3>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">
          {lang === 'ar'
            ? 'أنشئ عروضاً وخصومات مخصصة للمناسبات الخاصة وأرسلها لعملائك تلقائياً في الوقت المناسب.'
            : 'Create custom offers and discounts for special occasions and send them to your customers automatically at the right time.'
          }
        </p>
      </div>

      {/* Occasions grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-up delay-200">
        {occasions.map((occ, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-5 transition-all hover:shadow-md cursor-pointer group ${occ.color}`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{occ.emoji}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${occ.badge}`}>
                {lang === 'ar' ? occ.dateAr : occ.dateEn}
              </span>
            </div>
            <h4 className="font-bold text-[rgb(60_28_84)] text-base mb-1">
              {lang === 'ar' ? occ.labelAr : occ.labelEn}
            </h4>
            <p className="text-xs text-[rgb(60_28_84)]/60 mb-4">
              {lang === 'ar' ? occ.descAr : occ.descEn}
            </p>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgb(60_28_84)] text-white text-xs font-semibold hover:bg-[rgb(60_28_84)]/90 transition-all">
                <Plus className="w-3.5 h-3.5" />
                {tr.createOccasion}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[rgb(60_28_84)]/20 text-[rgb(60_28_84)] text-xs font-medium hover:bg-white/50 transition-all">
                <Calendar className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'جدولة' : 'Schedule'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
