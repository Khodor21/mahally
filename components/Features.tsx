const features = [
  {
    icon: '🏪',
    title: 'ابني متجرك بدون ما تعرف كود',
    body: 'اختار قالب، حط اسم متجرك، وابدأ تضيف منتجاتك. كل شي drag & drop — ما في تعقيد وما في لازمية تعرف تصميم.',
  },
  {
    icon: '📱',
    title: 'شايف حلو على كل الأجهزة',
    body: 'زبائنك بيتصفحوا من التليفون؟ لا مشكلة. متجرك بيبان محترف على الموبايل، التابلت، والكمبيوتر — تلقائياً.',
  },
  {
    icon: '💳',
    title: 'قبض فلوسك بالطريقة اللي بتريحك',
    body: 'OMT، WhishMoney، كاش عند الاستلام، Visa وMaster — كل طرق الدفع اللبنانية والعربية متاحة من أول يوم.',
  },
  {
    icon: '🚚',
    title: 'وصّل طلباتك لكل لبنان',
    body: 'ربط مباشر مع Aramex، Toters، وشركات التوصيل اللبنانية. تابع كل طلب وحالته بنقرة وحدة.',
  },
  {
    icon: '📊',
    title: 'اعرف شو بيصير بمتجرك بكل وقت',
    body: 'لوحة تحكم واضحة بتعطيك مبيعاتك، أكتر المنتجات مبيعاً، ومين زبائنك — كل الأرقام بمكان واحد وبشكل مفهوم.',
  },
  {
    icon: '🔍',
    title: 'خليك تنبسط على Google',
    body: 'أدوات SEO مدمجة بتساعد متجرك يطلع بأول نتائج البحث — وصل لزبائن جدد بدون ما تدفع إعلانات كتير.',
  },
  {
    icon: '🎨',
    title: 'قوالب لكل نوع تجارة',
    body: 'عشرات القوالب الاحترافية مصممة لملابس، أكل، إلكترونيات، عطور وأكتر — اختار وعدّل كما بدك.',
  },
  {
    icon: '📦',
    title: 'تحكم بمنتجاتك والمخزون',
    body: 'ضيف منتجاتك، حدد الكميات، رتبهم بالفئات — النظام بيتابع المخزون حالياً وبيحذرك لما يخلص.',
  },
  {
    icon: '💬',
    title: 'في حدا معك على طول',
    body: 'فريق دعم لبناني فاهم مشاكلك وجاهز يساعدك بالواتساب، الشات، والإيميل — بالعربي اللبناني مش بالفصحى.',
  },
  {
    icon: '🔗',
    title: 'بيع من إنستغرام وفيسبوك مباشرة',
    body: 'ربط متجرك مع صفحاتك على السوشيال ميديا وخلي زبائنك يشتروا من غير ما يطلعوا من التطبيق.',
  },
  {
    icon: '🌍',
    title: 'بالعربي والإنجليزي — بيع محلياً وعالمياً',
    body: 'متجرك بيدعم اللغتين تلقائياً — استهدف الزبائن اللبنانيين والعرب بنفس الوقت.',
  },
  {
    icon: '🔒',
    title: 'بياناتك وبيانات زبائنك بأمان تام',
    body: 'SSL مجاني، حماية من الاختراق، وبياناتك محفوظة على سيرفرات موثوقة — تجارتك بأيد أمينة.',
  },
];

export default function Features() {
  return (
    <section className="py-20 md:py-28 bg-[#FDF6EC]" id="features">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-[#C8392B]/10 text-[#C8392B] rounded-full px-5 py-2 text-sm font-semibold mb-5">
            المميزات
          </span>
          <h2
            className="text-[32px] md:text-[38px] font-bold text-[#1E1E1E] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            كل اللي بتحتاجه بمكان واحد
          </h2>
          <p className="text-[18px] text-[#6B6B6B] font-medium max-w-xl mx-auto">
            من بناء المتجر لأول طلبية — نحنا معك بكل خطوة
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card bg-white rounded-2xl p-7 border border-[#E8E0D5] shadow-[0_4px_20px_rgba(0,0,0,0.06)] group cursor-default"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-[#FDF6EC] flex items-center justify-center text-3xl mb-5 transition-transform duration-300 group-hover:scale-110">
                {f.icon}
              </div>

              {/* Title */}
              <h3
                className="text-[18px] font-bold text-[#1E1E1E] mb-3 leading-[1.4]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {f.title}
              </h3>

              {/* Body */}
              <p className="text-[14px] text-[#6B6B6B] leading-[1.8]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
