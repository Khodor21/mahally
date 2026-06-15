"use client";

import { Play, ShieldCheck, Star, Users } from "lucide-react";

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

                {/* Mobile phone mockup... (keep rest of static design) */}

                {/* Floating success/stats notifications... (keep rest of static design) */}
              </div>
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="w-full lg:w-1/2 text-right">
            <div className="inline-flex items-center gap-2 bg-[#3c1c54]/10 text-[#3c1c54] rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold">
                🇱🇧 المنصة اللبنانية الأولى للتجارة الإلكترونية
              </span>
            </div>

            <h1 className="text-[42px] md:text-[52px] lg:text-[56px] font-bold text-[#3c1c54] leading-[1.15] mb-6">
              افتح متجرك الإلكتروني
              <br />
              <span className="gradient-text">بدقيقتين — من لبنان للعالم</span>
            </h1>

            <p className="text-[18px] text-[#6B6B6B] leading-[1.75] mb-8 font-medium">
              مش محتاج خبرة، مش محتاج مبرمج، <br />
              ومش محتاج ميزانية كبيرة. <br />
              <span className="text-color font-semibold">
                ابني متجرك هلق وابدأ تبيع من اليوم.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <a
                href="#pricing"
                className="group flex items-center gap-3 bg-[#3c1c54] text-white font-bold text-lg px-4 py-2 rounded shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>ابدأ تجربتك المجانية</span>
                <span className="transition-transform group-hover:-translate-x-1">
                  ←
                </span>
              </a>
              <button className="flex items-center gap-3 text-[#1E1E1E] font-semibold text-base hover:text-[#3c1c54] transition-colors group px-2 py-4">
                <div className="w-11 h-11 rounded-full bg-white border-2 border-[#E8E0D5] group-hover:border-[#3c1c54] flex items-center justify-center transition-colors shadow-sm">
                  {/* Updated Play Icon */}
                  <Play
                    className="text-[#3c1c54] fill-[#3c1c54] mr-[-2px]"
                    size={16}
                  />
                </div>
                <span>شوف كيف بتشتغل</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-[#6B6B6B]">
              <div className="flex items-center gap-2">
                <Users className="text-[#C8392B] flex-shrink-0" size={16} />
                <span>
                  أكتر من <strong className="text-[#1E1E1E]">2,000</strong> تاجر
                  لبناني شغالين هلق
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="text-[#E8A838] flex-shrink-0" size={16} />
                <span>
                  تقييم <strong className="text-[#1E1E1E]">4.9</strong> من
                  التجار
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck
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
