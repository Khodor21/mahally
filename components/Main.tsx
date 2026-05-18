import {FaWhatsapp} from "react-icons/fa"
export default function FinalCTA() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden py-16 md:py-18 bg-brand-dark"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradient glow */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-brand-light/10 blur-3xl translate-x-1/3 -translate-y-1/3" />

        <div className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full bg-brand-white/5 blur-3xl -translate-x-1/3 translate-y-1/3" />

        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:18px_18px]" />

        {/* Huge Text */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] md:text-[220px] text-brand-white/[0.03] leading-none select-none"
          style={{ fontFamily: "Lalezar, cursive" }}
        >
          محلي
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mt-8 w-full mx-auto px-5 md:px-10">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-light text-brand-dark rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-semibold">
              🇱🇧 المنصة اللبنانية الأفضل للتجارة الإلكترونية
            </span>
          </div>

          {/* Heading */}
          <h2
            className="text-[42px] sm:text-[52px] md:text-[84px] leading-[1.05] text-brand-white mb-5"
            style={{ fontFamily: "Lalezar, cursive" }}
            dir="rtl"
          >
            افتح متجرك الإلكتروني
            <br />
            خلال ثواني!
          </h2>

          {/* Description */}
          <p className="text-brand-light text-[14px] md:text-[18px] max-w-[700px] mx-auto mb-10">
            أنشئ متجرك الإلكتروني، أضف منتجاتك، وابدأ تستقبل الطلبات بسهولة —
            بدون تعقيد وبدون خبرة تقنية.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/onboarding"
              className="w-full sm:w-auto h-[52px] md:h-[58px] px-8 rounded-2xl bg-brand-white text-brand-dark text-[14px] md:text-[16px] font-bold flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:opacity-90"
            >
              أنشـئ متجرك الآن
            </a>

             <a
            href="https://wa.me/+96171708103"
            target="_blank"
            rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1 sm:w-auto h-[52px] md:h-[58px] px-8 rounded-2xl border border-brand-white/15 bg-brand-white/5 backdrop-blur-sm text-brand-white text-[14px] md:text-[16px] font-semibold flex items-center justify-center transition-all duration-300 hover:bg-brand-white/10"
          >
            <FaWhatsapp size={18} />
            تواصل معنا
          </a>
          </div>

          {/* Trust Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-10 text-brand-light text-sm md:text-[15px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-light" />
              <span>إطلاق سريع خلال دقائق</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-light" />
              <span>دعم لبناني مباشر</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-light" />
              <span>بدون أي خبرة تقنية</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-light" />
              <span>بدون دفعة مسبقة</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
