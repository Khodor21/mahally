const categories = [
  {
    label: 'طرق الدفع',
    icon: '💳',
    items: [
      { name: 'OMT', emoji: '🏦', color: 'bg-orange-50 border-orange-200' },
      { name: 'WhishMoney', emoji: '💜', color: 'bg-purple-50 border-purple-200' },
      { name: 'Visa', emoji: '💳', color: 'bg-blue-50 border-blue-200' },
      { name: 'Mastercard', emoji: '🔴', color: 'bg-red-50 border-red-200' },
      { name: 'كاش عند الاستلام', emoji: '💵', color: 'bg-green-50 border-green-200' },
      { name: 'PayPal', emoji: '🅿️', color: 'bg-sky-50 border-sky-200' },
    ],
  },
  {
    label: 'الشحن والتوصيل',
    icon: '🚚',
    items: [
      { name: 'Aramex', emoji: '📦', color: 'bg-orange-50 border-orange-200' },
      { name: 'Toters', emoji: '🛵', color: 'bg-yellow-50 border-yellow-200' },
      { name: 'Allo Beirut', emoji: '🏙️', color: 'bg-red-50 border-red-200' },
      { name: 'Borzo', emoji: '🚀', color: 'bg-indigo-50 border-indigo-200' },
    ],
  },
  {
    label: 'التسويق والإعلانات',
    icon: '📣',
    items: [
      { name: 'Meta / Facebook', emoji: '📘', color: 'bg-blue-50 border-blue-200' },
      { name: 'Google Ads', emoji: '🎯', color: 'bg-green-50 border-green-200' },
      { name: 'TikTok Ads', emoji: '🎵', color: 'bg-slate-50 border-slate-200' },
      { name: 'Mailchimp', emoji: '📧', color: 'bg-yellow-50 border-yellow-200' },
    ],
  },
  {
    label: 'التحليلات',
    icon: '📊',
    items: [
      { name: 'Google Analytics', emoji: '📈', color: 'bg-orange-50 border-orange-200' },
      { name: 'Meta Pixel', emoji: '🔵', color: 'bg-blue-50 border-blue-200' },
      { name: 'Hotjar', emoji: '🔥', color: 'bg-red-50 border-red-200' },
    ],
  },
];

export default function Integrations() {
  return (
    <section className="py-20 md:py-28 bg-[#FDF6EC]" id="integrations">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-[#C8392B]/10 text-[#C8392B] rounded-full px-5 py-2 text-sm font-semibold mb-5">
            التكاملات
          </span>
          <h2
            className="text-[32px] md:text-[38px] font-bold text-[#1E1E1E] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            متصل بكل اللي بتحتاجه
          </h2>
          <p className="text-[18px] text-[#6B6B6B] font-medium">
            من الدفع للشحن للتسويق — كل شي مربوط
          </p>
        </div>

        <div className="space-y-10">
          {categories.map((cat, ci) => (
            <div key={ci}>
              {/* Category label */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xl">{cat.icon}</span>
                <h3
                  className="text-[17px] font-bold text-[#1E1E1E]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {cat.label}
                </h3>
                <div className="flex-1 h-px bg-[#E8E0D5]" />
              </div>

              {/* Items grid */}
              <div className="flex flex-wrap gap-3">
                {cat.items.map((item, ii) => (
                  <div
                    key={ii}
                    className={`integration-logo flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${item.color} cursor-default`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-sm font-semibold text-[#1E1E1E]">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <p className="text-[#6B6B6B] text-[15px] mb-4">
            ما لاقيت التكامل اللي بدك؟
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-[#C8392B] font-semibold hover:underline transition-colors"
          >
            <span>تواصل معنا وبنضيفه</span>
            <span>←</span>
          </a>
        </div>
      </div>
    </section>
  );
}
