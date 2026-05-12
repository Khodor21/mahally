"use client";
import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";

const navLinks = [
  { label: "المميزات", href: "#features" },
  { label: "الأسعار", href: "#pricing" },
  { label: "قصص نجاح", href: "#testimonials" },
  { label: "تواصل معنا", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 bg-white transition-all duration-300 ${
          scrolled ? "nav-scrolled" : "border-b border-[#E8E0D5]"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <div className="flex items-center justify-between h-[70px]">
            {/* CTA Buttons — Left side in RTL */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="#pricing"
                className="px-5 py-2.5 rounded-xl border-2 border-[#C8392B] text-[#C8392B] font-semibold text-sm transition-all duration-200 hover:bg-[#C8392B] hover:text-white"
              >
                تسجيل الدخول
              </a>
              <a
                href="#pricing"
                className="px-5 py-2.5 rounded-xl bg-[#C8392B] text-white font-semibold text-sm transition-all duration-200 hover:bg-[#a82e22] flex items-center gap-2 shadow-sm"
              >
                <span>←</span>
                <span>ابدأ مجاناً</span>
              </a>
            </div>

            {/* Nav Links — Center */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setActiveLink(link.href)}
                  className={`text-sm font-medium transition-all duration-200 pb-0.5 ${
                    activeLink === link.href
                      ? "text-[#C8392B] border-b-2 border-[#C8392B]"
                      : "text-[#1E1E1E] hover:text-[#C8392B]"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Logo — Right side in RTL */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-[#C8392B] rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg leading-none">
                    م
                  </span>
                </div>
                <span
                  className="text-2xl font-bold text-[#1E1E1E]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  محلي
                </span>
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-[#1E1E1E] hover:bg-[#FDF6EC] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="القائمة"
            >
              {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-[#E8E0D5] mobile-menu-enter">
            <div className="px-5 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setActiveLink(link.href);
                    setMobileOpen(false);
                  }}
                  className="text-base font-medium text-[#1E1E1E] hover:text-[#C8392B] transition-colors py-1"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-3 border-t border-[#E8E0D5]">
                <a
                  href="#pricing"
                  className="w-full text-center px-5 py-3 rounded-xl border-2 border-[#C8392B] text-[#C8392B] font-semibold transition-all hover:bg-[#C8392B] hover:text-white"
                >
                  تسجيل الدخول
                </a>
                <a
                  href="#pricing"
                  className="w-full text-center px-5 py-3 rounded-xl bg-[#C8392B] text-white font-semibold transition-all hover:bg-[#a82e22]"
                >
                  ← ابدأ مجاناً
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
