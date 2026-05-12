const stats = [
  { value: '+2,000', label: 'تاجر', icon: '👥' },
  { value: '+50,000', label: 'طلب / شهر', icon: '📦' },
  { value: '4.9 ⭐', label: 'تقييم', icon: '' },
  { value: '98%', label: 'رضا', icon: '😍' },
];

const testimonials = [
  {
    stars: 5,
    quote: '"فتحت متجري بساعة وبعت أول طلب بنفس اليوم! ما توقعت يكون الموضوع سهل هيك."',
    name: 'أحمد خليل',
    business: 'صاحب متجر ملابس',
    city: 'طرابلس، لبنان',
    initials: 'أخ',
    color: 'bg-[#C8392B]',
  },
  {
    stars: 5,
    quote: '"كنت دافعة لمصمم كل شهر — هلق بتحكم بمتجري لحالي وبوفر مصاري كتير."',
    name: 'مايا سمعان',
    business: 'متجر مستحضرات تجميل',
    city: 'بيروت، لبنان',
    initials: 'مس',
    color: 'bg-[#2A5C45]',
  },
  {
    stars: 5,
    quote: '"الدعم الفني مرتاح — بيردوا بالواتساب وبيحلوا المشكلة بدقائق مش بأيام."',
    name: 'جو أبو عمر',
    business: 'متجر إلكترونيات',
    city: 'صيدا، لبنان',
    initials: 'جع',
    color: 'bg-[#E8A838]',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-white" id="testimonials">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-[#C8392B]/10 text-[#C8392B] rounded-full px-5 py-2 text-sm font-semibold mb-5">
            قصص النجاح
          </span>
          <h2
            className="text-[32px] md:text-[38px] font-bold text-[#1E1E1E] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            التجار اللبنانيين بحكوا
          </h2>
          <p className="text-[18px] text-[#6B6B6B] font-medium">
            مش كلامنا — كلام العالم اللي جربوا
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-[#FDF6EC] rounded-2xl p-5 text-center border border-[#E8E0D5]"
            >
              <p
                className="text-[28px] md:text-[32px] font-bold text-[#C8392B] mb-1"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {stat.value}
              </p>
              <p className="text-sm text-[#6B6B6B] font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="testimonial-card bg-[#FDF6EC] rounded-2xl p-7 border border-[#E8E0D5] flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5 flex-row-reverse justify-end">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <span key={si} className="text-[#E8A838] text-lg">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[15px] text-[#1E1E1E] leading-[1.85] mb-6 font-medium flex-1">
                {t.quote}
              </p>

              {/* Divider */}
              <div className="h-px bg-[#E8E0D5] mb-5" />

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">{t.initials}</span>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#1E1E1E]">{t.name}</p>
                  <p className="text-[13px] text-[#6B6B6B]">{t.business}</p>
                  <p className="text-[12px] text-[#C8392B] font-medium">📍 {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
