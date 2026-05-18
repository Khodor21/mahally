"use client"

import { useDashboard } from './DashboardContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import HomePanel from './panels/HomePanel'
import OrdersPanel from './panels/OrdersPanel'
import ProductsPanel from './panels/ProductsPanel'
import CustomersPanel from './panels/CustomersPanel'
import AnalyticsPanel from './panels/AnalyticsPanel'
import SettingsPanel from './panels/SettingsPanel'
import CouponsPanel from './panels/CouponsPanel'
import OccasionsPanel from './panels/OccasionsPanel'
import PartnershipsPanel from './panels/PartnershipsPanel'

export default function Dashboard() {
  const { activeNav, setActiveNav, lang } = useDashboard()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const renderPanel = () => {
    switch (activeNav) {
      case 'home':
        return <HomePanel setActiveNav={setActiveNav} />
      case 'orders':
        return <OrdersPanel />
      case 'products':
        return <ProductsPanel />
      case 'customers':
        return <CustomersPanel />
      case 'analytics':
        return <AnalyticsPanel />
      case 'settings':
        return <SettingsPanel />
      case 'coupons':
        return <CouponsPanel />
      case 'occasions':
        return <OccasionsPanel />
      case 'partnerships':
        return <PartnershipsPanel />
      default:
        return <HomePanel setActiveNav={setActiveNav} />
    }
  }

  return (
    <div className="min-h-screen w-screen bg-white" dir={dir}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div
        className={`transition-all duration-300 ${
          dir === 'rtl' ? 'md:me-64' : 'md:ms-64'
        }`}
      >
        <Topbar />
        <main className="p-5 md:p-8 min-h-[calc(100vh-64px)] bg-[rgb(244_242_245)]/30">
          <div key={activeNav} className="animate-fade-in">
            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  )
}
