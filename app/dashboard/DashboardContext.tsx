"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { Language, NavItem } from "./types";
import { t } from "./i18n";

type Translations = typeof t.ar | typeof t.en;

interface DashboardContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  dir: "rtl" | "ltr";
  activeNav: NavItem;
  setActiveNav: (n: NavItem) => void;
  tr: Translations;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  const [lang, setLangState] = useState<Language>("ar");
  const [activeNav, setActiveNavState] = useState<NavItem>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // INIT FROM LOCALSTORAGE (CLIENT ONLY)
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language | null;
    const savedNav = localStorage.getItem("activeNav") as NavItem | null;

    if (savedLang) setLangState(savedLang);
    if (savedNav) setActiveNavState(savedNav);

    setMounted(true);
  }, []);

  // APPLY HTML ATTRIBUTES WHENEVER LANG CHANGES
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  // SET LANGUAGE + PERSIST
  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("lang", l);

    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  };

  // NAV + PERSIST
  const setActiveNav = (nav: NavItem) => {
    setActiveNavState(nav);
    localStorage.setItem("activeNav", nav);
  };

  const dir = lang === "ar" ? "rtl" : "ltr";
  const tr = t[lang];

  // prevent flash
  if (!mounted) return null;

  return (
    <DashboardContext.Provider
      value={{
        lang,
        setLang,
        dir,
        activeNav,
        setActiveNav,
        tr,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}
