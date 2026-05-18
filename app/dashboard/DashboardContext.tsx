"use client"
import { createContext, useContext, useState, ReactNode } from 'react'
import type { Language, NavItem } from './types'
import { t } from './i18n'

type Translations = typeof t.ar | typeof t.en

interface DashboardContextValue {
  lang: Language
  setLang: (l: Language) => void
  dir: 'rtl' | 'ltr'
  activeNav: NavItem
  setActiveNav: (n: NavItem) => void
  tr: Translations
  isSidebarOpen: boolean
  setIsSidebarOpen: (v: boolean) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar')
  const [activeNav, setActiveNav] = useState<NavItem>('home')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const setLang = (l: Language) => {
    setLangState(l)
    document.documentElement.lang = l
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
  }

  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const tr = t[lang]

  return (
    <DashboardContext.Provider
      value={{ lang, setLang, dir, activeNav, setActiveNav, tr, isSidebarOpen, setIsSidebarOpen }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider')
  return ctx
}
