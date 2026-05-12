import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/9611234567"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="تواصل معنا عبر واتساب"
    >
      <FaWhatsapp size={30} color="white" />
    </a>
  );
}
