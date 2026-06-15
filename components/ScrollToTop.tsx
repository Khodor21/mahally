"use client";
import { useState, useEffect } from "react";
// Changed import to lucide-react
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (!visible) return null;

  return (
    <button
      onClick={scrollUp}
      aria-label="العودة للأعلى"
      className="fixed bottom-28 left-7 z-50 w-9 h-9 md:w-11 md:h-11 bg-white border border-[#E8E0D5] rounded-full shadow-lg flex items-center justify-center text-brand-dark hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Updated to use ArrowUp from lucide-react with the original size */}
      <ArrowUp size={18} />
    </button>
  );
}
