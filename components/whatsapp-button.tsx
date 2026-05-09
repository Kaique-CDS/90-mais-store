"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5511945342493?text=Olá!%20Gostaria%20de%20tirar%20uma%20dúvida%20antes%20de%20comprar."
      target="_blank"
      rel="noopener noreferrer"
      className="wa-pulse fixed bottom-6 right-6 z-[90] bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center cursor-pointer"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}
