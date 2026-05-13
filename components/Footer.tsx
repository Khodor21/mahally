import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";

const platformLinks = [
  { label: "المميزات", href: "#features" },
  { label: "الأسعار", href: "#pricing" },
  { label: "قصص النجاح", href: "#testimonials" },
  { label: "المدونة", href: "#" },
  { label: "عن المنصة", href: "#" },
];

const supportLinks = [
  { label: "مركز المساعدة", href: "#" },
  { label: "تواصل معنا", href: "#contact" },
  {
    label: "واتساب مباشر",
    href: "https://wa.me/9611234567",
    external: true,
  },
  { label: "الأسئلة الشائعة", href: "#faq" },
  {
    label: "hello@mahalli.lb",
    href: "mailto:hello@mahalli.lb",
    external: true,
  },
];

const legalLinks = [
  { label: "سياسة الخصوصية", href: "#" },
  { label: "الشروط والأحكام", href: "#" },
  { label: "سياسة الاسترداد", href: "#" },
  { label: "سياسة الكوكيز", href: "#" },
];

const socials = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaTiktok, href: "#", label: "TikTok" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
  {
    icon: FaWhatsapp,
    href: "https://wa.me/9611234567",
    label: "WhatsApp",
  },
];

export default function Footer() {
  return (
    <footer
      id="footer"
      className="bg-brand-light text-brand-dark overflow-hidden"
    >
      <div className="w-full mx-auto px-5 md:px-10 pt-20 pb-8">
        {/* Top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-12 xl:gap-10 mb-14">
          {/* Brand */}
          <div className="xl:col-span-1">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl border border-brand-dark/10 bg-brand-dark/5 hover:bg-brand-dark hover:text-brand-dark text-brand-dark flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                <span className="text-brand-dark text-xl font-bold leading-none">
                  م
                </span>
              </div>

              <div className="flex flex-col leading-none">
                <span
                  className="text-[34px] text-brand-dark"
                  style={{ fontFamily: "Lalezar, cursive" }}
                >
                  محلي
                </span>
              </div>
            </a>

            {/* Tagline */}
            <p className="text-brand-light text-[15px] font-medium mb-4 leading-[1.9]">
              افتح متجرك من لبنان للعالم 🇱🇧
            </p>

            {/* Description */}
            <p className="text-brand-dark/65 text-[14px] leading-[2] max-w-[320px] mb-7">
              منصة لبنانية تساعدك تنشئ متجر إلكتروني احترافي بسهولة، بدون تعقيد
              وبدون خبرة تقنية.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    social.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="w-11 h-11 rounded-2xl border border-brand-dark/10 bg-brand-dark/5 hover:bg-brand-dark hover:text-brand-dark text-brand-dark flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <FooterColumn title="المنصة" links={platformLinks} />

          <FooterColumn title="الدعم" links={supportLinks} />

          <FooterColumn title="القانوني" links={legalLinks} />
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-brand-dark/10 mb-7" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] md:text-[14px] text-brand-dark/50 text-center md:text-right leading-[1.9]">
            © 2026 <span className="text-brand-dark font-semibold">محلي</span> —
            جميع الحقوق محفوظة
          </p>

          <div className="flex items-center gap-2 text-brand-dark/60 text-sm">
            <div className="w-2 h-2 rounded-full bg-brand-light animate-pulse" />
            <span>كل الأنظمة تعمل بشكل طبيعي</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
  }[];
}) {
  return (
    <div>
      <h4 className="text-brand-dark text-[18px] font-bold mb-5">{title}</h4>

      <ul className="space-y-3">
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-brand-dark/60 hover:text-brand-dark text-[14px] leading-[1.9] transition-colors duration-200"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
