const steps = [
  {
    number: "١",
    title: "سجّل حسابك",
    body: "30 ثانية وخلصت — بس اسمك، إيميلك، ورقم تليفونك",
    icon: "/icons/user.svg",
  },
  {
    number: "٢",
    title: "اختار قالب متجرك",
    body: "تصفّح القوالب الجاهزة واختار التصميم اللي بناسب هويتك",
    icon: "/icons/website.svg",
  },
  {
    number: "٣",
    title: "ضيف منتجاتك",
    body: "أضف الصور والأسعار والوصف بسهولة ومن دون أي تعقيد",
    icon: "/icons/box.svg",
  },
  {
    number: "٤",
    title: "ابدأ البيع",
    body: "شارك رابط متجرك واستقبل الطلبات مباشرة من أول يوم",
    icon: "/icons/click.svg",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-brand-white overflow-hidden">
      <div className="w-full mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center mb- md:mb-20">
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-brand-light text-brand-dark text-xs font-medium mb-6">
            كيف بتشتغل المنصة
          </span>

          <h2
            className="text-[28px] md:text-[60px] leading-[1.2] text-brand-dark mb-2"
            style={{ fontFamily: "Lalezar, cursive" }}
          >
            متجرك جاهز خلال دقائق
          </h2>

          <p className="text-brand-dark/70 text-[13px] md:text-[15px] max-w-[620px] mx-auto">
            كل شي مصمم ليكون سريع، واضح، وسهل حتى لو أول مرة بتنشئ متجر إلكتروني
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop line */}
          <div className="hidden lg:block absolute top-[52px] right-[12%] left-[12%] h-[1px] bg-brand-light" />

          {/* Mobile vertical line */}
          <div className="absolute top-0 bottom-0 right-[43px] w-[1px] bg-brand-light lg:hidden" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex lg:flex-col items-start lg:items-center text-right lg:text-center gap-5 lg:gap-0"
              >
                {/* Number */}
                <div className="relative z-10 shrink-0 lg:mb-8">
                  <div className="w-[68px] h-[68px] md:w-[86px] md:h-[86px] rounded-[28px] border border-brand-light bg-brand-white flex items-center justify-center shadow-sm">
                    <span className="text-[24px] md:text-[30px] font-bold text-brand-dark">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="absolute -bottom-2 -left-2 w-[38px] h-[38px] rounded-full bg-brand-grey border border-brand-light flex items-center justify-center">
                    <img
                      src={step.icon}
                      alt={step.title}
                      className="md:w-4 md:h-4 w-3 h-3 object-contain"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="pt-2 lg:pt-0">
                  <h3 className="text-[18px] md:text-[21px] font-bold text-brand-dark mb-2">
                    {step.title}
                  </h3>

                  <p className="text-[13px] md:text-[15px] text-brand-dark/70 max-w-[260px]">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-8 md:mt-12">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center h-[50px] md:h-[58px] px-6 md:px-10 rounded-2xl bg-brand-dark text-brand-white text-[14px] md:text-[17px] font-bold transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
          >
            أنشئ متجرك الآن
          </a>
        </div>
      </div>
    </section>
  );
}
