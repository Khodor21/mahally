export default function ProblemSolution() {
  const problems = [
    'مصممين ومبرمجين بياخدوا مصاري كتير ووقت طويل',
    'منصات أجنبية ما بتفهم السوق اللبناني',
    'دفع بالدولار على كل شي وكل شهر',
    'ما في دعم فني بالعربي اللبناني',
    'متجرك ما بيشتغل صح على الموبايل',
  ];

  const solutions = [
    'متجر جاهز وشغال بدقيقتين',
    'أسعار بالليرة والدولار — بتناسب الجيب اللبناني',
    'دعم فني لبناني بالواتساب ٧/٢٤',
    'تصميم يشتغل تمام على الموبايل تلقائياً',
    'تكامل مع طرق الدفع والشحن اللبنانية',
  ];

  return (
    <section className="py-20 md:py-28 bg-white" id="why-us">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        {/* Section label */}
        <div className="text-center mb-14">
          <span className="inline-block bg-[#C8392B]/10 text-[#C8392B] rounded-full px-5 py-2 text-sm font-semibold mb-4">
            ليش نحنا؟
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-6 items-center">
          
          {/* Problem Side */}
          <div className="bg-[#FDF6EC] rounded-2xl p-7 md:p-9 border border-[#E8E0D5]">
            <h2
              className="text-2xl md:text-[28px] font-bold text-[#1E1E1E] mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              😩 زهقت من هيك؟
            </h2>
            <ul className="space-y-4">
              {problems.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-lg mt-0.5 flex-shrink-0">😩</span>
                  <span className="text-[15px] text-[#1E1E1E] leading-[1.7] font-medium">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider Arrow */}
          <div className="flex lg:flex-col items-center justify-center gap-3 py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="hidden lg:block w-px h-16 bg-gradient-to-b from-transparent via-[#E8E0D5] to-transparent" />
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-[#C8392B] rounded-full flex flex-col items-center justify-center shadow-lg shadow-[#C8392B]/30 flex-shrink-0">
                <span className="text-white text-lg font-bold leading-none">في</span>
                <span className="text-white text-xs font-semibold">حل!</span>
              </div>
              <div className="hidden lg:block w-px h-16 bg-gradient-to-b from-transparent via-[#E8E0D5] to-transparent" />
            </div>
            {/* horizontal arrows for mobile */}
            <div className="lg:hidden flex gap-1 text-[#C8392B] text-2xl font-bold">
              <span>↓</span>
            </div>
          </div>

          {/* Solution Side */}
          <div className="bg-[#2A5C45] rounded-2xl p-7 md:p-9">
            <h2
              className="text-2xl md:text-[28px] font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ✨ معنا الموضوع غير:
            </h2>
            <ul className="space-y-4">
              {solutions.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#2ECC71] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[15px] text-white/90 leading-[1.7] font-medium">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
