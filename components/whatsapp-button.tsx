"use client";

import { MessageCircle } from "lucide-react";

/**
 * Componente do botão flutuante de atendimento via WhatsApp.
 * Fica fixo no canto inferior direito da tela.
 */
export default function WhatsAppButton() {
  return (
    <a
      // Link direto usando a API do WhatsApp com mensagem de saudação pré-preenchida
      href="https://wa.me/5511945342493?text=Olá!%20Gostaria%20de%20tirar%20uma%20dúvida%20antes%20de%20comprar."
      target="_blank"
      rel="noopener noreferrer"
      // A classe wa-pulse (definida no globals.css) cria a animação de pulso contínuo (ondas)
      className="wa-pulse fixed bottom-6 right-6 z-[90] bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center cursor-pointer"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}
