export default function ProblemSolution() {
  const problems = [
    "مصممين ومبرمجين بياخدوا مصاري كتير ووقت طويل",
    "منصات أجنبية ما بتفهم السوق اللبناني",
    "دفع بالدولار على كل شي وكل شهر",
    "ما في دعم فني بالعربي اللبناني",
    "متجرك ما بيشتغل صح على الموبايل",
  ];
  const solutions = [
    "متجر جاهز وشغال بدقيقتين",
    "أسعار بالليرة والدولار — بتناسب الجيب اللبناني",
    "دعم فني لبناني بالواتساب ٧/٢٤",
    "تصميم يشتغل تمام على الموبايل تلقائياً",
    "تكامل مع طرق الدفع والشحن اللبنانية",
  ];

  return (
    <section
      className="py-8 md:py-18 bg-brand-white overflow-hidden"
      id="why-us"
    >
      <div className="w-full mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-grey text-brand-dark text-xs font-medium mb-6">
            <span>✦</span>
            <span>ليش نحنا؟</span>
          </span>
          <h2
            className="text-[28px] md:text-[60px] text-brand-dark mb-4"
            style={{ fontFamily: "Lalezar, cursive" }}
          >
            في حل لكل مشكلة
          </h2>
          <p className="text-brand-light text-[13px] md:text-[15px] leading-[1.9] max-w-[600px] mx-auto">
            كلشي زهقت منه، عندنا جواب عليه
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-5 max-w-[900px] mx-auto items-center">
          {/* Problem Card */}
          <div className="bg-brand-grey border border-brand-white/50 rounded-[30px] p-6 md:p-8 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[44px] md:w-[52px] h-[44px] md:h-[52px] rounded-lg md:rounded-2xl bg-brand-grey border border-brand-light flex items-center justify-center text-[16px] md:text-[22px]">
                😩
              </div>
              <h3
                className="text-[18px] md:text-[22px] font-bold text-brand-dark leading-tight"
                style={{ fontFamily: "Lalezar, cursive" }}
              >
                زهقت من هيك؟
              </h3>
            </div>
            <ul className="space-y-4">
              {problems.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-[26px] h-[26px] rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-[12px] text-red-400 font-bold">
                    ✕
                  </div>
                  <span className="text-[14px] md:text-[15px] text-brand-dark/75 leading-[1.75] font-medium">
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider — Desktop */}
          <div className="hidden lg:flex flex-col items-center gap-3">
            <div className="w-px h-12 bg-brand-dark/10" />
            <div
              className="bg-brand-dark text-brand-white font-bold text-[13px] px-4 py-2.5 rounded-full text-center leading-tight"
              style={{ fontFamily: "Lalezar, cursive", fontSize: "15px" }}
            >
              في
              <br />
              حل ✦
            </div>
            <div className="w-px h-12 bg-brand-dark/10" />
          </div>

          {/* Divider — Mobile */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <div className="h-px flex-1 bg-brand-dark/10" />
            <div
              className="bg-brand-dark text-white px-5 py-2 rounded-full text-[14px] font-bold"
              style={{ fontFamily: "Lalezar, cursive" }}
            >
              في حل ✦
            </div>
            <div className="h-px flex-1 bg-brand-dark/10" />
          </div>

          {/* Solution Card */}
          <div className="bg-brand-dark rounded-[30px] p-6 md:p-8 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[44px] md:w-[52px] h-[44px] md:h-[52px] rounded-lg md:rounded-2xl bg-white/10 flex items-center justify-center text-[16px] md:text-[22px]">
                ✨
              </div>
              <h3
                className="text-[22px] font-bold text-white leading-tight"
                style={{ fontFamily: "Lalezar, cursive" }}
              >
                معنا الموضوع غير
              </h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-[26px] h-[26px] rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path
                        d="M1 4.5L4 7.5L11 1"
                        stroke="#A8F5C2"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-[14px] md:text-[15px] text-white/85 leading-[1.75] font-medium">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
