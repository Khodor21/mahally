import { FaFacebookF, FaInstagram, FaTiktok, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';

const platformLinks = [
  { label: 'المميزات', href: '#features' },
  { label: 'الأسعار', href: '#pricing' },
  { label: 'قصص النجاح', href: '#testimonials' },
  { label: 'المدونة', href: '#' },
  { label: 'عن المنصة', href: '#' },
];

const supportLinks = [
  { label: 'مركز المساعدة', href: '#' },
  { label: 'تواصل معنا', href: '#contact' },
  { label: 'واتساب مباشر', href: 'https://wa.me/9611234567', external: true },
  { label: 'الأسئلة الشائعة', href: '#faq' },
  { label: 'hello@mahalli.lb', href: 'mailto:hello@mahalli.lb', external: true },
];

const legalLinks = [
  { label: 'سياسة الخصوصية', href: '#' },
  { label: 'الشروط والأحكام', href: '#' },
  { label: 'سياسة الاسترداد', href: '#' },
  { label: 'سياسة الكوكيز', href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-[#1E1E1E] text-white" id="footer">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 pt-16 pb-8">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#C8392B] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">م</span>
              </div>
              <span
                className="text-2xl font-bold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                محلي
              </span>
            </div>

            {/* Tagline */}
            <p className="text-[#E8A838] font-semibold text-sm mb-3">
              "افتح متجرك من لبنان للعالم 🇱🇧"
            </p>

            {/* Short desc */}
            <p className="text-white/60 text-[14px] leading-[1.8] mb-6">
              منصة لبنانية لبناء المتاجر الإلكترونية
              بسهولة وبسعر يناسبك.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: FaFacebookF, href: '#', label: 'Facebook' },
                { icon: FaInstagram, href: '#', label: 'Instagram' },
                { icon: FaTiktok, href: '#', label: 'TikTok' },
                { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
                { icon: FaWhatsapp, href: 'https://wa.me/9611234567', label: 'WhatsApp' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#C8392B] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <s.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4
              className="text-white font-bold text-[16px] mb-5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              المنصة
            </h4>
            <ul className="space-y-3">
              {platformLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white text-[14px] transition-colors duration-200 hover:text-[#E8A838]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4
              className="text-white font-bold text-[16px] mb-5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              الدعم
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-[#E8A838] text-[14px] transition-colors duration-200"
                    target={(link as any).external ? '_blank' : undefined}
                    rel={(link as any).external ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4
              className="text-white font-bold text-[16px] mb-5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              القانوني
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-[#E8A838] text-[14px] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>
            © 2024 <span className="text-white/70 font-semibold">محلي</span> — صنع بـ ❤️ في لبنان 🇱🇧
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
            <span>كل الأنظمة شغالة</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
