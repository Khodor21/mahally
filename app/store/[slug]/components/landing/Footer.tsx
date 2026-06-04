import {
  FaInstagram,
  FaTiktok,
  FaFacebookF,
  FaWhatsapp,
} from "react-icons/fa6";
import { SiThreads } from "react-icons/si";

const socials = [
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: SiThreads, href: "#", label: "Threads" },
  { icon: FaTiktok, href: "#", label: "TikTok" },
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaWhatsapp, href: "#", label: "WhatsApp" },
];

const columns = [
  {
    title: "Shop",
    links: ["Laptops", "Gaming Laptops", "Business Laptops", "Accessories"],
  },
  {
    title: "Support",
    links: ["Contact Us", "Return Policy", "Shipping & Delivery", "FAQ"],
  },
  {
    title: "Company",
    links: ["About Us", "Blog", "Partners", "Careers"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#AEAEAE]/20 bg-white mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top row: Brand + Socials */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-xs">
            <div className="flex items-center gap-2">
              {/* L Logo */}
              <span className="w-8 h-8 rounded-md bg-[#1B53FE] flex items-center justify-center text-white font-extrabold text-sm leading-none">
                L
              </span>
              <span className="font-extrabold text-[#222222] text-base">
                Laptop <span className="text-[#1B53FE]">Store</span>
              </span>
            </div>
            <p className="text-xs text-[#AEAEAE] leading-relaxed">
              Your trusted destination for genuine laptops — gaming, business,
              and everyday performance.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-full border border-[#AEAEAE]/30 flex items-center justify-center text-[#AEAEAE] hover:text-white hover:bg-[#1B53FE] hover:border-[#1B53FE] transition-all duration-200"
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row: 3 link columns spread evenly */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8">
          {columns.map(({ title, links }) => (
            <div key={title} className="flex flex-col gap-3">
              <p className="font-extrabold text-[#222222] text-sm">{title}</p>
              {links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs text-[#AEAEAE] hover:text-[#1B53FE] transition-colors font-medium"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#AEAEAE]/20 py-5 text-center text-xs text-[#AEAEAE]">
        © {new Date().getFullYear()} Laptop Store. All rights reserved.
      </div>
    </footer>
  );
}
