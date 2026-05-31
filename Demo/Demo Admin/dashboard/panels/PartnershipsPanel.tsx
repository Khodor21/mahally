"use client"

import { Handshake, TrendingUp, Users, DollarSign, Lock } from 'lucide-react'
import { useDashboard } from '../DashboardContext'

export default function PartnershipsPanel() {
  const { tr, lang } = useDashboard()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const features = lang === 'ar'
    ? [
        { icon: Users, title: 'شبكة الشركاء', desc: 'انضم إلى شبكة من الشركاء والمسوقين لتنمية متجرك' },
        { icon: TrendingUp, title: 'نظام العمولات', desc: 'كسب عمولات تلقائية على كل عملية بيع من خلال الشركاء' },
        { icon: DollarSign, title: 'مدفوعات سريعة', desc: 'استلم مدفوعات عمولاتك شهرياً مباشرة في حسابك' },
      ]
    : [
        { icon: Users, title: 'Partner Network', desc: 'Join a network of partners and marketers to grow your store' },
        { icon: TrendingUp, title: 'Commission System', desc: 'Earn automatic commissions on every sale through partners' },
        { icon: DollarSign, title: 'Fast Payments', desc: 'Receive commission payments monthly directly to your account' },
      ]

  return (
    <div className="space-y-6" dir={dir}>
      {/* Main coming soon card */}
      <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm overflow-hidden animate-fade-up">
        {/* Top banner */}
        <div className="bg-[rgb(60_28_84)] px-8 py-12 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 start-0 w-32 h-32 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 end-0 w-48 h-48 rounded-full bg-white/5 translate-x-1/2 translate-y-1/2" />

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Handshake className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {lang === 'ar' ? 'برنامج الشراكات' : 'Partnerships Program'}
            </h2>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              {tr.partnershipsDesc}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-5 py-2.5">
              <Lock className="w-4 h-4 text-[rgb(207_195_223)]" />
              <span className="text-[rgb(207_195_223)] font-bold text-sm">{tr.comingSoon}</span>
            </div>
          </div>
        </div>

        {/* Features preview */}
        <div className="p-8">
          <p className="text-sm font-semibold text-[rgb(60_28_84)]/50 mb-5 text-center">
            {lang === 'ar' ? 'ما الذي ستحصل عليه' : 'What you will get'}
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="text-center p-5 rounded-2xl bg-[rgb(244_242_245)] hover:bg-[rgb(207_195_223)]/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <f.icon className="w-6 h-6 text-[rgb(60_28_84)]" />
                </div>
                <h4 className="font-bold text-[rgb(60_28_84)] text-sm mb-1">{f.title}</h4>
                <p className="text-xs text-[rgb(60_28_84)]/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Notify me */}
          <div className="mt-8 flex flex-col md:flex-row items-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              className="flex-1 bg-[rgb(244_242_245)] rounded-xl px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-colors w-full"
              dir={dir}
            />
            <button className="px-6 py-2.5 bg-[rgb(60_28_84)] text-white rounded-xl text-sm font-semibold hover:bg-[rgb(60_28_84)]/90 transition-all whitespace-nowrap shadow-md shadow-[rgb(60_28_84)]/20">
              {lang === 'ar' ? 'أبلغني عند الإطلاق' : 'Notify Me'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
