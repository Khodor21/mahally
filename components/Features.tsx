import Image from "next/image";

const features = [
  {
    icon: "/icons/click.svg",
    title: "ابني متجرك بدون كود",
    body: "اختار قالب، عدّل عليه، وابدأ البيع خلال دقائق بسهولة كاملة.",
  },
  {
    icon: "/icons/devices.svg",
    title: "متوافق مع كل الأجهزة",
    body: "متجرك بيظهر بشكل احترافي على الموبايل، التابلت، والكمبيوتر.",
  },
  {
    icon: "/icons/pay.svg",
    title: "طرق دفع متعددة",
    body: "ادعم OMT، Whish، الدفع عند الاستلام، والبطاقات بسهولة.",
  },
  {
    icon: "/icons/affiliate.svg",
    title: "برنامج أفلييت وتسويق",
    body: "وفّر مسوقين يساعدوا متجرك يبيع أكتر مقابل عمولات تلقائية.",
  },
  {
    icon: "/icons/stats.svg",
    title: "إحصائيات واضحة",
    body: "تابع المبيعات، المنتجات الأكثر طلباً، وأداء متجرك بلحظة.",
  },
  {
    icon: "/icons/google.svg",
    title: "جاهز لـ Google",
    body: "أدوات SEO مدمجة تساعد متجرك يوصل لنتائج بحث أفضل.",
  },
  {
    icon: "/icons/website.svg",
    title: "قوالب احترافية",
    body: "قوالب جاهزة لكل أنواع المتاجر مع تخصيص كامل بسهولة.",
  },
  {
    icon: "/icons/box.svg",
    title: "إدارة مخزون ذكية",
    body: "تحكم بالكميات، المنتجات، والتنبيهات من لوحة واحدة.",
  },
  {
    icon: "/icons/comments.svg",
    title: "دعم لبناني سريع",
    body: "فريقنا جاهز يساعدك عبر واتساب والشات بالعربي اللبناني.",
  },
  {
    icon: "/icons/social.svg",
    title: "بيع عبر السوشيال",
    body: "اربط متجرك بإنستغرام وفيسبوك وخلي الشراء أسهل.",
  },
  {
    icon: "/icons/languages.svg",
    title: "عربي وإنجليزي",
    body: "متجرك يدعم اللغتين لتبيع محلياً وعالمياً بسهولة.",
  },
  {
    icon: "/icons/shield.svg",
    title: "حماية وأمان كامل",
    body: "SSL مجاني وحماية كاملة لبياناتك وطلبات زبائنك.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-8 md:py-18 bg-brand-light overflow-hidden"
    >
      <div className="w-full mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-brand-white text-brand-dark text-xs font-medium mb-6">
            المميزات
          </span>

          <h2
            className="text-[28px] md:text-[60px] leading-[1.15] text-brand-dark mb-4"
            style={{ fontFamily: "Lalezar, cursive" }}
          >
            كل اللي تحتاجه لتبيع أونلاين
          </h2>

          <p className="text-brand-dark/70 text-[13px] md:text-[15px] max-w-[700px] mx-auto">
            أدوات احترافية، تصميم سريع، وتجربة سهلة تساعدك تطلق متجرك بدون تعقيد
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-brand-white border border-brand-white/50 rounded-[30px] p-5 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-dark/10 hover:shadow-[0_10px_40px_rgba(0,0,0,0.05)]"
            >
              {/* Icon */}
              <div className="w-12 h-12 md:w-[58px] md:h-[58px] rounded-2xl bg-brand-grey border border-brand-light flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={24}
                  height={24}
                  className="object-contain w-6 h-6 md:w-7 md:h-7"
                />
              </div>

              {/* Title */}
              <h3 className="text-[16px] md:text-[19px] font-bold text-brand-dark leading-[1.5] mb-3">
                {feature.title}
              </h3>

              {/* Body */}
              <p className="text-[12px] md:text-[14px] leading-[1.9] text-brand-dark/70">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
