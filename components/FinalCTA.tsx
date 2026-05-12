export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden" id="contact" style={{ background: 'linear-gradient(135deg, #C8392B 0%, #a82e22 60%, #8a2218 100%)' }}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/4 w-[200px] h-[200px] bg-[#E8A838]/10 rounded-full -translate-y-1/2" />
        {/* Lebanese flag accent */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/5 text-[200px] select-none font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          🇱🇧
        </div>
      </div>

      <div className="relative z-10 max-w-[700px] mx-auto px-5 md:px-10 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white rounded-full px-5 py-2 text-sm font-semibold mb-8">
          <span>🚀</span>
          <span>جاهز تبدأ؟</span>
        </div>

        {/* Main title */}
        <h2
          className="text-[38px] md:text-[50px] font-bold text-white leading-[1.2] mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          افتح متجرك هلق
          <br />
          <span className="text-[#E8A838]">وابدأ تبيع من اليوم</span>
        </h2>

        {/* Subtitle */}
        <p className="text-[18px] text-white/80 font-medium leading-[1.75] mb-10">
          أكتر من 2,000 تاجر لبناني بدأوا هيك —
          <br />
          <strong className="text-white">هلق دورك!</strong>
        </p>

        {/* CTA */}
        <a
          href="#pricing"
          className="inline-flex items-center gap-3 bg-white text-[#C8392B] font-bold text-lg px-10 py-5 rounded-xl shadow-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] group"
        >
          <span>ابدأ مجاناً — بدون بطاقة ائتمانية</span>
          <span className="transition-transform group-hover:-translate-x-1">←</span>
        </a>

        {/* Trust microcopy */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <span className="text-[#2ECC71]">✅</span>
            <span>مجاني 14 يوم</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="text-[#2ECC71]">✅</span>
            <span>إلغاء بأي وقت</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="text-[#2ECC71]">✅</span>
            <span>متجرك جاهز بدقيقتين</span>
          </div>
        </div>
      </div>
    </section>
  );
}
