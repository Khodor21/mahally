import { FiPlay } from "react-icons/fi";
import { BsShieldCheck, BsStar, BsPeople } from "react-icons/bs";

export default function Hero() {
  return (
    <section
      className="pt-[90px] pb-20 md:pb-28 overflow-hidden bg-[#cfc3df]"
      id="hero"
    >
      <div className="mx-auto px-5 md:px-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Visual Mockup */}
          <div className="w-full lg:w-1/2 flex justify-center items-center relative">
            <div className="relative w-full max-w-[480px]">
              {/* Glow effect behind */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#C8392B]/10 to-[#E8A838]/15 rounded-3xl blur-3xl scale-110" />

              {/* Laptop mockup */}
              <div className="relative z-10">
                <div className="bg-[#1E1E1E] rounded-2xl p-3 shadow-2xl">
                  {/* Laptop top bar */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-3 h-3 rounded-full bg-[#C8392B]" />
                    <div className="w-3 h-3 rounded-full bg-[#E8A838]" />
                    <div className="w-3 h-3 rounded-full bg-[#2ECC71]" />
                    <div className="flex-1 bg-[#2a2a2a] rounded-full h-5 mx-4 flex items-center px-3">
                      <span className="text-[#6B6B6B] text-[10px]">
                        متجرك.محلي.lb
                      </span>
                    </div>
                  </div>

                  {/* Store preview */}
                  <div className="bg-white rounded-xl overflow-hidden">
                    {/* Store header */}
                    <div className="bg-[#C8392B] px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            م
                          </span>
                        </div>
                        <span className="text-white text-sm font-semibold">
                          متجر نور
                        </span>
                      </div>
                      <div className="flex gap-2 text-white/80 text-xs">
                        <span>الرئيسية</span>
                        <span>المنتجات</span>
                        <span>تواصل</span>
                      </div>
                    </div>

                    {/* Hero banner */}
                    <div className="bg-gradient-to-br from-[#FDF6EC] to-[#f5e8d0] px-4 py-5 text-center">
                      <p className="text-[#C8392B] text-xs font-semibold mb-1">
                        🌸 مجموعة الصيف الجديدة
                      </p>
                      <h3 className="text-[#1E1E1E] text-sm font-bold mb-2">
                        أزياء لبنانية أصيلة
                      </h3>
                      <button className="bg-[#C8392B] text-white text-xs px-4 py-1.5 rounded-lg">
                        تسوّق هلق
                      </button>
                    </div>

                    {/* Products grid */}
                    <div className="grid grid-cols-3 gap-2 p-3">
                      {[
                        {
                          name: "فستان صيفي",
                          price: "150,000 ل.ل",
                          color: "from-pink-100 to-pink-200",
                        },
                        {
                          name: "بلوزة كتان",
                          price: "90,000 ل.ل",
                          color: "from-amber-100 to-amber-200",
                        },
                        {
                          name: "حقيبة يد",
                          price: "200,000 ل.ل",
                          color: "from-emerald-100 to-emerald-200",
                        },
                      ].map((p, i) => (
                        <div
                          key={i}
                          className="rounded-lg overflow-hidden border border-[#E8E0D5]"
                        >
                          <div
                            className={`h-14 bg-gradient-to-br ${p.color} flex items-center justify-center`}
                          >
                            <span className="text-2xl">
                              {["👗", "👚", "👜"][i]}
                            </span>
                          </div>
                          <div className="p-1.5">
                            <p className="text-[9px] font-semibold text-[#1E1E1E] leading-tight">
                              {p.name}
                            </p>
                            <p className="text-[8px] text-[#C8392B] font-bold mt-0.5">
                              {p.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile phone mockup */}
                <div className="absolute -bottom-6 -left-6 w-[110px] bg-[#1E1E1E] rounded-2xl p-1.5 shadow-2xl border-2 border-[#2a2a2a]">
                  <div className="bg-white rounded-xl overflow-hidden">
                    <div className="bg-[#C8392B] h-8 flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">
                        متجر نور
                      </span>
                    </div>
                    <div className="p-1.5 space-y-1.5">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex gap-1.5 items-center">
                          <div className="w-8 h-8 bg-[#FDF6EC] rounded-lg flex items-center justify-center text-sm">
                            {i === 1 ? "👗" : "👜"}
                          </div>
                          <div>
                            <div className="w-12 h-1.5 bg-[#E8E0D5] rounded mb-1" />
                            <div className="w-8 h-1.5 bg-[#C8392B]/30 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating success notification */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl p-2.5 shadow-lg border border-[#E8E0D5] flex items-center gap-2 min-w-[150px]">
                  <div className="w-8 h-8 bg-[#2ECC71]/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🎉</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#1E1E1E]">
                      طلب جديد!
                    </p>
                    <p className="text-[9px] text-[#6B6B6B]">فستان صيفي × 2</p>
                    <p className="text-[9px] text-[#2ECC71] font-semibold">
                      +300,000 ل.ل
                    </p>
                  </div>
                </div>

                {/* Floating stats */}
                <div className="absolute bottom-8 -right-5 bg-white rounded-xl p-2.5 shadow-lg border border-[#E8E0D5]">
                  <p className="text-[9px] text-[#6B6B6B] mb-1">مبيعات اليوم</p>
                  <p className="text-sm font-bold text-[#C8392B]">2.4M ل.ل</p>
                  <p className="text-[8px] text-[#2ECC71]">↑ 24% من أمس</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="w-full lg:w-1/2 text-right">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#3c1c54]/10 text-[#3c1c54] rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold">
                🇱🇧 المنصة اللبنانية الأولى للتجارة الإلكترونية
              </span>
            </div>

            {/* Main title */}
            <h1
              className="text-[42px] md:text-[52px] lg:text-[56px] font-bold text-[#3c1c54] leading-[1.15] mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              افتح متجرك الإلكتروني
              <br />
              <span className="gradient-text">بدقيقتين — من لبنان للعالم</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[18px] text-[#6B6B6B] leading-[1.75] mb-8 font-medium">
              مش محتاج خبرة، مش محتاج مبرمج，
              <br />
              ومش محتاج ميزانية كبيرة.
              <br />
              <span className="text-color font-semibold">
                ابني متجرك هلق وابدأ تبيع من اليوم.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <a
                href="#pricing"
                className="group flex items-center gap-3 bg-[#3c1c54] hover:bg-[#3c1c54] text-white font-bold text-lg px-4 py-2 rounded shadow-lg shadow-[#3c1c54]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#3c1c54]/35 hover:-translate-y-0.5"
              >
                <span>ابدأ تجربتك المجانية</span>
                <span className="transition-transform group-hover:-translate-x-1">
                  ←
                </span>
              </a>
              <button className="flex items-center gap-3 text-[#1E1E1E] font-semibold text-base hover:text-[#3c1c54] transition-colors group px-2 py-4">
                <div className="w-11 h-11 rounded-full bg-white border-2 border-[#E8E0D5] group-hover:border-[#3c1c54] flex items-center justify-center transition-colors shadow-sm">
                  <FiPlay className="text-[#3c1c54] mr-[-2px]" size={16} />
                </div>
                <span>شوف كيف بتشتغل</span>
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-[#6B6B6B]">
              <div className="flex items-center gap-2">
                <BsPeople className="text-[#C8392B] flex-shrink-0" size={16} />
                <span>
                  أكتر من <strong className="text-[#1E1E1E]">2,000</strong> تاجر
                  لبناني شغالين هلق
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BsStar className="text-[#E8A838] flex-shrink-0" size={16} />
                <span>
                  تقييم <strong className="text-[#1E1E1E]">4.9</strong> من
                  التجار
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BsShieldCheck
                  className="text-[#2ECC71] flex-shrink-0"
                  size={16}
                />
                <span>
                  بدون دفعة مسبقة{" "}
                  <strong className="text-[#1E1E1E]">14 يوم</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
