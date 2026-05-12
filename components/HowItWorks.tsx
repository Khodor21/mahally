const steps = [
  {
    number: '١',
    numberEn: 1,
    title: 'سجّل حسابك',
    body: '30 ثانية وخلصت — بس اسمك، إيميلك، ورقم تليفونك',
    icon: '👤',
    color: 'bg-[#C8392B]',
  },
  {
    number: '٢',
    numberEn: 2,
    title: 'اختار قالب متجرك',
    body: 'عشرات القوالب الجاهزة — اختار وعدّل اللي بيعجبك',
    icon: '🎨',
    color: 'bg-[#E8A838]',
  },
  {
    number: '٣',
    numberEn: 3,
    title: 'ضيف منتجاتك',
    body: 'صور، أسعار، أوصاف — كل شي بيتضاف بثواني',
    icon: '📦',
    color: 'bg-[#2A5C45]',
  },
  {
    number: '٤',
    numberEn: 4,
    title: 'ابدأ تبيع! 🎉',
    body: 'شارك رابط متجرك وابدأ تستقبل طلبات من أول يوم',
    icon: '🚀',
    color: 'bg-[#C8392B]',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-white" id="how-it-works">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-[#C8392B]/10 text-[#C8392B] rounded-full px-5 py-2 text-sm font-semibold mb-5">
            كيف بتشتغل
          </span>
          <h2
            className="text-[32px] md:text-[38px] font-bold text-[#1E1E1E] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            في 4 خطوات — متجرك شغال
          </h2>
          <p className="text-[18px] text-[#6B6B6B] font-medium">
            أبسط من ما بتفكر
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-[52px] right-[10%] left-[10%] h-0.5">
            <div className="h-full bg-gradient-to-l from-[#C8392B]/20 via-[#E8A838]/40 to-[#C8392B]/20" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                {/* Number circle */}
                <div className="relative z-10 mb-6">
                  <div className={`w-[64px] h-[64px] rounded-2xl ${step.color} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1`}>
                    <span className="text-white font-bold text-2xl">{step.number}</span>
                  </div>
                  {/* Step icon badge */}
                  <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-white rounded-full border-2 border-[#E8E0D5] flex items-center justify-center text-base shadow-sm">
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <h3
                  className="text-[18px] font-bold text-[#1E1E1E] mb-3"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {step.title}
                </h3>
                <p className="text-[14px] text-[#6B6B6B] leading-[1.75] max-w-[220px]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <a
            href="#pricing"
            className="inline-flex items-center gap-3 bg-[#C8392B] hover:bg-[#a82e22] text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg shadow-[#C8392B]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#C8392B]/35 hover:-translate-y-0.5"
          >
            <span>ابدأ هلق — مجاني</span>
            <span>←</span>
          </a>
        </div>
      </div>
    </section>
  );
}
