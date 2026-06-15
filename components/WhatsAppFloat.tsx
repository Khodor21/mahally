"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/9611234567"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="تواصل معنا عبر واتساب"
    >
      <MessageCircle size={30} stroke="white" />
    </a>
  );
}
