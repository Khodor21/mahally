"use client";

import { useEffect, useState } from "react";
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
      setScrolled(window.scrollY > 16);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-brand-white/90 backdrop-blur-xl border-b border-brand-light shadow-[0_4px_30px_rgba(0,0,0,0.04)]"
            : "bg-brand-white border-b border-brand-light"
        }`}
      >
        <div className="w-full mx-auto px-5 md:px-10">
          <div className="h-[60px] md:h-[74px] flex items-center justify-between">
            {/* Right Side */}
            <div className="flex items-center gap-12">
              {/* Logo */}
              <a href="#" className="flex items-center gap-3 shrink-0">
                <img
                  alt="logo here"
                  src="/Logo.svg"
                  className="w-16 h-16 md:w-32 md:h-32"
                />
              </a>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-8">
                {navLinks.map((link) => {
                  const active = activeLink === link.href;

                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setActiveLink(link.href)}
                      className={`relative text-sm font-medium transition-all duration-200 ${
                        active
                          ? "text-brand-dark"
                          : "text-brand-dark/70 hover:text-brand-dark"
                      }`}
                    >
                      {link.label}

                      <span
                        className={`absolute -bottom-[10px] right-0 h-[2px] bg-brand-dark rounded-full transition-all duration-300 ${
                          active ? "w-full" : "w-0"
                        }`}
                      />
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Left Side */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="#login"
                className="h-[48px] px-6 rounded-2xl border border-brand-light text-brand-dark text-sm font-semibold flex items-center justify-center transition-all duration-300 hover:bg-brand-grey"
              >
                تسجيل الدخول
              </a>

              <a
                href="#pricing"
                className="h-[48px] px-6 rounded-2xl bg-brand-dark text-brand-white text-sm font-bold flex items-center justify-center transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
              >
                أنشئ متجرك الآن
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 rounded-2xl border border-brand-light bg-brand-white text-brand-dark flex items-center justify-center transition-all duration-200"
              aria-label="القائمة"
            >
              {mobileOpen ? <FiX size={16} /> : <FiMenu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? "max-h-[500px] border-t border-brand-light" : "max-h-0"
          }`}
        >
          <div className="bg-brand-white px-5 py-5">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setActiveLink(link.href);
                    setMobileOpen(false);
                  }}
                  className="h-[42px] px-4 rounded-2xl flex items-center text-brand-dark font-medium transition-all duration-200 hover:bg-brand-grey text-sm"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Mobile CTA */}
            <div className="flex flex-col gap-3 pt-5 mt-5 border-t border-brand-light">
              <a
                href="#login"
                className="h-[40px] rounded-xl text-xs border border-brand-light text-brand-dark font-semibold flex items-center justify-center"
              >
                تسجيل الدخول
              </a>

              <a
                href="#pricing"
                className="h-[40px] rounded-xl text-xs bg-brand-dark text-brand-white font-bold flex items-center justify-center"
              >
                أنشئ متجرك الآن
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
