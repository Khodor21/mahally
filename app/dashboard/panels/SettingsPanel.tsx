"use client"
import { useState } from 'react'
import { Save, Store, User, Bell, Globe, AlertTriangle, Check } from 'lucide-react'
import { useDashboard } from '../DashboardContext'
import { mockStore, STORE_TYPE_LABELS } from '../data'

export default function SettingsPanel() {
  const { tr, lang, setLang } = useDashboard()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'store' | 'account' | 'notifications' | 'appearance'>('store')

  const [formData, setFormData] = useState({
    store_name: mockStore.store_name,
    location: mockStore.location,
    phone: mockStore.phone,
    store_type: mockStore.store_type,
    admin_name: mockStore.admin_name,
    admin_email: mockStore.admin_email,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const tabs = [
    { id: 'store' as const, label: tr.storeSettings, icon: Store },
    { id: 'account' as const, label: tr.accountSettings, icon: User },
    { id: 'notifications' as const, label: tr.notificationSettings, icon: Bell },
    { id: 'appearance' as const, label: tr.appearance, icon: Globe },
  ]

  const createdDate = new Date(mockStore.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="space-y-6 max-w-3xl" dir={dir}>
      {/* Tabs */}
      <div className="flex gap-1 bg-[rgb(244_242_245)] rounded-xl p-1 animate-fade-up">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-white text-[rgb(60_28_84)] shadow-sm'
                : 'text-[rgb(60_28_84)]/50 hover:text-[rgb(60_28_84)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Store Settings */}
      {activeTab === 'store' && (
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
            <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
              <Store className="w-5 h-5" />
              {tr.storeSettings}
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: tr.storeName, key: 'store_name', type: 'text' },
                { label: tr.location, key: 'location', type: 'text' },
                { label: tr.phone, key: 'phone', type: 'tel' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full bg-[rgb(244_242_245)] rounded-xl px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                    dir={dir}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">{tr.storeType}</label>
                <select
                  value={formData.store_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, store_type: e.target.value }))}
                  className="w-full bg-[rgb(244_242_245)] rounded-xl px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                  dir={dir}
                >
                  {Object.entries(STORE_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{lang === 'ar' ? v.ar : v.en}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Store info readonly */}
            <div className="pt-4 border-t border-[rgb(244_242_245)] grid md:grid-cols-2 gap-4">
              {[
                { label: tr.storeId, value: `#${mockStore.id.slice(0, 8).toUpperCase()}` },
                { label: tr.memberSince, value: createdDate },
              ].map((item) => (
                <div key={item.label} className="bg-[rgb(244_242_245)] rounded-xl px-4 py-3">
                  <p className="text-xs text-[rgb(60_28_84)]/40 mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-[rgb(60_28_84)] font-mono">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Custom domain */}
            <div className="p-4 rounded-xl border border-[rgb(207_195_223)] bg-[rgb(207_195_223)]/20">
              <p className="text-xs font-bold text-[rgb(60_28_84)]/60 mb-1">{tr.customDomain}</p>
              <p className="text-sm text-[rgb(60_28_84)]">{tr.customDomainDesc}</p>
            </div>

            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md ${
                saved
                  ? 'bg-emerald-500 text-white shadow-emerald-200'
                  : 'bg-[rgb(60_28_84)] text-white hover:bg-[rgb(60_28_84)]/90 shadow-[rgb(60_28_84)]/20'
              }`}
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved
                ? (lang === 'ar' ? 'تم الحفظ!' : 'Saved!')
                : tr.saveChanges
              }
            </button>
          </div>
        </div>
      )}

      {/* Account Settings */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
            <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
              <User className="w-5 h-5" />
              {tr.accountSettings}
            </h3>
          </div>
          <div className="p-6 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[rgb(60_28_84)] flex items-center justify-center text-white font-bold text-2xl">
                {mockStore.admin_name[0]}
              </div>
              <div>
                <p className="font-bold text-[rgb(60_28_84)]">{mockStore.admin_name}</p>
                <p className="text-sm text-[rgb(60_28_84)]/50">{mockStore.admin_email}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: tr.adminName, key: 'admin_name' },
                { label: tr.email, key: 'admin_email' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-[rgb(60_28_84)]/50 mb-2">{field.label}</label>
                  <input
                    type="text"
                    value={formData[field.key as keyof typeof formData]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full bg-[rgb(244_242_245)] rounded-xl px-4 py-2.5 text-sm text-[rgb(60_28_84)] outline-none border border-transparent focus:border-[rgb(207_195_223)] transition-all"
                    dir={dir}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-[rgb(60_28_84)] text-white rounded-xl text-sm font-semibold hover:bg-[rgb(60_28_84)]/90 transition-all shadow-md shadow-[rgb(60_28_84)]/20"
            >
              <Save className="w-4 h-4" />
              {tr.saveChanges}
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm animate-fade-up">
          <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
            <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {tr.notificationSettings}
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {(lang === 'ar' ? [
              { label: 'إشعارات الطلبات الجديدة', desc: 'استلم إشعاراً عند وصول طلب جديد' },
              { label: 'إشعارات المخزون المنخفض', desc: 'تنبيه عند نفاد المنتجات' },
              { label: 'إشعارات العملاء الجدد', desc: 'معرفة كل عميل جديد يسجل' },
              { label: 'التقارير الأسبوعية', desc: 'ملخص أسبوعي لأداء متجرك' },
            ] : [
              { label: 'New Order Notifications', desc: 'Get notified when a new order arrives' },
              { label: 'Low Stock Alerts', desc: 'Alert when products run low' },
              { label: 'New Customer Notifications', desc: 'Know every time a new customer registers' },
              { label: 'Weekly Reports', desc: 'Weekly summary of your store performance' },
            ]).map((notif, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-[rgb(244_242_245)] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-[rgb(60_28_84)]">{notif.label}</p>
                  <p className="text-xs text-[rgb(60_28_84)]/50 mt-0.5">{notif.desc}</p>
                </div>
                <button
                  className={`relative w-12 h-6 rounded-full transition-colors ${i < 3 ? 'bg-[rgb(60_28_84)]' : 'bg-[rgb(244_242_245)]'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                    i < 3
                      ? dir === 'rtl' ? 'start-0.5' : 'end-0.5 left-[calc(100%-22px)]'
                      : 'start-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appearance */}
      {activeTab === 'appearance' && (
        <div className="space-y-4 animate-fade-up">
          <div className="bg-white rounded-2xl border border-[rgb(244_242_245)] shadow-sm">
            <div className="px-6 py-5 border-b border-[rgb(244_242_245)]">
              <h3 className="font-bold text-[rgb(60_28_84)] flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {tr.language}
              </h3>
            </div>
            <div className="p-6 flex gap-3">
              {([['ar', tr.arabic, '🇸🇦'], ['en', tr.english, '🇺🇸']] as const).map(([code, label, flag]) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    lang === code
                      ? 'border-[rgb(60_28_84)] bg-[rgb(60_28_84)] text-white'
                      : 'border-[rgb(244_242_245)] text-[rgb(60_28_84)] hover:border-[rgb(207_195_223)]'
                  }`}
                >
                  <span>{flag}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm">
            <div className="px-6 py-5 border-b border-red-100">
              <h3 className="font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {tr.dangerZone}
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div>
                  <p className="text-sm font-bold text-red-700">{tr.deleteStore}</p>
                  <p className="text-xs text-red-500/70 mt-0.5">
                    {lang === 'ar' ? 'هذا الإجراء لا يمكن التراجع عنه' : 'This action cannot be undone'}
                  </p>
                </div>
                <button className="px-4 py-2 rounded-xl border-2 border-red-400 text-red-600 text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                  {tr.deleteStore}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
